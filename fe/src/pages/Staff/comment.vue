<template>
  <div class="space-y-10 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Phản hồi Khách hàng
        </h1>
        <p class="mt-1.5 text-gray-500 dark:text-gray-400">
          Quản lý đánh giá & trả lời khách hàng 
        </p>
      </div>
    </div>

    <!-- Filters + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex flex-wrap gap-2.5">
        <button
          @click="changeFilter('')"
          :class="['rounded-full px-5 py-2 text-sm font-semibold transition-all', filter === '' ? 'bg-gray-900 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700']"
        >
          Tất cả
        </button>
        <button
          @click="changeFilter('unreplied')"
          :class="['rounded-full px-5 py-2 text-sm font-semibold transition-all', filter === 'unreplied' ? 'bg-red-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800']"
        >
          Chưa trả lời
        </button>
        <button
          @click="changeFilter('replied')"
          :class="['rounded-full px-5 py-2 text-sm font-semibold transition-all', filter === 'replied' ? 'bg-green-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800']"
        >
          Đã trả lời
        </button>
      </div>

      <div class="relative w-full sm:w-80">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          @keyup.enter="fetchReviews"
          type="text"
          placeholder="Tìm theo tên, sản phẩm hoặc nội dung..."
          class="w-full rounded-full border-gray-200 bg-white dark:bg-gray-800 pl-11 pr-5 py-3.5 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:focus:border-gray-300 dark:focus:ring-gray-300 transition"
        />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-6">
      <div v-for="n in 5" :key="n" class="animate-pulse rounded-3xl bg-gray-100 dark:bg-gray-800 h-64"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="reviews.length === 0" class="text-center py-20">
      <div class="mx-auto w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Chưa có phản hồi nào</h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Hoặc không tìm thấy kết quả phù hợp với bộ lọc / từ khóa hiện tại.</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-6">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="group relative overflow-hidden rounded-3xl border border-gray-100/80 bg-white/80 backdrop-blur-sm p-6 sm:p-7 transition-all hover:shadow-xl hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-gray-700 dark:hover:shadow-2xl"
      >
        <!-- Header Info -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300 shadow-sm">
              {{ (review.user_name || 'U').charAt(0).toUpperCase() }}
            </div>

            <div>
              <h3 class="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                {{ review.user_name || 'Khách hàng' }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{ review.product_name }} • {{ new Date(review.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) }}
              </p>
              <div class="mt-1.5 flex items-center gap-1.5">
                <div class="flex text-xl" :class="getRatingColor(review.rating)">
                  <span v-for="n in 5" :key="n">{{ n <= review.rating ? '★' : '☆' }}</span>
                </div>
                <span class="ml-1 text-sm font-medium text-gray-600 dark:text-gray-300">{{ review.rating }}/5</span>
              </div>
            </div>
          </div>

          <div
            v-if="!review.replies?.length"
            class="flex-shrink-0 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-red-700 dark:bg-red-900/40 dark:text-red-300"
          >
            Chưa trả lời
          </div>
          <div v-else class="flex-shrink-0 rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/40 dark:text-green-300">
            Đã trả lời
          </div>
        </div>

        <!-- Nội dung đánh giá gốc -->
        <div class="mt-6 rounded-2xl bg-gray-50/70 p-5 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-700/50">
          <p class="text-gray-700 leading-relaxed dark:text-gray-200 whitespace-pre-line">
            "{{ review.comment }}"
          </p>
        </div>

        <!-- Replies - Tối ưu cho số lượng lớn -->
        <div class="mt-6">
          <div v-if="review.replies?.length" class="space-y-4">
            <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {{ review.replies.length }} phản hồi
            </div>

            <!-- Phần preview (luôn hiển thị 3 reply mới nhất) -->
            <div class="space-y-4">
              <div
                v-for="(reply, idx) in getPreviewReplies(review.replies)"
                :key="idx"
                class="rounded-2xl p-4 sm:p-5 transition-all relative"
                :class="[
                  reply.role === 'customer' ? 'bg-blue-50/70 border-l-4 border-blue-400 dark:bg-blue-950/30 dark:border-blue-600' :
                  reply.role === 'admin' ? 'bg-purple-50/70 border-l-4 border-purple-500 dark:bg-purple-950/30 dark:border-purple-600' :
                  'bg-green-50/70 border-l-4 border-green-500 dark:bg-green-950/30 dark:border-green-600',
                  idx === getPreviewReplies(review.replies).length - 1 && !expandedReviews.has(review.id) ? 'ring-1 ring-offset-2 ring-green-400/50 dark:ring-green-600/50' : ''
                ]"
              >
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {{ reply.user_name || 'Người dùng' }}
                    </span>
                    <span
                      class="text-xs font-medium px-2.5 py-0.5 rounded-full border border-current/30"
                      :class="getRoleBadgeClass(reply.role)"
                    >
                      {{ getRoleLabel(reply.role) }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {{ formatRelativeTime(reply.created_at) }}
                  </span>
                </div>
                <p class="text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-line">
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

            <!-- Phần mở rộng đầy đủ (chỉ khi expanded) -->
            <div v-if="expandedReviews.has(review.id) && review.replies.length > 1" class="space-y-4 mt-4">
              <div
                v-for="(reply, idx) in getExpandedReplies(review.replies)"
                :key="idx + 1"
                class="rounded-2xl p-4 sm:p-5 transition-all relative"
                :class="[
                  reply.role === 'customer' ? 'bg-blue-50/70 border-l-4 border-blue-400 dark:bg-blue-950/30 dark:border-blue-600' :
                  reply.role === 'admin' ? 'bg-purple-50/70 border-l-4 border-purple-500 dark:bg-purple-950/30 dark:border-purple-600' :
                  'bg-green-50/70 border-l-4 border-green-500 dark:bg-green-950/30 dark:border-green-600'
                ]"
              >
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {{ reply.user_name || 'Người dùng' }}
                    </span>
                    <span
                      class="text-xs font-medium px-2.5 py-0.5 rounded-full border border-current/30"
                      :class="getRoleBadgeClass(reply.role)"
                    >
                      {{ getRoleLabel(reply.role) }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {{ formatRelativeTime(reply.created_at) }}
                  </span>
                </div>
                <p class="text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-line">
                  {{ reply.content }}
                </p>
              </div>
            </div>
          </div>

          <!-- Form Trả lời -->
          <div class="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <textarea
              v-model="replyInputs[review.id]"
              rows="3"
              placeholder="Viết phản hồi chuyên nghiệp, lịch sự..."
              class="w-full rounded-2xl border-gray-200 bg-white dark:bg-gray-800 px-5 py-4 text-sm focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 dark:focus:border-gray-300 dark:focus:ring-gray-300 transition resize-none"
            ></textarea>

            <div class="mt-4 flex justify-end gap-3">
              <button
                @click="replyInputs[review.id] = ''"
                class="rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
              >
                Hủy
              </button>
              <button
                @click="submitReply(review)"
                :disabled="!replyInputs[review.id]?.trim() || isSubmitting"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-black px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-black hover:to-gray-900 disabled:opacity-50 transition"
              >
                <span>Gửi trả lời</span>
                <svg v-if="isSubmitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex justify-center gap-3 mt-10">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-6 py-3 rounded-full border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
        >
          Trang trước
        </button>
        <span class="px-6 py-3 rounded-full bg-gray-900 text-white font-semibold">
          {{ pagination.page }} / {{ pagination.pages }}
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="px-6 py-3 rounded-full border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
        >
          Trang sau
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import api from '../../utils/product_service_api';

const ui = useUIStore();
const userStore = useUserStore();

const reviews = ref([]);
const loading = ref(false);
const isSubmitting = ref(false);
const filter = ref('');
const searchQuery = ref('');
const replyInputs = ref({});
const pagination = ref({ page: 1, pages: 1 });
const expandedReviews = ref(new Set()); // Theo dõi review nào đang mở rộng replies

const fetchReviews = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: 10,
      search: searchQuery.value.trim(),
      replyStatus: filter.value
    };
    const res = await api.get('/products/reviews', { params });
    reviews.value = res.data.data.data || [];
    if (res.data.data.pagination) pagination.value = res.data.data.pagination;
  } catch (e) {
    console.error(e);
    ui.pushToast({ type: 'error', message: 'Không thể tải danh sách phản hồi' });
  } finally {
    loading.value = false;
  }
};

const changeFilter = (val) => {
  filter.value = val;
  pagination.value.page = 1;
  fetchReviews();
};

const changePage = (p) => {
  if (p < 1 || p > pagination.value.pages) return;
  pagination.value.page = p;
  fetchReviews();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

let searchTimeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchReviews();
  }, 500);
});

const submitReply = async (review) => {
  const text = replyInputs.value[review.id]?.trim();
  if (!text) return;

  isSubmitting.value = true;
  try {
    const userName = userStore.profile?.full_name || userStore.profile?.username || 'Staff';
    await api.put(`/products/reviews/${review.id}/reply`, {
      reply: text,
      user_name: userName
    });

    if (!review.replies) review.replies = [];
    review.replies.push({
      user_name: userName,
      role: userStore.profile?.role || 'staff',
      content: text,
      created_at: new Date().toISOString()
    });

    ui.pushToast({ type: 'success', message: 'Đã gửi trả lời thành công!' });
    replyInputs.value[review.id] = '';
  } catch (e) {
    console.error(e);
    ui.pushToast({ type: 'error', message: 'Gửi phản hồi thất bại. Vui lòng thử lại.' });
  } finally {
    isSubmitting.value = false;
  }
};

const toggleReplies = (reviewId) => {
  if (expandedReviews.value.has(reviewId)) {
    expandedReviews.value.delete(reviewId);
  } else {
    expandedReviews.value.add(reviewId);
  }
};

const getPreviewReplies = (replies) => {
  if (!replies?.length) return [];
  return sortedReplies(replies).slice(-1); // 3 reply mới nhất
};

const getExpandedReplies = (replies) => {
  if (!replies?.length) return [];
  return sortedReplies(replies).slice(0, -1); // Phần còn lại khi mở rộng
};

const sortedReplies = (replies) => {
  if (!replies?.length) return [];
  return [...replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} giờ trước`;
  if (diffMin < 10080) return `${Math.floor(diffMin / 1440)} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
};

const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'text-yellow-400';
  if (rating >= 3.5) return 'text-amber-400';
  if (rating >= 2.5) return 'text-orange-400';
  return 'text-red-400';
};

const getRoleLabel = (role) => {
  const map = {
    customer: 'Khách hàng',
    staff: 'Nhân viên',
    admin: 'Quản trị viên'
  };
  return map[role] || role?.charAt(0).toUpperCase() + role?.slice(1) || 'Unknown';
};

const getRoleBadgeClass = (role) => {
  const base = 'border-current/30';
  if (role === 'customer') return `bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 ${base}`;
  if (role === 'admin') return `bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 ${base}`;
  if (role === 'staff') return `bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 ${base}`;
  return `bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 ${base}`;
};

onMounted(fetchReviews);
</script>