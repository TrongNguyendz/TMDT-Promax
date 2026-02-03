<template>
  <div class="space-y-10 pb-10 font-sans">
    <!-- 1. Header Section -->
    <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase lg:text-4xl">
          Phân tích kinh doanh
        </h1>
        <p class="mt-1 text-sm text-gray-500">Dữ liệu hiệu suất và tăng trưởng thời gian thực</p>
      </div>
      
      <!-- Export Action -->
      <!-- <button class="hidden sm:flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 transition-all active:scale-95">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Xuất báo cáo
      </button> -->
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white"></div>
      <p class="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Đang truy xuất dữ liệu hệ thống...</p>
    </div>

    <div v-else class="space-y-10 animate-in fade-in duration-700">
      <!-- 2. KPI CARDS (Bento Style) -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <!-- Doanh thu -->
        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tổng doanh thu</p>
          <p class="mt-2 text-2xl font-black text-gray-900 dark:text-white">{{ formatCurrency(stats.kpi?.total_revenue || 0) }}</p>
          <div class="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-500">
             <span class="bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">+18.5% ↑</span>
          </div>
        </div>

        <!-- Đơn hàng -->
        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tổng đơn hàng</p>
          <p class="mt-2 text-3xl font-black text-gray-900 dark:text-white">{{ stats.kpi?.total_orders || 0 }}</p>
          <p class="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Giao dịch thành công</p>
        </div>

        <!-- Sản phẩm bán chạy -->
        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sản phẩm đã bán</p>
          <p class="mt-2 text-3xl font-black text-gray-900 dark:text-white">{{ stats.kpi?.total_products_sold || 0 }}</p>
<p class="mt-4 text-[10px] font-bold text-indigo-500 uppercase tracking-tighter italic">Hiệu suất kho hàng</p>
        </div>

        <!-- Giá trị TB đơn -->
        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Giá trị TB/Đơn</p>
          <p class="mt-2 text-2xl font-black text-gray-900 dark:text-white">{{ formatCurrency(stats.avgOrderValue || 0) }}</p>
          <p class="mt-4 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
            <span class="animate-pulse">●</span> LIVE DATA
          </p>
        </div>
      </div>

      <!-- 3. BIỂU ĐỒ & TOP SẢN PHẨM -->
      <div class="grid gap-8 md:grid-cols-12">
        <!-- Doanh thu theo tháng -->
        <div class="luxe-card p-8 md:col-span-7">
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8 italic dark:text-white">Doanh thu định kỳ</h2>
          <div class="space-y-6">
            <div v-for="m in stats.revenueByMonth" :key="m.name" class="group">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">{{ m.name }}</span>
                <span class="text-xs font-black text-gray-900 dark:text-white">{{ formatCurrency(m.value) }}</span>
              </div>
              <div class="h-3 bg-gray-50 rounded-full dark:bg-gray-800 overflow-hidden shadow-inner">
                <div 
                  class="h-full bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 rounded-full transition-all duration-1000 ease-out" 
                  :style="{ width: `${(m.value / maxRevenue) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Sản phẩm -->
        <div class="luxe-card p-8 md:col-span-5">
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8 italic dark:text-white">Top 5 Sản phẩm</h2>
          <div v-if="!stats.topProducts?.length" class="flex h-64 items-center justify-center text-gray-400 italic text-xs uppercase tracking-widest">
            Chưa có dữ liệu giao dịch
          </div>
          <div v-else class="space-y-4">
            <div v-for="(p, idx) in stats.topProducts" :key="idx" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
              <div class="flex items-center gap-4 overflow-hidden">
                <span class="text-xs font-black text-gray-300 italic">0{{ idx + 1 }}</span>
                <span class="font-bold dark:text-white truncate text-xs uppercase tracking-tight">{{ p.name }}</span>
              </div>
              <div class="text-right shrink-0">
<div class="text-sm font-black text-gray-900 dark:text-white">{{ p.quantity }} <span class="text-[10px] font-bold text-gray-400 uppercase">Sales</span></div>
                <div class="text-[9px] font-bold text-gray-500">{{ formatCurrency(p.revenue) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 4. TRẠNG THÁI ĐƠN HÀNG -->
      <div class="luxe-card p-10">
        <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-10 text-center italic dark:text-white">Tỷ lệ xử lý vận hành</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div v-for="status in stats.orderStatus" :key="status.name" class="flex flex-col items-center group">
            <div class="relative w-24 h-24 mb-4">
              <svg class="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" class="stroke-gray-50 dark:stroke-gray-800" stroke-width="3"></circle>
                <circle 
                  cx="18" cy="18" r="16" fill="none" 
                  class="stroke-gray-900 dark:stroke-white transition-all duration-1000" 
                  stroke-width="3.5" 
                  :stroke-dasharray="`${status.percentage}, 100`" 
                  stroke-linecap="round"
                ></circle>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col">
                <span class="text-lg font-black dark:text-white">{{ status.percentage }}%</span>
              </div>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ status.label }}</p>
            <p class="text-[10px] font-bold dark:text-gray-500">{{ status.count }} định danh</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import OrderAPI from '../../utils/order_service_api';
import { formatCurrency } from '../../utils/helpers';

const stats = ref({});
const loading = ref(true);

const maxRevenue = computed(() => {
  if (!stats.value.revenueByMonth) return 1;
  const max = Math.max(...stats.value.revenueByMonth.map(m => m.value));
  return max > 0 ? max : 1;
});

onMounted(async () => {
  try {
    loading.value = true;
    const res = await OrderAPI.getReportStats();
    if (res.data.success) {
      stats.value = res.data.data;
    }
  } catch (e) {
    console.error("Lỗi tải báo cáo:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Luxe Card Base Style */
.luxe-card {
  @apply rounded-[2.5rem] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none;
}

/* Animations */
.animate-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>