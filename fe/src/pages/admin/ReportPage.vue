<template>
  <div class="space-y-10 pb-10 font-sans">
    <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase lg:text-4xl">
          Phân tích kinh doanh
        </h1>
        <p class="mt-1 text-sm text-gray-500">Dữ liệu hiệu suất và tăng trưởng thời gian thực</p>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white"></div>
      <p class="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Đang truy xuất dữ liệu hệ thống...</p>
    </div>

    <div v-else class="space-y-10 animate-in fade-in duration-700">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tổng doanh thu</p>
          <p class="mt-2 text-2xl font-black text-gray-900 dark:text-white">{{ formatCurrency(stats.kpi?.total_revenue || 0) }}</p>
          <div class="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-500">
             <span class="bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">+18.5% ↑</span>
          </div>
        </div>

        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tổng đơn hàng</p>
          <p class="mt-2 text-3xl font-black text-gray-900 dark:text-white">{{ stats.kpi?.total_orders || 0 }}</p>
          <p class="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Giao dịch thành công</p>
        </div>

        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sản phẩm đã bán</p>
          <p class="mt-2 text-3xl font-black text-gray-900 dark:text-white">{{ stats.kpi?.total_products_sold || 0 }}</p>
          <p class="mt-4 text-[10px] font-bold text-indigo-500 uppercase tracking-tighter italic">Hiệu suất kho hàng</p>
        </div>

        <div class="luxe-card p-6">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Giá trị TB/Đơn</p>
          <p class="mt-2 text-2xl font-black text-gray-900 dark:text-white">{{ formatCurrency(stats.avgOrderValue || 0) }}</p>
          <p class="mt-4 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
            <span class="animate-pulse">●</span> LIVE DATA
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button
              @click="activeTab = 'revenue'"
              :class="activeTab === 'revenue' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'"
              class="rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest transition-all">
              Doanh thu định kỳ
            </button>
            <button
              @click="activeTab = 'topProducts'"
              :class="activeTab === 'topProducts' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'"
              class="rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest transition-all">
              Top 5 sản phẩm
            </button>
          </div>

          <button
            @click="activeTab === 'revenue' ? showRevenueChart = !showRevenueChart : showTopProductsChart = !showTopProductsChart"
            class="rounded-full bg-gray-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all">
            {{ (activeTab === 'revenue' ? showRevenueChart : showTopProductsChart) ? 'Chuyển sang danh sách' : 'Chuyển sang biểu đồ' }}
          </button>
        </div>

        <div v-if="activeTab === 'revenue'" class="luxe-card p-8">
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8 italic dark:text-white">Doanh thu định kỳ</h2>

          <div v-if="showRevenueChart" class="relative">
            <div v-if="hoveredRevenue" class="absolute right-0 top-0 z-10 w-44 rounded-2xl bg-white/90 p-3 text-xs font-semibold text-gray-800 shadow-lg backdrop-blur dark:bg-gray-950/80 dark:text-gray-100 border dark:border-gray-800">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">{{ hoveredRevenue.name }}</p>
              <p class="mt-1 text-sm font-black">{{ formatCurrency(hoveredRevenue.value) }}</p>
              <p class="mt-1 text-[9px] text-gray-500">{{ ((hoveredRevenue.value / maxRevenue) * 100).toFixed(0) }}% của cao nhất</p>
            </div>

            <div class="flex items-end justify-between gap-3 h-64 pt-10 px-2 border-b border-gray-50 dark:border-gray-800">
              <div v-for="m in stats.revenueByMonth" :key="m.name" class="flex flex-1 flex-col items-center gap-3 h-full group">
                <div 
                  class="relative w-full max-w-[40px] h-full cursor-pointer rounded-2xl bg-gray-50 dark:bg-gray-800/30 transition-all hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  @mouseenter="hoveredRevenue = m"
                  @mouseleave="hoveredRevenue = null"
                >
                  <div
                    class="absolute bottom-0 left-0 right-0 rounded-2xl bg-gradient-to-t from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 transition-all duration-1000 ease-out shadow-lg"
                    :style="{ height: `${Math.max((m.value / maxRevenue) * 100, 2)}%` }"
                  ></div>
                </div>
                <span class="text-[9px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ m.name }}</span>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div v-for="m in stats.revenueByMonth" :key="m.name" class="flex justify-between items-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-gray-400">{{ m.name }}</p>
                <p class="mt-1 text-sm font-black text-gray-900 dark:text-white">{{ formatCurrency(m.value) }}</p>
              </div>
              <div class="text-[10px] font-black text-gray-500 uppercase tracking-widest">{{ ((m.value / maxRevenue) * 100).toFixed(0) }}%</div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'topProducts'" class="luxe-card p-8">
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8 italic dark:text-white">Top 5 Sản phẩm</h2>

          <div v-if="!stats.topProducts?.length" class="flex h-64 items-center justify-center text-gray-400 italic text-xs uppercase tracking-widest">
            Chưa có dữ liệu giao dịch
          </div>

          <div v-else>
            <div v-if="showTopProductsChart" class="flex flex-col gap-10 md:flex-row md:items-center">
              <div class="relative w-full md:w-1/3 flex items-center justify-center">
                <svg viewBox="0 0 36 36" class="w-52 h-52 transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" class="stroke-gray-100 dark:stroke-gray-800" stroke-width="3" />
                  <template v-for="(segment, idx) in pieSegments" :key="idx">
                    <circle
                      cx="18" cy="18" r="15.915" fill="none"
                      :stroke="segment.color"
                      stroke-width="3.5"
                      stroke-linecap="round"
                      :stroke-dasharray="segment.dasharray"
                      :stroke-dashoffset="segment.dashoffset"
                      class="transition-all duration-1000 ease-in-out cursor-pointer hover:opacity-80"
                      @mouseenter="hoveredProduct = stats.topProducts[idx]"
                      @mouseleave="hoveredProduct = null"
                    />
                  </template>
                </svg>
                
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-8">
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Hạng</p>
                  <p class="text-2xl font-black text-gray-900 dark:text-white">
                    #{{ hoveredProduct ? stats.topProducts.indexOf(hoveredProduct) + 1 : '1' }}
                  </p>
                  <div v-if="hoveredProduct" class="mt-1 transition-all">
                    <p class="text-[9px] font-black uppercase text-indigo-500 truncate max-w-[100px]">{{ hoveredProduct.name }}</p>
                  </div>
                </div>
              </div>

              <div class="grid gap-4 w-full md:w-2/3">
                <div v-for="(p, idx) in stats.topProducts" :key="idx" 
                  class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-4 transition-all hover:translate-x-1"
                  :style="{ borderLeftColor: pieSegments[idx]?.color }"
                  @mouseenter="hoveredProduct = p"
                  @mouseleave="hoveredProduct = null"
                >
                  <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                      <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">TOP 0{{ idx + 1 }}</span>
                      <span class="font-bold dark:text-white truncate text-xs uppercase tracking-tight">{{ p.name }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-black text-gray-900 dark:text-white">{{ p.quantity }} <span class="text-[10px] font-bold text-gray-400 uppercase">Sales</span></div>
                    <div class="text-[9px] font-bold text-gray-500">{{ formatCurrency(p.revenue) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div v-for="(p, idx) in stats.topProducts" :key="idx" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                <div class="flex items-center gap-4">
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
      </div>

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

const activeTab = ref('revenue');
const showRevenueChart = ref(true);
const showTopProductsChart = ref(true);

const hoveredRevenue = ref(null);
const hoveredProduct = ref(null);

const maxRevenue = computed(() => {
  if (!stats.value.revenueByMonth || stats.value.revenueByMonth.length === 0) return 1;
  const values = stats.value.revenueByMonth.map(m => Number(m.value) || 0);
  const max = Math.max(...values);
  return max > 0 ? max : 1;
});

const pieSegments = computed(() => {
  const products = stats.value.topProducts || [];
  const total = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const colors = ['#1F2937', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  // Chu vi hình tròn với r = 15.915 là đúng 100 đơn vị (2 * PI * 15.915 ≈ 100)
  const circumference = 100; 
  let accumulatedPercent = 0;

  return products.map((p, index) => {
    const value = p.revenue || 0;
    const percentage = total ? (value / total) * 100 : 0;
    
    const segment = {
      dasharray: `${percentage} ${circumference}`,
      dashoffset: -accumulatedPercent,
      color: colors[index % colors.length]
    };

    accumulatedPercent += percentage;
    return segment;
  });
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
.luxe-card {
  @apply rounded-[2.5rem] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none;
}
.animate-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>