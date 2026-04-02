<!-- fe/src/pages/customer/support.vue -->
<template>
  <section class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <div class="mb-8">
      <h1 class="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Hỗ trợ trực tuyến</h1>
      <p class="mt-2 text-gray-500">Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
    </div>

    <div class="flex h-[600px] flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      
      <div class="flex items-center gap-4 border-b border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-800/30">
        <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900"></span>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Chăm sóc khách hàng</h2>
          <p class="text-sm font-medium text-green-500">Đang hoạt động</p>
        </div>
      </div>

      <div 
        ref="chatContainer"
        class="flex-1 space-y-6 overflow-y-auto p-6 scroll-smooth"
      >
        <div class="text-center">
          <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Hôm nay
          </span>
        </div>

        <div 
          v-for="(msg, index) in supportStore.messages" 
          :key="index"
          :class="['flex', !msg.isStaff ? 'justify-end' : 'justify-start']"
        >
          <div v-if="msg.isStaff" class="mr-3 mt-auto hidden shrink-0 sm:block">
             <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
               <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
             </div>
          </div>

          <div 
            :class="[
              'max-w-[85%] px-5 py-3.5 text-sm sm:max-w-[75%] sm:text-base',
              !msg.isStaff 
                ? 'rounded-2xl rounded-br-sm bg-blue-600 text-white shadow-md' 
                : 'rounded-2xl rounded-bl-sm border border-gray-100 bg-gray-50 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            ]"
          >
            <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>
            <p 
              :class="['mt-1.5 text-[10px] font-medium tracking-wider', !msg.isStaff ? 'text-blue-200 text-right' : 'text-gray-400']"
            >
              {{ formatTime(msg.time) }}
            </p>
          </div>
        </div>

        <div v-if="isTyping" class="flex justify-start">
          <div class="mr-3 mt-auto hidden shrink-0 sm:block">
             <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
             </div>
          </div>
          <div class="rounded-2xl rounded-bl-sm border border-gray-100 bg-gray-50 px-5 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="flex items-center gap-1.5">
              <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 0s"></div>
              <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 0.2s"></div>
              <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <form @submit.prevent="sendMessage" class="flex items-end gap-3 rounded-2xl bg-gray-50 p-2 dark:bg-gray-800">
          <input 
            v-model="newMessage"
            type="text"
            placeholder="Nhập tin nhắn của bạn..." 
            class="w-full bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
            autocomplete="off"
          />
          <button 
            type="submit"
            :disabled="!newMessage.trim() || isTyping"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:hover:shadow-none dark:focus:ring-blue-900"
          >
            <svg class="h-5 w-5 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserStore } from '../../stores/user';
import { useSupportStore } from '../../stores/support';
import { io } from 'socket.io-client';

const user = useUserStore();
const supportStore = useSupportStore();
const chatContainer = ref(null);
const newMessage = ref('');
const socket = ref(null);
const isTyping = ref(false);
const scrollToBottom = () => {
  nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight; });
};

const setupSocket = (ticketId) => {
  if (!ticketId || socket.value) return;
  socket.value = io('http://localhost:3007');
  socket.value.emit('join_ticket', ticketId);
  socket.value.on('receive_message', (data) => {
    if (data.isStaff) {
      supportStore.pushNewMessage({ text: data.text, time: data.time, isStaff: true });
      scrollToBottom();
    }
  });
};

const initChat = async () => {
  let ticketId = localStorage.getItem('support_ticket_id');
  const userId = user.profile?.id;

  if (ticketId && ticketId !== 'undefined') {
    try {
      const data = await supportStore.fetchTicketDetails(ticketId);
      if (data?.ticket.status === 'open' && String(data.ticket.user_id || '') === String(userId || '')) {
        setupSocket(ticketId);
        scrollToBottom();
        return;
      }
    } catch { localStorage.removeItem('support_ticket_id'); }
  }

  if (userId) {
    const active = await supportStore.fetchMyActiveTicket(userId);
    if (active) {
      ticketId = active._id;
      await supportStore.fetchTicketDetails(ticketId);
      localStorage.setItem('support_ticket_id', ticketId);
      setupSocket(ticketId);
      scrollToBottom();
      return;
    }
  }

  try {
    const res = await supportStore.createNewTicket({
      user_id: userId ? String(userId) : null,
      user_name: user.profile?.username || 'Khách vãng lai',
      subject: 'Hỗ trợ khách hàng'
    });
    const newTicket = res.data.data;
    ticketId = newTicket._id;
    supportStore.currentTicket = { ...newTicket, id: newTicket._id };
    supportStore.messages = [];
    localStorage.setItem('support_ticket_id', ticketId);
    setupSocket(ticketId);
  } catch {}
};

const sendMessage = async () => {
  const ticketId = supportStore.currentTicket?.id || supportStore.currentTicket?._id;
  if (!newMessage.value.trim() || !ticketId) return;

  const msgText = newMessage.value.trim();
  supportStore.pushNewMessage({ text: msgText, time: new Date().toISOString(), isStaff: false });
  scrollToBottom();
  newMessage.value = '';

  try {
    await supportStore.sendChatMessage(ticketId, {
      sender_type: 'customer',
      sender_id: String(user.profile?.id || 0),
      content: msgText
    });
  } catch {}
};

onMounted(() => initChat());
onUnmounted(() => { socket.value?.disconnect(); });
const formatTime = (t) => t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
</script>

<style scoped>
/* Hiệu ứng nhấp nháy 3 dấu chấm */
.animate-bounce {
  animation: bounce 1.1s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Ẩn thanh scroll cho đẹp nhưng vẫn scroll được */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #374151;
}
</style>