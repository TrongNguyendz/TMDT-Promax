<template>
  <div class="space-y-10 pb-10 font-sans">
    <!-- 1. Header Section -->
    <div class="flex items-end justify-between border-b border-gray-100 pb-8 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase lg:text-4xl">
          Hệ thống Voucher
        </h1>
        <p class="mt-2 text-base text-gray-500">Thiết lập và điều phối các đặc quyền ưu đãi dành cho khách hàng</p>
      </div>
      <button
        @click="openCreateModal"
        class="group flex items-center gap-3 rounded-2xl bg-gray-900 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Tạo mã mới
      </button>
    </div>

    <!-- 2. Voucher Grid (Bento Style) -->
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="v in voucherData"
        :key="v.id"
        class="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-2 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none"
      >
        <div class="rounded-[2.2rem] bg-gray-50/50 p-8 dark:bg-gray-800/30">
          <!-- Discount Info -->
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Giá trị giảm</p>
              <h3 class="mt-1 text-3xl font-black text-gray-900 dark:text-white">
                {{ v.discount_type === 'percentage' ? `${v.discount_value}%` : formatCurrency(v.discount_value) }}
              </h3>
            </div>
            <span class="rounded-xl bg-gray-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white dark:bg-white dark:text-black shadow-lg">
              {{ v.discount_type === 'percentage' ? 'Offer' : 'Fixed' }}
            </span>
          </div>

          <!-- Voucher Ticket UI -->
          <div class="mt-8 relative">
            <div class="absolute -left-10 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800"></div>
            <div class="absolute -right-10 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800"></div>
            <div class="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-950 transition-colors group-hover:border-gray-400">
<span class="font-mono text-xl font-black tracking-[0.4em] text-gray-900 dark:text-gray-100 uppercase">
                {{ v.code }}
              </span>
            </div>
          </div>

          <!-- Details -->
          <div class="mt-8 space-y-4">
            <p class="text-xs font-bold leading-relaxed text-gray-500 line-clamp-2 italic">
              "{{ v.description || 'Đặc quyền dành riêng cho khách hàng UNQILO' }}"
            </p>
            <div class="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                Tối thiểu: <span class="text-gray-900 dark:text-white">{{ formatCurrency(v.min_order_amount) }}</span>
              </div>
              <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Hết hạn: <span class="text-gray-900 dark:text-white">{{ formatDate(v.valid_until) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hover Actions Overlay -->
        <div class="absolute inset-0 flex items-center justify-center gap-4 bg-black/5 opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100">
          <button @click="editVoucher(v)" class="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-900 shadow-2xl transition-all hover:scale-110 active:scale-90">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button @click="deleteVoucher(v)" class="flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-600 shadow-2xl transition-all hover:scale-110 active:scale-90">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Create/Edit Modal -->
<div v-if="showModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <div class="fixed inset-0 bg-black/70 backdrop-blur-md" @click="closeModal"></div>
      <div class="relative w-full max-w-2xl overflow-hidden rounded-[3rem] bg-white shadow-2xl dark:bg-gray-950 border border-white/5">
        <div class="bg-gray-900 px-10 py-8 text-white dark:bg-black">
          <h2 class="text-2xl font-black uppercase tracking-widest italic">
            {{ editingId ? 'Cập nhật định danh' : 'Thiết lập mã ưu đãi' }}
          </h2>
        </div>

        <form @submit.prevent="saveVoucher" class="p-10 space-y-8">
          <!-- Code & Description -->
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mã định danh (Code) *</label>
              <input v-model="formData.code" type="text" placeholder="VD: LUXE50" class="luxe-input font-mono uppercase tracking-[0.3em]" required />
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mô tả hiển thị</label>
              <textarea v-model="formData.description" rows="2" class="luxe-input" placeholder="Ghi chú về voucher này..."></textarea>
            </div>
          </div>

          <!-- Type & Value Grid -->
          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Hình thức</label>
              <select v-model="formData.discount_type" class="luxe-input font-bold">
                <option value="percentage">Chiết khấu (%)</option>
                <option value="fixed">Tiền mặt (VND)</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Giá trị giảm *</label>
              <input v-model.number="formData.discount_value" type="number" class="luxe-input font-bold" required />
            </div>
          </div>

          <!-- Min Order -->
          <div class="space-y-2">
            <label class="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Giá trị đơn hàng tối thiểu</label>
            <input v-model.number="formData.min_order_amount" type="number" class="luxe-input font-bold" />
          </div>

          <!-- Date Picker Grid (Nâng cấp) -->
          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Hiệu lực từ</label>
              <VueDatePicker
                v-model="formData.valid_from"
                v-bind="datePickerConfig"
                :dark="isDark"
              >
<template #dp-input="{ value }">
                  <input :value="value" class="luxe-input cursor-pointer" placeholder="Chọn ngày bắt đầu" readonly />
                </template>
              </VueDatePicker>
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Hết hạn vào</label>
              <VueDatePicker
                v-model="formData.valid_until"
                v-bind="datePickerConfig"
                :dark="isDark"
              >
                <template #dp-input="{ value }">
                  <input :value="value" class="luxe-input cursor-pointer" placeholder="Chọn ngày kết thúc" readonly />
                </template>
              </VueDatePicker>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="flex gap-4 pt-4">
            <button type="button" @click="closeModal" class="flex-1 rounded-2xl bg-gray-50 py-5 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 dark:bg-gray-900 transition-all">HỦY BỎ</button>
            <button type="submit" class="flex-1 rounded-2xl bg-gray-900 py-5 text-xs font-black uppercase tracking-widest text-white shadow-2xl hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all">XÁC NHẬN LƯU</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 4. Delete Confirmation -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-[2.5rem] bg-white p-10 text-center shadow-2xl dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30">
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <h3 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Xóa mã này?</h3>
        <p class="mt-3 text-sm font-medium text-gray-500 leading-relaxed">Hành động này không thể hoàn tác. Mã <span class="text-gray-900 dark:text-white font-black underline">{{ voucherToDelete?.code }}</span> sẽ bị gỡ vĩnh viễn.</p>
        <div class="mt-10 flex gap-4">
          <button @click="showDeleteModal = false" class="flex-1 rounded-xl bg-gray-50 py-4 text-xs font-black dark:bg-gray-900 dark:text-gray-400 uppercase tracking-widest">HỦY</button>
          <button @click="confirmDelete" class="flex-1 rounded-xl bg-red-600 py-4 text-xs font-black text-white shadow-lg shadow-red-200 dark:shadow-none uppercase tracking-widest">XÁC NHẬN</button>
</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { getListVouchers1, createVoucher1, updateVoucher1, deleteVoucher1 } from '../../utils/voucher_service_api.js';

const ui = useUIStore();
const user = useUserStore();
const isDark = computed(() => ui.isDarkMode);

const voucherData = ref([]);

// Cấu hình chuẩn cho bộ chọn ngày
const datePickerConfig = {
  format: "dd/MM/yyyy",
  autoApply: true,
  closeOnAutoApply: true,
  modelType: "yyyy-MM-dd",
};

async function loadVouchers() {
  try {
    const response = await getListVouchers1(user.token);
    voucherData.value = response.data.data;
    console.log('Danh sách voucher đã tải:', voucherData.value);
  } catch (err) {
    console.error('Lỗi tải voucher:', err);
    ui.pushToast({ type: 'error', message: 'Không thể tải danh sách voucher' });
  }
}

onMounted(() => {
  loadVouchers();
});

// Modal states
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingId = ref(null);
const voucherToDelete = ref(null);

const formData = reactive({
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_order_amount: 0,
  valid_from: '',
  valid_until: '',
});

function openCreateModal() {
  editingId.value = null;
  Object.assign(formData, {
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    valid_from: '',
    valid_until: '',
  });
  showModal.value = true;
}

function editVoucher(voucher) {
  editingId.value = voucher._id;
  Object.assign(formData, { 
    ...voucher,
    // Đảm bảo định dạng ngày để DatePicker nhận diện
    valid_from: voucher.valid_from ? voucher.valid_from.split('T')[0] : '',
    valid_until: voucher.valid_until ? voucher.valid_until.split('T')[0] : '',
  });
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

async function saveVoucher() {
  try {
    if (editingId.value) {
      await updateVoucher1(editingId.value, formData, user.token);
      ui.pushToast({ type: 'success', message: 'Đã cập nhật thay đổi' });
    } else {
      await createVoucher1(formData, user.token);
      ui.pushToast({ type: 'success', message: 'Tạo mã ưu đãi thành công' });
    }
    await loadVouchers();
    closeModal();
  } catch (err) {
    ui.pushToast({ type: 'error', message: 'Thao tác thất bại, vui lòng kiểm tra dữ liệu' });
  }
}

function deleteVoucher(voucher) {
  voucherToDelete.value = voucher;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (voucherToDelete.value) {
    try {
      await deleteVoucher1(voucherToDelete.value._id, user.token);
      ui.pushToast({ type: 'success', message: 'Mã ưu đãi đã được gỡ bỏ' });
await loadVouchers();
    } catch (err) {
      ui.pushToast({ type: 'error', message: 'Không thể xóa voucher' });
    } finally {
      showDeleteModal.value = false;
      voucherToDelete.value = null;
    }
  }
}

// Helpers
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}
</script>

<style scoped>
/* Luxe Input Style Base */
.luxe-input {
  @apply w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm transition-all focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:focus:ring-white;
}

/* Customizing DatePicker Colors */
:deep(.dp__theme_light) {
  --dp-primary-color: #000000;
}
:deep(.dp__theme_dark) {
  --dp-primary-color: #ffffff;
  --dp-primary-text-color: #000000;
}
:deep(.dp__menu) {
  @apply rounded-[2rem] border-gray-100 shadow-2xl dark:border-gray-800;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
}

.group:hover {
  transform: translateY(-4px);
}
</style>