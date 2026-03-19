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

    <!-- Controls: Navigation + Filter + Summary -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
      <!-- Navigation -->
      <div class="flex flex-wrap items-center gap-4">
        <button 
          @click="goToToday" 
          class="rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-black dark:bg-white dark:text-black"
          :disabled="isCurrentWeek"
        >
          Hôm nay
        </button>

        <button 
          @click="prevWeek" 
          class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ← Tuần trước
        </button>

        <div class="text-lg font-black tracking-tight min-w-[180px] text-center">
          {{ formatDate(currentWeekStart) }} — {{ formatDate(currentWeekEnd) }}
        </div>

        <button 
          @click="nextWeek" 
          class="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Tuần sau →
        </button>
      </div>

      <!-- Filter đơn giản cho ca cá nhân -->
      <div class="flex flex-wrap items-end gap-4">
        <div class="space-y-1 min-w-[180px]">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Tìm ghi chú ca</label>
          <input 
            v-model="filters.note"
            type="text"
            placeholder="OT, Phụ bếp, Ca sáng..."
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-4 py-2.5 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div class="space-y-1 min-w-[140px]">
          <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Loại ca</label>
          <select 
            v-model="filters.type"
            class="w-full rounded-2xl border-gray-100 bg-gray-50 px-4 py-2.5 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="all">Tất cả</option>
            <option value="Ca sáng">Ca sáng</option>
            <option value="Ca chiều">Ca chiều</option>
            <option value="Ca tối">Ca tối</option>
            <option value="OT">OT</option>
            <option value="Nghỉ">Nghỉ</option>
          </select>
        </div>

        <button 
          @click="resetFilters"
          class="rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300"
        >
          Xóa lọc
        </button>
      </div>

      <!-- Summary -->
      <div class="flex items-center gap-6 whitespace-nowrap">
        <div class="rounded-2xl bg-gray-100 px-5 py-3 dark:bg-gray-800">
          Tổng ca: <strong class="text-lg">{{ filteredMyShifts.length }}</strong>
        </div>
        <div class="rounded-2xl bg-gray-100 px-5 py-3 dark:bg-gray-800">
          Tổng giờ: <strong class="text-lg">{{ totalFilteredHours }}h</strong>
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

        <!-- Staff name row (chỉ 1 dòng) -->
        <div class="sticky left-0 z-10 bg-white p-4 font-bold border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          {{ currentUserName }}
          <span class="block text-xs font-normal text-gray-500 dark:text-gray-400">{{ currentUserPosition }}</span>
        </div>

        <!-- 7 days -->
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="relative min-h-[200px] bg-white p-2 dark:bg-gray-900 transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
        >
          <div
            v-for="shift in getFilteredShiftsForDay(day)"
            :key="shift.id"
            class="absolute left-1 right-1 rounded-xl p-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
            :style="{
              top: `${timeToPixels(shift.start)}px`,
              height: `${timeToPixels(shift.end) - timeToPixels(shift.start)}px`,
              backgroundColor: shift.color || '#3b82f6',
              opacity: 0.92
            }"
            :title="shift.notes ? `Ghi chú: ${shift.notes}` : ''"
          >
            <div class="font-bold truncate">{{ shift.notes || shift.type || 'Ca làm việc' }}</div>
            <div class="text-xs opacity-90 mt-0.5">
              {{ formatTime(shift.start) }} – {{ formatTime(shift.end) }}
            </div>
            <div v-if="shift.notes" class="text-xs italic opacity-80 mt-1 truncate">
              {{ shift.notes }}
            </div>
          </div>

          <!-- Placeholder khi không có ca -->
          <div 
            v-if="!getFilteredShiftsForDay(day).length"
            class="absolute inset-0 flex items-center justify-center text-sm text-gray-400 italic opacity-70"
          >
            Không có ca làm việc
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import { getShiftById } from '../../utils/shift_service_api'; // giả định API lấy ca theo staff_id

const ui = useUIStore();
const user = useUserStore();

const currentUserName = computed(() => user.profile?.full_name || user.profile?.username || 'Nhân viên');
const currentUserPosition = computed(() => user.profile?.position || 'Nhân viên');

// Bộ lọc đơn giản
const filters = reactive({
  note: '',
  type: 'all',
});

function resetFilters() {
  filters.note = '';
  filters.type = 'all';
}

// Dữ liệu ca làm của tôi
const myShifts = ref([]);

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
  todayStart.setHours(0, 0, 0, 0);
  return currentWeekStart.value <= todayStart && currentWeekEnd.value >= todayStart;
});

function goToToday() {
  currentWeekStart.value = new Date(today);
  currentWeekStart.value.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  loadMyShifts();
}

function prevWeek() {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7);
  currentWeekStart.value = new Date(currentWeekStart.value);
  loadMyShifts();
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

// Lọc ca theo bộ lọc
const filteredMyShifts = computed(() => {
  let result = myShifts.value;

  if (filters.note.trim()) {
    const term = filters.note.toLowerCase().trim();
    result = result.filter(s => 
      (s.notes || '').toLowerCase().includes(term) ||
      (s.type || '').toLowerCase().includes(term)
    );
  }

  if (filters.type !== 'all') {
    result = result.filter(s => (s.type || 'Ca làm việc') === filters.type);
  }

  return result;
});

function getFilteredShiftsForDay(day) {
  const dateStr = day.toISOString().split('T')[0];
  return filteredMyShifts.value.filter(s => s.date === dateStr);
}

// Format giờ (hỗ trợ cả '08:00' và '08:00:00')
function formatTime(timeStr) {
  if (!timeStr) return '--:--';
  const [h, m] = timeStr.split(':').slice(0, 2);
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

// Chuyển thời gian thành pixel
const DAY_START_HOUR = 6;
const PIXELS_PER_HOUR = 60;

function timeToPixels(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  const hoursFromStart = h - DAY_START_HOUR + (m || 0) / 60;
  return Math.max(0, hoursFromStart * PIXELS_PER_HOUR);
}

// Tổng giờ (dựa trên ca đã lọc)
const totalFilteredHours = computed(() => {
  return filteredMyShifts.value.reduce((sum, shift) => {
    if (!shift.start || !shift.end) return sum;
    // Vì start/end giờ là string 'HH:mm:ss' → chuyển tạm thành Date cùng ngày
    const datePart = shift.date;
    const startDate = new Date(`${datePart}T${shift.start}`);
    const endDate   = new Date(`${datePart}T${shift.end}`);
    const diff = (endDate - startDate) / (1000 * 60 * 60);
    return sum + (isNaN(diff) ? 0 : diff);
  }, 0).toFixed(1);
});

// Tải ca làm việc của nhân viên hiện tại
async function loadMyShifts() {
  try {
    const staffId = user.profile?.id || user.profile?.user_id;
    if (!staffId) {
      ui.pushToast({ type: 'error', message: 'Không tìm thấy ID nhân viên' });
      return;
    }

    const res = await getShiftById(staffId, user.token);
    if (!res?.data?.success) {
      throw new Error(res.data?.message || 'Lỗi tải lịch');
    }

    const raw = res.data.data || [];

    myShifts.value = raw.map(shift => ({
      id: shift.id,
      date: new Date(shift.shift_date).toISOString().split('T')[0],
      start: shift.start_time || '00:00:00',
      end: shift.end_time || '00:00:00',
      type: shift.shift_type || null,
      notes: shift.notes || '',
      color: shift.color || '#3b82f6',
    }));

    // Không cần filter theo tuần ở client nữa nếu backend đã hỗ trợ
    // Nhưng để an toàn, ta có thể giữ filter nhẹ
    const startStr = currentWeekStart.value.toISOString().split('T')[0];
    const endStr   = currentWeekEnd.value.toISOString().split('T')[0];

    myShifts.value = myShifts.value.filter(s => s.date >= startStr && s.date <= endStr);

  } catch (err) {
    console.error('Load my shifts error:', err);
    ui.pushToast({ type: 'error', message: 'Không tải được lịch làm việc' });
    myShifts.value = [];
  }
}

onMounted(() => {
  loadMyShifts();
});
</script>

<style scoped>
/* Hover effect cho ca */
div[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 50;
  pointer-events: none;
}
</style>