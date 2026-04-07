<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-8 md:px-10 lg:px-12">
    <!-- HEADER -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800 gap-4">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Quản lý Đánh giá
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Xem, lọc và phản hồi tất cả đánh giá từ khách hàng • {{ pagination.total || reviews.length }} đánh giá
        </p>
      </div>

      <button
        @click="goBack"
        class="group flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-black hover:shadow-xl active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:-rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
        QUAY LẠI
      </button>
    </div>

    <!-- FILTER BAR -->
    <div class="mb-10 flex flex-wrap gap-4 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <!-- Search -->
      <div class="flex-1 min-w-[240px]">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Tìm kiếm</label>
        <input
          v-model="filters.search"
          placeholder="Nội dung / sản phẩm / tác giả"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-white"
        />
      </div>

      <!-- Product ID -->
      <div class="w-40">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Product ID</label>
        <input
          v-model="filters.productId"
          type="text"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        />
      </div>

      <!-- User ID -->
      <div class="w-40">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">User ID</label>
        <input
          v-model="filters.userId"
          type="text"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        />
      </div>

      <!-- Rating -->
      <div class="w-40">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Đánh giá</label>
        <select
          v-model="filters.rating"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        >
          <option value="">Tất cả</option>
          <option value="5">5 ⭐</option>
          <option value="4">4 ⭐</option>
          <option value="3">3 ⭐</option>
          <option value="2">2 ⭐</option>
          <option value="1">1 ⭐</option>
        </select>
      </div>

      <!-- Reply Status -->
      <div class="w-44">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Trạng thái trả lời</label>
        <select
          v-model="filters.replyStatus"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        >
          <option value="">Tất cả</option>
          <option value="replied">Đã trả lời</option>
          <option value="unreplied">Chưa trả lời</option>
        </select>
      </div>

      <!-- Date From & To -->
      <div class="w-44">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Từ ngày</label>
        <input
          type="date"
          v-model="filters.dateFrom"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        />
      </div>
      <div class="w-44">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Đến ngày</label>
        <input
          type="date"
          v-model="filters.dateTo"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        />
      </div>

      <!-- Sort -->
      <div class="w-44">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Sắp xếp theo</label>
        <select
          v-model="filters.sortBy"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        >
          <option value="created_at">Ngày tạo</option>
          <option value="rating">Đánh giá</option>
        </select>
      </div>

      <div class="w-40">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Thứ tự</label>
        <select
          v-model="filters.sortDir"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        >
          <option value="desc">Mới → Cũ</option>
          <option value="asc">Cũ → Mới</option>
        </select>
      </div>

      <!-- Reset -->
      <button
        @click="resetFilters"
        class="h-[46px] px-8 rounded-2xl border border-gray-200 bg-white text-sm font-bold tracking-widest text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-800 mt-auto"
      >
        RESET LỌC
      </button>
    </div>

    <!-- TABLE -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <table class="min-w-full text-sm text-left">
        <thead class="border-b bg-gray-50 font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
          <tr>
            <th class="p-4 w-[20%]">Sản phẩm</th>
            <th class="p-4 w-[20%]">Khách hàng</th>
            <th class="p-4 w-[15%]">Đánh giá</th>
            <th class="p-4 w-[35%]">Nội dung & Phản hồi</th>
            <th class="p-4 w-[10%]">Ngày tạo</th>
            <th class="p-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <!-- Loading Skeleton -->
          <tr v-if="loading">
            <td colspan="6" class="p-12 text-center">
              <div class="animate-pulse space-y-4">
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="!reviews || reviews.length === 0">
            <td colspan="6" class="p-16 text-center text-gray-500 dark:text-gray-400">
              <div class="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-lg font-medium">Không tìm thấy đánh giá nào</p>
              <p class="mt-2">Thử thay đổi bộ lọc hoặc xóa một số điều kiện</p>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr v-else v-for="review in reviews" :key="review.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <!-- Sản phẩm -->
            <td class="p-4 font-medium text-gray-900 dark:text-white align-top">
              <div class="line-clamp-2" :title="review.product_name">{{ review.product_name || 'N/A' }}</div>
              <div class="text-xs text-gray-400 font-mono mt-1">
                ID: {{ review.product_id?._id?.slice(0,10) || 'N/A' }}
              </div>
            </td>

            <!-- Khách hàng -->
            <td class="p-4 text-gray-600 dark:text-gray-300 align-top">
              <div class="font-bold">{{ review.user_name || 'Khách hàng' }}</div>
              <div class="text-xs text-gray-400 mt-1 break-all">ID: {{ review.user_id.slice(0,10) || 'N/A' }}</div>
            </td>

            <!-- Đánh giá sao -->
            <td class="p-4 text-yellow-500 text-xl align-top">
              {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
            </td>

            <!-- Nội dung & Trả lời -->
            <td class="p-4 align-top">
  <div class="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 mb-3">
    <p class="text-gray-800 dark:text-gray-200">{{ review.comment || '(Chỉ đánh giá sao)' }}</p>
  </div>

  <div v-if="review.replies && review.replies.length > 0" class="mt-2">
    <!-- Preview replies (3 mới nhất) -->
    <div class="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
      <div
        v-for="(reply, idx) in getPreviewReplies(review.replies)"
        :key="idx"
        class="text-sm"
      >
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span
            class="text-xs font-medium px-2.5 py-0.5 rounded-full border"
            :class="getRoleBadgeClass(reply.role)"
          >
            {{ getRoleLabel(reply.role) }}
          </span>
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ reply.user_name }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatRelativeTime(reply.created_at) }}
          </span>
        </div>
        <p class="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
          {{ reply.content }}
        </p>
      </div>
    </div>

    <!-- Nút xem thêm / thu gọn -->
    <button
      v-if="review.replies.length > 1"
      @click="toggleReplies(review.id)"
      class="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition"
    >
      <span v-if="expandedReviews.has(review.id)">
        Thu gọn {{ review.replies.length - 1 }} phản hồi
      </span>
      <span v-else>
        Xem thêm {{ review.replies.length - 1 }} phản hồi
      </span>
      <svg class="w-4 h-4 transition-transform" :class="expandedReviews.has(review.id) ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Replies mở rộng -->
    <div v-if="expandedReviews.has(review.id) && review.replies.length > 1" class="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3 mt-3">
      <div
        v-for="(reply, idx) in getExpandedReplies(review.replies)"
        :key="idx + 1"
        class="text-sm"
      >
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span
            class="text-xs font-medium px-2.5 py-0.5 rounded-full border"
            :class="getRoleBadgeClass(reply.role)"
          >
            {{ getRoleLabel(reply.role) }}
          </span>
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ reply.user_name }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatRelativeTime(reply.created_at) }}
          </span>
        </div>
        <p class="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
          {{ reply.content }}
        </p>
      </div>
    </div>
  </div>

  <span v-else class="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
    Chưa có phản hồi
  </span>
</td>

            <td class="p-4 text-gray-500 dark:text-gray-400 text-xs align-top">
              {{ formatRelativeTime(review.created_at) }}
            </td>

            <!-- Thao tác -->
            <td class="p-4 text-right align-top">
              <div class="flex flex-col items-end gap-2">
                <button @click="openReplyModal(review)" class="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition dark:bg-blue-900/30 dark:hover:bg-blue-900/50" title="Trả lời">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <button @click="deleteReview(review.id)" class="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition dark:bg-red-900/30 dark:hover:bg-red-900/50" title="Xóa">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <div v-if="pagination.pages > 1" class="mt-8 flex items-center justify-center gap-3">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="px-6 py-3 rounded-full border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
      >
        Trang trước
      </button>
      <span class="px-6 py-3 rounded-full bg-gray-900 text-white font-bold shadow">
        {{ pagination.page }} / {{ pagination.pages }}
      </span>
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page === pagination.pages"
        class="px-6 py-3 rounded-full border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
      >
        Trang sau
      </button>
    </div>

    <!-- MODAL TRẢ LỜI -->
    <div v-if="showReplyModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h3 class="text-lg font-black uppercase tracking-widest italic dark:text-white">Phản hồi Khách hàng</h3>
          <button @click="showReplyModal = false" class="text-gray-500 hover:text-gray-900 dark:hover:text-white transition text-xl">✕</button>
        </div>
        <div class="p-6">
          <div class="mb-5 p-4 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl text-gray-700 dark:text-gray-300">
            <span class="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-1">{{ selectedReview?.user_name }} đã viết:</span>
            <p class="italic text-sm">"{{ selectedReview?.comment }}"</p>
          </div>
          <textarea
            v-model="replyText"
            rows="5"
            class="w-full p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm dark:text-white shadow-inner"
            placeholder="Nhập nội dung phản hồi của bạn..."
            @keydown.enter.exact.prevent="submitReply"
            ref="replyTextarea"
          ></textarea>
          <div class="mt-6 flex justify-end gap-3">
            <button @click="showReplyModal = false" class="px-6 py-3 border rounded-xl hover:bg-gray-100 font-medium text-sm text-gray-600 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300 transition">Hủy</button>
            <button
              @click="submitReply"
              :disabled="!replyText.trim() || isSubmitting"
              class="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 font-bold text-sm shadow-lg active:scale-95 transition dark:bg-blue-600 dark:hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <span>{{ isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi' }}</span>
              <svg v-if="isSubmitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import api from '../../utils/product_service_api';

const router = useRouter();
const ui = useUIStore();
const userStore = useUserStore();

const reviews = ref([]);
const loading = ref(false);
const showReplyModal = ref(false);
const selectedReview = ref(null);
const replyText = ref('');
const isSubmitting = ref(false);
const replyTextarea = ref(null);

const pagination = ref({ page: 1, pages: 1, total: 0 });

const filters = ref({
  search: '',
  productId: '',
  userId: '',
  rating: '',
  replyStatus: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'created_at',
  sortDir: 'desc'
});

let debounceTimeout = null;

const fetchReviews = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: 10,
      ...filters.value
    };
    const res = await api.get('/products/reviews', { params });
    const responseData = res.data?.data;

    if (responseData && Array.isArray(responseData.data)) {
      reviews.value = responseData.data;
      if (responseData.pagination) {
        pagination.value = responseData.pagination;
      }
    } else if (Array.isArray(responseData)) {
      reviews.value = responseData;
      pagination.value = { page: 1, pages: 1, total: responseData.length };
    } else {
      reviews.value = [];
    }
  } catch (e) {
    console.error('Lỗi lấy danh sách đánh giá:', e);
    reviews.value = [];
    ui.pushToast({ type: 'error', message: 'Không thể tải danh sách đánh giá' });
  } finally {
    loading.value = false;
  }
};

const changePage = (p) => {
  if (p < 1 || p > pagination.value.pages) return;
  pagination.value.page = p;
  fetchReviews();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetFilters = () => {
  filters.value = {
    search: '',
    productId: '',
    userId: '',
    rating: '',
    replyStatus: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortDir: 'desc'
  };
  pagination.value.page = 1;
};

watch(filters, () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchReviews();
  }, 500);
}, { deep: true });


const openReplyModal = (review) => {
  selectedReview.value = review;
  replyText.value = '';
  showReplyModal.value = true;
  nextTick(() => {
    replyTextarea.value?.focus();
  });
};

const submitReply = async () => {
  if (!replyText.value.trim()) return;
  isSubmitting.value = true;
  try {
    const userName = userStore.profile?.full_name || userStore.profile?.username || 'Quản trị viên';
    await api.put(`/products/reviews/${selectedReview.value.id}/reply`, {
      reply: replyText.value.trim(),
      user_name: userName
    });

    const idx = reviews.value.findIndex(r => r.id === selectedReview.value.id);
    if (idx !== -1) {
      if (!reviews.value[idx].replies) reviews.value[idx].replies = [];
      reviews.value[idx].replies.push({
        user_id: userStore.profile?.id || 'admin',
        user_name: userName,
        role: userStore.profile?.role || 'admin',
        content: replyText.value.trim(),
        created_at: new Date().toISOString()
      });
    }

    ui.pushToast({ type: 'success', message: 'Phản hồi thành công' });
    showReplyModal.value = false;
  } catch (e) {
    console.error(e);
    ui.pushToast({ type: 'error', message: 'Lỗi gửi phản hồi' });
  } finally {
    isSubmitting.value = false;
  }
};

const deleteReview = async (id) => {
  if (!confirm('Xác nhận xóa vĩnh viễn đánh giá và toàn bộ phản hồi?')) return;
  try {
    await api.delete(`/products/reviews/${id}`);
    reviews.value = reviews.value.filter(r => r.id !== id);
    ui.pushToast({ type: 'success', message: 'Đã xóa đánh giá' });

    if (reviews.value.length === 0 && pagination.value.page > 1) {
      changePage(pagination.value.page - 1);
    }
  } catch (e) {
    ui.pushToast({ type: 'error', message: 'Lỗi xóa đánh giá' });
  }
};

const sortedReplies = (replies) => {
  if (!replies?.length) return [];
  return [...replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};
const expandedReviews = ref(new Set());

const toggleReplies = (reviewId) => {
  if (expandedReviews.value.has(reviewId)) {
    expandedReviews.value.delete(reviewId);
  } else {
    expandedReviews.value.add(reviewId);
  }
};

const getPreviewReplies = (replies) => {
  if (!replies?.length) return [];
  return sortedReplies(replies).slice(-1);
};

const getExpandedReplies = (replies) => {
  if (!replies?.length) return [];
  return sortedReplies(replies).slice(0, -1);
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} giờ trước`;
  if (diffMin < 10080) return `${Math.floor(diffMin / 1440)} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getRoleLabel = (role) => {
  const map = {
    customer: 'Khách hàng',
    staff: 'Nhân viên',
    admin: 'Quản trị viên'
  };
  return map[role] || 'Người dùng';
};

const getRoleBadgeClass = (role) => {
  const base = 'border-current/30';
  if (role === 'customer') return `bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 ${base}`;
  if (role === 'admin') return `bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 ${base}`;
  if (role === 'staff') return `bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 ${base}`;
  return `bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 ${base}`;
};

const goBack = () => router.back();

onMounted(() => {
  fetchReviews();
});
</script>