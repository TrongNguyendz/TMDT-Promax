<template>
  <div class="p-6">
    <h1 class="mb-6 text-2xl font-black tracking-tight dark:text-white uppercase italic">
      Quản lý đơn hàng
    </h1>

    <div class="mb-6 flex gap-4 flex-wrap items-end">
      <div class="min-w-[160px]">
        <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Trạng thái</label>
        <select v-model="status"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-white">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="flex-1 min-w-[280px]">
        <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Tìm kiếm</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          <svg :class="{ 'animate-spin': loading }" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Tải lại
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-500 text-sm font-bold uppercase tracking-widest">Đang cập nhật dữ liệu...</p>
    </div>

    <div v-else class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50/50 text-left dark:bg-gray-900/50 dark:text-gray-300 border-b dark:border-gray-800">
          <tr>
            <th class="p-4 font-black uppercase text-[11px] tracking-widest">Mã đơn</th>
            <th class="p-4 font-black uppercase text-[11px] tracking-widest">Ngày đặt</th>
            <th class="p-4 font-black uppercase text-[11px] tracking-widest">Khách hàng</th>
            <th class="p-4 font-black uppercase text-[11px] tracking-widest text-right">Tổng tiền</th>
            <th class="p-4 font-black uppercase text-[11px] tracking-widest text-center">Trạng thái</th>
            <th class="p-4 font-black uppercase text-[11px] tracking-widest text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
            <td class="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
              <RouterLink :to="`/order-detail/${order.id}`" class="hover:underline">#{{ order.order_number }}</RouterLink>
            </td>
            <td class="p-4 text-gray-500">{{ formatDate(order.created_at) }}</td>
            <td class="p-4">
              <div class="font-bold text-gray-900 dark:text-white">{{ order.shipping_fullname }}</div>
              <div class="text-[11px] text-gray-400 font-medium">{{ order.shipping_phone }}</div>
            </td>
            <td class="p-4 font-black text-right text-gray-900 dark:text-gray-100">
              {{ formatCurrency(order.final_amount) }}
            </td>
            <td class="p-4 text-center">
              <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter', statusBadgeClass(order.status)]">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center justify-center gap-2">
                <!-- Nút xem chi tiết -->
                <RouterLink :to="`/admin/order-detail/${order.id}`"
                  class="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500/50"
                  title="Xem chi tiết">
                  <svg class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </RouterLink>

                <!-- Nút duyệt nhanh -->
                <button 
                  v-if="['pending', 'takepacking', 'shipping'].includes(order.status)"
                  @click="handleNextStep(order)"
                  class="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-green-500 hover:bg-green-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-green-500/50"
                  :title="getNextStepLabel(order.status)">
                  <svg class="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <!-- Nút hủy đơn -->
                <button 
                  v-if="order.status === 'pending'"
                  @click="cancelOrder(order)"
                  class="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-red-500 hover:bg-red-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-500/50"
                  title="Hủy đơn">
                  <svg class="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div v-else-if="order.status === 'delivered'" class="flex items-center gap-1 text-green-500 font-black text-[10px] uppercase italic">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Hoàn tất
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && filteredOrders.length === 0" class="mt-20 text-center">
      <div class="flex flex-col items-center gap-4">
        <svg class="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-gray-400 font-medium uppercase tracking-widest text-sm">Không tìm thấy dữ liệu đơn hàng</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { useOrderStore } from "../../stores/order";
import OrderAPI from "../../utils/order_service_api";
import { useUIStore } from "../../stores/ui";
import { formatCurrency } from "../../utils/helpers";

const uiStore = useUIStore();
const orderStore = useOrderStore();

const status = ref("all");
const searchQuery = ref("");
const loading = ref(false);
let refreshTimer = null;

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "packed", label: "Đã đóng gói" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

const orders = computed(() => orderStore.orders);

const filteredOrders = computed(() => {
  let result = orders.value;
  if (status.value !== "all") result = result.filter((o) => o.status === status.value);
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(o => 
      (o.order_number || "").toLowerCase().includes(q) ||
      (o.shipping_fullname || "").toLowerCase().includes(q) ||
      (o.shipping_phone || "").includes(q)
    );
  }
  return result;
});

const loadOrders = async () => {
  loading.value = true;
  await orderStore.fetchAllOrders();
  loading.value = false;
};

// Lấy nhãn cho bước tiếp theo
const getNextStepLabel = (status) => {
  const steps = {
    pending: 'Duyệt đơn',
    takepacking: 'Chờ vận chuyển',
    shipping: 'Giao hàng'
  };
  return steps[status] || 'Cập nhật';
};

// Hàm duyệt đơn theo luồng Pipeline
const handleNextStep = async (order) => {
  let nextStatus = '';
  let msg = '';

 if (order.status === 'pending') {
    nextStatus = 'confirmed';
    msg = `Xác nhận duyệt đơn #${order.order_number}?`;
  } else if (order.status === 'confirmed') {
    nextStatus = 'packed';
    msg = `Xác nhận đơn #${order.order_number} đã đóng gói?`;
  } else if (order.status === 'packed') {
    nextStatus = 'shipping';
    msg = `Xác nhận đơn #${order.order_number} đang giao hàng?`;
  }

  if (nextStatus && confirm(msg)) {
    try {
      const res = await OrderAPI.updateOrderStatus(order.id, nextStatus);
      if (res.data.success) {
        uiStore.pushToast({ type: "success", message: `Đã chuyển sang trạng thái: ${getStatusLabel(nextStatus)}` });
        await loadOrders(); // Reload to get fresh data
      }
    } catch (e) {
      uiStore.pushToast({ type: "error", message: "Lỗi hệ thống" });
    }
  }
};

// Hàm hủy đơn hàng
const cancelOrder = async (order) => {
  if (confirm(`Xác nhận hủy đơn hàng #${order.order_number}?`)) {
    try {
      const res = await OrderAPI.updateOrderStatus(order.id, 'cancelled');
      if (res.data.success) {
        uiStore.pushToast({ type: "success", message: "Đã hủy đơn hàng" });
        await loadOrders();
      }
    } catch (e) {
      uiStore.pushToast({ type: "error", message: "Lỗi hủy đơn hàng" });
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString("vi-VN");
};

onMounted(() => {
  loadOrders();
  // Tự động tải lại sau mỗi 1 tiếng
  refreshTimer = setInterval(() => {
    console.log("Auto refreshing data...");
    orderStore.fetchAllOrders();
  }, 3600000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

const statusBadgeClass = (s) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500",
    confirmed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-500",
    packed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500",
    shipping: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500",
  };
  return map[s] || "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500";
};

const getStatusLabel = (s) => {
  const map = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    packed: "Đã đóng gói",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy"
  };
  return map[s] || s;
};
</script>