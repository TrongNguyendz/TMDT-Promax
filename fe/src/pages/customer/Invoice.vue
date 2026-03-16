<template>
	<div v-if="order" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
		<div class="container mx-auto max-w-4xl px-4">
			<!-- Action Buttons -->
			<div class="mb-6 flex gap-3 justify-end print:hidden">
				<button 
					@click="printInvoice"
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
					</svg>
					In hóa đơn
				</button>
				<button 
					@click="downloadPDF"
					class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors shadow-md hover:shadow-lg"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Tải PDF
				</button>
			</div>

			<!-- Main Invoice -->
			<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none" data-invoice-container>
				<!-- Header Section -->
				<div class="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 px-8 py-8 text-white">
					<div class="flex items-start justify-between mb-6">
						<div>
							<h1 class="text-4xl font-bold mb-2">HÓA ĐƠN</h1>
							<p class="text-blue-100">Mã đơn: <span class="font-mono font-bold text-lg">{{ order.orderNumber }}</span></p>
						</div>
						<div class="text-right">
							<div class="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur">
								<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span class="font-semibold">{{ getStatusLabel(order.status) }}</span>
							</div>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-8 text-sm text-blue-50">
						<div>
							<p class="text-blue-200 text-xs font-semibold">Ngày tạo</p>
							<p class="text-lg font-semibold">{{ formatDate(order.orderDate) }}</p>
						</div>
						<div class="text-right">
							<p class="text-blue-200 text-xs font-semibold">Trạng thái thanh toán</p>
							<p class="text-lg font-semibold">{{ getPaymentStatusLabel(order.paymentStatus) }}</p>
						</div>
					</div>
				</div>

				<!-- Company & Customer Info -->
				<div class="px-8 py-8 border-b dark:border-gray-800">
					<div class="grid grid-cols-3 gap-8">
						<!-- Company Info -->
						<div>
							<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Từ</h3>
							<div class="space-y-2">
								<p class="text-lg font-bold text-gray-900 dark:text-gray-100">E-Commerce Store</p>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									123 Đường Nguyễn Huệ<br>
									Quận 1, TP.HCM, 700000<br>
									<span class="font-medium">Điện thoại:</span> (028) 1234 5678<br>
									<span class="font-medium">Email:</span> contact@ecommerce.com
								</p>
							</div>
						</div>

						<!-- Bill To -->
						<div>
							<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Hóa đơn cho</h3>
							<div class="space-y-2">
								<p class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ order.customer.name }}</p>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									{{ order.customer.address }}<br>
									<span class="font-medium">Email:</span> {{ order.customer.email }}<br>
									<span class="font-medium">Điện thoại:</span> {{ order.customer.phone }}
								</p>
							</div>
						</div>

						<!-- Ship To -->
						<div>
							<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Giao đến</h3>
							<div class="space-y-2">
								<p class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ order.shipping.recipientName }}</p>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									{{ order.shipping.address }}<br>
									<span class="font-medium">Điện thoại:</span> {{ order.shipping.phone }}<br>
									<span class="font-medium">Dự kiến giao:</span> {{ formatDate(order.shipping.estimatedDelivery) }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Line Items -->
				<div class="px-8 py-8 border-b dark:border-gray-800">
					<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Chi tiết sản phẩm</h3>
					
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead>
								<tr class="border-b-2 border-gray-300 dark:border-gray-700">
									<th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Sản phẩm</th>
									<th class="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Số lượng</th>
									<th class="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Thông số</th>
									<th class="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Đơn giá</th>
									<th class="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Thành tiền</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item, index) in order.items" :key="index" class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
									<td class="py-4 px-4">
										<div class="flex gap-3">
											<img :src="item.image" :alt="item.name" class="h-16 w-16 rounded-lg object-cover shadow-sm" />
											<div>
												<p class="font-semibold text-gray-900 dark:text-gray-100">{{ item.name }}</p>
												<p class="text-xs text-gray-600 dark:text-gray-400">SKU: {{ item.sku }}</p>
											</div>
										</div>
									</td>
									<td class="py-4 px-4 text-center text-gray-900 dark:text-gray-100 font-medium">{{ item.quantity }}</td>
									<td class="py-4 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
										<div class="flex gap-2 justify-center">
											<span v-if="item.color" class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">{{ item.color }}</span>
											<span v-if="item.size" class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">{{ item.size }}</span>
										</div>
										<span v-if="!item.color && !item.size" class="text-gray-400">-</span>
									</td>
									<td class="py-4 px-4 text-right text-gray-900 dark:text-gray-100">{{ formatCurrency(item.price) }}</td>
									<td class="py-4 px-4 text-right font-bold text-gray-900 dark:text-gray-100">
										{{ formatCurrency(item.price * item.quantity) }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- Summary Section -->
				<div class="px-8 py-8">
					<div class="grid grid-cols-3 gap-8">
						<!-- Notes -->
						<div class="col-span-2">
							<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Ghi chú</h3>
							<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
								{{ order.notes || 'Cảm ơn bạn đã mua hàng tại E-Commerce Store. Vui lòng liên hệ chúng tôi nếu có bất kỳ câu hỏi hoặc ý kiến.' }}
							</p>
						</div>

						<!-- Total -->
						<div class="col-span-1">
							<div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 space-y-4">
								<div class="flex justify-between items-center text-sm">
									<span class="text-gray-600 dark:text-gray-400">Tổng tiền hàng:</span>
									<span class="font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(order.subtotal) }}</span>
								</div>
								<div class="flex justify-between items-center text-sm">
									<span class="text-gray-600 dark:text-gray-400">Giảm giá:</span>
									<span class="font-semibold text-green-600 dark:text-green-400">-{{ formatCurrency(order.discount) }}</span>
								</div>
								<div class="flex justify-between items-center text-sm">
									<span class="text-gray-600 dark:text-gray-400">Phí vận chuyển:</span>
									<span class="font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(order.shippingFee) }}</span>
								</div>
								<div class="flex justify-between items-center text-sm">
									<span class="text-gray-600 dark:text-gray-400">Thuế (10%):</span>
									<span class="font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(order.tax) }}</span>
								</div>
								<div class="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
									<div class="flex justify-between items-center">
										<span class="text-lg font-bold text-gray-900 dark:text-gray-100">Tổng cộng</span>
										<span class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(order.total) }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="bg-gray-50 dark:bg-gray-800/50 px-8 py-6 border-t dark:border-gray-700">
					<div class="text-center space-y-1">
						<p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Phương thức thanh toán: <span class="text-gray-900 dark:text-gray-100">{{ order.paymentMethod }}</span></p>
						<p class="text-xs text-gray-600 dark:text-gray-400">
							Hóa đơn này được tạo tự động. © 2025 E-Commerce Store. All rights reserved.
						</p>
					</div>
				</div>
			</div>

			<!-- Action Buttons - Bottom -->
			<div class="mt-8 flex gap-3 justify-center print:hidden">
				<button 
					@click="$router.back()"
					class="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-6 py-3 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Quay lại
				</button>
				<RouterLink 
					to="/products"
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
					</svg>
					Tiếp tục mua sắm
				</RouterLink>
			</div>
		</div>
	</div>
	<div v-else class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
		<div class="text-center">
			<div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800 mb-4">
				<svg class="h-8 w-8 text-gray-600 dark:text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
				</svg>
			</div>
			<p class="text-gray-600 dark:text-gray-400 font-medium">Đang tải hóa đơn...</p>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { formatCurrency } from '../../utils/helpers';
import { useOrderStore } from '../../stores/order';
import html2pdf from 'html2pdf.js';

const route = useRoute();
const order = ref(null);
const orderStore = useOrderStore();

function formatDate(date) {
	if (!date) return '';
	const d = new Date(date);
	return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function getStatusLabel(status) {
	const labels = {
		pending: '⏳ Chờ xác nhận',
		confirmed: '✓ Đã xác nhận',
		shipped: '📦 Đang giao',
		delivered: '✓ Đã giao',
		cancelled: '✗ Đã hủy'
	};
	return labels[status] || status;
}

function getPaymentStatusLabel(status) {
	const labels = {
		paid: '✓ Đã thanh toán',
		pending: '⏳ Chờ thanh toán',
		failed: '✗ Thanh toán thất bại'
	};
	return labels[status] || status;
}

function printInvoice() {
	window.print();
}

function downloadPDF() {
	if (!order.value) return;

	const element = document.querySelector('[data-invoice-container]');
	if (!element) return;

	const filename = `${order.value.orderNumber}.pdf`;
	const options = {
		margin: [5, 5, 5, 5],
		filename,
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: { scale: 2 },
		jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
	};

	html2pdf().set(options).from(element).save();
}

onMounted(() => {
	const id = route.params.id;
	if (!id) return;

	// Try to load the order from the Pinia store
	const found = orderStore.getOrderById(id);
	if (found) {
		// Normalize store shape to the invoice template expectations
		const shipping = found.shippingInfo || {};
		const customer = {
			name: shipping.fullName || shipping.name || 'Khách lẻ',
			email: shipping.email || '',
			phone: shipping.phone || ''
		};

		order.value = {
			orderNumber: found.id,
			orderDate: found.createdAt || new Date().toISOString(),
			status: found.status || 'pending',
			paymentStatus: found.paymentStatus || (found.paymentMethod && found.paymentMethod !== 'cod' ? 'paid' : 'pending'),
			paymentMethod: found.paymentMethod || 'COD',
			paymentDate: found.updatedAt || found.createdAt || new Date().toISOString(),
			customer,
			shipping: {
				recipientName: shipping.fullName || shipping.name || 'Khách lẻ',
				address: shipping.address || '',
				phone: shipping.phone || '',
				estimatedDelivery: shipping.estimatedDelivery || null
			},
			items: found.items || [],
			subtotal: found.subtotal || 0,
			discount: found.discount || 0,
			shippingFee: found.shippingFee || 0,
			tax: found.tax || 0,
			total: found.total || found.subtotal || 0,
			notes: found.notes || ''
		};
	}
});
</script>

<style scoped>
@media print {
	body {
		background: white;
	}
	.print\:hidden {
		display: none !important;
	}
	.rounded-2xl {
		border-radius: 0;
	}
	.shadow-lg {
		box-shadow: none;
	}
}
</style>
