<template>
  <div class="flex h-[calc(100vh-100px)] overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
    
    <div class="w-[340px] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
      <div class="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h2 class="text-xl font-black text-gray-900 dark:text-white">Trung tâm Hỗ trợ</h2>
      </div>

      <div class="px-3 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 z-10 overflow-x-auto custom-scrollbar-hide">
        <div class="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg min-w-max">
          <button v-for="tab in filterTabs" :key="tab.value" @click="changeFilter(tab.value)"
            :class="['px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap', 
              currentFilter === tab.value ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700']">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="tickets.length === 0" class="p-8 text-center text-gray-400 text-sm italic">Không có cuộc hội thoại nào...</div>
        <div v-else v-for="ticket in tickets" :key="ticket._id" @click="selectTicket(ticket._id)"
          :class="['p-4 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800', 
                   currentTicketId === ticket._id ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-600' : '']">
          <div class="flex justify-between items-start mb-1">
            <span class="font-bold text-gray-900 dark:text-white truncate pr-2">{{ ticket.customer_name || 'Khách ẩn danh' }}</span>
            <span class="text-[10px] text-gray-400 flex-shrink-0">{{ formatTime(ticket.last_message_at) }}</span>
          </div>
          <p class="text-xs text-gray-500 truncate mb-2">{{ ticket.subject || 'Cần hỗ trợ tư vấn...' }}</p>
          <div class="flex justify-between items-center">
            <span :class="getStatusColor(ticket.status)" class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {{ getStatusLabel(ticket.status) }}
            </span>
            <div v-if="ticket.unread_count_staff > 0" class="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded-full font-bold shadow-sm animate-pulse">
              {{ ticket.unread_count_staff }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
      <template v-if="currentTicketId">
        <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm z-10">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg uppercase shadow-inner">
              {{ (currentTicketInfo?.customer_name || 'C').charAt(0) }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-sm">Đang chat: {{ currentTicketInfo?.customer_name }}</h3>
              <p class="text-xs text-green-500 font-medium flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Trực tuyến
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button v-if="['open', 'in_progress'].includes(currentTicketInfo?.status)" @click="handleStatusChange('resolved')"
              class="px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg text-sm font-semibold transition-all flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Giải quyết
            </button>

            <button v-if="currentTicketInfo?.status !== 'closed'" @click="handleStatusChange('closed')"
              class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-semibold transition-all flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Kết thúc
            </button>
          </div>
        </div>

        <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900 custom-scrollbar">
          <div v-for="(msg, index) in messages" :key="index" :class="['flex', msg.isStaff ? 'justify-end' : 'justify-start']">
            <div :class="['max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm opacity-100', 
                          msg.isStaff ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-md']">
              <p class="leading-relaxed whitespace-pre-wrap">{{ msg.text }}</p>
              <span :class="['text-[9px] mt-1 block font-medium opacity-60', msg.isStaff ? 'text-right' : '']">
                {{ formatTime(msg.time) }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <form v-if="currentTicketInfo?.status !== 'closed'" @submit.prevent="handleSend" class="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-1.5">
            <input v-model="newMessage" placeholder="Nhập câu trả lời..." class="flex-1 bg-transparent border-none outline-none text-sm py-2 dark:text-white" autocomplete="off" />
            
            <button type="submit" :disabled="!newMessage.trim()" class="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-30 transition-all">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
          <div v-else class="text-center py-2.5 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 uppercase tracking-widest">
             🔒 Phiên hỗ trợ này đã kết thúc
          </div>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { chatService } from '@/utils/chatService';
import { socketService } from '@/utils/socketService';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const tickets = ref([]);
const messages = ref([]);
const currentTicketId = ref(null);
const newMessage = ref('');
const chatContainer = ref(null);
const currentFilter = ref('open'); 

const filterTabs = [
  { label: 'Mới', value: 'open' },
  { label: 'Đang làm', value: 'in_progress' },
  { label: 'Xong', value: 'resolved' },
  { label: 'Đóng', value: 'closed' },
  { label: 'Tất cả', value: 'all' }
];

const currentTicketInfo = computed(() => tickets.value.find(t => t._id === currentTicketId.value));

const scrollToBottom = () => nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight; });
const formatTime = (t) => t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

const getStatusLabel = (s) => ({ open: 'Mới', in_progress: 'Đang làm', resolved: 'Xong', closed: 'Đóng' }[s] || s);
const getStatusColor = (s) => {
  const map = {
    open: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    resolved: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    closed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  };
  return map[s] || map.open;
};

const changeFilter = (val) => { currentFilter.value = val; loadTickets(); };

const loadTickets = async () => {
  try {
    const q = currentFilter.value === 'all' ? {} : { status: currentFilter.value };
    const res = await chatService.getTickets(q);
    tickets.value = res.data.data || [];
  } catch (err) { console.error('Lỗi tải ticket:', err); }
};

const selectTicket = async (id) => {
  currentTicketId.value = id;
  try {
    const res = await chatService.getTicketDetail(id);
    messages.value = res.data.data.messages.map(m => ({ 
      text: m.content, 
      time: m.created_at, 
      isStaff: m.sender_type !== 'customer' 
    }));
    await chatService.markAsRead(id, 'staff');
    if(currentTicketInfo.value) currentTicketInfo.value.unread_count_staff = 0;
    socketService.joinRoom(id);
    scrollToBottom();
  } catch (err) { console.error('Lỗi tải tin nhắn:', err); }
};

// Đổi trạng thái (Resolved / Closed)
const handleStatusChange = async (newStatus) => {
  const confirmMsg = newStatus === 'closed' ? 'Bạn chắc chắn muốn kết thúc?' : 'Đánh dấu đơn này đã giải quyết?';
  if (!confirm(confirmMsg)) return;
  try {
    await chatService.updateTicketStatus(currentTicketId.value, { status: newStatus });
    if(currentTicketInfo.value) currentTicketInfo.value.status = newStatus;
    loadTickets(); // Refresh lại danh sách để nhảy sang tab tương ứng
  } catch (err) { console.error('Lỗi đổi trạng thái:', err); }
};

const handleSend = async () => {
  if (!newMessage.value.trim() || !currentTicketId.value) return;
  const content = newMessage.value;
  const oldStatus = currentTicketInfo.value?.status;
  newMessage.value = '';
  try {
    await chatService.sendMessage(currentTicketId.value, { 
      content, sender_type: 'staff', sender_id: userStore.profile?.id || 999 
    });
    // Tự động nhảy sang 'in_progress' nếu đang là 'open'
    if(oldStatus === 'open' && currentTicketInfo.value) {
      currentTicketInfo.value.status = 'in_progress';
      loadTickets(); // Tải lại để Sidebar cập nhật tab
    }
  } catch (err) { console.error('Lỗi gửi tin nhắn:', err); }
};

onMounted(() => {
  loadTickets();
  socketService.connect();
  socketService.onMessageReceived((newMsg) => {
    if (newMsg.ticket_id === currentTicketId.value) {
      messages.value.push({ text: newMsg.content, time: newMsg.created_at, isStaff: newMsg.sender_type !== 'customer' });
      scrollToBottom();
    }
  });
  // Nhận tín hiệu toàn cục để reload sidebar khi có tin nhắn mới hoặc đổi status
  socketService.onGlobalUpdate(() => loadTickets());
});

onUnmounted(() => socketService.disconnect());
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
.custom-scrollbar-hide::-webkit-scrollbar { display: none; }
.custom-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>