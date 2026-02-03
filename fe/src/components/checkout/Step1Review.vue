<template>
  <div class="space-y-4">
    <h2 class="mb-4 text-lg font-semibold">Xem lại đơn hàng</h2>
    
    <div v-if="!items.length" class="rounded-lg border p-8 text-center dark:border-gray-800">
      <p class="text-gray-600 dark:text-gray-400">Giỏ hàng trống</p>
      <RouterLink to="/products" class="mt-3 inline-block text-blue-600 hover:underline">
        Tiếp tục mua sắm
      </RouterLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.product_id || item.id"
        class="flex gap-4 rounded-lg border p-4 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <!-- Ảnh -->
        <img
          :src="item.product_image || item.image || 'https://via.placeholder.com/80'"
          :alt="item.product_name || item.name"
          class="h-20 w-20 rounded object-cover border"
        />

        <div class="flex-1">
          <!-- Tên -->
          <p class="font-semibold">
            {{ item.product_name || item.name }}
          </p>

          <!-- Màu + Size -->
          <p v-if="item.color || item.size" class="text-xs text-gray-500 mt-1">
            <span v-if="item.color">
              Màu: {{ getColorName(item.color) }}
            </span>
            <span v-if="item.size" class="ml-2">
              Size: {{ item.size }}
            </span>
          </p>

          <!-- Giá -->
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ item.quantity }} × {{ formatCurrency(item.price) }}
            =
            <span class="font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(item.price * item.quantity) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="pt-4">
      <button
        @click="$emit('next')"
        :disabled="!items.length"
        class="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
      >
        Tiếp tục
      </button>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '../../utils/helpers';

defineProps(['items']);
defineEmits(['next']);

function getColorName(color) {
  if (!color) return '';
  if (typeof color === 'string') return color;
  if (typeof color === 'object' && color.name) return color.name;
  return '';
}
</script>
