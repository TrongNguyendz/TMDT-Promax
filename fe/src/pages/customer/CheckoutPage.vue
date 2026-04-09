<template>
  <section class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase italic tracking-tighter">Thanh toán</h1>
    </div>

    <CheckoutStep :currentStep="checkout.currentStep" />

    <div v-if="checkout.currentStep === 4 && successOrder">
      <Step4Success :order="successOrder" />
    </div>

    <div v-else class="grid gap-8 md:grid-cols-[1fr_380px]">
      <div class="space-y-6">
        
        <Step1Review 
          v-if="checkout.currentStep === 1" 
          :items="checkoutItems" 
          @next="checkout.nextStep" 
        />
        
        <Step2Shipping 
          v-if="checkout.currentStep === 2" 
          :shippingInfo="checkout.shippingInfo" 
          v-model:paymentMethod="checkout.paymentMethod"
          @prev="checkout.previousStep" 
          @next="handleShippingNext" 
        />

        <Step3Payment 
  v-if="checkout.currentStep === 3"
  :order-id="successOrder?.id || successOrder?._id" 
  :paymentMethod="checkout.paymentMethod"
  :qrData="qrCodeData"
  :checkoutUrl="checkoutUrl"
  :total="checkoutSubtotal"
  :isProcessing="isProcessing"
  @prev="handleBackStep"
  @complete="completeCODOrder"
  @refresh-qr="handleRefreshQR"
  @success="finishSteps" 
/>
        </div>

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
import { useCartStore } from '../../stores/cart';
import { useCheckoutStore } from '../../stores/checkout';
import { useOrderStore } from '../../stores/order';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import { useRoute } from 'vue-router';

// Import các component con
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
const route = useRoute();


const qrCodeData = ref('');
const checkoutUrl = ref('');
const isProcessing = ref(false);
const successOrder = ref(null); 

const checkoutItems = computed(() => {
    if (successOrder.value && successOrder.value.items) return successOrder.value.items;
    if (checkout.isDirectBuy && checkout.directBuyItem) return [checkout.directBuyItem]; 
    return cart.items; 
});

const checkoutSubtotal = computed(() => {
    if (successOrder.value) return successOrder.value.total_amount || successOrder.value.final_amount;
    if (checkout.isDirectBuy && checkout.directBuyItem) return checkout.directBuyItem.price * checkout.directBuyItem.quantity;
    return cart.subtotal;
});

onMounted(() => {
    // Reset về bước 1 khi vào trang
    checkout.currentStep = 1;
});

// --- LOGIC ĐIỀU PHỐI ---

async function handleShippingNext() {
  if (['vietqr', 'payos', 'vnpay'].includes(checkout.paymentMethod)) {
    await createPendingOrderAndGetQR();
  } else {
    checkout.nextStep();
  }
}

async function createPendingOrderAndGetQR() {
    isProcessing.value = true;
    try {
        const newOrder = await checkout.submitOrder();
        
        if (newOrder) {
            // ✅ Lưu đơn hàng vào successOrder để lấy ID truyền cho con
            successOrder.value = newOrder; 
            checkout.nextStep(); 

            // Lấy QR từ PayOS
            await generatePayOSUrl(newOrder.id || newOrder._id, newOrder.final_amount);
        }
    } catch (error) {
        console.error("Lỗi tạo đơn:", error);
        ui.pushToast({ type: 'error', message: 'Không thể tạo đơn hàng' });
    } finally {
        isProcessing.value = false;
    }
}

async function generatePayOSUrl(orderId, amount) {
  try {
    const token = userStore.token || localStorage.getItem('token'); 

    // 2. CẤU HÌNH HEADER ĐỂ MANG THEO TOKEN
    const config = {
      headers: {}
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gắn thẻ ra vào
    }

    // 3. GỌI API VỚI CONFIG (Bao gồm Token)
    const response = await axios.post('http://localhost:3000/api/v1/payments/payos/create', {
      orderId: orderId, 
      amount: Math.round(Number(amount)), 
      userId: userStore.profile?.id || 'GUEST',
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      qrCodeData.value = response.data.qrCodeData; 
      checkoutUrl.value = response.data.paymentUrl; 
    }
  } catch (error) {
    console.error("Lỗi API PayOS:", error.message);
    ui.pushToast({ type: 'error', message: 'Lỗi tạo mã QR' });
  }
}

async function completeCODOrder() {
    isProcessing.value = true;
    try {
        const newOrder = await checkout.submitOrder();
        if (newOrder) {
            successOrder.value = newOrder;
            ui.pushToast({ type: 'success', message: 'Đặt hàng thành công!' });
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
    console.log(`✅ Socket connected for Order #${orderId}`);
    // Xin vào đúng phòng của đơn hàng này
    socket.emit('join-order-room', `order_${orderId}`);
  });

  socket.on('payment-success', (data) => {
    console.log("🚀 TING TING! THANH TOÁN THÀNH CÔNG!", data);
    
    // Nếu ID trả về khớp với ID đang thanh toán
    if (data.orderId === orderId && successOrder.value) {
        successOrder.value.payment_status = 'paid';
        successOrder.value.status = 'processing';
        
        ui.pushToast({ type: 'success', message: 'Thanh toán thành công! Đang hoàn tất đơn...' });
        finishSteps();
    }
  });
}

function finishSteps() {
  checkout.currentStep = 4;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cart.clearCart(); 
}

async function handleBackStep() {
    if (checkout.currentStep === 3 && successOrder.value) {
        if (confirm('Hủy thanh toán hiện tại để chọn phương thức khác?')) {
            try {
                isProcessing.value = true;
                await orderStore.cancelOrder(successOrder.value.id || successOrder.value._id, 'Đổi phương thức');
                successOrder.value = null;
                checkout.previousStep();
            } finally {
                isProcessing.value = false;
            }
        }
    } else {
        checkout.previousStep();
    }
}
</script>