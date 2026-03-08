<!-- views/staff/Inventory.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Kho hàng</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="item in inventory" :key="item.id" class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">{{ item.name }}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Mã: {{ item.code }} • Size: {{ item.size }}</p>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-gray-500">Tổng tồn</p>
              <p class="text-2xl font-bold">{{ item.totalStock }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Đã bán</p>
              <p class="text-2xl font-bold text-teal-600">{{ item.sold }}</p>
            </div>
          </div>

          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div :style="{ width: `${(item.sold / item.totalStock) * 100}%` }" class="bg-teal-500 h-3 rounded-full"></div>
          </div>
          <p class="text-sm text-right text-gray-500">{{ Math.round((item.sold / item.totalStock) * 100) }}% đã bán</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const inventory = ref([
  { id: 1, name: 'Áo thun oversize 2026', code: 'AT-001', size: 'M/L/XL', sold: 187, totalStock: 1200 },
  { id: 2, name: 'Quần jeans slim fit', code: 'QJ-002', size: '28-34', sold: 320, totalStock: 850 },
  { id: 3, name: 'Váy maxi dài', code: 'VM-003', size: 'S/M/L', sold: 68, totalStock: 200 },
]);
</script>