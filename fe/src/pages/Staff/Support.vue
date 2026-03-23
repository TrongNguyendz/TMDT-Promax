<!-- views/staff/Support.vue -->
<template>
  <div class="space-y-6">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Hỗ trợ khách hàng</h1>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-[calc(100vh-180px)] flex flex-col lg:flex-row">
      
      <!-- Left Sidebar: Danh sách cuộc hội thoại -->
      <div class="w-full lg:w-80 lg:border-r dark:border-gray-800 flex flex-col">
        <!-- Header + Search -->
        <div class="p-4 border-b dark:border-gray-800 space-y-3">
          <h2 class="text-lg font-bold">Cuộc hội thoại</h2>
          <input 
            v-model="searchQuery"
            placeholder="Tìm kiếm khách hàng hoặc tin nhắn..." 
            class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <!-- Danh sách -->
        <div class="flex-1 overflow-y-auto">
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation.id"
            @click="selectConversation(conversation)"
            class="relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition flex items-start gap-3"
            :class="{ 'bg-teal-50 dark:bg-teal-900/20': selectedConversation?.id === conversation.id }"
          >
            <div class="flex-shrink-0 relative">
              <div class="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                {{ conversation.customer.charAt(0).toUpperCase() }}
              </div>
              <!-- Unread badge -->
              <span 
                v-if="getUnreadCount(conversation) > 0"
                class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900"
              >
                {{ getUnreadCount(conversation) }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <p class="font-semibold truncate">{{ conversation.customer }}</p>
                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ formatTime(conversation.lastMessageTime) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                {{ conversation.lastMessage }}
              </p>
            </div>
          </div>

          <!-- No results -->
          <div v-if="filteredConversations.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
            Không tìm thấy cuộc hội thoại nào
          </div>
        </div>
      </div>

      <!-- Right Panel: Chat Area -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedConversation" class="flex flex-col h-full">
          <!-- Chat Header -->
          <div class="p-4 border-b dark:border-gray-800 flex items-center gap-3 bg-gray-50 dark:bg-gray-800">
            <div class="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
              {{ selectedConversation.customer.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold">{{ selectedConversation.customer }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Đang hoạt động</p>
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
              :class="msg.isStaff ? 'justify-end' : 'justify-start'"
              class="flex"
            >
              <div 
                :class="[
                  msg.isStaff 
                    ? 'bg-teal-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'
                ]"
                class="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm"
              >
                <p class="break-words leading-relaxed">{{ msg.text }}</p>
                <p class="text-xs mt-1 opacity-70 text-right">
                  {{ formatTime(msg.time) }}
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

          <!-- Input area -->
          <div class="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
            <div class="flex gap-3">
              <input 
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Nhập tin nhắn..." 
                class="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button 
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                class="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>

        <!-- Placeholder khi chưa chọn -->
        <div v-else class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-950/50">
          <div class="text-center p-6">
            <svg class="w-20 h-20 mx-auto mb-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-xl font-medium">Chọn một cuộc hội thoại để bắt đầu trò chuyện</p>
            <p class="mt-2 text-sm">Tất cả tin nhắn sẽ được lưu và đồng bộ</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3007/api/support'; // hoặc import từ env nếu cần

const searchQuery = ref('');
const selectedConversation = ref(null);
const newMessage = ref('');
const isTyping = ref(false);
const chatContainer = ref(null);
const loading = ref(false);
const error = ref(null);

// Danh sách ticket từ backend
const conversations = ref([]);

// Tìm kiếm client-side
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value;
  const q = searchQuery.value.toLowerCase();
  return conversations.value.filter(c => 
    (c.user_name?.toLowerCase().includes(q) || '') ||
    (c.subject?.toLowerCase().includes(q)) ||
    (c.last_message_content?.toLowerCase().includes(q))
  );
});

// Lấy unread count từ trường unread_count_staff (hoặc tính từ messages)
function getUnreadCount(conv) {
  return conv.unread_count_staff || 0;
  // Nếu muốn tính thủ công: conv.messages?.filter(m => m.sender_type === 'customer' && !m.is_read).length || 0
}

// Format tên khách + avatar
function getCustomerName(ticket) {
  return ticket.user_name || ticket.guest_name || `Khách ${ticket.user_id || ticket._id.slice(-6)}`;
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// Lấy danh sách ticket
async function fetchTickets() {
  try {
    loading.value = true;
    const res = await axios.get(`${API_BASE}/tickets`, {
      params: {
        page: 1,
        limit: 50,          // có thể tăng lên nếu cần
        status: 'open',     // chỉ lấy ticket đang mở (tùy bạn)
      }
    });
    
    // Chuẩn hóa dữ liệu giống cấu trúc cũ một chút
    conversations.value = res.data.data.map(ticket => ({
      id: ticket._id,
      customer: getCustomerName(ticket),
      lastMessage: ticket.last_message_content || ticket.subject || '',
      lastMessageTime: ticket.last_message_at,
      unread_count_staff: ticket.unread_count_staff || 0,
      // sẽ load messages sau khi chọn
      messages: []
    }));
  } catch (err) {
    console.error('Lỗi load tickets:', err);
    error.value = 'Không tải được danh sách hội thoại';
  } finally {
    loading.value = false;
  }
}

// Chọn ticket → load messages
async function selectConversation(conv) {
  selectedConversation.value = conv;
  
  try {
    const res = await axios.get(`${API_BASE}/tickets/${conv.id}`);
    const { ticket, messages } = res.data.data;

    // Cập nhật thông tin ticket nếu cần
    conv.customer = getCustomerName(ticket);
    conv.lastMessageTime = ticket.last_message_at;

    // Chuẩn hóa messages cho frontend
    conv.messages = messages.map(msg => ({
      text: msg.content,
      time: msg.created_at,
      isStaff: msg.sender_type === 'staff',
      isRead: msg.is_read
    }));

    // Đánh dấu đã đọc
    await axios.put(`${API_BASE}/tickets/${conv.id}/mark-read`);

    nextTick(() => scrollToBottom());
  } catch (err) {
    console.error('Lỗi load messages:', err);
  }
}

// Gửi tin nhắn thật
async function sendMessage() {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  const tempMsg = {
    text: newMessage.value.trim(),
    time: new Date(),
    isStaff: true,
    isRead: true
  };

  // Hiển thị tạm trước (optimistic UI)
  selectedConversation.value.messages.push(tempMsg);
  selectedConversation.value.lastMessage = tempMsg.text;
  selectedConversation.value.lastMessageTime = new Date();
  nextTick(scrollToBottom);

  try {
    await axios.post(`${API_BASE}/tickets/${selectedConversation.value.id}/messages`, {
      sender_type: 'staff',
      sender_id: 2001,           // ← thay bằng staff id thật (từ store/auth)
      content: newMessage.value.trim(),
      message_type: 'text'
    });

    newMessage.value = '';
  } catch (err) {
    console.error('Lỗi gửi tin nhắn:', err);
    // Có thể rollback hoặc thông báo lỗi
  }
}

// Scroll xuống dưới
function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

// Khởi tạo
onMounted(() => {
  fetchTickets();
  // Tự động chọn ticket đầu tiên nếu có
  watch(conversations, () => {
    if (conversations.value.length > 0 && !selectedConversation.value) {
      selectConversation(conversations.value[0]);
    }
  }, { immediate: true });
});
</script>