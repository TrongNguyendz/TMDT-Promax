<!-- views/staff/Dashboard.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Tổng quan ca làm - {{ today }}</h1>

    <!-- Sản phẩm bán chạy / hàng tồn thấp -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V21M4 11v10l8 4"/></svg>
        Sản phẩm bán chạy
      </h2>
      <div class="flex flex-col lg:flex-row gap-3 mb-4">
        <input
          v-model="productSearch"
          type="text"
          placeholder="Tìm sản phẩm..."
          class="border rounded-lg px-3 py-2 flex-1 dark:bg-gray-800"
        />

        <select v-model="soldFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="">Đã bán</option>
          <option value="desc">Nhiều → ít</option>
          <option value="asc">Ít → nhiều</option>
        </select>

        <select v-model="stockFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="">Tồn kho</option>
          <option value="desc">Nhiều → ít</option>
          <option value="asc">Ít → nhiều</option>
        </select>

        <select v-model="statusFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="">Trạng thái</option>
          <option value="Bán chạy">Bán chạy</option>
          <option value="Bán chậm">Bán chậm</option>
        </select>

        <select v-model="nameFilter" class="border rounded-lg px-3 py-2 w-full lg:w-48 dark:bg-gray-800">
          <option value="">Tên</option>
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã bán</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="product in paginatedProducts" :key="product.id">
              <td class="px-4 py-4 text-sm font-medium">{{ product.name }}</td>
              <td class="px-4 py-4 text-sm">{{ product.sold }}</td>
              <td class="px-4 py-4 text-sm">{{ product.totalStock }}</td>
              <td class="px-4 py-4">
                <span
                  :class="product.status === 'Bán chạy'
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'"
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ product.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import orderApi from '@/utils/order_service_api';
import { getTopProducts } from '@/utils/product_service_api';
import ProductCard from '../../components/common/ProductCard.vue';

const today = computed(() => new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
const productSearch = ref('')
const soldFilter = ref('')
const stockFilter = ref('')
const statusFilter = ref('')
const nameFilter = ref('')

const filteredProducts = computed(() => {
  let data = [...topProducts.value]

  if (productSearch.value) {
    const keyword = productSearch.value.toLowerCase()
    data = data.filter(p =>
      p.name.toLowerCase().includes(keyword)
    )
  }

  if (statusFilter.value) {
    data = data.filter(p => p.status === statusFilter.value)
  }

  data.sort((a, b) => {
    // Ưu tiên sort theo đã bán nếu có
    if (soldFilter.value === 'desc') {
      return b.sold - a.sold
    }

    if (soldFilter.value === 'asc') {
      return a.sold - b.sold
    }

    // Nếu không chọn đã bán thì sort theo tồn kho
    if (stockFilter.value === 'desc') {
      return b.totalStock - a.totalStock
    }

    if (stockFilter.value === 'asc') {
      return a.totalStock - b.totalStock
    }

    // Nếu không thì theo tên
    if (nameFilter.value === 'asc') {
      return a.name.localeCompare(b.name)
    }

    if (nameFilter.value === 'desc') {
      return b.name.localeCompare(a.name)
    }

    return 0
  })

  return data
})

/* ORDER FILTER */

const orderSearch = ref('')
const orderStatusFilter = ref('')
const orderSort = ref('id-asc')

const topProducts = ref([]);

const loadTopProducts = async () => {
  try {
    const res = await getTopProducts()

    const data = res.data.data || []

    topProducts.value = data.map(p => ({
      id: p.id || p._id,
      name: p.name,
      sold: p.sold,
      totalStock: p.stock_quantity,
      status: p.sold > 20 ? 'Bán chạy' : 'Bán chậm'
    }))

  } catch (err) {
    console.error('❌ Load top products lỗi:', err)
  }
}

const recentOrders = ref([]);

const loadRecentOrders = async () => {
  try {
    const res = await orderApi.getOrders()
    console.log(res.data)

    const data = res.data.data || []

    recentOrders.value = data.slice(0, 10).map(o => ({
      id: o.order_number,
      customer: o.shipping_fullname,
      items: o.items?.length + ' sản phẩm',
      status: mapStatus(o.status)
    }))

  } catch (err) {
    console.error('❌ Load orders lỗi:', err)
  }
}

const mapStatus = (status) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận'
    case 'confirmed': return 'Đã xác nhận'
    case 'packed': return 'Đã đóng gói'
    case 'shipping': return 'Đang giao'
    case 'delivered': return 'Đã giao'
    case 'cancelled': return 'Đã hủy'
    default: return status
  }
}

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
const productPerPage = 10

const paginatedProducts = computed(() => {
  const start = (productPage.value - 1) * productPerPage
  const end = start + productPerPage
  return filteredProducts.value.slice(start, end)
})

const totalProductPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / productPerPage))
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
  switch (status) {
    case 'Chờ xác nhận': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'Đã xác nhận': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'Đã đóng gói': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'Đang giao': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'Đã giao': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'Đã hủy': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  }
}

onMounted(() => {
  loadTopProducts()
  loadRecentOrders()
})

</script>