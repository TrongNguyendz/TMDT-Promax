<template>
  <div class="space-y-10 pb-10">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Phản hồi Khách hàng
        </h1>
        <p class="mt-1 text-sm text-gray-500">Trả lời bình luận & đánh giá từ khách hàng một cách nhanh chóng</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          Chưa trả lời: <strong class="text-red-600">{{ pendingComments }}</strong>
        </span>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex flex-wrap gap-3">
        <button
          @click="filter = 'all'"
          :class="{ 'bg-gray-900 text-white dark:bg-white dark:text-black': filter === 'all', 'bg-gray-100 dark:bg-gray-800': filter !== 'all' }"
          class="rounded-xl px-5 py-2.5 text-sm font-bold transition"
        >
          Tất cả
        </button>
        <button
          @click="filter = 'pending'"
          :class="{ 'bg-gray-900 text-white dark:bg-white dark:text-black': filter === 'pending', 'bg-gray-100 dark:bg-gray-800': filter !== 'pending' }"
          class="rounded-xl px-5 py-2.5 text-sm font-bold transition"
        >
          Chưa trả lời
        </button>
        <button
          @click="filter = 'replied'"
          :class="{ 'bg-gray-900 text-white dark:bg-white dark:text-black': filter === 'replied', 'bg-gray-100 dark:bg-gray-800': filter !== 'replied' }"
          class="rounded-xl px-5 py-2.5 text-sm font-bold transition"
        >
          Đã trả lời
        </button>
      </div>

      <div class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm theo tên khách, nội dung..."
          class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-3.5 pl-11 text-sm focus:border-black dark:border-gray-700 dark:bg-gray-900"
        />
        <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Comments List -->
    <div class="space-y-6">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900"
      >
        <!-- Customer Info & Rating -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="h-14 w-14 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <img
                v-if="comment.avatar"
                :src="comment.avatar"
                alt=""
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center text-gray-500">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="font-black tracking-tight text-gray-900 dark:text-white">
                {{ comment.customer_name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ comment.platform }} • {{ formatDate(comment.created_at) }}
              </p>
              <div class="mt-1 flex items-center gap-1">
                <span v-for="n in 5" :key="n" class="text-lg" :class="n <= comment.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'">
                  ★
                </span>
              </div>
            </div>
          </div>

          <div v-if="!comment.replied_at" class="rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Chưa trả lời
          </div>
        </div>

        <!-- Comment Content -->
        <div class="mt-5 rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/50">
          <p class="text-gray-700 leading-relaxed dark:text-gray-300">
            "{{ comment.content }}"
          </p>
        </div>

        <!-- Reply Section -->
        <div class="mt-6">
          <div v-if="comment.reply" class="rounded-2xl border-l-4 border-green-500 bg-green-50/50 p-5 dark:bg-green-950/20">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Trả lời của bạn:</p>
            <p class="mt-2 text-gray-800 dark:text-gray-200">{{ comment.reply }}</p>
            <p class="mt-3 text-xs text-gray-500 dark:text-gray-500">
              {{ formatDate(comment.replied_at) }}
            </p>
          </div>

          <div v-else class="mt-4">
            <textarea
              v-model="replyInputs[comment.id]"
              rows="3"
              placeholder="Trả lời khách hàng tại đây..."
              class="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:border-black focus:ring-0 dark:border-gray-700 dark:bg-gray-900"
            ></textarea>

            <div class="mt-3 flex justify-end gap-3">
              <button
                @click="cancelReply(comment.id)"
                class="rounded-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Hủy
              </button>
              <button
                @click="submitReply(comment)"
                :disabled="!replyInputs[comment.id]?.trim()"
                class="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Gửi trả lời
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredComments.length === 0" class="rounded-[2rem] bg-gray-50 p-12 text-center dark:bg-gray-900">
        <p class="text-lg font-medium text-gray-500 dark:text-gray-400">
          Không tìm thấy bình luận nào phù hợp
        </p>
      </div>
    </div>

    <!-- Reply Preview Modal (nếu muốn preview trước khi gửi) -->
    <!-- ... có thể thêm modal xác nhận nếu cần ... -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUIStore } from '../../stores/ui'; // giả sử bạn có toast store

const ui = useUIStore();

const filter = ref('pending');
const searchQuery = ref('');
const replyInputs = ref({}); // { commentId: replyText }

const comments = ref([
  // Dữ liệu mẫu - sau này fetch từ API
  {
    id: 1,
    customer_name: 'Nguyễn Minh Anh',
    avatar: '',
    platform: 'Google Review',
    rating: 4,
    content: 'Món ăn rất ngon nhưng đợi hơi lâu một chút. Nhân viên thân thiện!',
    created_at: '2026-03-07T14:30:00',
    reply: null,
    replied_at: null,
  },
  {
    id: 2,
    customer_name: 'Trần Văn Bình',
    avatar: 'https://...',
    platform: 'Facebook',
    rating: 5,
    content: 'Rất hài lòng với dịch vụ giao hàng nhanh và đồ ăn nóng hổi!',
    created_at: '2026-03-06T09:15:00',
    reply: 'Cảm ơn anh Bình đã tin tưởng! Rất mong được phục vụ anh lần sau ạ!',
    replied_at: '2026-03-06T11:42:00',
  },
  // ...
]);

const filteredComments = computed(() => {
  let result = comments.value;

  // Lọc theo tab
  if (filter.value === 'pending') {
    result = result.filter(c => !c.replied_at);
  } else if (filter.value === 'replied') {
    result = result.filter(c => c.replied_at);
  }

  // Tìm kiếm
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c =>
      c.customer_name.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q)
    );
  }

  return result;
});

const pendingComments = computed(() =>
  comments.value.filter(c => !c.replied_at).length
);

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function submitReply(comment) {
  const replyText = replyInputs.value[comment.id]?.trim();
  if (!replyText) return;

  // Giả lập gọi API
  comment.reply = replyText;
  comment.replied_at = new Date().toISOString();

  ui.pushToast({
    type: 'success',
    message: 'Đã gửi trả lời thành công!',
  });

  // Xóa input sau khi gửi
  replyInputs.value[comment.id] = '';
}

function cancelReply(id) {
  replyInputs.value[id] = '';
}

// Fetch thật từ API
onMounted(() => {
  // fetchCommentsFromAPI();
});
</script>