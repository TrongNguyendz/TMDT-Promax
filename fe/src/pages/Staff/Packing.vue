<!-- views/staff/Packing.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Xử lý đơn hàng</h1>

    <!-- Search + Confirm area -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <div class="max-w-xl mx-auto">
        <label class="block text-lg font-semibold mb-3">Nhập mã đơn để đóng gói hoặc xác nhận giao</label>
        <div class="flex gap-3">
          <input 
            v-model="orderCode" 
            @keyup.enter="packOrder"
            class="flex-1 px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Nhập mã đơn (VD: ORD-12345678)"
          />
          <button @click="packOrder" class="px-8 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition">
            XÁC NHẬN
          </button>
        </div>
      </div>
    </div>

    <!-- Kết quả xử lý gần nhất -->
    <div v-if="recentPacks.length" class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <h2 class="text-xl font-bold mb-4">Xử lý gần đây</h2>
      <div class="flex flex-col lg:flex-row gap-3 mb-4">
        <!-- search -->
        <input
          v-model="packSearch"
          type="text"
          placeholder="Tìm tên khách hoặc mã đơn..."
          class="border rounded-lg px-3 py-2 flex-1 dark:bg-gray-800"
        />

        <!-- filter time -->
        <select
          v-model="timeSort"
          class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800"
        >
          <option value="">Tất cả</option>
          <option value="desc">Mới nhất</option>
          <option value="asc">Cũ nhất</option>
        </select>
      </div>
      <div class="space-y-3">
        <div v-for="pack in paginatedPacks" :key="pack.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div>
            <p class="font-semibold">{{ pack.customer }} - {{ pack.order }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ pack.time }}</p>
          </div>
          <span class="px-4 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 rounded-full text-sm font-medium">Thành công</span>
        </div>
      </div>
      <div class="flex justify-center items-center gap-2 mt-6">
        <button
          @click="changePage(currentPage-1)"
          :disabled="currentPage === 1"
          class="px-2 py-1 text-sm border rounded-md disabled:opacity-40"
        >
          Prev
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          @click="changePage(page)"
          :class="[
            'px-2 py-1 text-sm border rounded-md min-w-[32px]',
            page === currentPage ? 'bg-teal-500 text-white border-teal-500' : ''
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="changePage(currentPage+1)"
          :disabled="currentPage === totalPages"
          class="px-2 py-1 text-sm border rounded-md disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Thông báo lỗi / thành công -->
    <div v-if="message" :class="message.type === 'success' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'" class="p-5 rounded-xl text-center font-medium">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const orderCode = ref('');
const recentPacks = ref([
  { id: 1, customer: 'Nguyễn Văn A', order: 'ORD-987654', time: '10:15' },
  { id: 2, customer: 'Trần Thị B', order: 'ORD-123456', time: '10:12' },
]);
const message = ref(null);

const packSearch = ref('')
const timeSort = ref('')

const currentPage = ref(1)
const perPage = 5

const filteredPacks = computed(() => {
  let data = [...recentPacks.value]

  // search
  if (packSearch.value) {
    const keyword = packSearch.value.toLowerCase()

    data = data.filter(p =>
      p.customer.toLowerCase().includes(keyword) ||
      p.order.toLowerCase().includes(keyword)
    )
  }

  // sort time
  if (timeSort.value === 'asc') {
    data.sort((a, b) => a.id - b.id)
  }

  if (timeSort.value === 'desc') {
    data.sort((a, b) => b.id - a.id)
  }

  return data
})

const totalPages = computed(() =>
  Math.ceil(filteredPacks.value.length / perPage)
)

const paginatedPacks = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredPacks.value.slice(start, start + perPage)
})

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function packOrder() {
  if (!orderCode.value.trim()) {
    message.value = { type: 'error', text: 'Vui lòng nhập mã đơn!' };
    return;
  }

  // Mock xử lý thành công
  recentPacks.value.unshift({
    id: Date.now(),
    customer: 'Khách hàng mẫu',
    order: orderCode.value.toUpperCase(),
    time: new Date().toLocaleTimeString('vi-VN'),
  });

  message.value = { type: 'success', text: `Đơn hàng ${orderCode.value.toUpperCase()} đã được xử lý thành công!` };
  orderCode.value = '';

  setTimeout(() => { message.value = null; }, 5000);
}
</script>