<template>
  <div class="space-y-6">
    <div class="mb-4">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 italic uppercase">Xác nhận & Thanh toán</h2>
      <p v-if="['vietqr', 'payos', 'vnpay'].includes(paymentMethod)" class="text-sm text-gray-500">
        Dùng bất kỳ App Ngân hàng nào để quét mã VietQR bên dưới.
      </p>
      <p v-else class="text-sm text-gray-500">Vui lòng kiểm tra lại thông tin trước khi hoàn tất đặt hàng.</p>
    </div>

    <div v-if="['vietqr', 'payos', 'vnpay'].includes(paymentMethod)" 
         class="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 p-8 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950">
      
      <h3 class="mb-6 text-center font-black text-gray-400 uppercase tracking-[0.2em] text-xs">Mã QR Thanh Toán</h3>
      
      <div class="relative mb-6 rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-gray-100">
        <div v-if="timeLeft <= 0" class="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-white/95 backdrop-blur-sm">
          <div class="mb-3 rounded-full bg-red-50 p-3">
            <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="mb-4 text-sm font-bold text-gray-800 uppercase italic">Mã đã hết hạn</p>
          <button @click="handleRefresh" class="rounded-full bg-blue-600 px-6 py-2 text-xs font-black text-white uppercase tracking-widest active:scale-95 transition-transform hover:scale-105">
            Lấy mã mới
          </button>
        </div>

        <qrcode-vue 
          v-if="qrData" 
          :value="qrData" 
          :size="210" 
          level="H" 
          :class="['mx-auto transition-opacity duration-300', { 'opacity-10': timeLeft <= 0 }]"
        />
        
        <div v-else class="flex h-[210px] w-[210px] flex-col items-center justify-center space-y-3">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p class="text-[10px] font-black uppercase text-gray-400 animate-pulse">Đang tạo VietQR...</p>
        </div>

        <div v-if="qrData && timeLeft > 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="bg-white p-1 rounded-md shadow-sm border border-gray-100">
               <img src="https://img.vietqr.io/image/vietqr.png" class="h-5 w-auto" />
            </div>
        </div>
      </div>

      <div v-if="timeLeft > 0" class="mb-8 w-full max-w-[210px] space-y-2">
        <div class="flex justify-between text-[10px] font-black uppercase tracking-tighter">
          <span :class="timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-gray-400'">
            Hiệu lực: {{ Math.floor(timeLeft / 60) }}:{{ (timeLeft % 60).toString().padStart(2, '0') }}
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full bg-blue-600 transition-all duration-1000 ease-linear" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <div class="flex flex-col items-center space-y-4 text-center">
        <div class="flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-blue-700 dark:text-blue-400">
          <span class="relative flex h-2 w-2">
            <span class="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative h-2 w-2 rounded-full bg-blue-500"></span>
          </span>
          <span class="text-[10px] font-black uppercase tracking-[0.1em]">Đang chờ bạn thanh toán...</span>
        </div>
        
        <p class="text-sm font-medium text-gray-500">
          Tổng cộng: <span class="text-xl font-black text-red-600">{{ formatCurrency(total) }}</span>
        </p>

        <a v-if="checkoutUrl" :href="checkoutUrl" target="_blank" class="text-[10px] font-black uppercase text-blue-500 underline hover:text-blue-700 transition-colors">
          Bấm để mở App Ngân hàng
        </a>
      </div>

      <div class="mt-8 w-full border-t border-gray-100 pt-6 dark:border-gray-800">
        <button @click="$emit('prev')" class="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
          Quay lại và đổi phương thức
        </button>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-2xl bg-gray-50 p-8 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 shadow-sm">
        <div class="flex items-center gap-5">
          <div class="rounded-xl bg-blue-600 p-3.5 text-white shadow-xl shadow-blue-100 dark:shadow-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h4 class="text-lg font-black text-gray-900 dark:text-gray-100 uppercase italic">Thanh toán COD</h4>
            <p class="mt-1 text-sm text-gray-500 font-medium">
              Bạn sẽ trả <span class="text-red-600 font-bold">{{ formatCurrency(total) }}</span> khi nhận hàng.
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <button @click="$emit('prev')" :disabled="isProcessing" class="flex-1 rounded-xl border border-gray-200 py-3.5 font-black text-gray-400 uppercase text-[10px] tracking-widest active:scale-95 transition-all">
          Quay lại
        </button>
        <button @click="$emit('complete')" :disabled="isProcessing" class="flex-[2] rounded-xl bg-gray-900 py-3.5 font-black text-white shadow-2xl hover:bg-black active:scale-95 uppercase text-[10px] tracking-[0.15em] disabled:opacity-50 transition-all">
          {{ isProcessing ? 'Đang tạo đơn...' : 'Xác nhận đặt hàng' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import QrcodeVue from 'qrcode.vue';
import { formatCurrency } from '../../utils/helpers';
import OrderAPI from '../../utils/order_service_api';

const props = defineProps({
  orderId: String,       
  paymentMethod: String,
  qrData: String,       
  checkoutUrl: String,  
  total: Number,
  isProcessing: Boolean 
});

const emit = defineEmits(['prev', 'complete', 'refresh-qr', 'success']);
const router = useRouter();

const TIME_LIMIT = 300; 
const timeLeft = ref(TIME_LIMIT);
let timerInterval = null;
let pollInterval = null;

const progress = computed(() => (timeLeft.value / TIME_LIMIT) * 100);

// 🟢 RADAR: Quét trạng thái đơn hàng
const startPolling = () => {
  // Nếu chưa có ID thì không quét, tránh lỗi 404
  if (!props.orderId) return; 
  
  clearInterval(pollInterval);
  console.log(`📡 [RADAR] Bắt đầu truy quét đơn hàng: ${props.orderId}`);
  
  pollInterval = setInterval(async () => {
    try {
      const res = await OrderAPI.getOrderById(props.orderId);
      const order = res.data?.data || res.data;

      console.log(`🔄 [CHECK] Trạng thái: ${order.payment_status} | ${order.status}`);

      // Chỉ cần thấy 'paid' hoặc 'processing' là nhảy ngay
      const isPaid = String(order.payment_status).toLowerCase() === 'paid';
      const isProcessing = String(order.status).toLowerCase() === 'processing';

      if (isPaid || isProcessing) {
        console.log("✅ [SUCCESS] Tiền đã về! Phát tín hiệu nhảy Step 4...");
        clearInterval(pollInterval);
        emit('success'); // 👈 Hét lên cho thằng Cha nghe
      }
    } catch (error) {
      console.error("❌ [ERROR] Radar mất sóng:", error.message);
    }
  }, 3000); // 3 giây gõ cửa Backend 1 lần
};

const startTimer = () => {
  clearInterval(timerInterval);
  timeLeft.value = TIME_LIMIT;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--;
    else {
      clearInterval(timerInterval);
      clearInterval(pollInterval);
    }
  }, 1000);
};

const handleRefresh = () => { emit('refresh-qr'); };

// 🎯 THAY ĐỔI QUAN TRỌNG: Theo dõi sát sao orderId thay vì qrData
watch(() => props.orderId, (newId) => {
  if (newId) {
    console.log("🎯 Đã nhận diện ID đơn hàng:", newId);
    startPolling();
  }
}, { immediate: true });

// Theo dõi thêm qrData để chạy timer đếm ngược
watch(() => props.qrData, (newVal) => {
  if (newVal) startTimer();
}, { immediate: true });

onUnmounted(() => {
  clearInterval(timerInterval);
  clearInterval(pollInterval);
});
</script>

<style scoped>
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>