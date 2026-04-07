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

    <!-- FILTER SECTION -->
    <div class="mt-6 mb-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        
        <!-- Tìm kiếm chung -->
        <div class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Tìm kiếm</label>
          <input 
            v-model="filters.search"
            type="text" 
            placeholder="Tên, email, sđt, username..." 
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <!-- Chức vụ -->
        <div class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Chức vụ</label>
          <select 
            v-model="filters.position"
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option v-for="opt in positionOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Trạng thái -->
        <div class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Trạng thái</label>
          <select 
            v-model="filters.status"
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>
        </div>

        <!-- Chỉ hiển thị ở tab Scheduling -->
        <div v-if="activeTab === 'scheduling'" class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Có ca trong tuần?</label>
          <select 
            v-model="filters.hasShift"
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="all">Tất cả</option>
            <option value="yes">Có ca</option>
            <option value="no">Không có ca</option>
          </select>
        </div>

        <!-- Ghi chú ca -->
        <div v-if="activeTab === 'scheduling'" class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Ghi chú ca</label>
          <input 
            v-model="filters.shiftNote"
            type="text" 
            placeholder="Ca sáng, OT, Phụ bếp..." 
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <!-- Tổng giờ tối thiểu (scheduling) -->
        <div v-if="activeTab === 'scheduling'" class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng giờ ≥</label>
          <input 
            v-model.number="filters.minHours"
            type="number" 
            min="0" 
            placeholder="VD: 40" 
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      <!-- Nút reset filter -->
      <div class="mt-5 flex justify-end">
        <button 
          @click="resetFilters"
          class="rounded-xl bg-gray-200 px-6 py-3 text-sm font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          XÓA BỘ LỌC
        </button>
      </div>
    </div>

    <!-- Management Tab -->
    <div v-if="activeTab === 'management'" class="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="staff in filteredStaff"
        :key="staff.id"
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-2 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none"
      >
        <div class="relative aspect-[1/1] overflow-hidden rounded-[1.8rem] bg-gray-100 dark:bg-gray-950">
          <img
            :src="getAvatar(staff.avatar)"
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
              @click="deleteStaff1(staff)"
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
          <template v-for="staff in filteredStaffWithShifts" :key="staff.id">
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
              @click="openShiftModal(staff, day, getShifts(staff.id, day).length ? getShifts(staff.id, day)[0] : null)"
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
                <div class="font-bold truncate">{{ shift.notes || 'Ca làm việc' }}</div>
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
          <!-- Name & Username -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Họ và Tên *</label>
              <input v-model="formData.full_name" type="text" class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white" required />
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Tên Đăng Nhập *</label>
              <input v-model="formData.username" type="text" class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white" required />
            </div>
          </div>

          <!-- Email & Phone
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Chức vụ *</label>
              <select v-model="formData.position" class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" required>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div> -->

          <!-- Email & Phone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Email *</label>
              <input v-model="formData.email" type="email" placeholder="example@gmail.com" class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white" required />
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Số Điện Thoại</label>
              <input v-model="formData.phone" type="tel" placeholder="+84..." class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" />
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
            <input v-model="shiftForm.note" placeholder="Ca sáng, Phụ bếp, OT, ..." class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-800" />
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
import {
  getListStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  uploadStaffAvatar,
  hardDeleteStaff
} from "../../utils/staff-service_api";

import {
  getListShifts,
  createShift,
  updateShift,
  hardDeleteShift
} from "../../utils/shift_service_api";

import defaultAvatar from "@/assets/default_user.jpg"; 

const ui = useUIStore();
const user = useUserStore();
const token = computed(() => user.token);

const activeTab = ref('management');
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingId = ref(null);
const staffToDelete = ref(null);

const formData = reactive({
  user_id: '',
  full_name: '',
  email: '',
  phone: '',
  avatar_url: '',
  username: '',
});

const fileToUpload = ref(null);

const API_BASE = "http://localhost:3007";

const getAvatar = (avatar) => {
  if (!avatar) return defaultAvatar;
  if (avatar.startsWith("http")) return avatar;
  return API_BASE + avatar;
};

// Staff Data
const staffData = ref([]);

const loadStaff = async () => {
  try {
    const res = await getListStaff(token.value);
    console.log("Loaded staff data:", res.data);
    const staffs = res.data.data || [];

    staffData.value = staffs.map(s => ({
      id: s.id,
      user_id: s.user_id,
      name: s.full_name,
      email: s.email,
      phone: s.phone,
      status: s.status || 'active',
      position: s.position || 'Staff',      // giả sử có field position
      avatar: s.avatar_url
    }));
  } catch (err) {
    console.error("Load staff failed:", err);
  }
};

// Shifts Data
const shifts = ref([]);

async function loadShifts() {
  try {
    const res = await getListShifts(token.value);
    if (!res.data.success) return;

    shifts.value = res.data.data.map((s) => {
      const date = new Date(s.shift_date).toISOString().split("T")[0];
      return {
        id: s.id,
        staffId: s.staff_id,
        date: date,
        start: `${date}T${s.start_time}`,
        end: `${date}T${s.end_time}`,
        notes: s.notes,
        color: s.color || '#3b82f6'
      };
    });
  } catch (err) {
    console.error("Load shifts failed:", err);
  }
}

// Filters
const filters = reactive({
  search: '',
  position: 'all',
  status: 'all',
  hasShift: 'all',
  shiftNote: '',
  minHours: null,
});

const positionOptions = ref([
  { value: 'all', label: 'Tất cả chức vụ' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Staff', label: 'Nhân viên' },
  { value: 'Intern', label: 'Thực tập sinh' },
]);

// Filtered Staff for Management Tab
const filteredStaff = computed(() => {
  let result = [...staffData.value];

  // Search
  if (filters.search.trim()) {
    const term = filters.search.toLowerCase().trim();
    result = result.filter(s =>
      (s.name || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term) ||
      (s.phone || '').toLowerCase().includes(term) ||
      (s.username || '').toLowerCase().includes(term)
    );
  }

  // Position
  if (filters.position !== 'all') {
    result = result.filter(s => (s.position || 'Staff') === filters.position);
  }

  // Status
  if (filters.status !== 'all') {
    result = result.filter(s => (s.status || 'active') === filters.status);
  }

  return result;
});

// Filtered Staff for Scheduling Tab (with shift conditions)
const filteredStaffWithShifts = computed(() => {
  let staffList = filteredStaff.value;

  // Has shift this week?
  if (filters.hasShift !== 'all') {
    const wantHasShift = filters.hasShift === 'yes';
    staffList = staffList.filter(staff => {
      const hasAny = weekDays.value.some(day => getShifts(staff.id, day).length > 0);
      return wantHasShift ? hasAny : !hasAny;
    });
  }

  // Shift note contains
  if (filters.shiftNote.trim()) {
    const noteTerm = filters.shiftNote.toLowerCase().trim();
    staffList = staffList.filter(staff =>
      weekDays.value.some(day =>
        getShifts(staff.id, day).some(shift =>
          (shift.notes || '').toLowerCase().includes(noteTerm)
        )
      )
    );
  }

  // Min hours this week
  if (filters.minHours !== null && filters.minHours > 0) {
    staffList = staffList.filter(staff => {
      let totalHours = 0;
      weekDays.value.forEach(day => {
        getShifts(staff.id, day).forEach(shift => {
          const start = new Date(shift.start);
          const end = new Date(shift.end);
          totalHours += (end - start) / (1000 * 60 * 60);
        });
      });
      return totalHours >= filters.minHours;
    });
  }

  return staffList;
});

function resetFilters() {
  filters.search = '';
  filters.position = 'all';
  filters.status = 'all';
  filters.hasShift = 'all';
  filters.shiftNote = '';
  filters.minHours = null;
}


// Week Navigation
const today = new Date();
const currentWeekStart = ref(new Date(today));
currentWeekStart.value.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

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
  note: '',
  color: '#3b82f6'
});

function openShiftModal(staff, date, shiftToEdit = null) {
  if (shiftToEdit) {
    editingShift.value = shiftToEdit;
    shiftForm.value = {
      id: shiftToEdit.id,
      staffId: shiftToEdit.staffId,
      date: shiftToEdit.date,
      startTime: shiftToEdit.start.split('T')[1]?.slice(0,5) || '08:00',
      endTime: shiftToEdit.end.split('T')[1]?.slice(0,5) || '17:00',
      note: shiftToEdit.notes || '',
      color: shiftToEdit.color || '#3b82f6'
    };
  } else {
    editingShift.value = null;
    shiftForm.value = {
      id: null,
      staffId: staff.id,
      date: date.toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      note: '',
      color: '#3b82f6'
    };
  }
  showShiftModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
  // Optional: reset form nếu cần
  Object.assign(formData, {
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    username: '',
    avatar_url: ''
  });
  fileToUpload.value = null;
}

async function saveShift() {
  if (!shiftForm.value.staffId || !shiftForm.value.date || 
      !shiftForm.value.startTime || !shiftForm.value.endTime) {
    ui.pushToast({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin ca làm' });
    return;
  }

  const payload = {
    staff_id: Number(shiftForm.value.staffId),
    shift_date: shiftForm.value.date,
    start_time: shiftForm.value.startTime + ':00',
    end_time: shiftForm.value.endTime + ':00',
    notes: shiftForm.value.note.trim() || null,
    color: shiftForm.value.color || null,
  };

  try {
    let res;
    if (editingShift.value) {
      res = await updateShift(editingShift.value.id, payload, token.value);
      ui.pushToast({ type: 'success', message: 'Đã cập nhật ca làm việc' });
    } else {
      res = await createShift(payload, token.value);
      ui.pushToast({ type: 'success', message: 'Đã tạo ca làm việc mới' });
    }
    await loadShifts();
  } catch (err) {
    console.error("Lỗi lưu ca làm:", err);
    ui.pushToast({ 
      type: 'error', 
      message: err.response?.data?.message || 'Không thể lưu ca làm việc' 
    });
  }

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

async function removeShift(shift) {
  if (!confirm(`Xác nhận xóa ca của ${getStaffName(shift.staffId)} ?`)) return;

  try {
    await hardDeleteShift(shift.id, token.value);
    ui.pushToast({ type: 'success', message: 'Đã xóa ca làm việc' });
    await loadShifts();
  } catch (err) {
    console.error("Lỗi xóa ca:", err);
    ui.pushToast({ type: 'error', message: 'Không thể xóa ca làm việc' });
  }
}

function getStaffName(id) {
  const staff = staffData.value.find(s => s.id === id);
  return staff ? staff.name : 'Unknown';
}

// Timeline helpers
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

// Stats (dựa trên tất cả shifts, không lọc)
const totalShifts = computed(() => shifts.value.length);

const totalHours = computed(() => {
  return shifts.value.reduce((sum, shift) => {
    const start = new Date(shift.start);
    const end = new Date(shift.end);
    return sum + (end - start) / (1000 * 60 * 60);
  }, 0).toFixed(1);
});

// Staff CRUD
function openCreateModal() {
  editingId.value = null;
  Object.assign(formData, { full_name: '', username: '', email: '', phone: '', avatar_url: '' });
  fileToUpload.value = null;
  showModal.value = true;
}

function editStaff(staff) {
  editingId.value = staff.id;
  formData.user_id = staff.user_id;
  formData.full_name = staff.name;
  formData.email = staff.email;
  formData.phone = staff.phone;
  formData.username = staff.username || '';
  formData.avatar_url = staff.avatar;
  showModal.value = true;
}

async function saveStaff() {
  try {
    const payload = {
      user_id: formData.user_id || undefined,
      full_name: formData.full_name?.trim(),
      email: formData.email?.trim(),
      phone: formData.phone?.trim() || null,
      username: formData.username?.trim()
    };

    let res;
    if (editingId.value) {
      res = await updateStaff(editingId.value, payload, token.value);
      ui.pushToast({ type: 'success', message: 'Cập nhật nhân viên thành công' });
    } else {
      res = await createStaff(payload, token.value);
      ui.pushToast({ type: 'success', message: 'Thêm nhân viên thành công' });

      // Upload avatar nếu có (sau khi tạo thành công)
      if (fileToUpload.value && res?.data?.data?.id) {
        await uploadStaffAvatar(res.data.data.id, fileToUpload.value, token.value);
      }
    }

    await loadStaff();
    showModal.value = false;          // ← quan trọng: đóng modal
    editingId.value = null;
  } catch (err) {
    console.error("Lỗi khi lưu nhân viên:", err);
    const msg = err.response?.data?.message || 'Không thể lưu nhân viên. Vui lòng kiểm tra lại.';
    ui.pushToast({ type: 'error', message: msg });
  }
}

function deleteStaff1(staff) {
  staffToDelete.value = staff;
  showDeleteModal.value = true;
}

  
const confirmDelete = async () => {
  if (staffToDelete.value) {
    console.log("thông tin nhân viên cần xóa:", staffToDelete.value);
    try {
      const res = await hardDeleteStaff(staffToDelete.value.id, user.token);
      if (res.data.success) {
        ui.pushToast({ type: 'success', message: 'Xóa nhân viên thành công' });
        await loadStaff();
      } else {
        ui.pushToast({ type: 'error', message: 'Xóa nhân viên thất bại' });
      }
    } catch (err) {
      console.error('Lỗi xóa nhân viên:', err);
      ui.pushToast({ type: 'error', message: 'Xóa nhân viên thất bại, vui lòng thử lại' });
    } finally {
      showDeleteModal.value = false;
      staffToDelete.value = null;
    }
  }
  else {
    ui.pushToast({ type: 'error', message: 'Không tìm thấy nhân viên để xóa' });
    showDeleteModal.value = false;
    staffToDelete.value = null;
  }
};

function openBulkAssignModal() {
  ui.pushToast({ type: 'info', message: 'Chức năng phân công hàng loạt đang phát triển' });
}

onMounted(() => {
  loadStaff();
  loadShifts();
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