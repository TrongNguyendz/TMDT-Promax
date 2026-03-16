<!-- views/staff/Dashboard.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Tổng quan ca làm - {{ today }}</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Sản phẩm bán ra" value="187" total="450" color="teal" icon="shopping-cart" />
      <StatCard title="Đơn hàng mới" value="42" trend="+18%" color="blue" icon="shopping-bag" />
      <StatCard title="Khách chờ hỗ trợ" value="9" trend="+3" color="amber" icon="headphones" />
      <StatCard title="Thời gian còn lại ca" value="3h 14m" color="purple" icon="clock" />
    </div>

    <!-- Sản phẩm bán chạy / hàng tồn thấp -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V21M4 11v10l8 4"/></svg>
        Sản phẩm bán chạy hôm nay
      </h2>
      <div class="flex flex-col lg:flex-row gap-3 mb-4">
        <input
          v-model="productSearch"
          type="text"
          placeholder="Tìm sản phẩm..."
          class="border rounded-lg px-3 py-2 flex-1 dark:bg-gray-800"
        />

        <select v-model="productStatusFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="">Tất cả trạng thái</option>
          <option value="Bán chạy">Bán chạy</option>
          <option value="Tồn thấp">Tồn thấp</option>
        </select>

        <select v-model="productSort" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="name-asc">Tên A → Z</option>
          <option value="name-desc">Tên Z → A</option>
        </select>
      </div>
      <div class="space-y-4">
        <ProductItem v-for="product in paginatedProducts" :key="product.id" :product="product"/>
      </div>
      <div class="flex justify-center items-center gap-2 mt-6">
        <button
          @click="productPage--"
          :disabled="productPage === 1"
          class="px-2 py-1 text-sm border rounded-md disabled:opacity-40"
        >
          Prev
        </button>

        <button
          v-for="page in totalProductPages"
          :key="page"
          @click="productPage = page"
          :class="[
            'px-2 py-1 text-sm border rounded-md min-w-[32px]',
            page === productPage ? 'bg-teal-500 text-white border-teal-500' : ''
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="productPage++"
          :disabled="productPage === totalProductPages"
          class="px-2 py-1 text-sm border rounded-md disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Đơn hàng gần nhất -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <h2 class="text-xl font-bold mb-4">Đơn hàng gần đây</h2>
      <div class="flex flex-col lg:flex-row gap-3 mb-4">
        
        <input
          v-model="orderSearch"
          type="text"
          placeholder="Tìm mã đơn, khách hàng..."
          class="border rounded-lg px-3 py-2 flex-1 dark:bg-gray-800"
        />

        <select v-model="orderStatusFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="">Tất cả trạng thái</option>
          <option value="Đã giao">Đã giao</option>
          <option value="Chờ đóng gói">Chờ đóng gói</option>
          <option value="Hủy">Hủy</option>
        </select>

        <select v-model="orderSort" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="id-asc">Mã đơn A → Z</option>
          <option value="id-desc">Mã đơn Z → A</option>
          <option value="customer-asc">Tên khách A → Z</option>
          <option value="customer-desc">Tên khách Z → A</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="order in paginatedOrders" :key="order.id">
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">#{{ order.id }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">{{ order.customer }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">{{ order.items }}</td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-center items-center gap-2 mt-4">
          <button
            @click="orderPage--"
            :disabled="orderPage === 1"
            class="px-2 py-1 text-sm border rounded-md disabled:opacity-40"
          >
            Prev
          </button>

          <button
            v-for="page in totalOrderPages"
            :key="page"
            @click="orderPage = page"
            :class="[
              'px-2 py-1 text-sm border rounded-md min-w-[32px]',
              page === orderPage ? 'bg-teal-500 text-white border-teal-500' : ''
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="orderPage++"
            :disabled="orderPage === totalOrderPages"
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

const today = computed(() => new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
const productSearch = ref('')
const productStatusFilter = ref('')
const productSort = ref('name-asc')

const filteredProducts = computed(() => {
  let data = [...topProducts.value]

  if (productSearch.value) {
    const keyword = productSearch.value.toLowerCase()
    data = data.filter(p =>
      p.name.toLowerCase().includes(keyword)
    )
  }

  if (productStatusFilter.value) {
    data = data.filter(p =>
      p.status === productStatusFilter.value
    )
  }

  data.sort((a, b) => {
    if (productSort.value === 'name-asc')
      return a.name.localeCompare(b.name)

    if (productSort.value === 'name-desc')
      return b.name.localeCompare(a.name)

    return 0
  })

  return data
})

/* ORDER FILTER */

const orderSearch = ref('')
const orderStatusFilter = ref('')
const orderSort = ref('id-asc')

const topProducts = ref([
  { id: 1, name: 'Áo thun oversize 2026', sold: 142, totalStock: 800, status: 'Bán chạy' },
  { id: 2, name: 'Quần jeans slim fit', sold: 45, totalStock: 120, status: 'Tồn thấp' },
]);

const recentOrders = ref([
  { id: 'ORD-0421', customer: 'Nguyễn Văn A', items: 'Áo thun x2', status: 'Đã giao' },
  { id: 'ORD-0420', customer: 'Trần Thị B', items: 'Quần jeans x4', status: 'Chờ đóng gói' },
  { id: 'ORD-0419', customer: 'Lê Minh C', items: 'Váy maxi x1', status: 'Đã giao' },
  { id: 'ORD-0418', customer: 'Phạm Hồng D', items: 'Áo khoác x3', status: 'Hủy' },
]);

const filteredOrders = computed(() => {
  let data = [...recentOrders.value]

  if (orderSearch.value) {
    const keyword = orderSearch.value.toLowerCase()

    data = data.filter(o =>
      o.id.toLowerCase().includes(keyword) ||
      o.customer.toLowerCase().includes(keyword) ||
      o.items.toLowerCase().includes(keyword)
    )
  }

  if (orderStatusFilter.value) {
    data = data.filter(o =>
      o.status === orderStatusFilter.value
    )
  }

  data.sort((a, b) => {

    if (orderSort.value === 'id-asc')
      return a.id.localeCompare(b.id)

    if (orderSort.value === 'id-desc')
      return b.id.localeCompare(a.id)

    if (orderSort.value === 'customer-asc')
      return a.customer.localeCompare(b.customer)

    if (orderSort.value === 'customer-desc')
      return b.customer.localeCompare(a.customer)

    return 0
  })

  return data
})

const productPage = ref(1)
const productPerPage = 6

const paginatedProducts = computed(() => {
  const start = (productPage.value - 1) * productPerPage
  const end = start + productPerPage
  return filteredProducts.value.slice(start, end)
})

const totalProductPages = computed(() =>
  Math.ceil(filteredProducts.value.length / productPerPage)
)

const orderPage = ref(1)
const orderPerPage = 10

const paginatedOrders = computed(() => {
  const start = (orderPage.value - 1) * orderPerPage
  const end = start + orderPerPage
  return filteredOrders.value.slice(start, end)
})

const totalOrderPages = computed(() =>
  Math.ceil(filteredOrders.value.length / orderPerPage)
)

function getStatusClass(status) {
  if (status === 'Đã giao') return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
  if (status === 'Chờ đóng gói') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  if (status === 'Hủy') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}
</script>