<template>
  <div class="p-6">
    <h1 class="mb-6 text-2xl font-black tracking-tight dark:text-white uppercase italic">
      Quản lý vận chuyển
    </h1>

    <div class="mb-6 flex gap-4 flex-wrap items-end">
      <div class="min-w-[160px]">
        <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
          Trạng thái
        </label>
        <select v-model="status"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-white">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="flex-1 min-w-[280px]">
        <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
          Tìm kiếm
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input v-model="searchQuery" type="text" placeholder="Mã đơn, tên khách hàng..."
            class="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-white" />
        </div>
      </div>

      <div class="flex flex-col">
        <span class="mb-2 h-4"></span>
        <button @click="loadOrders"
          class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900">
          <svg :class="{ 'animate-spin': loading }" class="h-4 w-4" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Tải lại
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-black dark:border-white mx-auto"></div>
      <p class="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">Đang đồng bộ dữ liệu...</p>
    </div>

    <div v-else class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-left dark:bg-gray-900 dark:text-gray-300 border-b dark:border-gray-800">
          <tr>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest">Mã đơn</th>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest">Ngày đặt</th>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest">Khách hàng</th>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest text-right">Tổng tiền</th>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest text-center">Trạng thái</th>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest text-center">Hành động</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
            <td class="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
              <RouterLink :to="`/order-detail/${order.id}`" class="hover:underline">
                {{ order.order_number }}
              </RouterLink>
            </td>
            <td class="p-4 text-gray-500">
              {{ new Date(order.created_at).toLocaleDateString('vi-VN') }}
            </td>
            <td class="p-4">
              <p class="font-bold text-gray-900 dark:text-white">{{ order.shipping_fullname }}</p>
              <p class="text-[11px] text-gray-400">{{ order.shipping_phone }}</p>
            </td>
            <td class="p-4 font-black italic text-right text-gray-900 dark:text-gray-100">
              {{ formatCurrency(order.final_amount) }}
            </td>
            <td class="p-4 text-center">
              <span :class="['inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border', statusBadgeClass(order.status)]">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center justify-center gap-2">
                <button @click="openDetail(order)"
                  class="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 uppercase tracking-tighter">
                  Xem chi tiết
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && filteredOrders.length === 0" class="mt-12 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p class="text-gray-500 font-bold uppercase text-xs tracking-widest">Không tìm thấy vận đơn nào</p>
    </div>

    <Transition name="modal">
      <div v-if="selectedOrder" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-md" @click="selectedOrder = null"></div>
        
        <div class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white/80 dark:bg-gray-950/90 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 flex flex-col transition-all duration-500">
          
          <div class="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50">
            <div>
              <h2 class="text-2xl font-black italic uppercase tracking-tighter dark:text-white leading-none">Shipping Insight</h2>
              <p class="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase mt-2 tracking-[0.2em] font-bold">{{ selectedOrder.order_number }}</p>
            </div>
            <button @click="selectedOrder = null" class="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-full transition-all duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3" stroke-linecap="round"/></svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              <div class="space-y-10">
                <section>
                  <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5 flex items-center gap-2">
                    <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Receiver Info
                  </h3>
                  <div class="bg-gray-50/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-inner">
                    <p class="font-black dark:text-white text-xl italic">{{ selectedOrder.shipping_fullname }}</p>
                    <p class="text-gray-500 font-bold text-sm mt-1">{{ selectedOrder.shipping_phone }}</p>
                    <div class="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                      <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{{ selectedOrder.shipping_address }}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5">Package Content</h3>
                  <div class="space-y-4">
                    <div v-for="item in selectedOrder.items" :key="item.id" class="flex gap-5 p-4 bg-white dark:bg-black/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                      <div class="w-20 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <img :src="item.image" class="w-full h-full object-cover" />
                      </div>
                      <div class="flex-1 py-1">
                        <p class="font-bold text-sm dark:text-white line-clamp-1 italic uppercase tracking-tighter">{{ item.name }}</p>
                        <div class="flex gap-4 mt-2 text-[10px] font-black uppercase text-gray-400">
                          <span>Size <b class="text-black dark:text-white ml-1">{{ item.size }}</b></span>
                          <span>Color <b class="text-black dark:text-white ml-1">{{ item.color }}</b></span>
                        </div>
                        <p class="text-black dark:text-white font-black mt-3 italic">{{ formatCurrency(item.price) }}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div class="space-y-10">
                <section>
                  <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-2">
                    <span class="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Live Tracking (GHTK)
                  </h3>
                  <div class="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-500 before:to-transparent">
                    <div v-for="(log, idx) in selectedOrder.tracking_history" :key="idx" class="relative group">
                      <div class="absolute -left-[27px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-gray-950 transition-all duration-500 shadow-lg" 
                           :class="idx === 0 ? 'bg-blue-600 scale-125' : 'bg-gray-200 dark:bg-gray-800'"></div>
                      <div :class="{'opacity-100': idx === 0, 'opacity-40': idx !== 0}">
                        <p class="text-xs font-black uppercase tracking-tight italic dark:text-white">{{ log.status_text }}</p>
                        <p class="text-[10px] text-gray-400 mt-1 font-mono tracking-widest uppercase">{{ log.time }}</p>
                      </div>
                    </div>
                    <div v-if="!selectedOrder.tracking_history?.length" class="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                      Đang đồng bộ hành trình...
                    </div>
                  </div>
                </section>

                <div class="p-8 bg-black/5 dark:bg-white/5 rounded-[32px] border border-black/10 dark:border-white/10 flex justify-between items-center">
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Paid</span>
                  <span class="text-2xl font-black italic text-black dark:text-white">{{ formatCurrency(selectedOrder.final_amount) }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useOrderStore } from '../../stores/order';
import OrderAPI from '../../utils/order_service_api';
import { useUIStore } from '../../stores/ui';
import { formatCurrency } from '../../utils/helpers';

const uiStore = useUIStore();
const orderStore = useOrderStore();

// State
const status = ref('all');
const searchQuery = ref('');
const loading = ref(false);
const selectedOrder = ref(null);

const statusOptions = [
  { value: 'all', label: 'Tất cả đơn hàng' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' }
];

// Computed
const orders = computed(() => orderStore.orders);

const filteredOrders = computed(() => {
  let result = orders.value;
  if (status.value !== 'all') {
    result = result.filter(o => o.status === status.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(o =>
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.shipping_fullname || '').toLowerCase().includes(q) ||
      (o.shipping_phone || '').includes(q)
    );
  }
  return result;
});

// Methods
const loadOrders = async () => {
  loading.value = true;
  await orderStore.fetchAllOrders();
  loading.value = false;
};

const openDetail = (order) => {
  selectedOrder.value = order;
};

onMounted(() => {
  loadOrders();
});

// Helpers
const statusBadgeClass = (status) => {
  const map = {
    pending: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800',
    processing: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800',
    shipping: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800',
    delivered: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800',
    cancelled: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800'
  };
  return map[status] || 'bg-gray-100 border-gray-200 text-gray-600';
};

const getStatusLabel = (status) => {
  const map = {
    pending: 'Chờ xử lý',
    processing: 'Đang gói',
    shipping: 'Đang giao',
    delivered: 'Hoàn tất',
    cancelled: 'Đã hủy'
  };
  return map[status] || status;
};
</script>

<style scoped>
/* Modal Transition */
.modal-enter-active, .modal-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>