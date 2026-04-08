<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Đơn hàng của tôi</h1>
        <p class="text-sm text-gray-500">Theo dõi và quản lý các đơn hàng đã đặt</p>
      </div>
      <RouterLink
        to="/products"
        class="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        ← Tiếp tục mua sắm
      </RouterLink>
    </div>

    <div class="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div class="flex overflow-x-auto no-scrollbar gap-8">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          :class="[
            'relative py-4 text-sm font-medium whitespace-nowrap transition-all',
            currentTab === tab.key
              ? 'text-blue-600 font-bold'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ]"
        >
          {{ tab.label }}
          <span 
            v-if="getBadgeCount(tab.key) > 0"
            class="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full"
          >
            {{ getBadgeCount(tab.key) }}
          </span>
          <div 
            v-if="currentTab === tab.key"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          ></div>
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-500 text-sm">Đang tải đơn hàng...</p>
    </div>

    <div v-else-if="filteredOrders.length > 0" class="space-y-6">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="border border-gray-200 rounded-xl overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow"
      >
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30">
          <div class="flex items-center gap-3">
            <span class="font-bold text-gray-900 dark:text-white">{{ order.order_number }}</span>
            <span class="text-gray-300 dark:text-gray-700">|</span>
            <span :class="['text-xs font-bold uppercase tracking-wider', statusColor(order.status)]">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          <p class="text-xs text-gray-500">
            Ngày đặt: {{ new Date(order.created_at).toLocaleString('vi-VN') }}
          </p>
        </div>

        <div class="p-6">
          <div v-for="item in order.items" :key="item.id" class="flex gap-4 mb-4 last:mb-0">
            <img :src="item.product_image || 'https://via.placeholder.com/80'" class="w-20 h-20 object-cover rounded-lg border dark:border-gray-800" />
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ item.product_name }}</h4>
              <p class="text-xs text-gray-500 mt-1">Phân loại: {{ item.color }} / {{ item.size }}</p>
              <p class="text-xs text-gray-900 dark:text-gray-300 mt-1">x{{ item.quantity }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-blue-600">{{ formatCurrency(item.unit_price) }}</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50/30 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Thành tiền: <span class="text-lg font-bold text-blue-600 ml-1">{{ formatCurrency(order.final_amount) }}</span>
          </div>
          
          <div class="flex gap-2 w-full sm:w-auto">
            <RouterLink
              :to="`/orders/${order.id}`"
              class="flex-1 sm:flex-none px-5 py-2 text-xs font-bold border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 text-center"
            >
              XEM CHI TIẾT
            </RouterLink>

            <button
              v-if="['delivered', 'cancelled'].includes(order.status)"
              @click="reorderItems(order)"
              class="flex-1 sm:flex-none px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              MUA LẠI
            </button>

            <button
              v-if="['pending', 'unpaid'].includes(order.status)"
              @click="handleCancel(order.id)"
              class="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 rounded"
            >
              HỦY ĐƠN
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
      <h3 class="text-gray-900 dark:text-white font-medium">Không có đơn hàng nào</h3>
      <p class="text-gray-500 text-sm mt-1">Bạn chưa có đơn hàng nào trong mục này.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useOrderStore } from '../../stores/order';
import { useCartStore } from '../../stores/cart';
import { useUIStore } from '../../stores/ui';
import { formatCurrency } from '../../utils/helpers';

const orderStore = useOrderStore();
const cartStore = useCartStore();
const uiStore = useUIStore();

const currentTab = ref('all');

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'packed', label: 'Đã đóng gói' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' }
];

const loading = computed(() => orderStore.loading);

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return orderStore.orders;
  return orderStore.orders.filter(order => order.status === currentTab.value);
});

const getBadgeCount = (statusKey) => {
  if (statusKey === 'all') return 0;
  return orderStore.orders.filter(o => o.status === statusKey).length;
};

onMounted(() => {
  orderStore.fetchMyOrders();
});

const handleCancel = async (orderId) => {
  if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
    await orderStore.cancelOrder(orderId, 'Khách hàng hủy');
    uiStore.pushToast({ type: 'success', message: 'Đã hủy đơn thành công' });
  }
};

const reorderItems = (order) => {
	let count = 0;
	order.items.forEach(item => {
		// Map lại dữ liệu snapshot sang dữ liệu Cart Store cần
		cartStore.addToCart({
			id: item.product_id,
			name: item.product_name,
			price: item.unit_price,
			image: item.product_image,
			selectedColor: item.color,
			selectedSize: item.size
		}, item.quantity);
		count++;
	});

	
};

const statusColor = (status) => {
  const map = {
    pending: 'text-yellow-500',
    confirmed: 'text-blue-500',
    packed: 'text-purple-500',
    shipping: 'text-orange-500',
    delivered: 'text-green-500',
    cancelled: 'text-red-500'
  };
  return map[status] || 'text-gray-500';
};

const getStatusLabel = (status) => {
  const map = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    packed: 'Đã đóng gói',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };
  return map[status] || status;
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>