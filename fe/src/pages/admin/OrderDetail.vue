<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <RouterLink
          to="/admin/orders"
          class="rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </RouterLink>
        <h1
          class="text-2xl font-black tracking-tight dark:text-white uppercase italic"
        >
          Chi tiết đơn hàng #{{ order?.order_number }}
        </h1>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"
      ></div>
      <p class="mt-4 text-gray-500 text-sm font-bold uppercase tracking-widest">
        Đang tải dữ liệu...
      </p>
    </div>

    <div v-else-if="order" class="space-y-6">
      <!-- Status Timeline -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
      >
        <h3
          class="mb-4 text-sm font-black uppercase tracking-widest text-gray-400"
        >
          Trạng thái đơn hàng
        </h3>
        <div class="relative">
          <div
            class="absolute left-5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-800"
          ></div>
          <div
            v-for="(step, index) in statusSteps"
            :key="step.status"
            class="relative mb-6 flex items-start gap-4 last:mb-0"
          >
            <div
              :class="[
                'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2',
                step.completed
                  ? 'bg-green-500 border-green-500'
                  : 'bg-white border-gray-300 dark:bg-gray-950 dark:border-gray-700',
              ]"
            >
              <svg
                v-if="step.completed"
                class="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <div
                v-else
                :class="[
                  'h-2 w-2 rounded-full',
                  step.active ? 'bg-blue-500' : 'bg-gray-300',
                ]"
              ></div>
            </div>
            <div class="flex-1 pt-1">
              <div class="flex items-center gap-2">
                <p class="font-bold text-gray-900 dark:text-white">
                  {{ step.label }}
                </p>
                <p v-if="step.date" class="text-xs text-gray-400">
                  {{ step.date }}
                </p>
              </div>
              <p
                v-if="step.active"
                class="text-xs text-blue-600 dark:text-blue-400 mt-1"
              >
                Đang xử lý...
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Info Grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Customer Info -->
        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
        >
          <h3
            class="mb-4 text-sm font-black uppercase tracking-widest text-gray-400"
          >
            Thông tin khách hàng
          </h3>
          <div class="space-y-3">
            <div>
              <p class="text-xs font-medium text-gray-400">Họ tên</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ order.shipping_fullname }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400">Số điện thoại</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ order.shipping_phone }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400">Email</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ order.shipping_email || "Không có" }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400">Địa chỉ</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ order.shipping_address }}, {{ order.shipping_city }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
        >
          <h3
            class="mb-4 text-sm font-black uppercase tracking-widest text-gray-400"
          >
            Tổng quan đơn hàng
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Ngày đặt</span>
              <span class="font-bold">{{
                new Date(order.created_at).toLocaleString("vi-VN")
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Phương thức thanh toán</span
              >
              <span class="font-bold">{{
                order.payment_method === "cod"
                  ? "COD (Thanh toán khi nhận hàng)"
                  : "Chuyển khoản"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Trạng thái thanh toán</span
              >
              <span
                :class="
                  order.payment_status === 'paid'
                    ? 'text-green-600'
                    : 'text-yellow-600'
                "
                class="font-bold"
              >
                {{
                  order.payment_status === "paid"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"
                }}
              </span>
            </div>
            <div class="border-t pt-3 mt-3">
              <div class="flex justify-between text-lg">
                <span class="font-black">Tổng cộng</span>
                <span class="font-black text-blue-600">{{
                  formatCurrency(order.final_amount)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
        >
          <h3
            class="mb-4 text-sm font-black uppercase tracking-widest text-gray-400"
          >
            Thao tác
          </h3>
          <div class="space-y-3">
            <button
              v-if="
                ['pending', 'takepacking', 'shipping'].includes(order.status)
              "
              @click="updateStatus"
              class="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              {{ getNextStepButtonLabel(order.status) }}
            </button>
            <button
              v-if="order.status === 'pending'"
              @click="cancelOrder"
              class="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 font-bold text-red-600 transition-all hover:bg-red-50 active:scale-95"
            >
              Hủy đơn hàng
            </button>
            <button
              @click="copyOrderInfo"
              class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
            >
              Sao chép thông tin
            </button>
          </div>
        </div>
      </div>

      <!-- Products List -->
      <div
        class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      >
        <div class="border-b p-6 dark:border-gray-800">
          <h3
            class="text-sm font-black uppercase tracking-widest text-gray-400"
          >
            Sản phẩm đã đặt
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th
                  class="p-4 text-left font-black uppercase text-[11px] tracking-widest"
                >
                  Sản phẩm
                </th>
                <th
                  class="p-4 text-center font-black uppercase text-[11px] tracking-widest"
                >
                  Số lượng
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
              <tr v-for="item in order.items" :key="item.id">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="item.product_image"
                      :src="item.product_image"
                      class="h-12 w-12 rounded-lg object-cover"
                    />
                    <div
                      v-else
                      class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100"
                    >
                      <svg
                        class="h-6 w-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 dark:text-white">
                        {{ item.product_name }}
                      </p>
                      <p class="text-xs text-gray-400">
                        {{ formatCurrency(item.price) }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <span
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 font-bold"
                  >
                    {{ item.quantity }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useUIStore } from "../../stores/ui";
import OrderAPI from "../../utils/order_service_api";
import { formatCurrency } from "../../utils/helpers";

const route = useRoute();
const router = useRouter();
const uiStore = useUIStore();
const order = ref(null);
const loading = ref(true);

const statusSteps = computed(() => {
  const statusOrder = [
    "pending",
    "takepacking",
    "shipping",
    "deliver",
    "delivered",
  ];
  const currentIndex = statusOrder.indexOf(order.value?.status);

  const steps = [
    {
      status: "pending",
      label: "Đơn hàng được tạo",
      completed: false,
      active: false,
    },
    {
      status: "takepacking",
      label: "Đã xác nhận & đóng gói",
      completed: false,
      active: false,
    },
    {
      status: "shipping",
      label: "Chờ vận chuyển",
      completed: false,
      active: false,
    },
    {
      status: "deliver",
      label: "Đang giao hàng",
      completed: false,
      active: false,
    },
    {
      status: "delivered",
      label: "Giao hàng thành công",
      completed: false,
      active: false,
    },
  ];

  steps.forEach((step, index) => {
    if (index < currentIndex) {
      step.completed = true;
    } else if (index === currentIndex) {
      step.active = true;
    }
  });

  return steps;
});

const getNextStepButtonLabel = (status) => {
  const steps = {
    pending: "Duyệt đơn hàng",
    takepacking: "Xác nhận chờ vận chuyển",
    shipping: "Xác nhận đang giao hàng",
    deliver: "Xác nhận đã giao hàng",
  };
  return steps[status] || "Cập nhật trạng thái";
};

const loadOrderDetail = async () => {
  loading.value = true;
  try {
    const orderId = route.params.id;
    const response = await OrderAPI.getOrderById(orderId);
    if (response.data.success) {
      order.value = response.data.data;
    } else {
      uiStore.pushToast({ type: "error", message: "Không tìm thấy đơn hàng" });
      router.push("/orders");
    }
  } catch (error) {
    console.error("Error loading order:", error);
    uiStore.pushToast({ type: "error", message: "Lỗi tải dữ liệu đơn hàng" });
  } finally {
    loading.value = false;
  }
};

const updateStatus = async () => {
  let nextStatus = "";
  let msg = "";

  if (order.value.status === "pending") {
    nextStatus = "takepacking";
    msg = `Xác nhận duyệt đơn hàng #${order.value.order_number}?`;
  } else if (order.value.status === "takepacking") {
    nextStatus = "shipping";
    msg = `Xác nhận đơn hàng #${order.value.order_number} đang chờ vận chuyển?`;
  } else if (order.value.status === "shipping") {
    nextStatus = "deliver";
    msg = `Xác nhận đơn hàng #${order.value.order_number} đang giao hàng?`;
  } else if (order.value.status === "deliver") {
    nextStatus = "delivered";
    msg = `Xác nhận đơn hàng #${order.value.order_number} đã giao thành công?`;
  }

  if (nextStatus && confirm(msg)) {
    try {
      const res = await OrderAPI.updateOrderStatus(order.value.id, nextStatus);
      if (res.data.success) {
        uiStore.pushToast({
          type: "success",
          message: `Đã cập nhật trạng thái: ${getStatusLabel(nextStatus)}`,
        });
        await loadOrderDetail(); // Reload to get fresh data
      }
    } catch (e) {
      uiStore.pushToast({ type: "error", message: "Lỗi cập nhật trạng thái" });
    }
  }
};

const cancelOrder = async () => {
  if (confirm(`Xác nhận hủy đơn hàng #${order.value.order_number}?`)) {
    try {
      const res = await OrderAPI.updateOrderStatus(order.value.id, "cancelled");
      if (res.data.success) {
        uiStore.pushToast({ type: "success", message: "Đã hủy đơn hàng" });
        await loadOrderDetail();
      }
    } catch (e) {
      uiStore.pushToast({ type: "error", message: "Lỗi hủy đơn hàng" });
    }
  }
};

const getStatusLabel = (status) => {
  const map = {
    pending: "Chờ xác nhận",
    takepacking: "Đang đóng gói",
    shipping: "Chờ vận chuyển",
    deliver: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};

const copyOrderInfo = () => {
  const info = `
ĐƠN HÀNG #${order.value.order_number}
Khách hàng: ${order.value.shipping_fullname}
Điện thoại: ${order.value.shipping_phone}
Địa chỉ: ${order.value.shipping_address}, ${order.value.shipping_city}
Tổng tiền: ${formatCurrency(order.value.final_amount)}
Trạng thái: ${getStatusLabel(order.value.status)}
  `;
  navigator.clipboard.writeText(info);
  uiStore.pushToast({ type: "success", message: "Đã sao chép thông tin" });
};

const printOrder = () => {
  window.print();
};

onMounted(() => {
  loadOrderDetail();
});
</script>

<style scoped>
@media print {
  button,
  .rounded-2xl:first-child {
    display: none !important;
  }
  body * {
    visibility: hidden;
  }
  .p-6,
  .p-6 * {
    visibility: visible;
  }
  .p-6 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
  }
}
</style>
