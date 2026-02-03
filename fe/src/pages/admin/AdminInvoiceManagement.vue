<template>
	<section>
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý hóa đơn</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Xem, tìm kiếm và quản lý tất cả hóa đơn</p>
		</div>

		<!-- Search and Filter -->
		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
			<div class="grid gap-4 md:grid-cols-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tìm kiếm hóa đơn</label>
					<input 
						v-model="searchQuery"
						type="text"
						placeholder="Mã hóa đơn, email, tên..."
						class="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
					<select 
						v-model="statusFilter"
						class="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
					>
						<option value="">Tất cả trạng thái</option>
						<option value="pending">Chờ xác nhận</option>
						<option value="confirmed">Đã xác nhận</option>
						<option value="shipped">Đang giao</option>
						<option value="delivered">Đã giao</option>
						<option value="cancelled">Đã hủy</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái thanh toán</label>
					<select 
						v-model="paymentStatusFilter"
						class="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
					>
						<option value="">Tất cả</option>
						<option value="paid">Đã thanh toán</option>
						<option value="pending">Chờ thanh toán</option>
						<option value="failed">Thanh toán thất bại</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">&nbsp;</label>
					<button 
						@click="applyFilters"
						class="w-full rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200"
					>
						Tìm kiếm
					</button>
				</div>
			</div>
		</div>

		<!-- Invoices Table -->
		<div class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
					<tr>
						<th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Mã hóa đơn</th>
						<th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Khách hàng</th>
						<th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Ngày đặt</th>
						<th class="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">Tổng tiền</th>
						<th class="px-6 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">Trạng thái</th>
						<th class="px-6 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">Thanh toán</th>
						<th class="px-6 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">Thao tác</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
					<tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
						<td class="px-6 py-4 font-mono font-semibold text-blue-600 dark:text-blue-400">{{ invoice.orderNumber }}</td>
						<td class="px-6 py-4">
							<div>
								<p class="font-medium text-gray-900 dark:text-gray-100">{{ invoice.customer.name }}</p>
								<p class="text-xs text-gray-600 dark:text-gray-400">{{ invoice.customer.email }}</p>
							</div>
						</td>
						<td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ formatDate(invoice.orderDate) }}</td>
						<td class="px-6 py-4 text-right font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(invoice.total) }}</td>
						<td class="px-6 py-4 text-center">
							<span 
								:class="{
									'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': invoice.status === 'pending',
									'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': invoice.status === 'confirmed',
									'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': invoice.status === 'shipped',
									'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': invoice.status === 'delivered',
									'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': invoice.status === 'cancelled'
								}"
								class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
							>
								{{ getStatusLabel(invoice.status) }}
							</span>
						</td>
						<td class="px-6 py-4 text-center">
							<span 
								:class="{
									'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': invoice.paymentStatus === 'paid',
									'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': invoice.paymentStatus === 'pending',
									'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': invoice.paymentStatus === 'failed'
								}"
								class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
							>
								{{ getPaymentStatusLabel(invoice.paymentStatus) }}
							</span>
						</td>
						<td class="px-6 py-4 text-center">
							<div class="flex gap-2 justify-center">
								<button 
									@click="viewInvoice(invoice.id)"
									title="Xem hóa đơn"
									class="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								</button>
								<button 
									@click="printInvoice(invoice.id)"
									title="In hóa đơn"
									class="rounded-lg bg-gray-600 p-2 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
									</svg>
								</button>
								<button 
									@click="downloadInvoicePDF(invoice.id)"
									title="Tải PDF"
									class="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>

			<!-- No Results -->
			<div v-if="filteredInvoices.length === 0" class="p-8 text-center text-gray-600 dark:text-gray-400">
				<svg class="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p>Không tìm thấy hóa đơn nào</p>
			</div>
		</div>

		<!-- Pagination -->
		<div v-if="filteredInvoices.length > 0" class="mt-6 flex items-center justify-center gap-3">
			<button 
				@click="currentPage = Math.max(1, currentPage - 1)"
				:disabled="currentPage === 1"
				class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
				Trang <span class="font-bold">{{ currentPage }}</span> / <span class="font-bold">{{ totalPages }}</span>
			</span>
			<button 
				@click="currentPage = Math.min(totalPages, currentPage + 1)"
				:disabled="currentPage === totalPages"
				class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	</section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency } from '../../utils/helpers';
import { useOrderStore } from '../../stores/order';
import html2pdf from 'html2pdf.js';

const router = useRouter();
const orderStore = useOrderStore();

const searchQuery = ref('');
const statusFilter = ref('');
const paymentStatusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Resolve orders from the store (handle computed ref or plain array)
const sourceOrders = computed(() => {
	const g = orderStore.getAllOrders;
	if (Array.isArray(g)) return g;
	if (g && typeof g === 'object' && 'value' in g) return g.value || [];
	return [];
});

// Map the store orders into the invoice view model
const invoices = computed(() => {
	return sourceOrders.value.map(o => {
		const orderNumber = o.id || `ORD-${Date.now()}`;
		// shippingInfo contains recipient details in this app
		const customerName = (o.shippingInfo && (o.shippingInfo.recipientName || o.shippingInfo.name)) || 'Khách lẻ';
		const customerEmail = (o.shippingInfo && (o.shippingInfo.email || o.shippingInfo.recipientEmail)) || '';
		const customer = { name: customerName, email: customerEmail };

		// subtotal stored as 'subtotal' in the store
		const total = o.total || o.subtotal || 0;

		// paymentStatus: derive from paymentMethod when explicit flag not present
		const paymentStatus = o.paymentStatus || (o.paymentMethod && o.paymentMethod !== 'cod' ? 'paid' : 'pending');

		return {
			id: o.id,
			orderNumber,
			customer,
			orderDate: o.createdAt || o.orderDate || new Date().toISOString(),
			total,
			status: o.status || 'pending',
			paymentStatus,
			items: o.items || [],
			raw: o
		};
	});
});

// Filtered invoices
const filteredInvoices = computed(() => {
	let result = invoices.value || [];

	// Search filter
	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase();
		result = result.filter(inv =>
			(inv.orderNumber || '').toString().toLowerCase().includes(query) ||
			(inv.customer?.name || '').toLowerCase().includes(query) ||
			(inv.customer?.email || '').toLowerCase().includes(query)
		);
	}

	// Status filter
	if (statusFilter.value) {
		result = result.filter(inv => inv.status === statusFilter.value);
	}

	// Payment status filter
	if (paymentStatusFilter.value) {
		result = result.filter(inv => inv.paymentStatus === paymentStatusFilter.value);
	}

	return result;
});

// Paginated invoices
const paginatedInvoices = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage;
	return filteredInvoices.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredInvoices.value.length / itemsPerPage)));

function formatDate(date) {
	if (!date) return '';
	const d = new Date(date);
	return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function getStatusLabel(status) {
	const labels = {
		pending: 'Chờ xác nhận',
		confirmed: 'Đã xác nhận',
		shipped: 'Đang giao',
		delivered: 'Đã giao',
		cancelled: 'Đã hủy'
	};
	return labels[status] || status;
}

function getPaymentStatusLabel(status) {
	const labels = {
		paid: 'Đã thanh toán',
		pending: 'Chờ thanh toán',
		failed: 'Thanh toán thất bại'
	};
	return labels[status] || status;
}

function applyFilters() {
	currentPage.value = 1;
}

function viewInvoice(invoiceId) {
	const invoice = invoices.value.find(inv => inv.id === invoiceId);
	if (invoice) {
		router.push(`/invoice/${invoice.orderNumber}`);
	}
}

function printInvoice(invoiceId) {
	const invoice = invoices.value.find(inv => inv.id === invoiceId);
	if (invoice) {
		window.open(`/invoice/${invoice.orderNumber}`, '_blank');
	}
}

function downloadInvoicePDF(invoiceId) {
	const invoice = invoices.value.find(inv => inv.id === invoiceId);
	if (invoice) {
		// Open the invoice page in a new tab for printing/PDF export
		const win = window.open(`/invoice/${invoice.orderNumber}`, '_blank');
		if (win) {
			// After a short delay, trigger print dialog (user can save as PDF from print dialog)
			setTimeout(() => {
				win.focus();
				win.print();
			}, 500);
		}
	}
}
</script>
