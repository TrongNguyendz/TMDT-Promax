<!-- views/staff/Orders.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Đơn hàng</h1>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
      <div class="p-6 border-b dark:border-gray-800">
        <h2 class="text-xl font-bold">Danh sách đơn hàng</h2>
      </div>
      <div class="overflow-x-auto">
        <div class="p-6 border-b dark:border-gray-800 flex flex-col lg:flex-row gap-3">
          <!-- search -->
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Tìm mã đơn, khách hàng, sản phẩm..."
            class="border rounded-lg px-3 py-2 flex-1 dark:bg-gray-800"
          />

          <!-- status -->
          <select v-model="statusFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
            <option value="">Tất cả trạng thái</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã đóng gói">Đã đóng gói</option>
          </select>

          <!-- quantity -->
          <select v-model="quantityFilter" class="border rounded-lg px-3 py-2 w-full lg:w-40 dark:bg-gray-800">
            <option value="">Số lượng</option>
            <option value="1">1</option>
            <option value="2">2+</option>
            <option value="5">5+</option>
          </select>

          <!-- price -->
          <select v-model="priceFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
            <option value="">Giá tiền</option>
            <option value="500000">≥ 500k</option>
            <option value="1000000">≥ 1 triệu</option>
            <option value="2000000">≥ 2 triệu</option>
          </select>

        </div>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Mã đơn</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Khách hàng</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Sản phẩm</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Số lượng</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Tổng tiền</th>
              <th class="px-6 py-4 text-left text-xs font-medium uppercase">Trạng thái</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="order in paginatedOrders" :key="order.id">
              <td class="px-6 py-5 whitespace-nowrap text-sm font-medium">#{{ order.id }}</td>
              <td class="px-6 py-5 whitespace-nowrap">{{ order.customer }}</td>
              <td class="px-6 py-5">{{ order.product }}</td>
              <td class="px-6 py-5 text-center">{{ order.quantity }}</td>
              <td class="px-6 py-5">{{ order.total.toLocaleString('vi-VN') }}đ</td>
              <td class="px-6 py-5">
                <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <button class="text-teal-600 hover:text-teal-800 font-medium">Chi tiết</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-center items-center gap-2 py-4">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchKeyword = ref('')
const statusFilter = ref('')
const quantityFilter = ref('')
const priceFilter = ref('')

const currentPage = ref(1)
const perPage = 10

const orders = ref([
  { id: 'ORD-0421', customer: 'Nguyễn Văn A', product: 'Áo thun oversize', quantity: 2, total: 1200000, status: 'Đã thanh toán' },
  { id: 'ORD-0420', customer: 'Trần Thị B', product: 'Quần jeans slim', quantity: 1, total: 450000, status: 'Chờ xác nhận' },
  { id: 'ORD-0419', customer: 'Lê Minh C', product: 'Váy maxi dài', quantity: 4, total: 2400000, status: 'Đã đóng gói' },
])

const filteredOrders = computed(() => {
  let data = [...orders.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()

    data = data.filter(o =>
      o.id.toLowerCase().includes(keyword) ||
      o.customer.toLowerCase().includes(keyword) ||
      o.product.toLowerCase().includes(keyword)
    )
  }

  if (statusFilter.value) {
    data = data.filter(o =>
      o.status.includes(statusFilter.value)
    )
  }

  if (quantityFilter.value) {
    const q = Number(quantityFilter.value)
    data = data.filter(o => o.quantity >= q)
  }

  if (priceFilter.value) {
    const price = Number(priceFilter.value)
    data = data.filter(o => o.total >= price)
  }

  return data
})

const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / perPage)
)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredOrders.value.slice(start, start + perPage)
})

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function getStatusClass(status) {
  if (status === 'Đã thanh toán') return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
  if (status === 'Chờ xác nhận') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}
</script>