<template>
  <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Thống kê mua sắm</h1>
        <p class="mt-2 text-gray-500">Tổng quan chi tiêu và lịch sử hoạt động của bạn.</p>
      </div>
      
      <div class="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            currentFilter === filter.value 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <div v-else class="space-y-8">
      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Tổng chi tiêu</p>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white">{{ formatCurrency(totalSpent) }}</h3>
            </div>
          </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Đơn hàng hoàn tất</p>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white">{{ totalOrders }} <span class="text-sm font-medium text-gray-500">đơn</span></h3>
            </div>
          </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Sản phẩm đã mua</p>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white">{{ totalItems }} <span class="text-sm font-medium text-gray-500">món</span></h3>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 class="mb-6 text-lg font-bold text-gray-900 dark:text-white">Chi tiêu 6 tháng gần nhất</h3>
        
        <div class="relative h-64 w-full">
          <div class="absolute inset-0 flex flex-col justify-between text-xs text-gray-400">
            <div class="flex w-full items-center border-t border-gray-100 border-dashed dark:border-gray-800"><span class="absolute -top-3 right-0 bg-white pl-2 dark:bg-gray-900">Tối đa</span></div>
            <div class="flex w-full items-center border-t border-gray-100 border-dashed dark:border-gray-800"></div>
            <div class="flex w-full items-center border-t border-gray-100 border-dashed dark:border-gray-800"></div>
            <div class="flex w-full items-center border-t border-gray-100 border-dashed dark:border-gray-800"><span class="absolute -top-3 right-0 bg-white pl-2 dark:bg-gray-900">0đ</span></div>
          </div>

          <div class="absolute inset-0 flex items-end justify-between px-8 pb-px sm:px-16">
            <div 
              v-for="(bar, index) in chartData" 
              :key="index"
              class="group relative flex w-12 flex-col items-center sm:w-16"
            >
              <div class="absolute -top-12 z-10 hidden w-max rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-xl group-hover:block dark:bg-white dark:text-gray-900">
                <span class="font-bold">{{ formatCurrency(bar.amount) }}</span>
                <div class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900 dark:bg-white"></div>
              </div>
              
              <div class="w-full rounded-t-xl bg-blue-100 transition-all duration-500 group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-800/50" :style="{ height: '200px' }">
                <div 
                  class="absolute bottom-0 w-full rounded-t-xl bg-blue-600 transition-all duration-1000 group-hover:bg-blue-500" 
                  :style="{ height: `${bar.percentage}%` }"
                ></div>
              </div>
              <span class="mt-4 text-xs font-bold text-gray-500 dark:text-gray-400">{{ bar.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Giao dịch gần đây</h3>
          <RouterLink to="/orders" class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Xem tất cả →
          </RouterLink>
        </div>

        <div v-if="recentOrders.length > 0" class="space-y-4">
          <div 
            v-for="order in recentOrders" 
            :key="order.id"
            class="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white">{{ order.order_number }}</h4>
                <p class="text-xs text-gray-500">{{ new Date(order.created_at).toLocaleDateString('vi-VN') }} • {{ getStatusLabel(order.status) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(order.final_amount) }}</p>
              <p class="text-xs text-gray-500">{{ order.items?.length || 0 }} sản phẩm</p>
            </div>
          </div>
        </div>
        
        <div v-else class="rounded-[2rem] border border-gray-100 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
          <p class="text-gray-500">Chưa có giao dịch nào trong khoảng thời gian này.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useOrderStore } from '@/stores/order'; // Đảm bảo đúng đường dẫn theo cấu trúc của bạn
import { formatCurrency } from '@/utils/helpers'; // Đảm bảo đúng đường dẫn

const orderStore = useOrderStore();
const loading = computed(() => orderStore.loading);

// Bộ lọc
const currentFilter = ref('all');
const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Năm nay', value: 'year' }
];

// --- XỬ LÝ DỮ LIỆU & DỮ LIỆU MẪU ---
// Lấy danh sách đơn hàng thực, nếu rỗng thì tạo dữ liệu mẫu (Mock Data) để giao diện không bị trống
const displayOrders = computed(() => {
  if (orderStore.orders && orderStore.orders.length > 0) {
    return orderStore.orders;
  }
  
  // Trả về dữ liệu mẫu nếu API chưa có data để bạn dễ hình dung UI
  const now = new Date();
  return [
    { id: 1, order_number: 'ORD-1001', status: 'delivered', final_amount: 1500000, created_at: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(), items: [{}, {}] },
    { id: 2, order_number: 'ORD-1002', status: 'delivered', final_amount: 3200000, created_at: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(), items: [{}, {}, {}] },
    { id: 3, order_number: 'ORD-1003', status: 'shipping', final_amount: 850000, created_at: new Date(now.getFullYear(), now.getMonth() - 2, 20).toISOString(), items: [{}] },
    { id: 4, order_number: 'ORD-1004', status: 'delivered', final_amount: 2100000, created_at: new Date(now.getFullYear(), now.getMonth() - 3, 10).toISOString(), items: [{}, {}] },
    { id: 5, order_number: 'ORD-1005', status: 'delivered', final_amount: 4500000, created_at: new Date(now.getFullYear(), now.getMonth() - 4, 5).toISOString(), items: [{}, {}, {}, {}] },
  ];
});

// Lọc dữ liệu theo bộ lọc thời gian
const filteredOrders = computed(() => {
  const orders = displayOrders.value;
  const now = new Date();
  
  if (currentFilter.value === 'month') {
    return orders.filter(o => {
      const date = new Date(o.created_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }
  if (currentFilter.value === 'year') {
    return orders.filter(o => new Date(o.created_at).getFullYear() === now.getFullYear());
  }
  return orders;
});

// --- TÍNH TOÁN THỐNG KÊ ---
// Tính tổng tiền các đơn đã giao (delivered) hoặc đang xử lý
const totalSpent = computed(() => {
  return filteredOrders.value
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + order.final_amount, 0);
});

const totalOrders = computed(() => {
  return filteredOrders.value.filter(o => o.status === 'delivered').length;
});

const totalItems = computed(() => {
  return filteredOrders.value
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => {
      // Dùng length nếu item chưa có quantity, ngược lại cộng dồn quantity
      const itemsCount = order.items?.reduce((q, item) => q + (item.quantity || 1), 0) || 0;
      return sum + itemsCount;
    }, 0);
});

// Đơn hàng gần đây (Lấy 3 đơn mới nhất)
const recentOrders = computed(() => {
  return [...filteredOrders.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);
});

// --- LOGIC BIỂU ĐỒ (6 tháng gần nhất) ---
const chartData = computed(() => {
  const months = [];
  const now = new Date();
  let maxAmount = 0;

  // Tạo mảng 6 tháng gần nhất
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `T${d.getMonth() + 1}`;
    
    // Tính tổng tiền của tháng đó
    const amount = displayOrders.value
      .filter(o => o.status !== 'cancelled')
      .filter(o => {
        const oDate = new Date(o.created_at);
        return oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear();
      })
      .reduce((sum, o) => sum + o.final_amount, 0);

    if (amount > maxAmount) maxAmount = amount;

    months.push({ label: monthLabel, amount, percentage: 0 });
  }

  // Cập nhật phần trăm để vẽ chiều cao cột (Tối thiểu 5% để luôn thấy được vạch cột)
  return months.map(m => ({
    ...m,
    percentage: maxAmount === 0 ? 5 : Math.max(5, (m.amount / maxAmount) * 100)
  }));
});

// Helper: Label trạng thái (Tái sử dụng từ OrderHistory)
const getStatusLabel = (status) => {
  const map = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    packed: 'Đã đóng gói',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };
  return map[status] || status;
};

onMounted(() => {
  // Gọi API lấy dữ liệu thực tế
  if (typeof orderStore.fetchMyOrders === 'function') {
    orderStore.fetchMyOrders();
  }
});
</script>