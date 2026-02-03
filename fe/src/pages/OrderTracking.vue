<template>
	<section class="max-w-3xl mx-auto py-8 px-4">
		<!-- Tiêu đề & Nút quay lại -->
		<div class="mb-8">
			<RouterLink to="/orders" class="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
				← Quay lại danh sách đơn hàng
			</RouterLink>
			<h1 class="text-2xl font-bold dark:text-white">Theo dõi đơn hàng</h1>
			<p class="text-gray-500" v-if="order">Mã vận đơn: <span class="font-mono font-bold">{{ order.order_number }}</span></p>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="py-12 text-center">
			<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
		</div>

		<!-- Nội dung chính -->
		<div v-else-if="order" class="space-y-8">
			
			<!-- Thông báo nếu đơn bị Hủy -->
			<div v-if="order.status === 'cancelled'" class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
				<p class="font-semibold">Đơn hàng này đã bị hủy.</p>
			</div>

			<!-- Tiến trình vận chuyển (Stepper) -->
			<div v-else class="relative border-l-2 border-gray-200 ml-3 pl-8 dark:border-gray-700 space-y-12">
				<div 
					v-for="(step, index) in trackingSteps" 
					:key="step.status"
					class="relative"
				>
					<!-- Dấu chấm trạng thái -->
					<span 
						class="absolute -left-[41px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white dark:border-gray-900 transition-colors"
						:class="index <= currentStepIndex ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'"
					>
						<svg v-if="index < currentStepIndex" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
					</span>

					<!-- Nội dung bước -->
					<div>
						<h3 class="font-bold text-lg" :class="index <= currentStepIndex ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'">
							{{ step.label }}
						</h3>
						<p class="text-sm text-gray-500 mt-1">{{ step.desc }}</p>
						
						<!-- Hiển thị thời gian cập nhật nếu là bước hiện tại hoặc đã qua -->
						<p v-if="index === currentStepIndex" class="text-xs font-medium text-emerald-600 mt-2">
							Cập nhật lúc: {{ new Date(order.updated_at).toLocaleString('vi-VN') }}
						</p>
					</div>
				</div>
			</div>

			<!-- Box thông tin vận chuyển thêm -->
			<div class="rounded-xl border border-gray-200 p-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
				<h4 class="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Thông tin nhận hàng</h4>
				<div class="space-y-2 text-sm">
					<p><span class="text-gray-500">Người nhận:</span> <span class="font-semibold">{{ order.shipping_fullname }}</span></p>
					<p><span class="text-gray-500">Số điện thoại:</span> {{ order.shipping_phone }}</p>
					<p><span class="text-gray-500">Địa chỉ:</span> {{ order.shipping_address }}</p>
				</div>
			</div>
		</div>

		<!-- Không tìm thấy đơn -->
		<div v-else class="text-center py-20">
			<p class="text-gray-500">Không tìm thấy thông tin vận chuyển cho đơn hàng này.</p>
			<RouterLink to="/orders" class="mt-4 inline-block text-blue-600 font-semibold">Về trang đơn hàng</RouterLink>
		</div>
	</section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import OrderAPI from '../utils/order_service_api';

const route = useRoute();
const orderId = route.params.orderId;

const order = ref(null);
const loading = ref(true);

// 1. Định nghĩa các bước vận chuyển chuẩn
const trackingSteps = [
	{ status: 'pending', label: 'Đặt hàng thành công', desc: 'Đơn hàng của bạn đã được hệ thống ghi nhận.' },
	{ status: 'processing', label: 'Đang chuẩn bị hàng', desc: 'Người bán đang đóng gói sản phẩm của bạn.' },
	{ status: 'shipping', label: 'Đang vận chuyển', desc: 'Đơn hàng đang trên đường giao đến bạn.' },
	{ status: 'delivered', label: 'Giao hàng thành công', desc: 'Bạn đã nhận được kiện hàng.' }
];

// 2. Xác định index hiện tại dựa trên status của đơn hàng
const currentStepIndex = computed(() => {
	if (!order.value) return 0;
	// Map các status từ backend sang index của mảng trackingSteps
	const statusMap = {
		'unpaid': 0,
		'pending': 0,
		'processing': 1,
		'shipping': 2,
		'delivered': 3
	};
	return statusMap[order.value.status] ?? 0;
});

// 3. Tải dữ liệu từ API Gateway
onMounted(async () => {
	try {
		loading.value = true;
		const res = await OrderAPI.getOrderById(orderId);
		if (res.data.success) {
			order.value = res.data.data;
		}
	} catch (err) {
		console.error('Lỗi khi lấy thông tin theo dõi:', err);
	} finally {
		loading.value = false;
	}
});
</script>