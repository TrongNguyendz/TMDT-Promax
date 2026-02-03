<template>
	<h1 class="mb-6 text-2xl font-black tracking-tight dark:text-white uppercase italic">Quản lý đơn hàng</h1>
	
	<!-- Filter Row: Sử dụng items-end để các thành phần hít vào đáy -->
	<div class="mb-6 flex gap-4 flex-wrap items-end">
		
		<!-- Filter Status -->
		<div class="min-w-[160px]">
		<label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Trạng thái</label>
		<select 
			v-model="status" 
			class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-white"
		>
			<option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
		</select>
		</div>
		
		 <!-- Search -->
		<div class="flex-1 min-w-[280px]">
		<label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Tìm kiếm</label>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
			</span>
			<input 
			v-model="searchQuery"
			type="text"
			placeholder="Mã đơn, tên khách hàng..."
			class="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-white"
			/>
		</div>
		</div>

		<div class="flex flex-col">
		<!-- Label ẩn để giữ chỗ (spacer) -->
		<span class="mb-2 h-4"></span> 
		<button 
			@click="loadOrders" 
			class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900"
		>
			<svg :class="{'animate-spin': loading}" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
			</svg>
			Tải lại
		</button>
		</div>
	</div>

	<!-- Loading -->
	<div v-if="loading" class="text-center py-8">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
	</div>

	<!-- Table -->
	<div v-else class="overflow-x-auto rounded-lg border dark:border-gray-800">
		<table class="min-w-full text-sm">
			<thead class="bg-gray-50 text-left dark:bg-gray-900 dark:text-gray-300">
				<tr>
					<th class="p-3 font-semibold">Mã đơn</th>
					<th class="p-3 font-semibold">Ngày đặt</th>
					<th class="p-3 font-semibold">Khách hàng</th>
					<th class="p-3 font-semibold text-right">Tổng tiền</th>
<th class="p-3 font-semibold text-center">Trạng thái</th>
					<th class="p-3 font-semibold text-center">Hành động</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
				<tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
					<!-- Mã đơn (order_number) -->
					<td class="p-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
						<RouterLink :to="`/order-detail/${order.id}`">{{ order.order_number }}</RouterLink>
					</td>
					
					<!-- Ngày đặt -->
					<td class="p-3 text-gray-600 dark:text-gray-400">
						{{ new Date(order.created_at).toLocaleDateString('vi-VN') }}
					</td>
					
					<!-- Khách hàng (Snapshot) -->
					<td class="p-3">
						<p class="font-medium text-gray-900 dark:text-white">{{ order.shipping_fullname }}</p>
						<p class="text-xs text-gray-500">{{ order.shipping_phone }}</p>
					</td>
					
					<!-- Tổng tiền -->
					<td class="p-3 font-semibold text-right text-gray-900 dark:text-gray-100">
						{{ formatCurrency(order.final_amount) }}
					</td>
					
					<!-- Trạng thái -->
					<td class="p-3 text-center">
						<span 
							:class="[
								'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
								statusBadgeClass(order.status)
							]"
						>
							{{ getStatusLabel(order.status) }}
						</span>
					</td>
					
					<!-- Hành động -->
					<td class="p-3">
						<div class="flex items-center justify-center gap-2">
							<!-- Nút Giao Hàng (Hiện khi Pending/Processing) -->
							<button 
								v-if="['pending', 'processing'].includes(order.status)"
								@click="updateStatus(order.id, 'shipping')" 
								title="Chuyển sang Đang giao"
								class="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
							</button>

							<!-- Nút Hoàn Tất (Hiện khi Shipping) -->
							<button 
								v-if="order.status === 'shipping'"
								@click="updateStatus(order.id, 'delivered')" 
								title="Xác nhận Đã giao"
								class="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
							</button>

							<!-- Nút Hủy (Chỉ khi chưa giao) -->
							<button 
								v-if="['pending', 'processing', 'unpaid'].includes(order.status)"
								@click="cancelOrder(order.id)" 
								title="Hủy đơn"
								class="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
							>
<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<!-- Empty State -->
	<div v-if="!loading && filteredOrders.length === 0" class="mt-8 text-center text-gray-500">
		Không tìm thấy đơn hàng nào.
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useOrderStore } from '../../stores/order'; // Import Store
import OrderAPI from '../../utils/order_service_api'; // Import API trực tiếp để gọi action update
import { useUIStore } from '../../stores/ui';
import { formatCurrency } from '../../utils/helpers';

const uiStore = useUIStore();
const orderStore = useOrderStore(); // Dùng store để lấy list

const status = ref('all');
const searchQuery = ref('');
const loading = ref(false);

const statusOptions = [
	{ value: 'all', label: 'Tất cả' },
	{ value: 'pending', label: 'Chờ xác nhận' },
	{ value: 'processing', label: 'Đang xử lý' },
	{ value: 'shipping', label: 'Đang giao' },
	{ value: 'delivered', label: 'Hoàn tất' },
	{ value: 'cancelled', label: 'Đã hủy' }
];

// Lấy danh sách từ Store
// Lưu ý: Nếu trang Admin này cần xem ALL orders của hệ thống, 
// bạn nên viết thêm action `fetchAllOrders` trong store gọi API không có user_id filter.
// Ở đây tạm dùng fetchMyOrders.
const orders = computed(() => orderStore.orders); 

// Filter logic
const filteredOrders = computed(() => {
	let result = orders.value;

	if (status.value !== 'all') {
		result = result.filter(o => o.status === status.value);
	}

	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase();
		result = result.filter(o => 
			(o.order_number || '').toLowerCase().includes(q) ||
			(o.shipping_fullname || '').toLowerCase().includes(q) ||
			(o.shipping_phone || '').includes(q)
		);
	}
	return result;
});

// Load data
const loadOrders = async () => {
	loading.value = true;
	await orderStore.fetchAllOrders(); 
	loading.value = false;
};

onMounted(() => {
	loadOrders();
});

// Actions Update Status
const updateStatus = async (id, newStatus) => {
	try {
		const res = await OrderAPI.updateOrderStatus(id, newStatus);
		if (res.data.success) {
			uiStore.pushToast({ type: 'success', message: 'Cập nhật thành công' });
			// Reload list hoặc update local state
			const order = orders.value.find(o => o.id === id);
			if (order) order.status = newStatus;
		}
	} catch (error) {
		uiStore.pushToast({ type: 'error', message: 'Lỗi cập nhật' });
	}
};

const cancelOrder = async (id) => {
	if (!confirm('Chắc chắn hủy đơn hàng này?')) return;
	await updateStatus(id, 'cancelled');
};

// Helpers
const statusBadgeClass = (status) => {
	const map = {
		pending: 'bg-yellow-100 text-yellow-800',
		processing: 'bg-blue-100 text-blue-800',
		shipping: 'bg-purple-100 text-purple-800',
		delivered: 'bg-green-100 text-green-800',
		cancelled: 'bg-red-100 text-red-800',
		unpaid: 'bg-gray-100 text-gray-800'
	};
	return map[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status) => {
	const map = {
		pending: 'Chờ xử lý',
		processing: 'Đang gói',
		shipping: 'Đang giao',
		delivered: 'Hoàn tất',
		cancelled: 'Đã hủy',
		unpaid: 'Chưa thanh toán'
	};
	return map[status] || status;
};
</script>