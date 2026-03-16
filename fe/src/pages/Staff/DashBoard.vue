<!-- views/staff/Dashboard.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Tổng quan ca làm - {{ today }}</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Sản phẩm bán ra" value="187" total="450" color="teal" icon="shopping-cart" />
      <StatCard title="Đơn hàng mới" value="42" trend="+18%" color="blue" icon="shopping-bag" />
      <StatCard title="Khách chờ hỗ trợ" value="9" trend="+3" color="amber" icon="headphones" />
      <StatCard title="Thời gian còn lại ca" value="3h 14m" color="purple" icon="clock" />
    </div>

    <!-- Sản phẩm bán chạy / hàng tồn thấp -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V21M4 11v10l8 4"/></svg>
        Sản phẩm bán chạy hôm nay
      </h2>
      <div class="space-y-4">
        <ProductItem v-for="product in topProducts" :key="product.id" :product="product" />
      </div>
    </div>

    <!-- Đơn hàng gần nhất -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <h2 class="text-xl font-bold mb-4">Đơn hàng gần đây</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">#{{ order.id }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">{{ order.customer }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">{{ order.items }}</td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const today = computed(() => new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

const topProducts = ref([
  { id: 1, name: 'Áo thun oversize 2026', sold: 142, totalStock: 800, status: 'Bán chạy' },
  { id: 2, name: 'Quần jeans slim fit', sold: 45, totalStock: 120, status: 'Tồn thấp' },
]);

const recentOrders = ref([
  { id: 'ORD-0421', customer: 'Nguyễn Văn A', items: 'Áo thun x2', status: 'Đã giao' },
  { id: 'ORD-0420', customer: 'Trần Thị B', items: 'Quần jeans x4', status: 'Chờ đóng gói' },
  { id: 'ORD-0419', customer: 'Lê Minh C', items: 'Váy maxi x1', status: 'Đã giao' },
  { id: 'ORD-0418', customer: 'Phạm Hồng D', items: 'Áo khoác x3', status: 'Hủy' },
]);

function getStatusClass(status) {
  if (status === 'Đã giao') return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
  if (status === 'Chờ đóng gói') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  if (status === 'Hủy') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}
</script>