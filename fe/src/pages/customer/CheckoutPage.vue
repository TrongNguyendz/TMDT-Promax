<template>
  <section class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Thanh toán</h1>
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
          :paymentMethod="checkout.paymentMethod"
          :qrData="qrCodeData"
          :checkoutUrl="checkoutUrl"
          :total="cart.subtotal"
          :isProcessing="isProcessing"
          @prev="handleBackStep"
          @complete="completeCODOrder"
          @refresh-qr="handleRefreshQR"
        />
      </div>

      <OrdersSummary :itemCount="checkoutItems.length" :subtotal="checkoutSubtotal" :currentStep="checkout.currentStep" />
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

// Import các component con
import CheckoutStep from '../../components/checkout/CheckoutStep.vue';   
// Đã sửa đường dẫn chính xác: Không có chữ 's' ở chữ OrderSummary
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

// Biến cho PayOS
const qrCodeData = ref('');
const checkoutUrl = ref('');
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
    console.log("Socket disconnected cleanup");
  }
});

// --- XỬ LÝ CHUYỂN BƯỚC ---

async function handleShippingNext() {
  // Nhận diện cả 'vietqr' hoặc 'vnpay' (để dự phòng nếu bạn chưa đổi value ở radio button)
  if (checkout.paymentMethod === 'vietqr' || checkout.paymentMethod === 'payos' || checkout.paymentMethod === 'vnpay') {
    await createPendingOrderAndGetQR();
  } else {
    checkout.nextStep();
  }
}

async function handleRefreshQR() {
    if (successOrder.value) {
        await generatePayOSUrl(successOrder.value.id, successOrder.value.final_amount);
    }
}

// --- LOGIC TẠO ĐƠN & THANH TOÁN PAYOS ---

async function createOrderInDB() {
    return await checkout.submitOrder(); 
}

async function createPendingOrderAndGetQR() {
    isProcessing.value = true;
    try {
        const newOrder = await createOrderInDB();
        
        if (newOrder && newOrder.id) {
            successOrder.value = newOrder; 
            checkout.nextStep(); // Chuyển sang Step 3: Hiện QR Code

            // Gọi API PayOS
            await generatePayOSUrl(newOrder.id, newOrder.final_amount);
        }
    } catch (error) {
        console.error("Lỗi tạo đơn:", error);
    } finally {
        isProcessing.value = false;
    }
}

async function generatePayOSUrl(orderId, amount) {
  try {
    if (!orderId) return;

    const cleanAmount = Math.round(Number(amount));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
        ui.pushToast({ type: 'error', message: 'Số tiền không hợp lệ' });
        return;
    }

    console.log("📤 Tạo QR PayOS cho đơn:", orderId, "Tiền:", cleanAmount);

    // 1. LẤY TOKEN ĐĂNG NHẬP
    // Tùy vào cách bạn lưu token, có thể lấy từ userStore hoặc localStorage
    const token = userStore.token || localStorage.getItem('token'); 

    // 2. CẤU HÌNH HEADER ĐỂ MANG THEO TOKEN
    const config = {
      headers: {}
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gắn thẻ ra vào
    }

    // 3. GỌI API VỚI CONFIG (Bao gồm Token)
    const response = await axios.post('https://tmdt-promax-api-gateway.onrender.com/api/v1/payments/payos/create', {
      orderId: orderId, 
      amount: cleanAmount, 
      userId: userStore.profile?.id || 'GUEST',
    }, config); // <--- Chú ý biến config được truyền vào ở đây

    if (response.data.success) {
      console.log("📸 CHECK DỮ LIỆU API TRẢ VỀ:", response.data);
      qrCodeData.value = response.data.qrCodeData; 
      checkoutUrl.value = response.data.paymentUrl; 
      
      if (socket) socket.disconnect();
      setupSocketListener(orderId); 
    }
  } catch (error) {
    console.error("Lỗi API PayOS:", error.response?.data || error.message);
    ui.pushToast({ type: 'error', message: 'Không thể tạo mã thanh toán VietQR' });
  }
}

// Hàm xử lý COD
async function completeCODOrder() {
    isProcessing.value = true;
    try {
        const newOrder = await createOrderInDB();
        if (newOrder) {
            successOrder.value = newOrder;
            ui.pushToast({ type: 'success', message: 'Đặt hàng thành công, kiểm tra email để xem hóa đơn!' });
            finishSteps();
        }
    } finally {
        isProcessing.value = false;
    }
}

// --- SOCKET & HOÀN TẤT ---

function setupSocketListener(orderId) {
  socket = io('https://tmdt-promax-payment-service.onrender.com', {
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
  checkout.currentStep = 4; // Nhảy sang Bước 4 (Thành công)
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cart.clearCart(); 
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
            qrCodeData.value = '';
            checkoutUrl.value = '';
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