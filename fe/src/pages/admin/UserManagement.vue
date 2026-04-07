<template>
  <div class="space-y-8 pb-10">
    <!-- 1. Header Section -->
    <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Quản lý người dùng
        </h1>
        <p class="mt-1 text-sm text-gray-500">Quản trị danh sách và phân quyền truy cập hệ thống</p>
      </div>
      <div class="hidden sm:block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
        {{ users.length }} Tài khoản khả dụng
      </div>
    </div>

    <!-- 2. Search Bar -->
    <div class="relative max-w-lg">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input 
  v-model="filters.searchTerm" 
  type="text" 
  placeholder="Tìm kiếm người dùng..."
  class="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-11 pr-4 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white shadow-sm" 
/>
    </div>

    <!-- 3. Main Data Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white">
      </div>
      <p class="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Đang truy xuất dữ liệu...</p>
    </div>

    <div v-else
      class="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="overflow-x-auto">
        
        <table class="min-w-full text-sm">
          <thead
            class="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
            <tr>
              <th class="px-8 py-6 text-left">Định danh</th>
              <th class="px-8 py-6 text-left">Họ tên / Username</th>
              <th class="px-8 py-6 text-left">Email liên hệ</th>
              <th class="px-8 py-6 text-center">Vai trò</th>
              <th class="px-8 py-6 text-center">Tùy chọn</th>
              <th class="px-8 py-6 text-right">Thao tác</th>

            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
            <tr v-for="u in filteredUsers" :key="u._id"
              class="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30">

              <!-- ID: Kiểu font Mono tạo cảm giác hệ thống -->
              <td class="px-8 py-5 font-mono text-xs font-bold text-gray-400">
                #{{ u?._id?.slice(0,10) }}
              </td>
              <!-- User Name: Làm đậm để thay thế cho ảnh làm điểm nhấn -->
              <td class="px-8 py-5">
                <div class="font-black text-gray-700 dark:text-white tracking-tight text-base ">
                  {{ u.full_name || u.username }}
                </div>
              </td>

              <!-- Email -->
              <td class="px-8 py-5 text-gray-500 dark:text-gray-400 font-medium">
                {{ u.email }}
              </td>

              <!-- Role Badge -->
              <td class="px-8 py-5 text-center">
                <span
                  class="inline-flex rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm"
                  :class="u.role === 'admin'
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700'">
                  {{ u.role }}
                </span>
              </td>
              <td class="px-8 py-5 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openDetail(u)"
                    class="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 uppercase tracking-tighter">
                    Xem chi tiết
                  </button>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-8 py-5 text-right">
                <div
                  class="flex items-center justify-end gap-3 opacity-0 transition-all duration-300 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                  <button v-if="u.role !== 'admin'" @click="handlePromote(u)" title="Nâng quyền quản trị"
                    class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white dark:hover:text-black transition-all shadow-sm">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                    </svg>
                  </button>

                  <button @click="handleDelete(u)" title="Xóa tài khoản"
                    class="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-600 transition-all shadow-sm">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. User Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDetail"></div>
      <div class="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-gray-950 border border-white/10">
        <div class="bg-gray-900 px-8 py-6 text-white dark:bg-black">
          <h2 class="text-xl font-black uppercase tracking-widest italic">Thông tin người dùng</h2>
        </div>
        <div class="p-8 space-y-4 text-sm text-gray-700 dark:text-gray-200">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">ID</p>
              <p class="font-mono font-bold mt-1 text-gray-900 dark:text-white">#{{ (currentUser?._id || 0).slice(0,10) }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Vai trò</p>
              <p class="font-bold mt-1">{{ currentUser?.role }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Họ tên</p>
              <p class="font-bold mt-1">{{ currentUser?.full_name || currentUser?.username }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
              <p class="font-bold mt-1 break-all">{{ currentUser?.email }}</p>
            </div>
          </div>

          <!-- Placeholder for future user stats -->
          <div class="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
            <h3 class="text-xs font-black uppercase tracking-widest text-gray-400">Thống kê (tạm trống)</h3>
            <div class="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Sản phẩm đã mua</p>
                <p class="mt-1 font-bold">
                  {{ currentUser?.purchasedProducts?.length != null ? currentUser.purchasedProducts.length : 'Chưa có dữ liệu' }}
                </p>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng tiền đã mua</p>
                <p class="mt-1 font-bold">
                  {{ currentUser?.totalSpent != null ? currentUser.totalSpent : 'Chưa có dữ liệu' }}
                </p>
              </div>
              <div class="sm:col-span-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tương tác gần nhất</p>
                <p class="mt-1 font-bold">
                  {{ currentUser?.lastInteraction || 'Chưa có dữ liệu' }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button @click="closeDetail"
              class="rounded-2xl bg-gray-100 px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Empty State -->
    <div v-if="!loading && users.length === 0"
      class="flex flex-col items-center justify-center py-32 text-center rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-100 dark:border-gray-800">
      <h3 class="text-xl font-black text-gray-300 dark:text-gray-700 uppercase italic tracking-widest">Không có dữ liệu
      </h3>
    </div>
  </div>
</template>

<script setup>
import { ref,reactive, onMounted, computed } from 'vue'; // ← Chỉ import 1 lần
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import { getlistuser } from '../../utils/user_service_api.js';
import { updateUserRole, deleteUser } from '../../utils/user_service_api.js';
const ui = useUIStore();
const userStore = useUserStore();
// 1. Cập nhật filters
const filters = reactive({
  searchTerm: '', 
  role: ''
});

// 2. Cập nhật computed để lọc cho chuẩn
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const term = filters.searchTerm.toLowerCase();
    
    // Kiểm khớp tên, email
    const matchSearch = term === '' || 
                        (u.full_name?.toLowerCase().includes(term)) || 
                        (u.username?.toLowerCase().includes(term)) || 
                        (u.email?.toLowerCase().includes(term));
    
    // Kiểm role
    const matchRole = filters.role === '' || u.role === filters.role;
    
    return matchSearch && matchRole;
  });
});
// Khai báo state
const users = ref([]);
const loading = ref(true); 

// Detail modal state
const showDetailModal = ref(false);
const currentUser = ref(null);

// Hàm lấy danh sách user
const ListUser = async () => {
  loading.value = true;
  try {
    const res = await getlistuser(userStore.token);
    if (res.data.success) {
      users.value = res.data.data; // ← API trả về mảng ở res.data.data
      // Trong ListUser(), sau khi gán dữ liệu sort theo ID tăng dần:
      users.value = res.data.data.sort((a, b) => a.id - b.id);
    } else {
      ui.pushToast({ type: 'error', message: res.data.message || 'Lỗi tải dữ liệu' });
    }
  } catch (error) {
    ui.pushToast({ type: 'error', message: 'Không kết nối được server' });
  } finally {
    loading.value = false;
  }
};

// TỰ ĐỘNG TẢI KHI VÀO TRANG – Chỉ gọi 1 lần!
onMounted(() => {
  ListUser();
});

const handlePromote = async (user) => {
  try {
    const res = await updateUserRole(user.id, { role: "admin" }, userStore.token);
    if (res.data.success) {
      ui.pushToast({ type: 'success', message: `Đã thăng cấp ${user.id || user.username} thành Admin` });
      await ListUser(); // Cập nhật lại danh sách người dùng
    } else {
      ui.pushToast({ type: 'error', message: res.data.message || 'Lỗi thăng cấp người dùng' });
    }
  } catch (error) {
    ui.pushToast({ type: 'error', message: 'Không kết nối được server' });
  }
};

const handleDelete = async (user) => {
  try {
    const res = await deleteUser(user.id, userStore.token);
    if (res.data.success) {
      ui.pushToast({ type: 'success', message: `Đã xóa ${user.id || user.username}` });
      await ListUser(); // Cập nhật lại danh sách người dùng
    } else {
      ui.pushToast({ type: 'error', message: res.data.message || 'Lỗi xóa người dùng' });
    }
  } catch (error) {
    ui.pushToast({ type: 'error', message: 'Không kết nối được server' });
  }
};

const openDetail = (user) => {
  currentUser.value = user;
  showDetailModal.value = true;
};

const closeDetail = () => {
  showDetailModal.value = false;
  currentUser.value = null;
};
</script>