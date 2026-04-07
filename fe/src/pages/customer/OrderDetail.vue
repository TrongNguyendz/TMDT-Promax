<template>
  <section class="max-w-6xl mx-auto py-8 px-4">
    <!-- Navigation -->
    <button
      @click="goBack"
      class="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors dark:text-gray-400 dark:hover:text-gray-200"
    >
      <svg
        class="w-4 h-4 mr-1"
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
      Quay lại danh sách
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
      ></div>
      <p class="mt-4 text-gray-500">Đang tải thông tin đơn hàng...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="order" class="grid gap-8 lg:grid-cols-[1fr_380px]">
      <!-- Left Column: Details -->
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Đơn hàng #{{ order.order_number }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Đặt ngày {{ new Date(order.created_at).toLocaleString("vi-VN") }}
            </p>
          </div>
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium border',
              statusBadgeClass(order.status),
            ]"
          >
            {{ getStatusLabel(order.status) }}
          </span>
        </div>

        <!-- Product List (Snapshot Data) -->
        <div
          class="rounded-xl border border-gray-200 overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm"
        >
          <div
            class="p-4 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200"
          >
            Sản phẩm ({{ order.items ? order.items.length : 0 }})
          </div>
          <ul class="divide-y divide-gray-200 dark:divide-gray-700">
            <li
              v-for="item in order.items"
              :key="item.id"
              class="p-4 flex gap-4"
            >
              <img
                :src="item.product_image || 'https://via.placeholder.com/80'"
                :alt="item.product_name"
                class="h-20 w-20 rounded-lg object-cover bg-gray-100 border border-gray-200"
              />
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ item.product_name }}
                </h3>
                <p
                  v-if="item.color || item.size"
                  class="text-sm text-gray-500 mt-1"
                >
                  <span v-if="item.color">Màu: {{ item.color }}</span>
                  <span v-if="item.color && item.size" class="mx-1">|</span>
                  <span v-if="item.size">Size: {{ item.size }}</span>
                </p>
                <div class="flex justify-between items-end mt-2">
                  <p class="text-sm text-gray-500">
                    Số lượng: {{ item.quantity }}
                  </p>
                  <p class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(item.unit_price) }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Shipping Info (Snapshot Data) -->
        <div
          class="rounded-xl border border-gray-200 bg-white p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm"
        >
          <h3
            class="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white"
          >
            <svg
              class="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Thông tin giao hàng
          </h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 mb-1">Người nhận</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                {{ order.shipping_fullname }}
              </p>
              <p class="text-gray-600 dark:text-gray-400">
                {{ order.shipping_phone }}
              </p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">Địa chỉ</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                {{ order.shipping_address }}
              </p>
              <p class="text-gray-600 dark:text-gray-400">
                {{ order.shipping_city }}
              </p>
            </div>
            <div
              v-if="order.notes"
              class="md:col-span-2 mt-2 pt-2 border-t border-dashed dark:border-gray-700"
            >
              <p class="text-gray-500">Ghi chú:</p>
              <p class="italic text-gray-700 dark:text-gray-300">
                {{ order.notes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Summary & Actions -->
      <aside class="space-y-6">
        <!-- Payment Summary -->
        <div
          class="rounded-xl border border-gray-200 bg-white p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm"
        >
          <h3 class="font-semibold mb-4 text-gray-900 dark:text-white">
            Thanh toán
          </h3>
          <div
            class="space-y-3 text-sm border-b pb-4 mb-4 border-gray-100 dark:border-gray-700"
          >
            <div class="flex justify-between">
              <span class="text-gray-500">Tổng tiền:</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{
                formatCurrency(order.total_amount)
              }}</span>
            </div>
            <div class="flex justify-between" v-if="order.discount_amount > 0">
              <span class="text-gray-500">Giảm giá:</span>
              <span class="font-medium text-green-600"
                >-{{ formatCurrency(order.discount_amount) }}</span
              >
            </div>
          </div>
          <div class="flex justify-between items-center mb-6">
            <span class="font-bold text-gray-900 dark:text-white"
              >Thành tiền:</span
            >
            <span class="text-2xl font-bold text-blue-600">{{
              formatCurrency(order.final_amount)
            }}</span>
          </div>

          <div
            class="bg-gray-50 p-3 rounded text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400 mb-4 border dark:border-gray-700"
          >
            Phương thức:
            <span class="font-semibold uppercase">{{
              order.payment_method
            }}</span
            ><br />
            Trạng thái:
            <span
              :class="
                order.payment_status === 'paid'
                  ? 'text-green-600 font-bold'
                  : 'text-yellow-600 font-bold'
              "
              >{{
                order.payment_status === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"
              }}</span
            >
          </div>

          <!-- Cancel Button -->
          <button
            v-if="order.status === 'pending'"
            @click="handleCancel"
            class="w-full py-3 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Hủy đơn hàng
          </button>
        </div>

        <!-- Support -->
        <div
          class="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900"
        >
          <p class="text-sm text-blue-800 dark:text-blue-300 mb-2">
            Bạn cần hỗ trợ về đơn hàng này?
          </p>
          <button
            class="text-blue-600 font-semibold hover:underline text-sm dark:text-blue-400"
          >
            <a
              href="https://www.facebook.com/phutrong.nguyen.9026"
              class="text-blue-600 font-semibold hover:underline text-sm dark:text-blue-400"
              >Liên hệ CSKH</a
            >
          </button>
        </div>
      </aside>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-20">
      <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        Không tìm thấy đơn hàng
      </h2>
      <button @click="goBack" class="text-blue-600 hover:underline">
        Quay lại danh sách đơn hàng
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "../../stores/order";
import { formatCurrency } from "../../utils/helpers";

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

// Lấy ID từ URL (đây là ID trong database, dùng để query)
const orderId = route.params.id;

// Computed properties từ Store
const order = computed(() => orderStore.currentOrder);
const loading = computed(() => orderStore.loading);

// Fetch data khi component mounted
onMounted(() => {
  if (orderId) {
    orderStore.fetchOrderById(orderId);
  }
});

// Quay lại trang lịch sử
function goBack() {
  router.push("/orders"); // Hoặc '/profile/orders' tùy route của bạn
}

// Xử lý hủy đơn
async function handleCancel() {
  if (
    confirm(
      "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
    )
  ) {
    await orderStore.cancelOrder(
      order.value.id,
      "Người dùng hủy tại trang chi tiết",
    );
    // Store sẽ tự cập nhật status, UI sẽ tự render lại
  }
}

// Helper: Class màu sắc cho badge trạng thái
const statusBadgeClass = (status) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipping: "bg-indigo-100 text-indigo-800 border-indigo-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return map[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Helper: Label trạng thái tiếng Việt
const getStatusLabel = (status) => {
  const map = {
    pending: "Chờ xác nhận",
    processing: "Đang chuẩn bị hàng",
    shipping: "Đang giao hàng",
    delivered: "Giao thành công",
    cancelled: "Đã hủy",
    unpaid: "Chưa thanh toán",
  };
  return map[status] || status;
};
</script>
