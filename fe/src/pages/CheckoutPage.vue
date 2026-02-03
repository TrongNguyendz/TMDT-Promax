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
          :items="cartItems" 
          @next="checkout.nextStep" 
        />
        
        <!-- Bước 2: Thông tin giao hàng -->
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
          :total="cart.subtotal"
          :isProcessing="isProcessing"
          @prev="handleBackStep"
          @complete="completeCODOrder"
          @refresh-qr="handleRefreshQR"
        />
      </div>

      <!-- 3. Sidebar tóm tắt -->
      <OrdersSummary :cart="cart" :currentStep="checkout.currentStep" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useCartStore } from '../stores/cart';
import { useCheckoutStore } from '../stores/checkout';
import { useOrderStore } from '../stores/order';
import { useUIStore } from '../stores/ui';
import { useUserStore } from '../stores/user';

import CheckoutStep from '../components/checkout/CheckoutStep.vue';   
import OrdersSummary from '../components/checkout/OrderSummary.vue'; 
import Step1Review from '../components/checkout/Step1Review.vue';
import Step2Shipping from '../components/checkout/Step2Shipping.vue';
import Step3Payment from '../components/checkout/Step3Payment.vue';
import Step4Success from '../components/checkout/Step4Success.vue';

const cart = useCartStore();
const checkout = useCheckoutStore();
const orderStore = useOrderStore();
const ui = useUIStore();
const userStore = useUserStore();

const vnpayUrl = ref('');
const isProcessing = ref(false);
const successOrder = ref(null); 
let socket = null;

const cartItems = computed(() => cart.items);

onMounted(() => {
  checkout.currentStep = 1;
});

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect();
    console.log("🔌 Socket disconnected cleanup");
  }
});

// --- XỬ LÝ CHUYỂN BƯỚC ---

async function handleShippingNext() {
  if (checkout.paymentMethod === 'vnpay') {
    // Nếu chọn VNPay -> Tạo đơn hàng PENDING ngay để lấy ID thật
    await createPendingOrderAndGetQR();
  } else {
    // Nếu chọn COD -> Chỉ chuyển bước, chưa tạo đơn
    checkout.nextStep();
  }
}

async function handleRefreshQR() {
    if (successOrder.value) {
        await generateVnpayUrl(successOrder.value.id, successOrder.value.final_amount);
    }
}

// --- LOGIC TẠO ĐƠN & THANH TOÁN ---

// Hàm 1: Gọi Store để tạo đơn vào DB
async function createOrderInDB() {
    // submitOrder trả về object đơn hàng đầy đủ từ backend
    return await checkout.submitOrder(); 
}

// Hàm 2: Quy trình VNPay (Tạo đơn -> Lấy QR -> Lắng nghe Socket)
async function createPendingOrderAndGetQR() {
    isProcessing.value = true;
    try {
        // 1. Tạo đơn hàng thật trong DB (Trạng thái Pending)
        const newOrder = await createOrderInDB();
        
        if (newOrder && newOrder.id) {
            successOrder.value = newOrder; // Lưu lại
            checkout.nextStep(); // Chuyển sang màn hình QR (Step 3)

            // 2. Gọi Payment Service lấy URL thanh toán cho ID thật này
            await generateVnpayUrl(newOrder.id, newOrder.final_amount);
        }
    } catch (error) {
        console.error("Lỗi tạo đơn VNPay:", error);
    } finally {
        isProcessing.value = false;
    }
}

// Hàm 3: Gọi API lấy link thanh toán (ĐÃ FIX LỖI 400)
async function generateVnpayUrl(orderId, amount) {
  try {
    // Validate dữ liệu
    if (!orderId) return;

    // 👇 FIX QUAN TRỌNG: Làm tròn số tiền (VNPay không nhận số lẻ)
    const cleanAmount = Math.round(Number(amount));
    
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
        ui.pushToast({ type: 'error', message: 'Số tiền không hợp lệ' });
        return;
    }

    console.log("📤 Tạo QR cho đơn:", orderId, "Tiền:", cleanAmount);

    const response = await axios.post('http://localhost:3000/api/v1/payments/vnpay/create', {
      orderId: orderId, // ID thật
      amount: cleanAmount, // Số tiền thật đã làm tròn
      userId: userStore.profile?.id || 'GUEST',
      paymentMethod: 'vnpay',
      order_info: `Thanh toan don hang #${orderId}`
    });

    if (response.data.success) {
      vnpayUrl.value = response.data.paymentUrl;
      
      // Lắng nghe Socket
      if (socket) socket.disconnect();
      setupSocketListener(orderId); 
    }
  } catch (error) {
    console.error("Lỗi API Payment:", error.response?.data);
    ui.pushToast({ type: 'error', message: 'Không thể tạo mã thanh toán' });
  }
}

// Hàm 4: Xử lý COD (Khi bấm nút "Hoàn tất" ở Step 3)
async function completeCODOrder() {
    isProcessing.value = true;
    try {
        const newOrder = await createOrderInDB();
        if (newOrder) {
            successOrder.value = newOrder;
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
    console.log(`✅ Socket connected for Order #${orderId}`);
    socket.emit('join-order-room', orderId);
  });

  socket.on('payment-success', (data) => {
    console.log("🚀 THANH TOÁN THÀNH CÔNG!", data);
    
    if (successOrder.value) {
        successOrder.value.payment_status = 'paid';
        successOrder.value.status = 'processing';
    }
    
    ui.pushToast({ type: 'success', message: 'Thanh toán thành công, kiểm tra hóa đơn được gửi về mail!' });
    finishSteps();
  });
}

function finishSteps() {
  checkout.currentStep = 4;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cart.clearCart(); // Xóa giỏ hàng local
  if (socket) socket.disconnect();
}

async function handleBackStep() {
    // Nếu đang ở bước QR Code và đã có đơn hàng Pending
    if (checkout.currentStep === 3 && successOrder.value) {
        // Hỏi ý kiến người dùng
        if (!confirm('Đơn hàng chờ thanh toán hiện tại sẽ bị hủy để bạn chọn phương thức mới. Bạn chắc chắn chứ?')) {
            return;
        }

        try {
            isProcessing.value = true;
            // Gọi API Hủy đơn -> Backend sẽ tự động cộng lại tồn kho
            await orderStore.cancelOrder(successOrder.value.id, 'Khách đổi phương thức thanh toán');
            
            // Dọn dẹp
            successOrder.value = null;
            vnpayUrl.value = '';
            if (socket) socket.disconnect();

            // Quay về bước 2
            checkout.previousStep();
        } catch (e) {
            console.error("Lỗi hủy đơn:", e);
        } finally {
            isProcessing.value = false;
        }
    } else {
        // Trường hợp bình thường (chưa tạo đơn)
        checkout.previousStep();
    }
}
</script>