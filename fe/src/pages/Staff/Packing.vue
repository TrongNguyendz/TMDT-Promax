<!-- views/staff/Packing.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Xử lý đơn hàng</h1>

    <!-- Search + Confirm area -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <div class="max-w-xl mx-auto">
        <label class="block text-lg font-semibold mb-3">Nhập mã đơn để xác nhận giao</label>
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

        <!-- từ ngày -->
        <input
          type="date"
          v-model="startDate"
          class="border rounded-lg px-3 py-2 dark:bg-gray-800"
        />

        <!-- đến ngày -->
        <input
          type="date"
          v-model="endDate"
          class="border rounded-lg px-3 py-2 dark:bg-gray-800"
        />

        <!-- sort -->
        <select
          v-model="timeSort"
          class="border rounded-lg px-3 py-2 w-full lg:w-40 dark:bg-gray-800"
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
          <span class="px-4 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-medium">
            {{ pack.status }}
          </span>
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
import { ref, computed, onMounted } from 'vue';
import orderApi from '@/utils/order_service_api';

const orderCode = ref('');
const recentPacks = ref([]);
const message = ref(null);

const packSearch = ref('')
const timeSort = ref('')
const startDate = ref('')
const endDate = ref('')

const currentPage = ref(1)
const perPage = 5

const filteredPacks = computed(() => {
  let data = [...recentPacks.value]

  // search
  if (packSearch.value) {
    const keyword = packSearch.value.toLowerCase()

    data = data.filter(p =>
      (p.customer || '').toLowerCase().includes(keyword) ||
      (p.order || '').toLowerCase().includes(keyword)
    )
  }

  // sort date
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value).getTime()
    const end = new Date(endDate.value).getTime()

    data = data.filter(p => {
      return p.timestamp >= start && p.timestamp <= end + 86400000 // +1 ngày
    })
  }

  // sort time
  if (timeSort.value === 'asc') {
  data.sort((a, b) => a.timestamp - b.timestamp)
}

  if (timeSort.value === 'desc') {
    data.sort((a, b) => b.timestamp - a.timestamp)
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

const packOrder = async () => {
  const code = orderCode.value.trim().toUpperCase()

  // ❌ Rỗng
  if (!code) {
    message.value = { type: 'error', text: 'Vui lòng nhập mã đơn!' }
    return
  }

  // ❌ Sai format ORD-
  if (!/^ORD-.+/i.test(code)) {
    message.value = { type: 'error', text: 'Mã đơn sai định dạng!' }
    return
  }

  try {
    const res = await orderApi.getOrders({ keyword: code })

    const orders = res.data.data || []

    const order = orders.find(
      o => (o.order_number || '').toUpperCase() === code
    )

    if (!order) {
      message.value = { type: 'error', text: 'Không tìm thấy đơn hàng!' }
      return
    }

    const orderId = order._id || order.id

    if (!orderId) {
      message.value = { type: 'error', text: 'Lỗi ID đơn hàng!' }
      return
    }

    if (order.status !== 'packed') {
      message.value = {
        type: 'error',
        text:
          order.status === 'shipping'
            ? `Đơn hàng ${code} đã được giao cho bên vận chuyển rồi!`
            : 'Đơn hàng chưa được đóng gói!'
      }
      return
    }

    await orderApi.updateOrderStatus(orderId, 'shipping')

    recentPacks.value.unshift({
      id: Date.now(),
      customer: order.shipping_fullname || 'Unknown',
      order: code,
      status: 'Đang giao',
      time: new Date().toLocaleString('vi-VN'),
      timestamp: Date.now()
    })
    message.value = {
      type: 'success',
      text: `Đơn hàng ${code} đang được giao đến địa chỉ nhận!`
    }

    orderCode.value = ''

  } catch (err) {
    console.error(err)
    message.value = { type: 'error', text: 'Có lỗi xảy ra!' }
  }

  setTimeout(() => { message.value = null }, 5000)
}

const initCurrentMonth = () => {
  const now = new Date()

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  startDate.value = firstDay.toISOString().split('T')[0]
  endDate.value = lastDay.toISOString().split('T')[0]
}

const loadRecentOrders = async () => {
  try {
    const res = await orderApi.getOrders({
      limit: 20,
      sort: 'desc',
      status: 'shipping'
    })

    const data = res.data.data || []

    recentPacks.value = data
      .filter(o => o.status === 'shipping')
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 10)
      .map(o => ({
        id: o._id || o.id,
        customer: o.shipping_fullname || 'Unknown',
        order: o.order_number,
        status: 'Đang giao',
        time: new Date(o.updated_at || o.created_at).toLocaleString('vi-VN'),
        timestamp: new Date(o.updated_at || o.created_at).getTime()
      }))

  } catch (err) {
    console.error('❌ Load shipping orders lỗi:', err)
  }
}

onMounted(() => {
  initCurrentMonth()
  loadRecentOrders()
})
</script>