<template>
  <div v-if="hasCompare" class="fixed bottom-6 right-6 z-50 max-w-[360px] w-full">
    <div class="rounded-2xl bg-gray-900/95 border border-white/10 shadow-2xl p-4 backdrop-blur-xl text-white">
      <div class="flex items-center justify-between gap-3 mb-4">
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-gray-400">So sánh sản phẩm</p>
          <p class="text-lg font-semibold text-white">{{ compareList.length }} sản phẩm</p>
        </div>
        <button
          type="button"
          @click="compareStore.clearCompare"
          class="text-xs text-gray-400 hover:text-white"
        >
          Xóa tất cả
        </button>
      </div>

      <div class="flex gap-3 overflow-x-auto pb-2">
        <div
          v-for="product in compareList"
          :key="product.id"
          class="relative flex-shrink-0"
        >
          <button
            type="button"
            @click="compareStore.removeFromCompare(product.id)"
            class="absolute -top-2 -right-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
          >
            ×
          </button>
          <img
            :src="product.image || product.thumbnail || 'https://placehold.co/80x80?text=No+Img'"
            :alt="product.name || 'Sản phẩm'"
            class="h-20 w-20 rounded-2xl border border-white/10 object-cover bg-white"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <RouterLink
          to="/so-sanh"
          class="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition"
        >
          So sánh ngay
        </RouterLink>
        <span class="text-xs text-gray-400">{{ compareList.length }}/4</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCompareStore } from '../../stores/compare'
import { RouterLink } from 'vue-router'

const compareStore = useCompareStore()
const compareList = computed(() => compareStore.compareList)
const hasCompare = computed(() => compareList.value.length > 0)
</script>
