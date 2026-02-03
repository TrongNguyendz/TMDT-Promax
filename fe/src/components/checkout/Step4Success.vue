<template>
  <!-- THAY ĐỔI 1: Thêm max-w-3xl (rộng hơn) và mx-auto (căn giữa), tăng khoảng cách space-y-8 -->
  <div class="max-w-3xl mx-auto w-full space-y-8 px-4 md:px-0">
    
    <!-- Header Thành công -->
    <!-- THAY ĐỔI 2: Tăng py-8 lên py-12 để khung cao hơn -->
    <div class="text-center py-12 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-600">
      <div class="flex justify-center mb-6">
        <!-- Tăng kích thước vòng tròn icon -->
        <div class="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
          <!-- Tăng kích thước icon lên h-16 w-16 -->
          <svg class="h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 class="text-4xl font-bold text-green-700 dark:text-green-400 mb-3">Đặt hàng thành công!</h2>
      <p class="text-gray-700 dark:text-gray-300 text-lg">
        Mã đơn hàng: <span class="font-mono font-bold text-xl">{{ order?.order_number || 'N/A' }}</span>
      </p>
    </div>

    <!-- Tóm tắt đơn hàng -->
    <!-- THAY ĐỔI 3: Tăng padding p-6 lên p-10 -->
    <div class="rounded-xl border p-10 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <!-- Dòng tổng tiền -->
      <div class="flex flex-col sm:flex-row justify-between items-center">
        <span class="text-gray-600 dark:text-gray-400 font-medium text-xl">Tổng giá trị đơn hàng</span>
        <span class="text-3xl font-bold text-blue-600 mt-2 sm:mt-0">
          {{ formatCurrency(order?.final_amount || 0) }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Tăng padding nút bấm py-4 -->
      <RouterLink :to="`/orders/${order.id}`" class="flex-1 text-center bg-blue-600 text-white py-4 text-lg rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
        Xem chi tiết đơn hàng
      </RouterLink>
      <RouterLink to="/" class="flex-1 text-center bg-gray-900 text-white py-4 text-lg rounded-xl font-semibold hover:bg-gray-800 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200 transition-colors shadow-lg">
        Tiếp tục mua sắm
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { formatCurrency } from '../../utils/helpers';

defineProps({
  order: {
    type: Object,
    required: true,
    default: () => ({})
  }
});
</script>