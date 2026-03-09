<div class="mb-8 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
                        <option value="paid">Đã thanh toán (Paid)</option>
                        <option value="pending">Chờ thanh toán (Pending)</option>
                        <option value="failed">Thất bại (Failed)</option>
                    </select>
                </div>

                <div class="md:col-span-1 flex justify-end">
                    <button 
                        v-if="searchQuery || statusFilter || paymentStatusFilter"
                        @click="clearFilters"
                        title="Xóa bộ lọc"
                        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                    >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>