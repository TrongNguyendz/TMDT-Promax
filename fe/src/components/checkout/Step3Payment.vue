<template>
  <div class="space-y-6">
    <div class="mb-4">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Xác nhận & Thanh toán</h2>
      <p v-if="paymentMethod === 'vietqr'" class="text-sm text-gray-500">Dùng bất kỳ App Ngân hàng nào để quét mã VietQR bên dưới.</p>
      <p v-else class="text-sm text-gray-500">Vui lòng kiểm tra lại thông tin trước khi hoàn tất đặt hàng.</p>
    </div>

    <div v-if="paymentMethod === 'vietqr' || paymentMethod === 'payos' || paymentMethod === 'vnpay'" class="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 p-8 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">      <h3 class="mb-6 text-center font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
        Mã QR Thanh Toán
      </h3>
      
      <div class="relative mb-4 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
        
        <div v-if="timeLeft <= 0" class="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-[2px]">
          <div class="mb-3 rounded-full bg-red-50 p-3">
            <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="mb-4 text-sm font-bold text-gray-800">Mã QR đã hết hạn</p>
          <button @click="handleRefresh" class="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
            Lấy mã mới
          </button>
        </div>

        <qrcode-vue 
          v-if="qrData" 
          :value="qrData" 
          :size="220" 
          level="M" 
          :class="['mx-auto transition-opacity duration-300', { 'opacity-10': timeLeft <= 0 }]"
        />
        
        <div v-else class="flex h-[220px] w-[220px] flex-col items-center justify-center space-y-3">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p class="text-xs font-medium text-gray-500 animate-pulse">Đang tạo VietQR...</p>
        </div>

        <div v-if="qrData && timeLeft > 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="bg-white p-1 rounded-md shadow-sm border border-gray-100">
               <img src="https://img.vietqr.io/image/vietqr.png" class="h-5 w-auto" />
            </div>
        </div>
      </div>

      <div v-if="timeLeft > 0" class="mb-6 w-full max-w-[220px] space-y-2">
        <div class="flex justify-between text-[10px] font-bold uppercase">
          <span :class="timeLeft <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-400'">
            Hiệu lực: {{ Math.floor(timeLeft / 60) }}:{{ (timeLeft % 60).toString().padStart(2, '0') }}
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div class="h-full bg-blue-600 transition-all duration-1000 ease-linear" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <div class="flex flex-col items-center space-y-3 text-center">
        <div class="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-700">
          <span class="relative flex h-2 w-2">
            <span class="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative h-2 w-2 rounded-full bg-blue-500"></span>
          </span>
          <span class="text-sm font-medium">Hệ thống đang chờ bạn quét mã...</span>
        </div>
        
        <p class="text-sm text-gray-600">
          Tổng tiền: <span class="text-lg font-bold text-red-600">{{ formatCurrency(displayTotal) }}</span>
        </p>

        <a v-if="checkoutUrl" :href="checkoutUrl" target="_blank" class="mt-2 text-xs font-semibold text-blue-500 underline transition-colors hover:text-blue-700">
          👉 Hoặc bấm vào đây để mở App Ngân hàng
        </a>
      </div>

      <div class="mt-8 w-full border-t border-gray-200 pt-6 dark:border-gray-800">
        <button 
          @click="$emit('prev')" 
          :disabled="isProcessing"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Quay lại và đổi phương thức
        </button>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-lg bg-gray-50 p-6 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
        <div class="flex items-start gap-4">
          <div class="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">Xác nhận thanh toán COD</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Bạn sẽ thanh toán bằng tiền mặt với số tiền <span class="font-bold text-red-600">{{ formatCurrency(displayTotal) }}</span> khi nhận hàng.
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <button 
          @click="$emit('prev')" 
          :disabled="isProcessing"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Quay lại
        </button>
        <button 
          @click="$emit('complete')" 
          :disabled="isProcessing"
          class="flex-[2] flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white shadow-md transition-transform hover:bg-gray-800 active:scale-95 disabled:opacity-50"
        >
          <div v-if="isProcessing" class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <span>{{ isProcessing ? 'Đang xử lý...' : 'Xác nhận đặt hàng' }}</span>
        </button>
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
  qrData: String,
  checkoutUrl: String,
  finalTotal: Number,
  isProcessing: Boolean // Hứng trạng thái loading từ Component Cha
});

const emit = defineEmits(['prev', 'complete', 'refresh-qr']);

const displayTotal = computed(() => Number(props.finalTotal ?? 0));

const TIME_LIMIT = 300; 
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

watch(() => props.qrData, (newVal) => {
  if (newVal) startTimer();
});

onMounted(() => {
  if ((props.paymentMethod === 'vietqr' || props.paymentMethod === 'payos' || props.paymentMethod === 'vnpay') && props.qrData) {
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