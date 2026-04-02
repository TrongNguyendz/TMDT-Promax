<!-- fe/src/pages/admin/SupportManagement.vue -->
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
        <div v-if="supportStore.currentTicket" class="flex flex-col h-full">
          <!-- Chat Header – Admin version -->
          <div class="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {{ (supportStore.currentTicket.customer || 'K').charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold">{{ supportStore.currentTicket.customer }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ supportStore.currentTicket.role || 'Khách hàng' }} • 
                  <span v-if="supportStore.currentTicket.lastActive">Hoạt động {{ formatTime(supportStore.currentTicket.lastActive) }}</span>
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
              v-for="(msg, index) in supportStore.messages" 
              :key="index"
              :class="msg.isAdmin ? 'justify-end' : 'justify-start'"
              class="flex"
            >
              <div 
                :class="[
                  msg.isAdmin 
                    ? 'bg-indigo-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' // Bên phải
                    : 'bg-gray-200 text-gray-900 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'//bên trái   
                    ]"
                class="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm"
              >
                <p class="break-words leading-relaxed">{{ msg.text }}</p>
                <p class="text-xs mt-1 opacity-70 text-right">
                  {{ formatTime(msg.time) }}
                  <span v-if="msg.sender_type === 'staff'" class="ml-1 font-bold">
                    <!-- Ép kiểu string để so sánh chính xác -->
                    ({{ String(msg.sender_id) === myId ? 'Bạn' : 'Nhân viên' }})
                  </span>
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
import { ref, computed, onUnmounted, onMounted, nextTick } from 'vue';
import { io } from 'socket.io-client';
import { useUserStore } from '../../stores/user';
import { useSupportStore } from '../../stores/support';

const user = useUserStore();
const supportStore = useSupportStore();
const searchQuery = ref('');
const priorityFilter = ref('');
const newMessage = ref('');
const socket = ref(null);
const chatContainer = ref(null); 
const myId = computed(() => String(user.profile?.id || user.id)); 

const setupSocket = () => {
  socket.value = io('http://localhost:3007');
  socket.value.on('receive_message', (data) => {
    if (supportStore.currentTicket?.id === data.ticket_id && String(data.sender_id) !== myId.value) {
        if (String(data.sender_id) !== myId.value) {
      supportStore.pushNewMessage({
        text: data.text,
        time: data.time,
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        isAdmin: data.isStaff, 
        isStaff: data.isStaff
      });
      scrollToBottom();
    }
    }
  });
  socket.value.on('ticket_list_updated', (data) => {
     const conv = supportStore.tickets.find(c => c.id === data.ticket_id);
     if (conv) {
        conv.lastMessage = data.last_message;
        conv.lastMessageTime = data.last_message_at;
        if (String(data.sender_id) !== myId.value && supportStore.currentTicket?.id !== data.ticket_id) {
           conv.unread_count_staff++;
        }
        supportStore.tickets.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
     } else { supportStore.fetchAllTickets(); }
  });
};

const filteredConversations = computed(() => {
  return (supportStore.tickets || []).filter(c => 
    (!priorityFilter.value || c.priority === priorityFilter.value) &&
    (!searchQuery.value || c.customer.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

const selectConversation = async (conv) => {
  if (!conv?.id) return;
  socket.value?.emit('join_ticket', conv.id);
  await supportStore.fetchTicketDetails(conv.id);
  await supportStore.markAsRead(conv.id);
  scrollToBottom();
};

const sendMessage = async () => {
  const ticketId = supportStore.currentTicket?.id;
  if (!newMessage.value.trim() || !ticketId) return;
  const txt = newMessage.value.trim();
  supportStore.pushNewMessage({ 
      text: txt, time: new Date().toISOString(), 
      sender_id: myId.value, isStaff: true,
      isAdmin: true, sender_type: 'staff' 
  });
  scrollToBottom();
  newMessage.value = '';
  await supportStore.sendChatMessage(ticketId, { sender_type: 'staff', sender_id: myId.value, content: txt });
};

const scrollToBottom = () => nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight; });
const formatTime = (t) => t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
const getUnreadCount = (c) => c.unread_count_staff || 0;

onMounted(() => { supportStore.fetchAllTickets(); setupSocket(); });
onUnmounted(() => socket.value?.disconnect());
</script>


<style scoped>
/* Có thể thêm style riêng cho admin nếu muốn */
</style>