<template>
  <section class="mx-auto max-w-screen-xl px-4 py-8 lg:py-12">
    <!-- Header -->
    <div class="mb-8 flex items-end justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Giỏ hàng</h1>
      <p class="text-sm text-gray-500" v-if="items.length">{{ cart.itemCount }} sản phẩm</p>
    </div>

    <!-- Giỏ hàng trống -->
    <div v-if="!items.length"
      class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center dark:border-gray-800">
      <div class="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h2 class="mb-2 text-xl font-semibold dark:text-white">Giỏ hàng của bạn đang trống</h2>
      <RouterLink to="/products"
        class="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-lg dark:bg-white dark:text-black">
        TIẾP TỤC MUA SẮM
      </RouterLink>
    </div>

    <!-- Có hàng -->
    <div v-else class="grid gap-8 lg:grid-cols-12">
      <!-- Danh sách sản phẩm -->
      <div class="lg:col-span-8">
        <ul class="space-y-4">
          <!-- [CHANGE]: Sửa key thành index hoặc composite key để hỗ trợ biến thể trùng ID -->
          <li v-for="(it, index) in items" :key="`${it.product_id}-${index}`"
            class="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center">
            <!-- [END CHANGE] -->

            <!-- Ảnh sản phẩm -->
            <div
              class="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 sm:h-32 sm:w-32">
              <!-- [CHANGE]: Ưu tiên hiển thị ảnh Snapshot (product_image) -->
              <RouterLink :to="`/product/${it.product_id}`">
                <img :src="it.product_image || it.image || 'https://via.placeholder.com/150'" :alt="it.product_name"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </RouterLink>
              <!-- [END CHANGE] -->
            </div>

            <!-- Thông tin sản phẩm -->
            <div class="flex flex-1 flex-col justify-between">
              <div>
                <div class="flex justify-between items-start">
                  <!-- [CHANGE]: Ưu tiên tên Snapshot (product_name) -->
                  <RouterLink :to="`/product/${it.product_id}`"
                    class="text-lg font-bold text-gray-900 hover:text-red-600 dark:text-gray-100 dark:hover:text-red-400 line-clamp-2">
                    {{ it.product_name || it.name }}
                  </RouterLink>
                  <!-- [END CHANGE] -->

                  <p class="text-lg font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap ml-4">
                    {{ formatCurrency(it.price) }}
                  </p>
                </div>

                <!-- [CHANGE]: Hiển thị Phân loại (Màu/Size) -->
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-if="it.color"
                    class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    Màu: {{ displayColor(it.color) }}
                  </span>
                  <span v-if="it.size"
                    class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    Size: {{ it.size }}
                  </span>
                </div>
                <!-- [END CHANGE] -->
              </div>

              <!-- Bộ điều khiển bên dưới -->
              <div class="mt-4 flex items-center justify-between">
                <div
                  class="flex items-center overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">

                  <!-- [CHANGE] -->
                  <button @click="updateQty(it, it.quantity - 1)"
                    class="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
                    :disabled="it.quantity <= 1">-</button>

                  <input type="number" min="1"
                    class="h-8 w-12 border-none bg-transparent p-0 text-center text-sm font-medium focus:ring-0 dark:text-white"
                    :value="it.quantity" @change="updateQty(it, $event.target.value)" />

                  <button @click="updateQty(it, it.quantity + 1)"
                    class="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-200 transition">+</button>
                  <!-- [END CHANGE] -->
                </div>

                <!-- [CHANGE] -->
                <button @click="remove(it)"
                  class="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-700 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa
                </button>
                <!-- [END CHANGE] -->
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Sidebar Tổng tiền (Sticky) -->
      <aside class="lg:col-span-4">
        <div
          class="sticky top-8 rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
          <h2 class="mb-6 text-xl font-bold dark:text-white">Tóm tắt đơn hàng</h2>

          <div class="space-y-4 border-b border-gray-200 pb-6 dark:border-gray-800">
            <div class="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Số lượng sản phẩm</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ cart.itemCount }} sản phẩm</span>
            </div>
            <div class="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Phí vận chuyển</span>
              <span class="font-medium text-green-600">Chưa tính phí</span>
            </div>
          </div>

          <div class="mt-6 space-y-4">
            <div class="flex items-end justify-between">
              <span class="font-medium dark:text-white">Tổng cộng</span>
              <div class="text-right">
                <p class="text-2xl font-bold text-red-600">{{ formatCurrency(subtotal) }}</p>
                <p class="text-xs text-gray-500 mt-1">(Đã bao gồm VAT)</p>
              </div>
            </div>

            <!-- [CHANGE] -->
            <button @click="handleCheckout"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-center font-bold text-white shadow-lg transition-all hover:bg-black hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-gray-200 active:scale-95">
              TIẾN HÀNH THANH TOÁN
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <!-- [END CHANGE] -->

            <p class="text-center text-xs text-gray-500">
              Vui lòng kiểm tra kỹ thông tin trước khi thanh toán.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useUserStore } from '../../stores/user';
import { useUIStore } from '../../stores/ui';
import { useRouter,useRoute } from 'vue-router';
import { formatCurrency } from '../../utils/helpers';

const cart = useCartStore();
const userStore = useUserStore();
const uiStore = useUIStore();
const route = useRoute();
const router = useRouter();

const items = computed(() => cart.items);
const subtotal = computed(() => cart.subtotal);

// [CHANGE]
function handleCheckout() {
  if (userStore.profile?.id || userStore.isAuthenticated) {
    router.push({ name: 'checkout' , query: { subtotal: cart.subtotal, itemCount: cart.itemCount , type: 'cart' } });
  } else {
    if (uiStore.pushToast) {
      uiStore.pushToast({
        type: 'warning',
        message: 'Vui lòng đăng nhập để tiếp tục thanh toán!'
      });
    }
    router.push({
      path: '/auth',
      query: { redirect: '/checkout' }
    });
  }
}
// [END CHANGE]

// [CHANGE]: Helper hiển thị màu sắc gọn gàng
function displayColor(color) {
  if (!color) return '';
  if (typeof color === 'string') return color.split('(')[0].trim(); // Bỏ mã hex nếu có
  if (typeof color === 'object' && color.name) return color.name;
  return '';
}
// [END CHANGE]

// [CHANGE]
function updateQty(item, newQty) {
  const num = Number(newQty);
  if (num >= 1) {
    // Store cart mới yêu cầu truyền nguyên object item để biết chính xác biến thể nào
    cart.updateQuantity(item, num);
  }
}
// [END CHANGE]

// [CHANGE]
function remove(item) {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    cart.removeItem(item);
  }
}
// [END CHANGE]

function goBack() {
  router.back();
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>