<template>
  <div class="p-6">
    <h1
      class="mb-6 text-2xl font-black tracking-tight dark:text-white uppercase italic"
    >
      Quản lý vận chuyển
    </h1>

    <div class="mb-6 flex gap-4 flex-wrap items-end">
      <div class="min-w-[160px]">
        <label
          class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1"
        >
          Trạng thái
        </label>
        <select
          v-model="status"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-white"
        >
          <option
            v-for="opt in statusOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="flex-1 min-w-[280px]">
        <label
          class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1"
        >
          Tìm kiếm
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Mã đơn, tên khách hàng..."
            class="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-white"
          />
        </div>
      </div>

      <div class="flex flex-col">
        <span class="mb-2 h-4"></span>
        <button
          @click="loadOrders"
          class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <svg
            :class="{ 'animate-spin': loading }"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tải lại
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-black dark:border-white mx-auto"
      ></div>
      <p class="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
        Đang đồng bộ dữ liệu...
      </p>
    </div>

    <div
      v-else
      class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950"
    >
      <table class="min-w-full text-sm">
        <thead
          class="bg-gray-50 text-left dark:bg-gray-900 dark:text-gray-300 border-b dark:border-gray-800"
        >
          <tr>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest">
              Mã đơn
            </th>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest">
              Ngày đặt
            </th>
            <th class="p-4 font-black uppercase text-[10px] tracking-widest">
              Khách hàng
            </th>
            <th
              class="p-4 font-black uppercase text-[10px] tracking-widest text-right"
            >
              Tổng tiền
            </th>
            <th
              class="p-4 font-black uppercase text-[10px] tracking-widest text-center"
            >
              Trạng thái
            </th>
            <th
              class="p-4 font-black uppercase text-[10px] tracking-widest text-center"
            >
              Hành động
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="order in filteredOrders"
            :key="order.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
          >
            <td
              class="p-4 font-mono font-bold text-blue-600 dark:text-blue-400"
            >
              <RouterLink
                :to="`/order-detail/${order.id}`"
                class="hover:underline"
              >
                {{ order.order_number }}
              </RouterLink>
            </td>
            <td class="p-4 text-gray-500">
              {{ new Date(order.created_at).toLocaleDateString("vi-VN") }}
            </td>
            <td class="p-4">
              <p class="font-bold text-gray-900 dark:text-white">
                {{ order.shipping_fullname }}
              </p>
              <p class="text-[11px] text-gray-400">
                {{ order.shipping_phone }}
              </p>
            </td>
            <td
              class="p-4 font-black italic text-right text-gray-900 dark:text-gray-100"
            >
              {{ formatCurrency(order.final_amount) }}
            </td>
            <td class="p-4 text-center">
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border',
                  statusBadgeClass(order.status),
                ]"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openDetail(order)"
                  class="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 uppercase tracking-tighter"
                >
                  Xem chi tiết
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!loading && filteredOrders.length === 0"
      class="mt-12 text-center"
    >
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
      >
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p class="text-gray-500 font-bold uppercase text-xs tracking-widest">
        Không tìm thấy vận đơn nào
      </p>
    </div>

    <Transition name="modal">
      <div
        v-if="selectedOrder"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-md"
          @click="selectedOrder = null"
        ></div>

        <div
          class="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white/80 dark:bg-gray-950/90 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/20 flex flex-col transition-all duration-500"
        >
          <div
            class="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50"
          >
            <div>
              <div class="flex items-center gap-3">
                <h2
                  class="text-2xl font-black italic uppercase tracking-tighter dark:text-white leading-none"
                >
                  Shipping Insight
                </h2>
                <span
                  class="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded uppercase tracking-widest"
                  >GHTK System</span
                >
              </div>
              <div class="flex gap-6 mt-3">
                <div>
                  <p
                    class="text-[9px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Mã đơn GHTK (label_id)
                  </p>
                  <p
                    class="text-sm font-mono font-bold text-blue-600 dark:text-blue-400"
                  >
                    {{ selectedOrder.label_id || "---" }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-[9px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Mã đối tác (partner_id)
                  </p>
                  <p class="text-sm font-mono font-bold dark:text-gray-300">
                    {{ selectedOrder.partner_id || "---" }}
                  </p>
                </div>
              </div>
            </div>
            <button
              @click="selectedOrder = null"
              class="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-full transition-all duration-300"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div class="lg:col-span-2 space-y-8">
                <section>
                  <h3
                    class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5 flex items-center gap-2"
                  >
                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span> Thông
                    tin khách hàng
                  </h3>
                  <div
                    class="bg-gray-50/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-inner"
                  >
                    <div class="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p
                          class="text-[9px] uppercase font-black text-gray-400 mb-1"
                        >
                          Họ tên (customer_fullname)
                        </p>
                        <p
                          class="font-black dark:text-white text-lg italic tracking-tight"
                        >
                          {{ selectedOrder.customer_fullname || "---" }}
                        </p>
                      </div>
                      <div>
                        <p
                          class="text-[9px] uppercase font-black text-gray-400 mb-1"
                        >
                          Số điện thoại (customer_tel)
                        </p>
                        <p class="font-bold text-blue-600 dark:text-blue-400">
                          {{ selectedOrder.customer_tel || "---" }}
                        </p>
                      </div>
                    </div>
                    <div
                      class="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800"
                    >
                      <p
                        class="text-[9px] uppercase font-black text-gray-400 mb-1"
                      >
                        Địa chỉ (address)
                      </p>
                      <p
                        class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                      >
                        {{ selectedOrder.address || "---" }}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3
                    class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5 flex items-center gap-2"
                  >
                    <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Thông số kỹ thuật
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                      class="p-4 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5"
                    >
                      <p
                        class="text-[9px] font-black text-gray-400 uppercase mb-1"
                      >
                        Khối lượng (weight)
                      </p>
                      <p class="font-bold dark:text-white">
                        {{ selectedOrder.weight || "0" }}g
                      </p>
                    </div>
                    <div
                      class="p-4 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5"
                    >
                      <p
                        class="text-[9px] font-black text-gray-400 uppercase mb-1"
                      >
                        Lưu kho (storage_day)
                      </p>
                      <p class="font-bold dark:text-white">
                        {{ selectedOrder.storage_day || "0" }} Ngày
                      </p>
                    </div>
                    <div
                      class="p-4 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5"
                    >
                      <p
                        class="text-[9px] font-black text-gray-400 uppercase mb-1"
                      >
                        Ngày lấy (pick_date)
                      </p>
                      <p class="font-bold text-xs dark:text-white font-mono">
                        {{ selectedOrder.pick_date || "---" }}
                      </p>
                    </div>
                    <div
                      class="p-4 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5"
                    >
                      <p
                        class="text-[9px] font-black text-gray-400 uppercase mb-1"
                      >
                        Ngày giao (deliver_date)
                      </p>
                      <p class="font-bold text-xs dark:text-white font-mono">
                        {{ selectedOrder.deliver_date || "---" }}
                      </p>
                    </div>
                  </div>
                </section>

                <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    class="p-5 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl"
                  >
                    <p
                      class="text-[9px] font-black uppercase text-amber-600 mb-2"
                    >
                      Ghi chú (message)
                    </p>
                    <p
                      class="text-sm italic text-amber-800 dark:text-amber-200"
                    >
                      {{ selectedOrder.message || "Không có ghi chú" }}
                    </p>
                  </div>
                  <div
                    class="p-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl"
                  >
                    <p
                      class="text-[9px] font-black uppercase text-gray-400 mb-2"
                    >
                      Thời gian cập nhật
                    </p>
                    <div class="flex flex-col gap-1">
                      <p class="text-[10px] dark:text-gray-400">
                        Tạo:
                        <span class="font-mono text-gray-900 dark:text-white">{{
                          selectedOrder.created || "---"
                        }}</span>
                      </p>
                      <p class="text-[10px] dark:text-gray-400">
                        Cuối:
                        <span class="font-mono text-gray-900 dark:text-white">{{
                          selectedOrder.modified || "---"
                        }}</span>
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div class="space-y-8">
                <section>
                  <h3
                    class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5"
                  >
                    Trạng thái (status)
                  </h3>
                  <div
                    class="p-6 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center text-center bg-white dark:bg-black/20 border-blue-500/20"
                  >
                    <p
                      class="text-[9px] font-black uppercase text-blue-500 mb-1"
                    >
                      Mã trạng thái: {{ selectedOrder.status || "---" }}
                    </p>
                    <p
                      class="text-xl font-black uppercase italic dark:text-white tracking-tighter"
                    >
                      {{ selectedOrder.status_text || "ĐANG XỬ LÝ" }}
                    </p>
                  </div>
                </section>

                <section class="space-y-4">
                  <h3
                    class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400"
                  >
                    Tài chính (Finance)
                  </h3>

                  <div
                    class="p-8 bg-black dark:bg-white text-white dark:text-black rounded-[40px] shadow-2xl"
                  >
                    <p
                      class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2"
                    >
                      Tiền thu hộ (pick_money)
                    </p>
                    <p class="text-3xl font-black italic tracking-tighter">
                      {{ formatCurrency(selectedOrder.pick_money) }}
                    </p>
                  </div>

                  <div
                    class="p-6 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 space-y-4"
                  >
                    <div class="flex justify-between items-center">
                      <span
                        class="text-[10px] font-black uppercase text-gray-400"
                        >Phí giao hàng (ship_money)</span
                      >
                      <span class="font-bold dark:text-white">{{
                        formatCurrency(selectedOrder.ship_money)
                      }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span
                        class="text-[10px] font-black uppercase text-gray-400"
                        >Phí khai giá (insurance)</span
                      >
                      <span class="font-bold dark:text-white">{{
                        formatCurrency(selectedOrder.insurance)
                      }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span
                        class="text-[10px] font-black uppercase text-gray-400"
                        >Giá trị hàng (value)</span
                      >
                      <span class="font-bold dark:text-white">{{
                        formatCurrency(selectedOrder.value)
                      }}</span>
                    </div>
                    <div
                      class="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center"
                    >
                      <span
                        class="text-[10px] font-black uppercase text-gray-400"
                        >Freeship (is_freeship)</span
                      >
                      <span
                        :class="
                          selectedOrder.is_freeship
                            ? 'text-emerald-500'
                            : 'text-gray-400'
                        "
                        class="font-black italic uppercase text-xs"
                      >
                        {{ selectedOrder.is_freeship ? "Có" : "Không" }}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div
            class="p-6 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end"
          >
            <button
              @click="selectedOrder = null"
              class="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform active:scale-95"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useOrderStore } from "../../stores/order";
import OrderAPI from "../../utils/order_service_api";
import { useUIStore } from "../../stores/ui";
import { formatCurrency } from "../../utils/helpers";

const uiStore = useUIStore();
const orderStore = useOrderStore();

// State
const status = ref("all");
const searchQuery = ref("");
const loading = ref(false);
const selectedOrder = ref(null);

const statusOptions = [
  { value: "all", label: "Tất cả đơn hàng" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "packed", label: "Đã đóng gói" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

// Computed
const orders = computed(() => orderStore.orders);

const filteredOrders = computed(() => {
  let result = orders.value;
  if (status.value !== "all") {
    result = result.filter((o) => o.status === status.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (o) =>
        (o.order_number || "").toLowerCase().includes(q) ||
        (o.shipping_fullname || "").toLowerCase().includes(q) ||
        (o.shipping_phone || "").includes(q),
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
    pending: "bg-yellow-100 border-yellow-200 text-yellow-700",
    confirmed: "bg-blue-100 border-blue-200 text-blue-700",
    packed: "bg-purple-100 border-purple-200 text-purple-700",
    shipping: "bg-orange-100 border-orange-200 text-orange-700",
    delivered: "bg-green-100 border-green-200 text-green-700",
    cancelled: "bg-red-100 border-red-200 text-red-700",
  };
  return map[status] || "bg-yellow-100 border-yellow-200 text-yellow-700";
};

const getStatusLabel = (status) => {
  const map = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    packed: "Đã đóng gói",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};
</script>

<style scoped>
/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from,
.modal-leave-to {
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
