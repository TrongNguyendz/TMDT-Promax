<!-- views/admin/AdminChat.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
        Quản lý Tin nhắn & Hỗ trợ
      </h1>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium">
          Gửi thông báo hàng loạt
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-[calc(100vh-180px)] flex flex-col lg:flex-row">
      
      <!-- Left Sidebar: Danh sách cuộc hội thoại -->
      <div class="w-full lg:w-96 lg:border-r dark:border-gray-800 flex flex-col">
        <!-- Header + Search + Filter -->
        <div class="p-4 border-b dark:border-gray-800 space-y-3">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold flex-1">Cuộc hội thoại</h2>
            <select v-model="priorityFilter" class="text-xs border rounded-lg px-2 py-1 dark:bg-gray-800">
              <option value="">Tất cả mức độ</option>
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          <input 
            v-model="searchQuery"
            placeholder="Tìm theo tên, đơn hàng, nội dung..." 
            class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Danh sách -->
        <div class="flex-1 overflow-y-auto">
          <div 
            v-for="conv in filteredConversations" 
            :key="conv.id"
            @click="selectConversation(conv)"
            class="relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition flex items-start gap-3"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20': selectedConversation?.id === conv.id }"
          >
            <div class="flex-shrink-0 relative">
              <div class="h-12 w-12 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
                {{ conv.customer.charAt(0).toUpperCase() }}
              </div>
              <!-- Unread badge -->
              <span 
                v-if="getUnreadCount(conv) > 0"
                class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900"
              >
                {{ getUnreadCount(conv) }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <p class="font-semibold truncate">{{ conv.customer }}</p>
                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ formatTime(conv.lastMessageTime) }}
                </span>
              </div>

              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  {{ conv.role || 'Khách thường' }}
                </span>
                <span 
                  v-if="conv.priority === 'high'" 
                  class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                >
                  Cao
                </span>
                <span v-if="conv.orderId" class="text-xs text-indigo-600 dark:text-indigo-400">
                  #{{ conv.orderId }}
                </span>
              </div>

              <p class="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                {{ conv.lastMessage }}
              </p>
            </div>
          </div>

          <div v-if="filteredConversations.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
            Không tìm thấy cuộc hội thoại nào
          </div>
        </div>
      </div>

      <!-- Right Panel: Chat Area -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedConversation" class="flex flex-col h-full">
          <!-- Chat Header – Admin version -->
          <div class="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {{ selectedConversation.customer.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold">{{ selectedConversation.customer }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ selectedConversation.role || 'Khách hàng' }} • 
                  <span v-if="selectedConversation.lastActive">Hoạt động {{ formatTime(selectedConversation.lastActive) }}</span>
                </p>
              </div>
            </div>

            <div class="flex gap-2">
              <button class="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Xem đơn hàng
              </button>
              <button class="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Chuyển tiếp
              </button>
              <button class="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">
                Ban tài khoản
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div 
            ref="chatContainer"
            class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950/50"
          >
            <div 
              v-for="(msg, index) in selectedConversation.messages" 
              :key="index"
              :class="msg.isAdmin ? 'justify-end' : 'justify-start'"
              class="flex"
            >
              <div 
                :class="[
                  msg.isAdmin 
                    ? 'bg-indigo-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'
                ]"
                class="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm"
              >
                <p class="break-words leading-relaxed">{{ msg.text }}</p>
                <p class="text-xs mt-1 opacity-70 text-right">
                  {{ formatTime(msg.time) }}
                  <span v-if="msg.isAdmin" class="ml-1 opacity-60">(Admin)</span>
                </p>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-gray-200 dark:bg-gray-700 px-5 py-3 rounded-2xl shadow-sm">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-500" style="animation-delay: 0s"></div>
                  <div class="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-500" style="animation-delay: 0.2s"></div>
                  <div class="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-500" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input area – Admin có thêm nút gửi nhanh / template -->
          <div class="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
            <div class="flex gap-3">
              <input 
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Nhập tin nhắn trả lời..." 
                class="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi
              </button>
            </div>
            <div class="mt-2 text-xs text-gray-500 flex gap-3">
              <button class="hover:text-indigo-600">Gửi template xin lỗi</button>
              <button class="hover:text-indigo-600">Gửi thông tin chuyển khoản</button>
              <button class="hover:text-indigo-600">Gửi mã giảm giá</button>
            </div>
          </div>
        </div>

        <!-- Placeholder -->
        <div v-else class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-950/50">
          <div class="text-center p-8">
            <svg class="w-24 h-24 mx-auto mb-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <p class="text-xl font-medium">Chọn một cuộc hội thoại để xem và trả lời</p>
            <p class="mt-2 text-sm">Bạn có thể quản lý, chuyển tiếp hoặc thực hiện hành động với tài khoản</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3007/api/support';

const searchQuery = ref('');
const priorityFilter = ref('');
const selectedConversation = ref(null);
const newMessage = ref('');
const loading = ref(false);

const conversations = ref([]);

const filteredConversations = computed(() => {
  let list = conversations.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c =>
      (c.customer?.toLowerCase().includes(q) || false) ||
      (c.lastMessage?.toLowerCase().includes(q) || false) ||
      (c.orderId && String(c.orderId).includes(q))
    );
  }

  if (priorityFilter.value) {
    list = list.filter(c => c.priority === priorityFilter.value);
  }

  return list;
});

async function fetchTickets() {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/tickets`, {
      params: {
        status: 'open',       // chỉ lấy ticket đang mở
        limit: 100,
        // staffId: currentStaffId,  // nếu muốn lọc ticket được assign cho mình
      }
    });

    conversations.value = res.data.data.map(t => ({
      id: t._id,
      customer: t.guest_name || t.user_name || `Khách ${t.user_id || t._id.slice(-6)}`,
      role: t.user_id ? 'Đăng ký' : 'Khách vãng lai',   // có thể cải thiện sau
      priority: t.priority,
      orderId: t.order_id,
      lastMessage: t.last_message_content || t.subject || '(chưa có tin nhắn)',
      lastMessageTime: t.last_message_at,
      lastActive: t.updated_at,
      unread_count_staff: t.unread_count_staff || 0,
      messages: []   // load sau khi chọn
    }));
  } catch (err) {
    console.error('Load tickets lỗi:', err);
  } finally {
    loading.value = false;
  }
}

async function selectConversation(conv) {
  selectedConversation.value = conv;

  try {
    const res = await axios.get(`${API_BASE}/tickets/${conv.id}`);
    const { ticket, messages: apiMsgs } = res.data.data;

    // Cập nhật thông tin
    conv.customer = ticket.guest_name || ticket.user_name || conv.customer;
    conv.priority = ticket.priority;
    conv.orderId = ticket.order_id;
    conv.lastMessageTime = ticket.last_message_at;

    conv.messages = apiMsgs.map(m => ({
      text: m.content,
      time: m.created_at,
      isAdmin: m.sender_type === 'staff',   // hoặc isStaff
      isRead: m.is_read
    }));

    // Đánh dấu đã đọc
    await axios.put(`${API_BASE}/tickets/${conv.id}/mark-read`);

    nextTick(scrollToBottom);
  } catch (err) {
    console.error('Load chat lỗi:', err);
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  const msgText = newMessage.value.trim();

  // Optimistic
  const optimisticMsg = {
    text: msgText,
    time: new Date().toISOString(),
    isAdmin: true,
    isRead: true
  };
  selectedConversation.value.messages.push(optimisticMsg);
  selectedConversation.value.lastMessage = msgText;
  selectedConversation.value.lastMessageTime = new Date();
  scrollToBottom();

  newMessage.value = '';

  try {
    await axios.post(`${API_BASE}/tickets/${selectedConversation.value.id}/messages`, {
      sender_type: 'staff',
      sender_id: 2001,          // ← thay bằng staff id thật từ auth store
      content: msgText,
      message_type: 'text'
    });
  } catch (err) {
    console.error('Gửi tin lỗi:', err);
    // Có thể xóa optimistic message hoặc hiện thông báo
  }
}

function getUnreadCount(conv) {
  return conv.unread_count_staff || 0;
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function scrollToBottom() {
  // giả sử bạn thêm ref="chatContainer" vào div messages
  // code giống các file trước
}

onMounted(() => {
  fetchTickets();
});
</script>

<style scoped>
/* Có thể thêm style riêng cho admin nếu muốn */
</style>