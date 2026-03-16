<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-8 md:px-10 lg:px-12">

    <!-- HEADER -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800 gap-4">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Quản lý Đánh giá
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Xem, lọc và phản hồi tất cả đánh giá từ khách hàng
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

    <!-- FILTER BAR – chi tiết từ file bạn cung cấp -->
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
          type="number"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        />
      </div>

      <!-- User ID -->
      <div class="w-40">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">User ID</label>
        <input
          v-model="filters.userId"
          type="number"
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        />
      </div>

      <!-- Author -->
      <div class="w-48">
        <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Tên người đánh giá</label>
        <input
          v-model="filters.author"
          placeholder="Tên tác giả"
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

      <!-- Nút Reset & Lọc (tự động lọc nhờ computed) -->
      <button
        @click="resetFilters"
        class="h-[46px] px-8 rounded-2xl border border-gray-200 bg-white text-sm font-bold tracking-widest text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-800"
      >
        RESET
      </button>
    </div>

    <!-- TABLE -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <table class="min-w-full text-sm text-left">
        <thead class="border-b bg-gray-50 font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
          <tr>
            <th class="p-4">Sản phẩm</th>
            <th class="p-4">Khách hàng</th>
            <th class="p-4">Đánh giá</th>
            <th class="p-4 w-1/3">Nội dung & Phản hồi</th>
            <th class="p-4">Ngày tạo</th>
            <th class="p-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-if="loading">
            <td colspan="6" class="p-12 text-center text-gray-500 dark:text-gray-400">
              <div class="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent rounded-full mx-auto mb-3"></div>
              Đang tải...
            </td>
          </tr>
          <tr v-else-if="filteredReviews.length === 0">
            <td colspan="6" class="p-12 text-center text-gray-500 dark:text-gray-400">
              Không tìm thấy đánh giá nào phù hợp với bộ lọc
            </td>
          </tr>
          <tr v-else v-for="review in filteredReviews" :key="review.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <td class="p-4 font-medium text-gray-900 dark:text-white">
              {{ review.product_name || `ID: ${review.product_id}` }}
            </td>
            <td class="p-4 text-gray-600 dark:text-gray-300">
              User #{{ review.user_id }}
              <div class="text-xs text-gray-400">{{ review.author || 'Ẩn danh' }}</div>
            </td>
            <td class="p-4 text-yellow-500 text-xl">
              {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
            </td>
            <td class="p-4">
              <p class="text-gray-800 dark:text-gray-200">{{ review.comment }}</p>
              <div v-if="review.admin_reply" class="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                <span class="font-bold text-blue-700 dark:text-blue-400 block mb-1">Admin:</span>
                {{ review.admin_reply }}
              </div>
              <span v-else class="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                Chưa trả lời
              </span>
            </td>
            <td class="p-4 text-gray-500 dark:text-gray-400 text-xs">
              {{ formatDate(review.created_at) }}
            </td>
            <td class="p-4 text-right">
              <div class="flex justify-end gap-2">
                <button @click="openReplyModal(review)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition dark:hover:bg-blue-900/20" title="Trả lời">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <button @click="deleteReview(review.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-900/20" title="Xóa">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL TRẢ LỜI -->
    <div v-if="showReplyModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div class="p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-bold dark:text-white">Phản hồi đánh giá</h3>
          <button @click="showReplyModal = false" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        </div>
        <div class="p-6">
          <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg italic text-gray-700 dark:text-gray-300 border dark:border-gray-600">
            "{{ selectedReview?.comment }}"
          </div>
          <textarea
            v-model="replyText"
            rows="5"
            class="w-full p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:border-blue-500 focus:ring-0 resize-none"
            placeholder="Nhập phản hồi của Admin..."
          ></textarea>
          <div class="mt-6 flex justify-end gap-4">
            <button @click="showReplyModal = false" class="px-6 py-2.5 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">Hủy</button>
            <button
              @click="submitReply"
              :disabled="!replyText.trim() || isSubmitting"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../../stores/ui';
// import api from '../../utils/product_service_api';

const router = useRouter();
const ui = useUIStore();

const reviews = ref([]);
const loading = ref(false);
const showReplyModal = ref(false);
const selectedReview = ref(null);
const replyText = ref('');
const isSubmitting = ref(false);

const filters = ref({
  search: '',
  productId: '',
  userId: '',
  author: '',
  rating: '',
  replyStatus: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'created_at',
  sortDir: 'desc'
});

const mockReviews = [
  {
    id: 101,
    product_id: 1,
    product_name: "Áo Thun Basic Cotton",
    user_id: 45,
    author: "Nguyễn Văn A",
    rating: 5,
    comment: "Sản phẩm chất lượng rất tốt, vải mát, form chuẩn. Sẽ ủng hộ shop tiếp!",
    admin_reply: null,
    created_at: "2023-10-25T10:30:00Z"
  },
  {
    id: 102,
    product_id: 2,
    product_name: "Quần Jean Ống Rộng",
    user_id: 88,
    author: "Trần Thị B",
    rating: 4,
    comment: "Quần đẹp nhưng hơi dài so với mình, phải đi cắt bớt gấu.",
    admin_reply: "Dạ shop cảm ơn bạn đã góp ý. Shop sẽ lưu ý để cải thiện bảng size ạ.",
    created_at: "2023-10-26T14:15:00Z"
  },
  {
    id: 103,
    product_id: 1,
    product_name: "Áo Thun Basic Cotton",
    user_id: 12,
    author: "Lê C",
    rating: 3,
    comment: "Màu thực tế hơi nhạt hơn so với trên hình. Chất vải cũng trung bình thôi.",
    admin_reply: null,
    created_at: "2023-10-27T09:00:00Z"
  },
  {
    id: 104,
    product_id: 5,
    product_name: "Váy Hoa Nhí Trễ Vai",
    user_id: 99,
    author: "Phạm D",
    rating: 5,
    comment: "Váy siêu xinh luôn, mặc đi biển rất hợp. Giao hàng cũng nhanh nữa.",
    admin_reply: "Cảm ơn bạn đã tin tưởng shop ạ! Chúc bạn có những chuyến đi chơi vui vẻ.",
    created_at: "2023-10-28T16:45:00Z"
  }
];

onMounted(() => {
  fetchReviews();
});

const fetchReviews = async () => {
  loading.value = true;
  try {
    await new Promise(r => setTimeout(r, 600));
    reviews.value = [...mockReviews];
  } catch (e) {
    ui.pushToast({ type: 'error', message: 'Lỗi tải đánh giá' });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    productId: '',
    userId: '',
    author: '',
    rating: '',
    replyStatus: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortDir: 'desc'
  };
};

const filteredReviews = computed(() => {
  let data = [...reviews.value];

  // Search
  if (filters.value.search.trim()) {
    const s = filters.value.search.toLowerCase().trim();
    data = data.filter(r =>
      (r.comment || '').toLowerCase().includes(s) ||
      (r.product_name || '').toLowerCase().includes(s) ||
      (r.author || '').toLowerCase().includes(s)
    );
  }

  // Product ID
  if (filters.value.productId) {
    data = data.filter(r => String(r.product_id) === String(filters.value.productId));
  }

  // User ID
  if (filters.value.userId) {
    data = data.filter(r => String(r.user_id) === String(filters.value.userId));
  }

  // Author
  if (filters.value.author.trim()) {
    const a = filters.value.author.toLowerCase().trim();
    data = data.filter(r => (r.author || '').toLowerCase().includes(a));
  }

  // Rating
  if (filters.value.rating) {
    data = data.filter(r => r.rating === Number(filters.value.rating));
  }

  // Reply Status
  if (filters.value.replyStatus === 'replied') {
    data = data.filter(r => !!r.admin_reply);
  } else if (filters.value.replyStatus === 'unreplied') {
    data = data.filter(r => !r.admin_reply);
  }

  // Date range
  if (filters.value.dateFrom) {
    const from = new Date(filters.value.dateFrom);
    data = data.filter(r => new Date(r.created_at) >= from);
  }
  if (filters.value.dateTo) {
    const to = new Date(filters.value.dateTo);
    to.setHours(23, 59, 59, 999); // inclusive end of day
    data = data.filter(r => new Date(r.created_at) <= to);
  }

  // Sort
  data.sort((a, b) => {
    let valA = a[filters.value.sortBy];
    let valB = b[filters.value.sortBy];
    if (filters.value.sortBy === 'created_at') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA < valB) return filters.value.sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return filters.value.sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return data;
});

const openReplyModal = (review) => {
  selectedReview.value = review;
  replyText.value = review.admin_reply || '';
  showReplyModal.value = true;
};

const submitReply = async () => {
  if (!replyText.value.trim()) return;
  isSubmitting.value = true;
  try {
    await new Promise(r => setTimeout(r, 500));
    const idx = reviews.value.findIndex(r => r.id === selectedReview.value.id);
    if (idx !== -1) {
      reviews.value[idx].admin_reply = replyText.value.trim();
    }
    ui.pushToast({ type: 'success', message: 'Đã gửi phản hồi' });
    showReplyModal.value = false;
  } catch (e) {
    ui.pushToast({ type: 'error', message: 'Lỗi gửi phản hồi' });
  } finally {
    isSubmitting.value = false;
  }
};

const deleteReview = async (id) => {
  if (!confirm('Xác nhận xóa đánh giá này?')) return;
  try {
    await new Promise(r => setTimeout(r, 400));
    reviews.value = reviews.value.filter(r => r.id !== id);
    ui.pushToast({ type: 'success', message: 'Đã xóa đánh giá' });
  } catch (e) {
    ui.pushToast({ type: 'error', message: 'Lỗi xóa' });
  }
};

const formatDate = (d) => new Date(d).toLocaleString('vi-VN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
});

const goBack = () => router.back();
</script>