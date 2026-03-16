<!-- StaffSchedule.vue -->
<template>
  <div class="space-y-10 pb-10">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Lịch làm việc của tôi
        </h1>
        <p class="mt-1 text-sm text-gray-500">Xem ca làm việc được phân công trong tuần</p>
      </div>
    </div>

    <!-- Week Navigation & Summary -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- Có thể bỏ nút prev/next nếu chỉ muốn hiển thị tuần hiện tại -->
        <button 
          @click="prevWeek" 
          class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          :disabled="isCurrentWeek"
        >
          ← Tuần trước
        </button>
        <div class="text-lg font-black tracking-tight">
          {{ formatDate(currentWeekStart) }} — {{ formatDate(currentWeekEnd) }}
        </div>
        <button 
          @click="nextWeek" 
          class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Tuần sau →
        </button>
      </div>

      <div class="flex items-center gap-6">
        <div class="rounded-2xl bg-gray-100 px-5 py-3 dark:bg-gray-800">
          Tổng ca: <strong class="text-lg">{{ myShifts.length }}</strong>
        </div>
        <div class="rounded-2xl bg-gray-100 px-5 py-3 dark:bg-gray-800">
          Tổng giờ: <strong class="text-lg">{{ totalMyHours }}h</strong>
        </div>
      </div>
    </div>

    <!-- Timeline Grid -->
    <div class="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-inner dark:border-gray-800 dark:bg-gray-950">
      <div class="min-w-[1000px] grid grid-cols-[220px_repeat(7,1fr)] gap-px bg-gray-200 dark:bg-gray-800">
        <!-- Header -->
        <div class="sticky left-0 top-0 z-20 bg-gray-100 p-4 font-black text-sm uppercase tracking-wider text-gray-900 dark:bg-gray-950 dark:text-white border-r border-gray-300 dark:border-gray-700">
          Ca của tôi
        </div>
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="sticky top-0 z-10 bg-gray-100 p-3 text-center font-bold dark:bg-gray-950"
          :class="isToday(day) ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' : ''"
        >
          {{ day.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' }) }}
        </div>

        <!-- Only one row - current staff -->
        <!-- Staff name - sticky (chỉ 1 dòng) -->
        <div class="sticky left-0 z-10 bg-white p-4 font-bold border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 h-full">
          {{ currentUserName }}
          <span class="block text-xs font-normal text-gray-500 dark:text-gray-400">{{ currentUserPosition }}</span>
        </div>

        <!-- 7 days for current staff -->
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="relative min-h-[180px] bg-white p-2 dark:bg-gray-900"
        >
          <div
            v-for="shift in getMyShiftsForDay(day)"
            :key="shift.id"
            class="absolute left-1 right-1 rounded-xl p-3 text-sm font-medium text-white shadow-lg"
            :style="{
              top: `${timeToPixels(shift.start)}px`,
              height: `${timeToPixels(shift.end) - timeToPixels(shift.start)}px`,
              backgroundColor: shift.color || '#3b82f6',
              opacity: 0.92
            }"
          >
            <div class="font-bold truncate">{{ shift.type || 'Ca làm việc' }}</div>
            <div class="text-xs opacity-90">
              {{ formatTime(shift.start) }} – {{ formatTime(shift.end) }}
            </div>
          </div>

          <!-- Placeholder khi không có ca -->
          <div 
            v-if="!getMyShiftsForDay(day).length"
            class="absolute inset-0 flex items-center justify-center text-xs text-gray-400 italic opacity-60"
          >
            Không có ca
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
// import { useShiftStore } from '../../stores/shift'; // giả định bạn có store quản lý shifts
import {  getShiftById } from '../../utils/shift_service_api'; // giả định bạn có API để lấy ca làm việc
const ui = useUIStore();
const user = useUserStore();
const shiftStore = ref(); // nếu chưa có thì có thể dùng ref tạm



// Thông tin nhân viên hiện tại (từ user store)

const currentUserName = computed(() => user.profile?.username || 'Nhân viên');
const currentUserPosition = computed(() => user.profile?.position || '');

// Dữ liệu ca làm (lấy từ store hoặc API)
const myShifts = ref([]); // chỉ chứa ca của nhân viên hiện tại

// Tuần hiện tại
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

const isCurrentWeek = computed(() => {
  const todayStart = new Date(today);
  todayStart.setHours(0,0,0,0);
  return currentWeekStart.value.getTime() <= todayStart.getTime() && 
         currentWeekEnd.value.getTime() >= todayStart.getTime();
});

function prevWeek() {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7);
  currentWeekStart.value = new Date(currentWeekStart.value);
  loadMyShifts(); // reload nếu cần
}

function nextWeek() {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7);
  currentWeekStart.value = new Date(currentWeekStart.value);
  loadMyShifts();
}

function formatDate(date) {
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
}

function isToday(date) {
  return date.toDateString() === today.toDateString();
}

// Lấy ca làm trong ngày của nhân viên hiện tại
function getMyShiftsForDay(day) {
  const dateStr = day.toISOString().split('T')[0];
  return myShifts.value.filter(s => s.date === dateStr);
}

// Format giờ
// function formatTime(isoString) {
//   const date = new Date(isoString);
//   return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
// }

function formatTime(timeStr) {
  // timeStr đã là "08:00" hoặc "08:00:00"
  const [h, m] = timeStr.split(':').slice(0, 2); // bỏ giây nếu có
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

// Chuyển giờ thành pixel
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 23;
const PIXELS_PER_HOUR = 60;

function timeToPixels(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const hoursFromStart = h - DAY_START_HOUR + m / 60;
  return Math.max(0, hoursFromStart * PIXELS_PER_HOUR);
}

// Tổng giờ làm trong tuần
const totalMyHours = computed(() => {
  return myShifts.value.reduce((sum, shift) => {
    const start = new Date(shift.start);
    const end = new Date(shift.end);
    const diff = (end - start) / (1000 * 60 * 60);
    return sum + diff;
  }, 0).toFixed(1);
});

// Tải dữ liệu ca làm của nhân viên hiện tại
// async function loadMyShifts() {
//   try {
//     // Nếu dùng Pinia store
//     // myShifts.value = await shiftStore.fetchMyShifts(currentWeekStart.value, currentWeekEnd.value);

//     // Hoặc gọi API trực tiếp
//     // const res = await api.get('/shifts/my', {
//     //   params: {
//     //     start: currentWeekStart.value.toISOString().split('T')[0],
//     //     end: currentWeekEnd.value.toISOString().split('T')[0]
//     //   }
//     // });
//     // myShifts.value = res.data;

//     // Dữ liệu mẫu tạm thời
//     myShifts.value = [
//       // { id: 1, date: '2025-03-10', start: '2025-03-10T08:00:00', end: '2025-03-10T17:00:00', type: 'Ca sáng', color: '#3b82f6' },
//       // ...
//     ];
//   } catch (err) {
//     ui.pushToast({ type: 'error', message: 'Không tải được lịch làm việc' });
//   }
// }

// Tải ca làm việc của nhân viên hiện tại trong khoảng tuần
async function loadMyShifts() {
  try {
    const startDate = currentWeekStart.value.toISOString().split('T')[0];
    const endDate   = currentWeekEnd.value.toISOString().split('T')[0];

    // Giả sử endpoint backend hỗ trợ filter theo staff_id + khoảng ngày
    // Nếu chưa có, bạn có thể dùng /shifts?staff_id=...&start_date=...&end_date=...
    // Hoặc nếu endpoint /shifts/:staffId trả tất cả → lọc client-side (tạm thời ok nếu dữ liệu ít)
    const staffId = user.profile?.id; // hoặc userStore.user.id
    console.log('Loading shifts for staff ID:', staffId, 'from', startDate, 'to', endDate);
    const res = await getShiftById(staffId,user.token); // hoặc endpoint phù hợp
    console.log('dữ liệu nhận được:', res);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Lỗi tải ca');
    }

    // Dữ liệu thô từ backend
    const rawShifts = res.data.data || [];

    // Chuyển đổi sang định dạng component mong đợi
    myShifts.value = rawShifts
      .filter(shift => {
        // Chỉ giữ ca trong tuần hiện tại (tùy chọn - nếu backend đã filter thì bỏ)
        const shiftDate = new Date(shift.shift_date);
        return shiftDate >= currentWeekStart.value && shiftDate <= currentWeekEnd.value;
      })
      .map(shift => ({
        id: shift.id,                    // 3000, 3001...
        date: new Date(shift.shift_date).toISOString().split('T')[0],  // '2026-03-12'
        start: `${shift.start_time}`,    // '08:00:00' hoặc '08:00'
        end: `${shift.end_time}`,
        type: shift.shift_type || 'Ca làm việc',  // fallback nếu null
        color: shift.color || '#3b82f6',
        // Nếu cần thêm: notes, status,...
      }));

    console.log('Loaded my shifts:', myShifts.value);
  } catch (err) {
    console.error('Load shifts error:', err);
    ui.pushToast({ type: 'error', message: 'Không tải được lịch làm việc' });
    myShifts.value = []; // reset nếu lỗi
  }
}

onMounted(() => {
  loadMyShifts();
});
</script>

<style scoped>
/* Có thể tái sử dụng style từ StaffManagement.vue nếu cần */
</style>