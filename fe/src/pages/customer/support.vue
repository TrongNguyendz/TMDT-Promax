<!-- fe/src/pages/customer/support.vue -->
<template>
  <section class="relative left-1/2 -translate-x-1/2 w-[95vw] max-w-[1400px] py-6 px-4 h-[calc(100vh-100px)] flex flex-col">
    <div class="mb-6 flex-shrink-0">
      <h1 class="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
        Hỗ trợ trực tuyến 
        <span v-if="isLoading" class="text-yellow-500 font-medium text-lg bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">(Đang khởi tạo...)</span>
        <span v-else-if="currentTicketId" class="text-green-500 font-medium text-lg bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">(Sẵn sàng)</span>
        <span v-else class="text-red-500 font-medium text-lg bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">(Lỗi kết nối)</span>
      </h1>
      <p class="text-gray-500 mt-2 text-base">Chào bạn! Hãy cho chúng tôi biết bạn cần hỗ trợ gì hôm nay.</p>
    </div>

    <div class="flex-1 flex flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-[#111827]">
      <div class="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 flex items-center gap-5">
        <div class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span class="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 ring-4 ring-white dark:ring-[#111827]"></span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Chăm sóc khách hàng Promax</h2>
          <p class="text-sm font-medium text-green-500 mt-0.5">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </div>

      <div ref="chatContainer" class="flex-1 space-y-6 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30 dark:bg-[#0B1120]">
        <div v-for="(msg, index) in messages" :key="index" :class="['flex', !msg.isStaff ? 'justify-end' : 'justify-start']">
          <div :class="['max-w-[85%] min-w-[180px] px-6 py-4 rounded-3xl text-base shadow-sm', !msg.isStaff ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none']">
            <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>
            <span :class="['text-[11px] mt-2 block font-medium', !msg.isStaff ? 'text-blue-200 text-right' : 'text-gray-400']">
              {{ formatTime(msg.time) }}
            </span>
          </div>
        </div>
      </div>

      <div class="border-t p-5 bg-white dark:bg-[#111827] border-gray-100 dark:border-gray-800">
        <form @submit.prevent="handleSend" class="flex gap-4 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
          <input v-model="newMessage" placeholder="Nhập tin nhắn hỗ trợ..." class="flex-1 bg-transparent px-5 py-3 text-base outline-none text-gray-900 dark:text-white placeholder-gray-400" :disabled="!currentTicketId || isLoading" autocomplete="off" />
          <button type="submit" :disabled="!currentTicketId || !newMessage.trim() || isLoading" class="h-14 w-14 shrink-0 flex items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50">
            <svg class="h-6 w-6 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onUnmounted, nextTick, watch } from 'vue';
import { chatService } from '@/utils/chatService';
import { socketService } from '@/utils/socketService';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const messages = ref([]);
const newMessage = ref('');
const currentTicketId = ref(null);
const chatContainer = ref(null);
const isLoading = ref(true);

const scrollToBottom = () => { nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight; }); };
const formatTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';

const initChat = async () => {
  const userId = user.profile?.id;
  if (!userId) return;

  try {
    isLoading.value = true;
    const res = await chatService.getUserTickets(userId);
    let ticket = res.data.data?.[0]; 

    if (!ticket) {
      // ✅ Gắn tên thật của khách hàng vào đây
      const createRes = await chatService.createTicket({ 
        user_id: userId, 
        customer_name: user.profile?.username || user.profile?.email || `Khách hàng #${userId}`,
        subject: "Hỗ trợ khách hàng" 
      });
      ticket = createRes.data.data || createRes.data;
    }

    const ticketId = ticket?._id || ticket?.id;
    if (ticketId) {
      currentTicketId.value = ticketId;
      const detailRes = await chatService.getTicketDetail(ticketId);
      const rawMsgs = detailRes.data.data?.messages || detailRes.data?.messages || [];
      
      messages.value = rawMsgs.map(m => ({ text: m.content, isStaff: m.sender_type !== 'customer', time: m.created_at }));

      socketService.connect();
      socketService.joinRoom(ticketId);
      socketService.onMessageReceived((newMsg) => {
        messages.value.push({ text: newMsg.content, isStaff: newMsg.sender_type !== 'customer', time: newMsg.created_at || new Date() });
        scrollToBottom();
      });
      scrollToBottom();
    }
  } catch (err) { console.error(err); } finally { isLoading.value = false; }
};

const handleSend = async () => {
  if (!currentTicketId.value || !newMessage.value.trim()) return;
  const content = newMessage.value;
  newMessage.value = '';
  try { await chatService.sendMessage(currentTicketId.value, { content, sender_type: 'customer', sender_id: user.profile.id }); } 
  catch (err) { console.error(err); }
};

watch(() => user.profile?.id, (newVal) => { if (newVal) initChat(); }, { immediate: true });
onUnmounted(() => { socketService.disconnect(); });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; border: 2px solid transparent; background-clip: padding-box; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }
</style>