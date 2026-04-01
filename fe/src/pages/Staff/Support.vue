<template>
  <div class="flex h-[calc(100vh-100px)] overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
    
    <div class="w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      <div class="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-xl font-black text-gray-900 dark:text-white">Hỗ trợ khách hàng</h2>
        <div class="mt-4 relative">
          <input type="text" placeholder="Tìm kiếm khách hàng..." class="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
          <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div 
          v-for="ticket in tickets" :key="ticket._id"
          @click="selectTicket(ticket._id)"
          :class="['p-4 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800', 
                   currentTicketId === ticket._id ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-600' : '']"
        >
          <div class="flex justify-between items-start mb-1">
            <span class="font-bold text-gray-900 dark:text-white">Khách hàng #{{ ticket.user_id || 'Guest' }}</span>
            <span class="text-[10px] text-gray-400">{{ formatTime(ticket.last_message_at) }}</span>
          </div>
          <p class="text-xs text-gray-500 truncate">{{ ticket.subject || 'Cần hỗ trợ tư vấn...' }}</p>
          <div v-if="ticket.unread_count_staff > 0" class="mt-2 inline-block px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded-full font-bold">
            {{ ticket.unread_count_staff }} tin mới
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col bg-white dark:bg-gray-900">
      <template v-if="currentTicketId">
        <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm z-10">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">C</div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-sm">Đang chat với: Khách hàng #{{ currentTicketId.slice(-5) }}</h3>
              <p class="text-xs text-green-500 font-medium">Trực tuyến</p>
            </div>
          </div>
        </div>

        <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900 custom-scrollbar">
          <div v-for="(msg, index) in messages" :key="index" :class="['flex', msg.isStaff ? 'justify-end' : 'justify-start']">
            <div :class="['max-w-[70%] px-5 py-3 rounded-2xl shadow-sm text-sm', 
                          msg.isStaff ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-none']">
              <p class="leading-relaxed whitespace-pre-wrap">{{ msg.text }}</p>
              <span :class="['text-[9px] mt-1 block font-medium', msg.isStaff ? 'text-blue-200 text-right' : 'text-gray-400']">{{ formatTime(msg.time) }}</span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <form @submit.prevent="handleSend" class="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
            <input v-model="newMessage" placeholder="Nhập câu trả lời..." class="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-white" autocomplete="off" />
            <button type="submit" :disabled="!newMessage.trim()" class="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              <svg class="h-5 w-5 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      </template>

      <div v-else class="flex-1 flex flex-col justify-center items-center text-gray-400 bg-gray-50/30 dark:bg-gray-900/50">
        <svg class="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        <p class="font-medium text-gray-500">Chọn một khách hàng để bắt đầu tư vấn</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { chatService } from '@/utils/chatService';
import { socketService } from '@/utils/socketService';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const tickets = ref([]);
const messages = ref([]);
const currentTicketId = ref(null);
const newMessage = ref('');
const chatContainer = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  });
};

const formatTime = (t) => t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

// 1. Tải danh sách khách hàng đang chờ
const loadTickets = async () => {
  try {
    const res = await chatService.getTickets({ status: 'open' });
    tickets.value = res.data.data || [];
  } catch (err) { 
    console.error("Lỗi tải danh sách Ticket:", err); 
  }
};

// 2. Chọn một khách hàng để chat
const selectTicket = async (id) => {
  currentTicketId.value = id;
  try {
    const res = await chatService.getTicketDetail(id);
    
    // Map dữ liệu chuẩn cho Frontend Vue hiểu (có text, isStaff)
    messages.value = res.data.data.messages.map(m => ({
      text: m.content,
      time: m.created_at,
      isStaff: m.sender_type !== 'customer'
    }));

    // Đánh dấu đã đọc
    await chatService.markAsRead(id, 'staff');
    
    // Tắt thông báo unread trên UI
    const ticket = tickets.value.find(t => t._id === id);
    if(ticket) ticket.unread_count_staff = 0;

    // Vào phòng socket CỦA KHÁCH HÀNG ĐÓ
    socketService.joinRoom(id);
    scrollToBottom();
  } catch (err) { 
    console.error("Lỗi lấy chi tiết Ticket:", err); 
  }
};

// 3. Gửi tin nhắn trả lời
const handleSend = async () => {
  if (!newMessage.value.trim() || !currentTicketId.value) return;
  const content = newMessage.value;
  newMessage.value = '';

  try {
    // API Lưu tin nhắn. Khi lưu xong Backend sẽ tự emit Socket lại
    await chatService.sendMessage(currentTicketId.value, {
      content,
      sender_type: 'staff',
      sender_id: userStore.profile?.id || 999
    });
  } catch (err) { 
    console.error("Lỗi gửi tin nhắn:", err); 
  }
};

// 4. Khởi tạo & Lắng nghe Real-time
onMounted(() => {
  loadTickets();
  socketService.connect();
  
  // Hứng tin nhắn mới từ Socket
  socketService.onMessageReceived((newMsg) => {
    console.log("📩 Admin nhận được tin nhắn Socket:", newMsg);

    // Nếu tin nhắn thuộc về khách hàng đang mở trên màn hình -> Hiện chữ lên ngay
    if (newMsg.ticket_id === currentTicketId.value) {
      messages.value.push({
        text: newMsg.content,  // Ép kiểu `content` thành `text` (CHÌA KHÓA SỬA LỖI TRỐNG BOX)
        time: newMsg.created_at || new Date(),
        isStaff: newMsg.sender_type !== 'customer' // Staff thì màu xanh bên phải
      });
      scrollToBottom();
    } else {
      // Nếu tin nhắn của khách khác -> Gọi lại API để cập nhật cái chấm đỏ (unread) bên sidebar
      loadTickets();
    }
  });
});

onUnmounted(() => {
  socketService.disconnect();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
</style>