<!-- views/staff/Orders.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Đơn hàng</h1>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
      <div class="p-6 border-b dark:border-gray-800">
        <h2 class="text-xl font-bold">Danh sách đơn hàng</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Mã đơn</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Khách hàng</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Sản phẩm</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Số lượng</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Tổng tiền</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Trạng thái</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="order in orders" :key="order.id">
              <td class="px-6 py-5 whitespace-nowrap text-sm font-medium">#{{ order.id }}</td>
              <td class="px-6 py-5 whitespace-nowrap">{{ order.customer }}</td>
              <td class="px-6 py-5">{{ order.product }}</td>
              <td class="px-6 py-5 text-center">{{ order.quantity }}</td>
              <td class="px-6 py-5">{{ order.total.toLocaleString('vi-VN') }}đ</td>
              <td class="px-6 py-5">
                <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <button class="text-teal-600 hover:text-teal-800 font-medium">Chi tiết</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const orders = ref([
  { id: 'ORD-0421', customer: 'Nguyễn Văn A', product: 'Áo thun oversize', quantity: 2, total: 1200000, status: 'Đã thanh toán' },
  { id: 'ORD-0420', customer: 'Trần Thị B', product: 'Quần jeans slim', quantity: 1, total: 450000, status: 'Chờ xác nhận' },
  { id: 'ORD-0419', customer: 'Lê Minh C', product: 'Váy maxi dài', quantity: 4, total: 2400000, status: 'Đã đóng gói 2/4' },
]);

function getStatusClass(status) {
  if (status === 'Đã thanh toán') return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
  if (status === 'Chờ xác nhận') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}
</script>