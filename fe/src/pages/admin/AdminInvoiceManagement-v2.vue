<template>
    <section class="space-y-8 pb-10">
        <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
            <div>
                <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
                    Quản lý hóa đơn
                </h1>
                <p class="mt-1 text-sm text-gray-500">Xem, thống kê và quản lý toàn bộ dòng tiền</p>
            </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng doanh thu hợp lệ</p>
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <h3 class="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-white truncate">
                    {{ formatCurrency(stats.totalRevenue) }}
                </h3>
                <p class="mt-1 text-xs font-medium text-gray-500">Dựa trên <span class="font-bold text-black dark:text-white">{{ filteredInvoices.length }}</span> hóa đơn</p>
            </div>

            <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Đã thanh toán (Paid)</p>
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <h3 class="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-white truncate">
                    {{ formatCurrency(stats.paidAmount) }}
                </h3>
                <p class="mt-1 text-xs font-medium text-green-600">{{ stats.paidPercentage }}% tổng doanh thu</p>
            </div>

            <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Chờ thu (Pending)</p>
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <h3 class="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-white truncate">
                    {{ formatCurrency(stats.pendingAmount) }}
                </h3>
                <p class="mt-1 text-xs font-medium text-yellow-600">Cần theo dõi sát sao</p>
            </div>

            <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-transform hover:-translate-y-1">
                <div class="flex items-center justify-between">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Đơn đã hủy</p>
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <div class="mt-4 flex items-end gap-2 truncate">
                    <h3 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{{ stats.cancelledCount }}</h3>
                    <span class="text-sm text-gray-400 font-medium mb-1">đơn</span>
                </div>
                <p class="mt-1 text-xs font-medium text-red-600 truncate">Thất thoát: {{ formatCurrency(stats.cancelledAmount) }}</p>
            </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
            <div class="col-span-1 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col items-center justify-center min-h-[300px]">
                <p class="mb-4 text-[10px] w-full font-black uppercase tracking-widest text-gray-400 text-left">Phân bổ trạng thái đơn</p>
                <div v-if="filteredInvoices.length === 0" class="text-xs text-gray-400 italic">Không có dữ liệu</div>
                <apexchart v-else type="donut" width="100%" height="280" :options="donutOptions" :series="donutSeries"></apexchart>
            </div>
            
            <div class="col-span-2 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 min-h-[300px]">
                <p class="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Dòng tiền hợp lệ theo ngày</p>
                <div v-if="filteredInvoices.length === 0" class="flex h-[240px] items-center justify-center text-xs text-gray-400 italic">Không có dữ liệu để vẽ biểu đồ</div>
                <apexchart v-else type="area" width="100%" height="280" :options="areaOptions" :series="areaSeries"></apexchart>
            </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div class="grid gap-5 md:grid-cols-12 items-end">
                
                <div class="md:col-span-5">
                    <label class="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Tìm kiếm hóa đơn</label>
                    <div class="relative">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input 
                            v-model="searchQuery"
                            type="text"
                            placeholder="Nhập mã đơn, tên hoặc email..."
                            class="w-full rounded-2xl border-gray-100 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white transition-colors"
                        />
                    </div>
                </div>

                <div class="md:col-span-3">
                    <label class="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Tiến độ giao hàng</label>
                    <select 
                        v-model="statusFilter"
                        class="w-full rounded-2xl border-gray-100 bg-gray-50 px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white transition-colors cursor-pointer"
                    >
                        <option value="">Tất cả tiến độ</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipped">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                <div class="md:col-span-3">
                    <label class="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Thanh toán</label>
                    <select 
                        v-model="paymentStatusFilter"
                        class="w-full rounded-2xl border-gray-100 bg-gray-50 px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white transition-colors cursor-pointer"
                    >
                        <option value="">Tất cả dòng tiền</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="failed">Thất bại</option>
                    </select>
                </div>

                <div class="md:col-span-1 flex justify-end">
                    <button 
                        v-if="searchQuery || statusFilter || paymentStatusFilter"
                        @click="clearFilters"
                        title="Xóa bộ lọc"
                        class="flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                    >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/50">
                        <tr>
                            <th class="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-gray-500">Mã Hóa Đơn</th>
                            <th class="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-gray-500">Khách Hàng</th>
                            <th class="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px] text-gray-500">Ngày Đặt</th>
                            <th class="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px] text-gray-500">Tổng Tiền</th>
                            <th class="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px] text-gray-500">Trạng Thái</th>
                            <th class="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px] text-gray-500">Thanh Toán</th>
                            <th class="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px] text-gray-500">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        <tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{{ invoice.orderNumber }}</td>
                            <td class="px-6 py-4">
                                <div>
                                    <p class="font-bold text-gray-900 dark:text-white">{{ invoice.customer.name }}</p>
                                    <p class="text-[11px] text-gray-500">{{ invoice.customer.email }}</p>
                                </div>
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">{{ formatDate(invoice.orderDate) }}</td>
                            <td class="px-6 py-4 text-right font-black text-gray-900 dark:text-white">{{ formatCurrency(invoice.total) }}</td>
                            <td class="px-6 py-4 text-center">
                                <span 
                                    :class="{
                                        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800': invoice.status === 'pending',
                                        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800': invoice.status === 'confirmed',
                                        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800': invoice.status === 'shipped',
                                        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800': invoice.status === 'delivered',
                                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800': invoice.status === 'cancelled'
                                    }"
                                    class="inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                                >
                                    {{ getStatusLabel(invoice.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span 
                                    :class="{
                                        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800': invoice.paymentStatus === 'paid',
                                        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800': invoice.paymentStatus === 'pending',
                                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800': invoice.paymentStatus === 'failed'
                                    }"
                                    class="inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                                >
                                    {{ getPaymentStatusLabel(invoice.paymentStatus) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="flex gap-2 justify-center">
                                    <button 
                                        @click="viewInvoice(invoice.id)"
                                        title="Xem hóa đơn"
                                        class="rounded-xl bg-gray-100 p-2.5 text-gray-600 transition-colors hover:bg-gray-200 hover:text-black dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    >
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                    <button 
                                        @click="printInvoice(invoice.id)"
                                        title="In hóa đơn"
                                        class="rounded-xl bg-gray-100 p-2.5 text-gray-600 transition-colors hover:bg-gray-200 hover:text-black dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    >
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    </button>
                                    <button 
                                        @click="downloadInvoicePDF(invoice.id)"
                                        title="Tải PDF"
                                        class="rounded-xl bg-gray-900 p-2.5 text-white transition-colors hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                    >
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="filteredInvoices.length === 0" class="flex flex-col items-center justify-center p-16 text-center">
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                    <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Không có dữ liệu</h3>
                <p class="mt-2 text-sm text-gray-500">Thử thay đổi từ khóa hoặc bộ lọc để xem kết quả khác.</p>
            </div>
        </div>

        <div v-if="filteredInvoices.length > 0" class="mt-6 flex items-center justify-center gap-4">
            <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-900 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:hover:bg-gray-800"
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                TRANG <span class="text-gray-900 dark:text-white">{{ currentPage }}</span> / {{ totalPages }}
            </span>
            <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-900 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:hover:bg-gray-800"
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency } from '../../utils/helpers';
import { useOrderStore } from '../../stores/order';
// import VueApexCharts from 'vue3-apexcharts';

const router = useRouter();
const orderStore = useOrderStore();
// const apexchart = VueApexCharts;

// ==========================================
// 1. KÍCH HOẠT LẤY DỮ LIỆU KHI MỞ TRANG
// ==========================================
onMounted(async () => {
    try {
        // Gọi hàm fetchAllOrders từ stores/order.js
        await orderStore.fetchAllOrders(); 
    } catch (error) {
        console.error("Lỗi lấy danh sách hóa đơn:", error);
    }
});

const searchQuery = ref('');
const statusFilter = ref('');
const paymentStatusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Reset trang 1 khi lọc
watch([searchQuery, statusFilter, paymentStatusFilter], () => {
    currentPage.value = 1;
});

function clearFilters() {
    searchQuery.value = '';
    statusFilter.value = '';
    paymentStatusFilter.value = '';
}

// ==========================================
// 2. KẾT NỐI DỮ LIỆU TỪ STORE (ĐÃ SỬA LỖI)
// ==========================================
const sourceOrders = computed(() => {
    // ĐÃ SỬA: Đổi từ getAllOrders thành orders cho đúng với Store của bạn!
    const g = orderStore.orders; 
    
    if (Array.isArray(g)) return g;
    if (g && typeof g === 'object' && 'value' in g) return g.value || [];
    return [];
});

// Map sang Invoice View Model
const invoices = computed(() => {
    return sourceOrders.value.map(o => {
        const orderNumber = o.id || `ORD-${Date.now()}`;
        const customerName = (o.shippingInfo && (o.shippingInfo.recipientName || o.shippingInfo.name)) || 'Khách lẻ';
        const customerEmail = (o.shippingInfo && (o.shippingInfo.email || o.shippingInfo.recipientEmail)) || '';
        const customer = { name: customerName, email: customerEmail };
        const total = o.total || o.subtotal || 0;
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

// Lọc dữ liệu Real-time
const filteredInvoices = computed(() => {
    let result = invoices.value || [];
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(inv =>
            (inv.orderNumber || '').toString().toLowerCase().includes(query) ||
            (inv.customer?.name || '').toLowerCase().includes(query) ||
            (inv.customer?.email || '').toLowerCase().includes(query)
        );
    }
    if (statusFilter.value) {
        result = result.filter(inv => inv.status === statusFilter.value);
    }
    if (paymentStatusFilter.value) {
        result = result.filter(inv => inv.paymentStatus === paymentStatusFilter.value);
    }
    return result;
});

// Phân trang
const paginatedInvoices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredInvoices.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredInvoices.value.length / itemsPerPage)));

// ==========================================
// 3. LOGIC THỐNG KÊ DASHBOARD
// ==========================================
const stats = computed(() => {
    const list = filteredInvoices.value;
    let totalRevenue = 0; let paidAmount = 0; let pendingAmount = 0;
    let cancelledCount = 0; let cancelledAmount = 0;

    list.forEach(inv => {
        if (inv.status !== 'cancelled') {
            totalRevenue += inv.total;
            if (inv.paymentStatus === 'paid') paidAmount += inv.total;
            if (inv.paymentStatus === 'pending') pendingAmount += inv.total;
        } else {
            cancelledCount++;
            cancelledAmount += inv.total;
        }
    });

    const paidPercentage = totalRevenue > 0 ? ((paidAmount / totalRevenue) * 100).toFixed(1) : 0;
    return { totalRevenue, paidAmount, pendingAmount, cancelledCount, cancelledAmount, paidPercentage };
});

// ==========================================
// 4. LOGIC VẼ BIỂU ĐỒ TRÒN & ĐƯỜNG
// ==========================================
const donutSeries = computed(() => {
    const counts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    filteredInvoices.value.forEach(inv => {
        if (counts[inv.status] !== undefined) counts[inv.status]++;
    });
    return [counts.pending, counts.confirmed, counts.shipped, counts.delivered, counts.cancelled];
});

const donutOptions = ref({
    labels: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'],
    colors: ['#FBBF24', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'],
    chart: { fontFamily: 'inherit', background: 'transparent' },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '11px', fontWeight: 700 }
});

// Gom nhóm doanh thu theo ngày cho biểu đồ đường
const areaChartData = computed(() => {
    const validInvoices = filteredInvoices.value.filter(inv => inv.status !== 'cancelled');
    const grouped = {};
    
    validInvoices.forEach(inv => {
        const d = new Date(inv.orderDate);
        const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
        if (!grouped[dateStr]) grouped[dateStr] = 0;
        grouped[dateStr] += inv.total;
    });

    const sortedDates = Object.keys(grouped).sort((a,b) => {
        const [d1, m1] = a.split('/'); const [d2, m2] = b.split('/');
        return new Date(2026, m1-1, d1) - new Date(2026, m2-1, d2);
    });
    
    const data = sortedDates.map(date => grouped[date]);
    return { categories: sortedDates, data: data };
});

const areaSeries = computed(() => [{ name: 'Doanh thu', data: areaChartData.value.data }]);

const areaOptions = computed(() => ({
    chart: { type: 'area', fontFamily: 'inherit', background: 'transparent', toolbar: { show: false } },
    colors: ['#111827'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { 
        categories: areaChartData.value.categories,
        labels: { style: { fontSize: '10px', fontWeight: 600, colors: '#9CA3AF' } }
    },
    yaxis: {
        labels: { formatter: (value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value) }
    }
}));

// ==========================================
// 5. CÁC HÀM TIỆN ÍCH
// ==========================================
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getStatusLabel(status) {
    const labels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
    return labels[status] || status;
}

function getPaymentStatusLabel(status) {
    const labels = { paid: 'Đã thanh toán', pending: 'Chờ thanh toán', failed: 'Thanh toán thất bại' };
    return labels[status] || status;
}

function viewInvoice(invoiceId) {
    const invoice = invoices.value.find(inv => inv.id === invoiceId);
    if (invoice) router.push(`/admin/orders/${invoice.id}`); // Sửa lại đường dẫn cho đúng chuẩn admin
}

function printInvoice(invoiceId) {
    const invoice = invoices.value.find(inv => inv.id === invoiceId);
    if (invoice) window.open(`/invoice/${invoice.orderNumber}`, '_blank');
}

function downloadInvoicePDF(invoiceId) {
    const invoice = invoices.value.find(inv => inv.id === invoiceId);
    if (invoice) {
        const win = window.open(`/invoice/${invoice.orderNumber}`, '_blank');
        if (win) {
            setTimeout(() => { win.focus(); win.print(); }, 500);
        }
    }
}
</script>