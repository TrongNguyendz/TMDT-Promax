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
        {{ filteredUsers.length }} Tài khoản khả dụng
      </div>
    </div>

    <!-- 2. Search Bar -->
    <div class="relative max-w-lg">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-black dark:border-gray-800 dark:border-t-white"></div>
      <p class="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Đang truy xuất dữ liệu...</p>
    </div>

    <div v-else class="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
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
            <tr v-for="u in paginatedUsers" :key="u.id || u._id" class="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
              
              <td class="px-8 py-5 font-mono text-xs font-bold text-gray-400">
                #{{ String(u.id || u._id).slice(0,10) }}
              </td>
              
              <td class="px-8 py-5">
                <div class="font-black text-gray-700 dark:text-white tracking-tight text-base">
                  {{ u.full_name || u.name || u.username }}
                </div>
              </td>
              
              <td class="px-8 py-5 text-gray-500 dark:text-gray-400 font-medium">
                {{ u.email }}
              </td>
              
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
                  <button v-if="u.role == 'customer'" @click="openDetail(u)"
                    class="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 uppercase tracking-tighter">
                    Xem chi tiết
                  </button>
                </div>
              </td>
              
              <td class="px-8 py-5 text-right">
                <div class="flex items-center justify-end gap-3">
                  <button v-if="u.role !== 'admin'" @click="handlePromote(u)" title="Nâng quyền quản trị" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white dark:hover:text-black transition-all shadow-sm">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>
                  </button>
                  <button @click="handleDelete(u)" title="Xóa tài khoản" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-600 transition-all shadow-sm">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-100 px-8 py-4 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
        <span class="text-xs text-gray-500 font-medium">Trang {{ currentPage }} / {{ totalPages }}</span>
        <div class="flex gap-2">
          <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            Trước
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            Sau
          </button>
        </div>
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
          <!-- Thông tin cơ bản -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">ID</p>
              <p class="font-mono font-bold mt-1 text-gray-900 dark:text-white">#{{ String(currentUser?.id || currentUser?._id || 0).slice(0,10) }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Vai trò</p>
              <p class="font-bold mt-1">{{ currentUser?.role }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Họ tên</p>
              <p class="font-bold mt-1">{{ currentUser?.full_name || currentUser?.name || currentUser?.username }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
              <p class="font-bold mt-1 break-all">{{ currentUser?.email }}</p>
            </div>
          </div>

          <!-- THỐNG KÊ MUA HÀNG -->
          <div class="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
            <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Thống kê mua hàng</h3>
            
            <!-- Loading -->
            <div v-if="userStats.loading" class="flex justify-center py-4">
               <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white"></div>
            </div>

            <div v-else class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng tiền đã mua</p>
                <p class="mt-1 font-bold text-lg text-blue-600 dark:text-blue-400">
                  {{ formatCurrency(userStats.totalSpent) }}
                </p>
              </div>
              
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tương tác gần nhất</p>
                <p class="mt-1 font-bold">
                  {{ userStats.lastInteraction || 'Chưa có đơn hàng' }}
                </p>
              </div>
              
              <!-- 3 Sản phẩm gần nhất -->
              <div class="sm:col-span-2 mt-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Sản phẩm mua gần đây</p>
                
                <div v-if="userStats.recentProducts.length > 0" class="space-y-2">
                   <div v-for="(item, idx) in userStats.recentProducts" :key="idx" class="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                       <img :src="item.product_image || 'https://via.placeholder.com/40'" class="w-10 h-10 rounded-lg object-cover" />
                       <div class="flex-1 overflow-hidden">
                           <p class="text-xs font-bold truncate">{{ item.product_name }}</p>
                           <p class="text-[10px] text-gray-500">Số lượng: {{ item.quantity }}</p>
                       </div>
                   </div>
                </div>
                <p v-else class="text-xs font-medium text-gray-500 italic">Chưa có sản phẩm nào</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button @click="closeDetail"
              class="rounded-2xl bg-gray-100 px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredUsers.length === 0"
      class="flex flex-col items-center justify-center py-32 text-center rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-100 dark:border-gray-800">
      <h3 class="text-xl font-black text-gray-300 dark:text-gray-700 uppercase italic tracking-widest">Không tìm thấy người dùng</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'; 
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import { getlistuser, updateUserRole, deleteUser } from '../../utils/user_service_api.js';
import OrderAPI from '../../utils/order_service_api.js';
import { formatCurrency } from '../../utils/helpers.js';

const ui = useUIStore();
const userStore = useUserStore();

// --- STATE CƠ BẢN ---
const users = ref([]);
const loading = ref(true); 
const showDetailModal = ref(false);
const currentUser = ref(null);

// --- PHÂN TRANG & TÌM KIẾM ---
const currentPage = ref(1);
const itemsPerPage = ref(10); // Đã sửa lại thành ref() để có reactivity

const filters = reactive({
  searchTerm: '', 
  role: ''
});

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const term = filters.searchTerm.toLowerCase();
    const matchSearch = term === '' || 
                        (u.full_name?.toLowerCase().includes(term)) || 
                        (u.name?.toLowerCase().includes(term)) ||
                        (u.username?.toLowerCase().includes(term)) || 
                        (u.email?.toLowerCase().includes(term));
    const matchRole = filters.role === '' || u.role === filters.role;
    return matchSearch && matchRole;
  });
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value) || 1;
});

// Reset trang khi tìm kiếm
watch(() => filters.searchTerm, () => {
  currentPage.value = 1;
});

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// --- THỐNG KÊ USER ---
const userStats = reactive({
  loading: false,
  totalSpent: 0,
  lastInteraction: '',
  recentProducts:[]
});

const fetchUserStats = async (userId) => {
  userStats.loading = true;
  userStats.totalSpent = 0;
  userStats.lastInteraction = '';
  userStats.recentProducts =[];

  try {
    const res = await OrderAPI.getOrders({ user_id: userId });
    
    if (res.data.success) {
      const orders = res.data.data;
      const validOrders = orders.filter(o => o.status !== 'cancelled');

      userStats.totalSpent = validOrders.reduce((sum, o) => sum + Number(o.final_amount), 0);

      if (orders.length > 0) {
         userStats.lastInteraction = new Date(orders[0].created_at).toLocaleString('vi-VN');
      }

      let allItems =[];
      validOrders.forEach(o => {
         if (o.items) allItems = [...allItems, ...o.items];
      });
      userStats.recentProducts = allItems.slice(0, 3);
    }
  } catch (error) {
    console.error("Lỗi lấy thống kê user:", error);
  } finally {
    userStats.loading = false;
  }
};

// --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

const ListUser = async () => {
  loading.value = true;
  try {
    const res = await getlistuser(userStore.token);
    if (res.data.success) {
      users.value = res.data.data.sort((a, b) => {
        const idA = a.id || a._id;
        const idB = b.id || b._id;
        return (idA < idB) ? -1 : 1;
      });
    } else {
      ui.pushToast({ type: 'error', message: res.data.message || 'Lỗi tải dữ liệu' });
    }
  } catch (error) {
    ui.pushToast({ type: 'error', message: 'Không kết nối được server' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  ListUser();
});

const handlePromote = async (user) => {
  if(!confirm(`Nâng cấp quyền Admin cho ${user.email}?`)) return;
  const targetId = user.id || user._id;
  try {
    const res = await updateUserRole(targetId, { role: "admin" }, userStore.token);
    if (res.data.success) {
      ui.pushToast({ type: 'success', message: `Đã thăng cấp thành Admin` });
      await ListUser(); 
    }
  } catch (error) {
    ui.pushToast({ type: 'error', message: 'Không kết nối được server' });
  }
};

const handleDelete = async (user) => {
  if(!confirm(`Xác nhận xóa tài khoản ${user.email}?`)) return;
  const targetId = user.id || user._id;
  try {
    const res = await deleteUser(targetId, userStore.token);
    if (res.data.success) {
      ui.pushToast({ type: 'success', message: `Đã xóa người dùng` });
      await ListUser(); 
    }
  } catch (error) {
    ui.pushToast({ type: 'error', message: 'Không kết nối được server' });
  }
};

// [CHANGE QUAN TRỌNG]: Đã thêm await fetchUserStats vào hàm openDetail
const openDetail = async (user) => {
  currentUser.value = user;
  showDetailModal.value = true;
  
  // Gọi API lấy thống kê
  const targetId = user.id || user._id;
  if (targetId) {
    await fetchUserStats(targetId);
  }
};

const closeDetail = () => {
  showDetailModal.value = false;
  currentUser.value = null;
};
</script>