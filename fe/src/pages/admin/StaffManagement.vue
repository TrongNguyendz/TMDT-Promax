<template>
  <div class="space-y-10 pb-10">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Quản lý Nhân viên
        </h1>
        <p class="mt-1 text-sm text-gray-500">Cấu hình và sắp xếp nhân viên trong hệ thống</p>
      </div>
      <button
        v-if="activeTab === 'management'"
        @click="openCreateModal"
        class="group flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        THÊM NHÂN VIÊN
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-100 dark:border-gray-800">
      <button
        @click="activeTab = 'management'"
        :class="{ 'border-b-2 border-black text-black dark:border-white dark:text-white': activeTab === 'management', 'text-gray-500': activeTab !== 'management' }"
        class="flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors"
      >
        Quản lý Nhân viên
      </button>
      <button
        @click="activeTab = 'scheduling'"
        :class="{ 'border-b-2 border-black text-black dark:border-white dark:text-white': activeTab === 'scheduling', 'text-gray-500': activeTab !== 'scheduling' }"
        class="flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors"
      >
        Sắp xếp Ca Làm
      </button>
    </div>

    <!-- Management Tab -->
    <div v-if="activeTab === 'management'" class="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="staff in staffData"
        :key="staff.id"
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-2 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none"
      >
        <div class="relative aspect-[1/1] overflow-hidden rounded-[1.8rem] bg-gray-100 dark:bg-gray-950">
          <img
            :src="staff.avatar || `https://via.placeholder.com/300?text=${staff.name.charAt(0)}`"
            :alt="staff.name"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/10">
            <span>{{ staff.position }}</span>
          </div>
          <div class="absolute inset-0 flex items-center justify-center gap-4 bg-black/5 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
            <button
              @click="editStaff(staff)"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl transition-transform hover:scale-110 active:scale-95"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button
              @click="deleteStaff(staff)"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-xl transition-transform hover:scale-110 active:scale-95"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white truncate pr-4">
              {{ staff.name }}
            </h3>
            <span class="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-tighter italic">ID: {{ staff.id }}</span>
          </div>
          <p class="mt-2 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1 italic">
            {{ staff.email }} | {{ staff.phone }}
          </p>
        </div>
      </div>
    </div>

    <!-- Scheduling Tab - Timeline View -->
    <div v-if="activeTab === 'scheduling'" class="space-y-6">
      <!-- Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button @click="prevWeek" class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">← Tuần trước</button>
          <div class="text-lg font-black tracking-tight">
            {{ formatDate(currentWeekStart) }} — {{ formatDate(currentWeekEnd) }}
          </div>
          <button @click="nextWeek" class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Tuần sau →</button>
        </div>
        <button
          @click="openBulkAssignModal"
          class="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-black dark:bg-white dark:text-black"
        >
          Phân công hàng loạt
        </button>
      </div>

      <!-- Timeline Grid -->
      <div class="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-inner dark:border-gray-800 dark:bg-gray-950">
        <div class="min-w-[1400px] grid grid-cols-[220px_repeat(7,1fr)] gap-px bg-gray-200 dark:bg-gray-800">
          <!-- Header -->
          <div class="sticky left-0 top-0 z-20 bg-gray-100 p-4 font-black text-sm uppercase tracking-wider text-gray-900 dark:bg-gray-950 dark:text-white border-r border-gray-300 dark:border-gray-700">
            Nhân viên
          </div>
          <div
            v-for="day in weekDays"
            :key="day.toISOString()"
            class="sticky top-0 z-10 bg-gray-100 p-3 text-center font-bold dark:bg-gray-950"
            :class="isToday(day) ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' : ''"
          >
            {{ day.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' }) }}
          </div>

          <!-- Rows -->
          <template v-for="staff in staffData" :key="staff.id">
            <!-- Staff name - sticky -->
            <div class="sticky left-0 z-10 bg-white p-4 font-bold border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
              {{ staff.name }}
              <span class="block text-xs font-normal text-gray-500 dark:text-gray-400">{{ staff.position }}</span>
            </div>

            <!-- 7 days -->
            <div
              v-for="day in weekDays"
              :key="day.toISOString()"
              class="relative min-h-[160px] bg-white p-2 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60 cursor-pointer transition"
              @click="openShiftModal(staff, day)"
            >
              <div
                v-for="shift in getShifts(staff.id, day)"
                :key="shift.id"
                class="absolute left-1 right-1 rounded-xl p-2 text-xs font-medium text-white shadow-lg"
                :style="{
                  top: `${timeToPixels(shift.start)}px`,
                  height: `${timeToPixels(shift.end) - timeToPixels(shift.start)}px`,
                  backgroundColor: shift.color || '#3b82f6',
                  opacity: 0.9
                }"
              >
                <div class="font-bold truncate">{{ shift.type || 'Ca làm việc' }}</div>
                <div>{{ formatTime(shift.start) }} – {{ formatTime(shift.end) }}</div>
                <button
                  @click.stop="removeShift(shift)"
                  class="absolute top-1 right-1 text-white/80 hover:text-red-300 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
          Tổng ca: <strong class="text-lg">{{ totalShifts }}</strong>
        </div>
        <div class="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
          Tổng giờ: <strong class="text-lg">{{ totalHours }}h</strong>
        </div>
      </div>
    </div>

    <!-- Create/Edit Staff Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-gray-950 border border-white/10">
        <div class="bg-gray-900 px-8 py-6 text-white dark:bg-black">
          <h2 class="text-xl font-black uppercase tracking-widest italic">
            {{ editingId ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên mới' }}
          </h2>
        </div>

        <form @submit.prevent="saveStaff" class="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <!-- Name & Position -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Họ và Tên *</label>
              <input v-model="formData.name" type="text" class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white" required />
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Chức vụ *</label>
              <select v-model="formData.position" class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" required>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <!-- Email & Phone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Email *</label>
              <input v-model="formData.email" type="email" class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white" required />
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Số Điện Thoại</label>
              <input v-model="formData.phone" type="tel" placeholder="+84..." class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>

          <!-- Avatar Upload -->
          <div class="rounded-[2rem] border border-gray-100 bg-gray-50/50 p-8 dark:border-gray-800 dark:bg-gray-900/50">
            <div class="flex items-center justify-between mb-8 border-b border-gray-100 pb-4 dark:border-gray-800">
              <label class="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white italic">
                Ảnh Đại Diện
              </label>
            </div>
            <div class="grid gap-10 md:grid-cols-2">
              <div class="space-y-3">
                <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Tải lên ảnh
                </label>
                <div class="relative group aspect-square w-full overflow-hidden rounded-[1.5rem] bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 transition-all hover:border-black dark:hover:border-white flex items-center justify-center shadow-sm">
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleAvatarUpload" 
                    class="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div class="text-center transition-transform group-hover:scale-110">
                    <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:text-black dark:group-hover:text-white">
                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-black dark:group-hover:text-white">TẢI TỪ THIẾT BỊ</p>
                  </div>
                </div>
              </div>
              
              <div class="space-y-3">
                <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Xem trước
                </label>
                <div class="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-gray-200 dark:bg-black shadow-inner border border-gray-100 dark:border-gray-800">
                  <img 
                    v-if="formData.avatar" 
                    :src="formData.avatar" 
                    class="h-full w-full object-cover animate-in fade-in zoom-in-95 duration-500" 
                  />
                  <div v-else class="flex h-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50">
                    <div class="h-8 w-8 text-gray-300 mb-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Waiting for avatar...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-6">
            <button type="button" @click="closeModal" class="flex-1 rounded-2xl bg-gray-100 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-200 dark:bg-gray-800">HỦY BỎ</button>
            <button type="submit" class="flex-1 rounded-2xl bg-gray-900 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-black dark:bg-white dark:text-black shadow-xl">XÁC NHẬN LƯU</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-[2.5rem] bg-white p-10 text-center shadow-2xl dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30">
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0a9 9 0 11-9-9m9 9a9 9 0 109-9" /></svg>
        </div>
        <h3 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Xóa Nhân viên?</h3>
        <p class="mt-3 text-sm font-medium text-gray-500 leading-relaxed italic">Hành động này sẽ xóa vĩnh viễn <span class="text-gray-900 dark:text-white font-black underline">"{{ staffToDelete?.name }}"</span> khỏi hệ thống.</p>
        <div class="mt-10 flex gap-3">
          <button @click="showDeleteModal = false" class="flex-1 rounded-xl bg-gray-50 py-4 text-xs font-black uppercase tracking-widest dark:bg-gray-900 dark:text-gray-400">QUAY LẠI</button>
          <button @click="confirmDelete" class="flex-1 rounded-xl bg-red-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 dark:shadow-none transition-transform active:scale-95">XÓA NGAY</button>
        </div>
      </div>
    </div>

    <!-- New/Edit Shift Modal -->
    <div v-if="showShiftModal" class="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeShiftModal"></div>
      <div class="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
        <h2 class="mb-6 text-2xl font-black uppercase tracking-wide">
          {{ editingShift ? 'Sửa ca làm' : 'Thêm ca làm mới' }}
        </h2>

        <form @submit.prevent="saveShift" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nhân viên</label>
            <select v-model="shiftForm.staffId" class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-800" required>
              <option v-for="s in staffData" :key="s.id" :value="s.id">{{ s.name }} ({{ s.position }})</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ngày</label>
            <input v-model="shiftForm.date" type="date" class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-800" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bắt đầu</label>
              <input v-model="shiftForm.startTime" type="time" step="900" class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-800" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kết thúc</label>
              <input v-model="shiftForm.endTime" type="time" step="900" class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-800" required />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Loại ca / Ghi chú</label>
            <input v-model="shiftForm.type" placeholder="Ca sáng, Phụ bếp, OT, ..." class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-800" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Màu hiển thị</label>
            <input v-model="shiftForm.color" type="color" class="h-10 w-full rounded-xl" />
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" class="flex-1 rounded-2xl bg-gray-900 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-black dark:bg-white dark:text-black">
              LƯU CA LÀM
            </button>
            <button type="button" @click="closeShiftModal" class="flex-1 rounded-2xl bg-gray-200 py-4 text-sm font-black uppercase tracking-widest text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              HỦY
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';

const ui = useUIStore();
const user = useUserStore();

const activeTab = ref('management');
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingId = ref(null);
const staffToDelete = ref(null);

const formData = reactive({
  name: '',
  position: '',
  email: '',
  phone: '',
  avatar: ''
});

const fileToUpload = ref(null);

// Staff Data (sample)
const staffData = ref([
  { id: 1, name: 'Nguyễn Văn A', position: 'Manager', email: 'vana@example.com', phone: '0123456789', avatar: '' },
  { id: 2, name: 'Trần Thị B', position: 'Staff', email: 'thib@example.com', phone: '0987654321', avatar: '' },
  { id: 3, name: 'Lê Văn C', position: 'Intern', email: 'vanc@example.com', phone: '0112233445', avatar: '' },
]);

// Shifts Data
const shifts = ref([]); // { id, staffId, date, start, end, type, color }

// Week Navigation
const today = new Date();
const currentWeekStart = ref(new Date(today));
currentWeekStart.value.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday

const weekDays = computed(() => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart.value);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
});

const currentWeekEnd = computed(() => {
  const end = new Date(currentWeekStart.value);
  end.setDate(end.getDate() + 6);
  return end;
});

function prevWeek() {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7);
  currentWeekStart.value = new Date(currentWeekStart.value);
}

function nextWeek() {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7);
  currentWeekStart.value = new Date(currentWeekStart.value);
}

function formatDate(date) {
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
}

function isToday(date) {
  return date.toDateString() === today.toDateString();
}

// Shift Modal
const showShiftModal = ref(false);
const editingShift = ref(null);
const shiftForm = ref({
  id: null,
  staffId: null,
  date: '',
  startTime: '08:00',
  endTime: '17:00',
  type: '',
  color: '#3b82f6'
});

function openShiftModal(staff, date) {
  shiftForm.value = {
    id: null,
    staffId: staff.id,
    date: date.toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    type: '',
    color: '#3b82f6'
  };
  editingShift.value = null;
  showShiftModal.value = true;
}

function saveShift() {
  if (!shiftForm.value.staffId || !shiftForm.value.date || !shiftForm.value.startTime || !shiftForm.value.endTime) {
    ui.pushToast({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin ca làm' });
    return;
  }

  const start = `${shiftForm.value.date}T${shiftForm.value.startTime}:00`;
  const end = `${shiftForm.value.date}T${shiftForm.value.endTime}:00`;

  if (editingShift.value) {
    const idx = shifts.value.findIndex(s => s.id === editingShift.value.id);
    if (idx !== -1) {
      shifts.value[idx] = {
        ...shifts.value[idx],
        staffId: shiftForm.value.staffId,
        date: shiftForm.value.date,
        start,
        end,
        type: shiftForm.value.type,
        color: shiftForm.value.color
      };
    }
  } else {
    const newId = shifts.value.length ? Math.max(...shifts.value.map(s => s.id)) + 1 : 1;
    shifts.value.push({
      id: newId,
      staffId: shiftForm.value.staffId,
      date: shiftForm.value.date,
      start,
      end,
      type: shiftForm.value.type,
      color: shiftForm.value.color
    });
  }
  console.log('Saved shift:', shiftForm.value);
  ui.pushToast({ type: 'success', message: 'Đã lưu ca làm việc' });
  closeShiftModal();
}

function closeShiftModal() {
  showShiftModal.value = false;
  editingShift.value = null;
}

function getShifts(staffId, date) {
  const dateStr = date.toISOString().split('T')[0];
  return shifts.value.filter(s => s.staffId === staffId && s.date === dateStr);
}

function removeShift(shift) {
  if (confirm(`Xóa ca ${shift.type || ''} của ${getStaffName(shift.staffId)} ?`)) {
    shifts.value = shifts.value.filter(s => s.id !== shift.id);
    ui.pushToast({ type: 'success', message: 'Đã xóa ca làm việc' });
  }
}

function getStaffName(id) {
  const staff = staffData.value.find(s => s.id === id);
  return staff ? staff.name : 'Unknown';
}

// Timeline Height Calculation
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 23;
const PIXELS_PER_HOUR = 60;

function timeToPixels(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const hoursFromStart = h - DAY_START_HOUR + m / 60;
  return Math.max(0, hoursFromStart * PIXELS_PER_HOUR);
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Stats
const totalShifts = computed(() => shifts.value.length);

const totalHours = computed(() => {
  return shifts.value.reduce((sum, shift) => {
    const start = new Date(shift.start);
    const end = new Date(shift.end);
    const diff = (end - start) / (1000 * 60 * 60);
    return sum + diff;
  }, 0).toFixed(1);
});

// Staff CRUD
function openCreateModal() {
  editingId.value = null;
  Object.assign(formData, { name: '', position: '', email: '', phone: '', avatar: '' });
  fileToUpload.value = null;
  showModal.value = true;
}

function editStaff(staff) {
  editingId.value = staff.id;
  Object.assign(formData, staff);
  fileToUpload.value = null;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  fileToUpload.value = null;
}

function handleAvatarUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    ui.pushToast({ type: 'error', message: 'Ảnh tối đa 5MB' });
    return;
  }
  fileToUpload.value = file;
  const reader = new FileReader();
  reader.onload = ev => {
    formData.avatar = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function saveStaff() {
  if (!formData.name || !formData.position || !formData.email) {
    ui.pushToast({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    return;
  }

  const dataToSend = {
    name: formData.name,
    position: formData.position,
    email: formData.email,
    phone: formData.phone
  };

  if (fileToUpload.value) {
    dataToSend.avatar = fileToUpload.value; // Nếu có API thật thì gửi file
  }

  try {
    if (editingId.value) {
      // Update existing
      const index = staffData.value.findIndex(s => s.id === editingId.value);
      if (index !== -1) {
        staffData.value[index] = { 
          ...staffData.value[index], 
          ...dataToSend, 
          avatar: formData.avatar 
        };
      }
      ui.pushToast({ type: 'success', message: 'Cập nhật nhân viên thành công' });
    } else {
      // Create new
      const newId = staffData.value.length ? Math.max(...staffData.value.map(s => s.id)) + 1 : 1;
      staffData.value.push({ 
        id: newId, 
        ...dataToSend, 
        avatar: formData.avatar 
      });
      ui.pushToast({ type: 'success', message: 'Thêm nhân viên thành công' });
    }

    fileToUpload.value = null;
    closeModal();
  } catch (err) {
    console.error('Lỗi lưu nhân viên:', err);
    ui.pushToast({ type: 'error', message: 'Lưu nhân viên thất bại' });
  }
}

function deleteStaff(staff) {
  staffToDelete.value = staff;
  showDeleteModal.value = true;
}

function confirmDelete() {
  if (staffToDelete.value) {
    staffData.value = staffData.value.filter(s => s.id !== staffToDelete.value.id);
    // Xóa luôn các ca làm của nhân viên này
    shifts.value = shifts.value.filter(s => s.staffId !== staffToDelete.value.id);
    ui.pushToast({ type: 'success', message: 'Đã xóa nhân viên' });
  }
  showDeleteModal.value = false;
  staffToDelete.value = null;
}

function openBulkAssignModal() {
  ui.pushToast({ type: 'info', message: 'Chức năng phân công hàng loạt đang phát triển' });
}

onMounted(() => {
  // Nếu sau này có API thì load dữ liệu ở đây
});
</script>

<style scoped>
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
</style>