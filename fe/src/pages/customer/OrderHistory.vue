<template>
	<div class="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Lịch sử đơn hàng</h1>
				<p class="text-gray-600 dark:text-gray-400">Bạn có {{ orders.length }} đơn hàng</p>
			</div>
			<RouterLink
				to="/products"
				class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
			>
				← Tiếp tục mua sắm
			</RouterLink>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="text-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Đang tải dữ liệu...</p>
		</div>

		<!-- Orders List -->
		<div v-else-if="orders.length > 0" class="space-y-6">
			<div
				v-for="order in orders"
				:key="order.id"
				class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 dark:border-gray-800"
			>
				<!-- Order Header -->
				<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 gap-4">
					<div class="flex-1">
						<div class="flex items-center gap-3 mb-2">
							<!-- Hiển thị Mã đơn hàng (ORD-...) -->
							<h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ order.order_number }}</h3>
							<span
								:class="[
									'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase',
									statusBadgeClass(order.status)
								]"
							>
								{{ getStatusLabel(order.status) }}
							</span>
						</div>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Ngày đặt: {{ new Date(order.created_at).toLocaleString('vi-VN') }}
						</p>
					</div>
					<div class="text-right">
						<p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Tổng thành tiền</p>
						<p class="font-bold text-xl text-blue-600">{{ formatCurrency(order.final_amount) }}</p>
					</div>
				</div>

				<!-- Order Items (Snapshot Data) -->
				<div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
					<p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
						Sản phẩm ({{ order.items ? order.items.length : 0 }})
					</p>
					<div class="space-y-3">
						<div
							v-for="item in order.items"
							:key="item.id"
							class="flex items-center justify-between text-sm"
						>
							<div class="flex items-center gap-3 flex-1">
								<img
									:src="item.product_image || 'https://via.placeholder.com/60'"
									:alt="item.product_name"
									class="w-12 h-12 object-cover rounded border border-gray-200"
								/>
								<div>
									<!-- Sử dụng tên snapshot (product_name) -->
									<p class="font-medium text-gray-900 dark:text-white">{{ item.product_name }}</p>
									<p class="text-xs text-gray-500">
										<span v-if="item.color">{{ item.color }}</span>
										<span v-if="item.size" class="ml-1">/ {{ item.size }}</span>
										<span class="ml-2">x{{ item.quantity }}</span>
									</p>
								</div>
							</div>
							<!-- Sử dụng giá snapshot (unit_price) -->
							<p class="font-medium text-gray-900 dark:text-gray-100">
								{{ formatCurrency(item.unit_price) }}
							</p>
						</div>
					</div>
				</div>

				<!-- Shipping & Info -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-sm">
					<div>
						<p class="text-gray-500 mb-1">Địa chỉ giao hàng</p>
						<p class="font-medium text-gray-900 dark:text-gray-200">
							{{ order.shipping_fullname }} <span class="text-gray-400">|</span> {{ order.shipping_phone }}
						</p>
						<p class="text-gray-600 dark:text-gray-400 truncate">
							{{ order.shipping_address }}, {{ order.shipping_city }}
						</p>
					</div>
					<div class="md:text-right">
						<p class="text-gray-500 mb-1">Thanh toán</p>
						<p class="font-medium text-gray-900 dark:text-gray-200">{{ getPaymentLabel(order.payment_method) }}</p>
						<p :class="order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'">
							{{ order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
						</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-col sm:flex-row gap-3">
					<RouterLink
						:to="`/orders/${order.id}`"
						class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
					>
						Xem chi tiết
					</RouterLink>
					
					<!-- Nút Đặt lại (Re-order) -->
					<button
						@click="reorderItems(order)"
						class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Mua lại đơn này
					</button>

					<!-- Nút Hủy (Chỉ hiện khi chưa xử lý) -->
					<button
						v-if="['pending', 'unpaid'].includes(order.status)"
						@click="handleCancel(order.id)"
						class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
					>
						Hủy đơn hàng
					</button>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-16">
			<div class="mb-4">
				<svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có đơn hàng nào</h3>
			<RouterLink
				to="/products"
				class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
			>
				Bắt đầu mua sắm
			</RouterLink>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useOrderStore } from '@/stores/order';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import { formatCurrency } from '@/utils/helpers';

const orderStore = useOrderStore();
const cartStore = useCartStore();
const uiStore = useUIStore();

// Lấy dữ liệu từ Store
const orders = computed(() => orderStore.orders);
const loading = computed(() => orderStore.loading);

// 1. Gọi API lấy danh sách khi vào trang
onMounted(() => {
	orderStore.fetchMyOrders();
});

// 2. Xử lý Hủy đơn
const handleCancel = async (orderId) => {
	if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
		await orderStore.cancelOrder(orderId, 'Khách hàng hủy');
	}
};

// 3. Xử lý Mua lại (Re-order)
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

	uiStore.pushToast({
		type: 'success',
		message: `Đã thêm ${count} sản phẩm vào giỏ hàng`
	});
};

// Helper: Badge màu sắc
const statusBadgeClass = (status) => {
	const map = {
		pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		processing: 'bg-blue-100 text-blue-800 border-blue-200',
		shipping: 'bg-indigo-100 text-indigo-800 border-indigo-200',
		delivered: 'bg-green-100 text-green-800 border-green-200',
		cancelled: 'bg-red-100 text-red-800 border-red-200'
	};
	return map[status] || 'bg-gray-100 text-gray-800';
};

// Helper: Label trạng thái
const getStatusLabel = (status) => {
	const map = {
		pending: 'Chờ xác nhận',
		processing: 'Đang xử lý',
		shipping: 'Đang giao hàng',
		delivered: 'Giao thành công',
		cancelled: 'Đã hủy',
		unpaid: 'Chưa thanh toán'
	};
	return map[status] || status;
};

const getPaymentLabel = (method) => {
	const map = {
		cod: 'Tiền mặt (COD)',
		momo: 'Ví MoMo',
		banking: 'Chuyển khoản'
	};
	return map[method] || method;
};
</script>