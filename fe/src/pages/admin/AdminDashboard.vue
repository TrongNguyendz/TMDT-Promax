<template>
  <section class="space-y-10">
    <!-- Header Section -->
    <div class="mb-8 flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Tổng quan hệ thống
        </h1>
        <p class="mt-1 text-sm text-gray-500">Báo cáo hoạt động kinh doanh thời gian thực</p>
      </div>

    </div>

    <!-- Stats Grid (Bento Cards) -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Doanh thu -->
      <div
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <div class="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
            <svg class="h-5 w-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span
            class="text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">+12%</span>
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Doanh thu tuần này</p>
        <p class="mt-1 text-2xl font-black text-gray-900 dark:text-white">{{ formatCurrency(stats.revenueWeek || 0) }}
        </p>
      </div>

      <!-- Đơn hàng -->
      <div
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <div class="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
            <svg class="h-5 w-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span
            class="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">Mới</span>
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Đơn hàng</p>
        <p class="mt-1 text-2xl font-black text-gray-900 dark:text-white">{{ stats.orders }}</p>
      </div>

      <!-- Người dùng -->
      <div
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <div class="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
            <svg class="h-5 w-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Người dùng</p>
        <p class="mt-1 text-2xl font-black text-gray-900 dark:text-white">{{ totalUsers }}</p>
      </div>

      <!-- Tỷ lệ chuyển đổi -->
      <div
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <div class="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
            <svg class="h-5 w-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tỷ lệ chuyển đổi</p>
        <p class="mt-1 text-2xl font-black text-gray-900 dark:text-white">{{ conversionRate || 0 }}%</p>
        <p class="text-xs text-gray-400 mt-1">({{ stats.payingUsers }} / {{ totalUsers }} user)</p>
      </div>
    </div>

    <!-- Bảng đơn hàng gần đây -->
    <div class="mt-6 rounded-lg border p-4 bg-white dark:bg-gray-800 dark:border-gray-700">

      <h2 class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white italic">Đơn hàng gần đây
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
            <tr>
              <th class="py-2">Mã</th>
              <th class="py-2">Ngày</th>
              <th class="py-2">Khách</th>
              <th class="py-2">Tổng</th>
              <th class="py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <!-- [CHANGE] Loop qua danh sách thật recentOrders -->
            <tr v-for="o in recentOrders" :key="o.id" class="dark:text-gray-300">
              <td class="py-2 font-mono font-medium text-blue-600">{{ o.order_number }}</td>
              <td class="py-2">{{ formatDate(o.created_at) }}</td>
              <td class="py-2">{{ o.shipping_fullname }}</td>
              <td class="py-2 font-semibold">{{ formatCurrency(o.final_amount) }}</td>
              <td class="py-2">
                <span class="px-2 py-0.5 rounded text-xs border" :class="getStatusClass(o.status)">
                  {{ o.status }}
                </span>
              </td>
            </tr>
            <!-- Fallback nếu chưa có đơn -->
            <tr v-if="recentOrders.length === 0">
              <td colspan="5" class="py-4 text-center text-gray-500">Chưa có đơn hàng nào</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import { getlistuser } from '../../utils/user_service_api.js';
import OrderAPI from '../../utils/order_service_api';
import { formatCurrency } from '../../utils/helpers';

const ui = useUIStore();
const user = useUserStore();

const totalUsers = ref(0);

// [CHANGE] Cập nhật State để chứa thêm payingUsers
const stats = reactive({
  revenueWeek: 0,
  orders: 0,
  payingUsers: 0 // Số user đã mua hàng ít nhất 1 lần
});
const recentOrders = ref([]);

const ListUser = async () => {
  try {
    const res = await getlistuser(user.token);
    if (res.data.success) {
      totalUsers.value = res.data.pagination.total;
    }
  } catch (error) { console.error(error); }
};

const loadOrderData = async () => {
  try {
    const resStats = await OrderAPI.getReportStats();
    if (resStats.data.success) {
      const data = resStats.data.data;

      // [CHANGE] Gán dữ liệu mới từ Backend
      stats.revenueWeek = data.revenueWeek;
      stats.orders = data.kpi.total_orders;
      stats.payingUsers = data.payingUsers; // Lấy số user đã mua
    }

    const resList = await OrderAPI.getOrders({ limit: 5 });
    if (resList.data.success) {
      recentOrders.value = resList.data.data.slice(0, 5);
    }
  } catch (error) { console.error(error); }
};

// [CHANGE] Cập nhật logic tính Tỷ lệ chuyển đổi
const conversionRate = computed(() => {
  const users = Number(totalUsers.value) || 0;
  const buyers = Number(stats.payingUsers) || 0;

  // Nếu không có user nào, trả về 0.0 luôn để tránh lỗi
  if (users === 0) return '0.0';

  // Tính toán
  return ((buyers / users) * 100).toFixed(1);
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

const getStatusClass = (status) => {
  if (status === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
  if (status === 'shipping') return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-yellow-100 text-yellow-700 border-yellow-200';
};

onMounted(() => {
  ListUser();
  loadOrderData();
});
</script>