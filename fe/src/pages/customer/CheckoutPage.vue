<template>
  <section class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Thanh toán</h1>
    </div>

    <!-- 1. Thanh tiến trình -->
    <CheckoutStep :currentStep="checkout.currentStep" />

    <!-- 2. Nội dung chính -->
    
    <!-- Bước 4: Hoàn tất  -->
    <div v-if="checkout.currentStep === 4 && successOrder">
      <Step4Success :order="successOrder" />
    </div>

    <!-- Các bước 1, 2, 3 (Layout 2 cột) -->
    <div v-else class="grid gap-8 md:grid-cols-[1fr_380px]">
      <div class="space-y-6">
        
        <!-- Bước 1: Xem lại -->
        <Step1Review 
          v-if="checkout.currentStep === 1" 
          :items="checkoutItems" 
          @next="checkout.nextStep" 
        />
        
        <!-- Bước 2: Thông tin giao hàng -->
        <!-- Sửa: Dùng v-model rút gọn -->
        <Step2Shipping 
          v-if="checkout.currentStep === 2" 
          :shippingInfo="checkout.shippingInfo" 
          v-model:paymentMethod="checkout.paymentMethod"
          @prev="checkout.previousStep" 
          @next="handleShippingNext" 
        />

        <!-- Bước 3: Xác nhận & Thanh toán QR -->
        <Step3Payment 
          v-if="checkout.currentStep === 3"
          :paymentMethod="checkout.paymentMethod"
          :vnpayUrl="vnpayUrl"
          :total="checkoutSubtotal"
          :isProcessing="isProcessing"
          @prev="handleBackStep"
          @complete="completeCODOrder"
          @refresh-qr="handleRefreshQR"
        />
      </div>

      <!-- 3. Sidebar tóm tắt -->
      <OrdersSummary 
        :itemCount="checkoutItems.length" 
        :subtotal="checkoutSubtotal" 
        :currentStep="checkout.currentStep" 
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useCartStore } from '../../stores/cart';
import { useCheckoutStore } from '../../stores/checkout';
import { useOrderStore } from '../../stores/order';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';

import CheckoutStep from '../../components/checkout/CheckoutStep.vue';   
import OrdersSummary from '../../components/checkout/OrderSummary.vue'; 
import Step1Review from '../../components/checkout/Step1Review.vue';
import Step2Shipping from '../../components/checkout/Step2Shipping.vue';
import Step3Payment from '../../components/checkout/Step3Payment.vue';
import Step4Success from '../../components/checkout/Step4Success.vue';

const cart = useCartStore();
const checkout = useCheckoutStore();
const orderStore = useOrderStore();
const ui = useUIStore();
const userStore = useUserStore();

const vnpayUrl = ref('');
const isProcessing = ref(false);
const successOrder = ref(null); 
let socket = null;

// 1. Lấy sản phẩm hiển thị
const checkoutItems = computed(() => {
    if (successOrder.value && successOrder.value.items) {
        return successOrder.value.items;
    }
    
    if (checkout.isDirectBuy && checkout.directBuyItem) {
        return [checkout.directBuyItem]; 
    }
    return cart.items; 
});

// 2. Lấy tổng tiền
const checkoutSubtotal = computed(() => {
    if (successOrder.value) {
        return successOrder.value.total_amount || successOrder.value.final_amount;
    }
    
    if (checkout.isDirectBuy && checkout.directBuyItem) {
        return checkout.directBuyItem.price * checkout.directBuyItem.quantity;
    }
    return cart.subtotal;
});

onMounted(() => {
  checkout.currentStep = 1;
});

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect();
  };
  checkout.clearDirectBuy();
});

// --- XỬ LÝ CHUYỂN BƯỚC ---

async function handleShippingNext() {
  if (checkout.paymentMethod === 'vnpay') {
    await createPendingOrderAndGetQR();
  } else {
    checkout.nextStep();
  }
}

async function handleRefreshQR() {
    if (successOrder.value) {
        await generateVnpayUrl(successOrder.value.id, successOrder.value.final_amount);
    }
}

// --- LOGIC TẠO ĐƠN & THANH TOÁN ---

async function createOrderInDB() {
    return await checkout.submitOrder(); 
}

async function createPendingOrderAndGetQR() {
    isProcessing.value = true;
    try {
        const newOrder = await createOrderInDB();
        
        if (newOrder && newOrder.id) {
            const fullOrder = await orderStore.fetchOrderById(newOrder.id);
            successOrder.value = fullOrder; 
            
            checkout.nextStep(); 
            await generateVnpayUrl(newOrder.id, newOrder.final_amount);
        }
    } catch (error) {
        console.error("Lỗi tạo đơn VNPay:", error);
    } finally {
        isProcessing.value = false;
    }
}

async function generateVnpayUrl(orderId, amount) {
  try {
    if (!orderId) return;

    const cleanAmount = Math.round(Number(amount));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
        ui.pushToast({ type: 'error', message: 'Số tiền không hợp lệ' });
        return;
    }

    const response = await axios.post('http://localhost:3000/api/v1/payments/vnpay/create', {
      orderId: orderId, 
      amount: cleanAmount, 
      userId: userStore.profile?.id || 'GUEST',
      paymentMethod: 'vnpay',
      order_info: `Thanh toan don hang #${orderId}`
    });

    if (response.data.success) {
      vnpayUrl.value = response.data.paymentUrl;
      if (socket) socket.disconnect();
      setupSocketListener(orderId); 
    }
  } catch (error) {
    console.error("Lỗi API Payment:", error.response?.data);
    ui.pushToast({ type: 'error', message: 'Không thể tạo mã thanh toán' });
  }
}

async function completeCODOrder() {
    isProcessing.value = true;
    try {
        const newOrder = await createOrderInDB();
        if (newOrder && newOrder.id) {
            const fullOrder = await orderStore.fetchOrderById(newOrder.id);
            successOrder.value = fullOrder;

            ui.pushToast({ type: 'success', message: 'Đặt hàng thành công, kiểm tra hóa đơn được gửi về mail!' });
            finishSteps();
        }
    } finally {
        isProcessing.value = false;
    }
}

// --- SOCKET & HOÀN TẤT ---

function setupSocketListener(orderId) {
  socket = io('http://localhost:3004', {
    transports: ['websocket', 'polling'],
    withCredentials: true
  });

  socket.on('connect', () => {
    socket.emit('join-order-room', orderId);
  });

  socket.on('payment-success', async (data) => { 
    try {
        const fullOrder = await orderStore.fetchOrderById(orderId);
        successOrder.value = fullOrder;
    } catch (e) {
        console.error("Lỗi tải lại đơn:", e);
    }
    
    ui.pushToast({ type: 'success', message: 'Thanh toán thành công, kiểm tra hóa đơn được gửi về mail!' });
    finishSteps();
  });
}

function finishSteps() {
  checkout.currentStep = 4;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (!checkout.isDirectBuy) {
      cart.clearCart(); 
  }
  checkout.clearDirectBuy();

  if (socket) socket.disconnect();
}

async function handleBackStep() {
    if (checkout.currentStep === 3 && successOrder.value) {
        if (!confirm('Đơn hàng chờ thanh toán hiện tại sẽ bị hủy để bạn chọn phương thức mới. Bạn chắc chắn chứ?')) {
            return;
        }

        try {
            isProcessing.value = true;
            await orderStore.cancelOrder(successOrder.value.id, 'Khách đổi phương thức thanh toán');
            successOrder.value = null;
            vnpayUrl.value = '';
            if (socket) socket.disconnect();
            checkout.previousStep();
        } catch (e) {
            console.error("Lỗi hủy đơn:", e);
        } finally {
            isProcessing.value = false;
        }
    } else {
        checkout.previousStep();
    }
}
</script>