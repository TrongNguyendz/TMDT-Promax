<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <nav class="mb-6 text-sm text-gray-500">
        <RouterLink to="/" class="hover:underline">Trang chủ</RouterLink> /
        <span class="text-gray-700 dark:text-gray-300 font-medium">So sánh sản phẩm</span>
      </nav>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">So sánh chi tiết</h1>
        
        <div class="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Chỉ xem khác biệt</span>
          <button 
            @click="onlyDifference = !onlyDifference"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            :class="onlyDifference ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'"
          >
            <span
              :class="onlyDifference ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            />
          </button>
        </div>
      </div>

      <div v-if="compareProducts.length > 0" class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="p-6 min-w-[200px] bg-gray-50/50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                <p class="text-xs font-bold uppercase tracking-widest text-gray-400">Thông số</p>
              </th>
              <th v-for="product in compareProducts" :key="product.id" class="p-6 min-w-[300px] border-b border-l dark:border-gray-800 relative group">
                <button @click="removeProduct(product.id)" class="absolute top-4 right-4 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>

                <div class="flex flex-col items-center text-center">
                  <img :src="product.image" class="h-40 w-40 object-contain rounded-lg mb-4 bg-gray-50 dark:bg-gray-800 p-2 shadow-inner" />
                  <h3 class="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">{{ product.name }}</h3>
                  <p class="text-xl font-bold text-red-600 dark:text-red-400">{{ formatCurrency(product.price) }}</p>
                  <button class="mt-4 w-full bg-gray-900 dark:bg-gray-100 dark:text-black text-white py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-all">
                    THÊM VÀO GIỎ
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody class="divide-y dark:divide-gray-800">
            <tr v-show="!onlyDifference || !isSame('brand')">
              <td class="p-4 font-semibold text-sm text-gray-500 bg-gray-50/30 dark:bg-gray-800/30">Thương hiệu</td>
              <td v-for="p in compareProducts" :key="p.id" class="p-4 border-l dark:border-gray-800 text-gray-700 dark:text-gray-300">
                {{ p.brand }}
              </td>
            </tr>

            <tr v-show="!onlyDifference || !isSame('inStock')">
              <td class="p-4 font-semibold text-sm text-gray-500">Tình trạng</td>
              <td v-for="p in compareProducts" :key="p.id" class="p-4 border-l dark:border-gray-800">
                <div class="flex items-center gap-2">
                  <div class="h-2.5 w-2.5 rounded-full" :class="p.inStock ? 'bg-green-500' : 'bg-red-500'"></div>
                  <span class="text-sm font-medium" :class="p.inStock ? 'text-green-600' : 'text-red-600'">
                    {{ p.inStock ? `Còn hàng (${p.stock})` : 'Hết hàng' }}
                  </span>
                </div>
              </td>
            </tr>

            <tr v-show="!onlyDifference || !isSame('colors')">
              <td class="p-4 font-semibold text-sm text-gray-500 bg-gray-50/30 dark:bg-gray-800/30">Màu sắc</td>
              <td v-for="p in compareProducts" :key="p.id" class="p-4 border-l dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <div class="flex gap-2">
                  <div v-for="color in p.colors || []" :key="color.hex" class="w-5 h-5 rounded-full border dark:border-gray-700 shadow-sm" :style="{ backgroundColor: color.hex }" :title="color.name"></div>
                </div>
              </td>
            </tr>

            <tr v-show="!onlyDifference || !isSame('sizes')">
              <td class="p-4 font-semibold text-sm text-gray-500">Kích cỡ hiện có</td>
              <td v-for="p in compareProducts" :key="p.id" class="p-4 border-l dark:border-gray-800">
                <div class="flex flex-wrap gap-1">
                  <span v-for="s in p.sizes || []" :key="s" class="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 uppercase font-bold">
                    {{ s }}
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td class="p-4 font-semibold text-sm text-gray-500 bg-gray-50/30 dark:bg-gray-800/30">Đánh giá</td>
              <td v-for="p in compareProducts" :key="p.id" class="p-4 border-l dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <div class="flex items-center text-yellow-400">
                  <span v-for="i in 5" :key="i">{{ i <= Math.round(p.rating) ? "★" : "☆" }}</span>
                  <span class="ml-2 text-xs text-blue-600">({{ p.reviews }})</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h2 class="text-xl font-medium text-gray-600 dark:text-gray-400">Chưa có sản phẩm nào để so sánh</h2>
        <RouterLink to="/products" class="mt-4 inline-block text-blue-600 font-semibold hover:underline">Quay lại mua sắm</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCompareStore } from '../../stores/compare'

const compareStore = useCompareStore()
const onlyDifference = ref(false)
const compareProducts = computed(() =>
  compareStore.compareList.map((product) => ({
    ...product,
    colors: product.colors || [],
    sizes: product.sizes || []
  }))
)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const removeProduct = (id) => {
  compareStore.removeFromCompare(id)
}

const isSame = (key) => {
  if (compareProducts.value.length < 2) return true
  const first = JSON.stringify(compareProducts.value[0][key])
  return compareProducts.value.every((p) => JSON.stringify(p[key]) === first)
}
</script>

<style scoped>
/* Tùy chỉnh thanh cuộn ngang mượt hơn */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>