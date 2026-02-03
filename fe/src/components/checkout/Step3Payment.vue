<template>
  <div class="space-y-6">
    <div class="mb-4">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Xác nhận & Thanh toán</h2>
      <p class="text-sm text-gray-500">Vui lòng quét mã QR bên dưới để hoàn tất đơn hàng.</p>
    </div>

    <!-- TRƯỜNG HỢP 1: THANH TOÁN VNPAY QR -->
    <div v-if="paymentMethod === 'vnpay'" class="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 p-8 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
      <h3 class="mb-6 text-center font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
        Mã QR Thanh Toán
      </h3>
      
      <!-- Khung hiển thị QR Code với Logic Hết Hạn -->
      <div class="relative mb-4 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
        
        <!-- Lớp phủ khi mã hết hạn (Time's up Overlay) -->
        <div v-if="timeLeft <= 0" class="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-[2px]">
          <div class="mb-3 rounded-full bg-red-50 p-3">
            <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="mb-4 text-sm font-bold text-gray-800">Mã QR đã hết hạn</p>
          <button 
            @click="handleRefresh" 
            class="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:bg-gray-800 hover:scale-105 active:scale-95 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Lấy mã mới
          </button>
        </div>

        <!-- QR Code chính -->
        <qrcode-vue 
          v-if="vnpayUrl" 
          :value="vnpayUrl" 
          :size="220" 
          level="H" 
          :class="['mx-auto transition-opacity duration-300', { 'opacity-10': timeLeft <= 0 }]"
        />
        
        <!-- Loading khi đang tạo mã -->
        <div v-else class="flex h-[220px] w-[220px] flex-col items-center justify-center space-y-3">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p class="text-xs text-gray-500 animate-pulse">Đang tạo mã...</p>
        </div>

        <!-- Logo VNPAY ở giữa -->
        <div v-if="vnpayUrl && timeLeft > 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div class="bg-white p-1 rounded-md shadow-sm border border-gray-100">
              <img src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAY-QR.png" class="h-6 w-auto" />
           </div>
        </div>
      </div>

      <!-- Bộ đếm ngược & Thanh tiến trình -->
      <div v-if="timeLeft > 0" class="mb-8 w-full max-w-[220px] space-y-2">
        <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
          <span :class="timeLeft <= 20 ? 'text-red-600 animate-pulse' : 'text-gray-400'">
            Hiệu lực: {{ timeLeft }} giây
          </span>
          
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div 
            class="h-full transition-all duration-1000 ease-linear"
            :class="timeLeft <= 20 ? 'bg-red-500' : 'bg-blue-600'"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Trạng thái chờ Real-time -->
      <div class="flex flex-col items-center space-y-3 text-center">
        <div class="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
          </span>
          <span class="text-sm font-semibold italic">Đang chờ bạn quét mã...</span>
        </div>
        
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Tổng tiền: <span class="text-lg font-bold text-red-600 dark:text-red-400">{{ formatCurrency(total) }}</span>
        </p>
      </div>

      <!-- Nút Quay lại -->
      <div class="mt-8 w-full border-t border-gray-200 pt-6 dark:border-gray-800">
        <button 
          @click="$emit('prev')" 
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại và đổi phương thức
        </button>
      </div>
    </div>

    <!-- TRƯỜNG HỢP 2: THANH TOÁN KHI NHẬN HÀNG (COD) -->
    <div v-else class="space-y-6">
      <div class="rounded-lg bg-gray-50 p-6 dark:bg-gray-900/50">
        <div class="flex items-start gap-4">
          <div class="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 dark:text-gray-100">Xác nhận thanh toán COD</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Bạn sẽ thanh toán <span class="font-bold">{{ formatCurrency(total) }}</span> khi nhận hàng.
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <button @click="$emit('prev')" class="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-600">Quay lại</button>
        <button @click="$emit('complete')" class="flex-[2] rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white">Xác nhận đặt hàng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { formatCurrency } from '../../utils/helpers';

const props = defineProps({
  paymentMethod: String,
  vnpayUrl: String,
  total: Number
});

const emit = defineEmits(['prev', 'complete', 'refresh-qr']);

// Logic Countdown
const TIME_LIMIT = 120; // Giây
const timeLeft = ref(TIME_LIMIT);
let timerInterval = null;

const progress = computed(() => (timeLeft.value / TIME_LIMIT) * 100);

const startTimer = () => {
  clearInterval(timerInterval);
  timeLeft.value = TIME_LIMIT;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
};

const handleRefresh = () => {
  emit('refresh-qr');
};

// Theo dõi khi vnpayUrl thay đổi (khi lấy mã mới thành công)
watch(() => props.vnpayUrl, (newVal) => {
  if (newVal) {
    startTimer();
  }
});

onMounted(() => {
  if (props.paymentMethod === 'vnpay' && props.vnpayUrl) {
    startTimer();
  }
});

onUnmounted(() => {
  clearInterval(timerInterval);
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