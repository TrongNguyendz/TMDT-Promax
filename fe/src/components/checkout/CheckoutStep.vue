<template>
  <div class="mb-12 w-full px-4">
    <div class="relative flex w-full justify-between">
      
      <!-- Đường kẻ ngang chạy phía sau (Background Line) -->
      <div 
        class="absolute left-0 top-5 h-1 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-800" 
        aria-hidden="true"
      >
        <!-- Đường kẻ màu đậm chạy theo tiến trình (Active Progress Line) -->
        <div 
          class="h-full bg-gray-900 transition-all duration-500 ease-in-out dark:bg-gray-100"
          :style="{ width: ((currentStep - 1) / 3) * 100 + '%' }"
        ></div>
      </div>

      <!-- Từng bước (Step Item) -->
      <div 
        v-for="(label, index) in ['Xem lại', 'Giao hàng', 'Thanh toán', 'Hoàn tất']" 
        :key="index"
        class="relative z-10 flex flex-col items-center"
      >
        <!-- Vòng tròn số -->
        <div 
          :class="[
            'flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all duration-300',
            currentStep >= index + 1 
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-black scale-110 shadow-md' 
              : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          ]"
        >
          <!-- Hiện dấu tích nếu bước đó đã qua, hiện số nếu đang ở bước đó hoặc chưa tới -->
          <svg v-if="currentStep > index + 1" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span v-else>{{ index + 1 }}</span>
        </div>

        <!-- Nhãn văn bản (Căn giữa tuyệt đối dưới vòng tròn) -->
        <div class="absolute top-12 whitespace-nowrap text-center">
          <span 
            :class="[
              'text-xs font-bold uppercase tracking-wider transition-colors duration-300 sm:text-sm',
              currentStep >= index + 1 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
            ]"
          >
            {{ label }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps(['currentStep']);
</script>

<style scoped>
/* Đảm bảo phần nhãn không bị che khuất nếu text quá dài */
.relative {
  min-height: 4rem;
}
</style>