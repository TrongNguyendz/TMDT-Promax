<template>
  <div class="max-w-xl mx-auto w-full space-y-6 px-4 md:px-0 py-8">
    
    <div class="text-center space-y-4">
      <div class="flex justify-center">
        <div class="rounded-full bg-green-100 p-5 shadow-lg shadow-green-100/50 dark:bg-green-900/30 dark:shadow-green-900/20">
          <svg class="h-14 w-14 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <div>
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Đặt hàng thành công!</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
          Cảm ơn bạn đã mua sắm. Chúng tôi đã gửi email xác nhận đến bạn.
        </p>
      </div>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Mã đơn hàng</p>
          <p class="font-mono font-semibold text-gray-900 dark:text-white">
            #{{ order?.order_number || 'N/A' }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Phương thức</p>
          <p class="font-medium text-gray-900 dark:text-white truncate">
            {{ order?.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Đã thanh toán (Chuyển khoản)' }}
          </p>
        </div>
      </div>

      <hr class="border-dashed border-gray-200 dark:border-gray-700 mb-6">

      <div class="flex items-end justify-between">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Tổng thanh toán</p>
        </div>
        <div class="text-right">
          <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {{ formatCurrency(order?.final_amount || 0) }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 pt-4">
      <RouterLink :to="`/orders/${order.id}`" class="flex-1 text-center bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Xem chi tiết đơn hàng
      </RouterLink>
      
      <RouterLink to="/" class="flex-1 text-center bg-white border-2 border-gray-200 text-gray-700 py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition-all">
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