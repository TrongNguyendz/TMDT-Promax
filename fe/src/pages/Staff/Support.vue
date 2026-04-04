<!-- fe/src/pages/staff/Support.vue -->
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
            placeholder="Tìm kiếm khách hàng..." 
            class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <!-- Danh sách Sidebar -->
        <div class="flex-1 overflow-y-auto">
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation.id"
            @click="selectConversation(conversation)"
            class="relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition flex items-start gap-3 border-b dark:border-gray-800"
            :class="{ 'bg-teal-50 dark:bg-teal-900/20': supportStore.currentTicket?.id === conversation.id }"
          >
            <!-- Avatar + Unread Badge -->
            <div class="flex-shrink-0 relative">
              <div class="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg shadow-sm">
                {{ (conversation.customer || 'K').charAt(0).toUpperCase() }}
              </div>
              
              <!-- Badge số tin chưa đọc (Đẩy lên đầu Sidebar nhờ logic sort) -->
              <span 
                v-if="conversation.unread_count_staff > 0"
                class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-900 animate-pulse"
              >
                {{ conversation.unread_count_staff }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <!-- Tên khách: Tô đậm và đổi màu nếu có tin chưa đọc -->
                <p 
                  class="truncate transition-colors"
                  :class="conversation.unread_count_staff > 0 ? 'font-black text-teal-600 dark:text-teal-400' : 'font-semibold text-gray-900 dark:text-gray-100'"
                >
                  {{ conversation.customer }}
                </p>
                <span class="text-[10px] text-gray-400 whitespace-nowrap">
                  {{ formatTime(conversation.lastMessageTime) }}
                </span>
              </div>
              
              <!-- Nội dung tin nhắn cuối: Tô đậm nếu chưa đọc -->
              <p 
                class="text-xs truncate mt-0.5"
                :class="conversation.unread_count_staff > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
              >
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
        <div v-if="supportStore.currentTicket" class="flex flex-col h-full bg-gray-50/30 dark:bg-gray-950/20">
          
          <!-- Chat Header -->
          <div class="p-4 border-b dark:border-gray-800 flex items-center gap-3 bg-white dark:bg-gray-900">
            <div class="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shadow-md">
              {{ (supportStore.currentTicket.customer || 'K').charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white">{{ supportStore.currentTicket.customer }}</p>
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-green-500"></span>
                <p class="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Đang trực tuyến</p>
              </div>
            </div>
          </div>

          <!-- Messages List -->
          <div 
            ref="chatContainer"
            class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
          >
            <div 
              v-for="(msg, index) in supportStore.messages" 
              :key="index"
              :class="msg.isStaff ? 'justify-end' : 'justify-start'"
              class="flex"
            >
              <div 
                :class="[
                  msg.isStaff 
                    ? 'bg-teal-600 text-white rounded-2xl rounded-br-none shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none shadow-sm'
                ]"
                class="max-w-[85%] sm:max-w-[70%] px-4 py-3"
              >
                <p class="break-words text-sm sm:text-base leading-relaxed">{{ msg.text }}</p>
                <p 
                  class="text-[10px] mt-1.5 opacity-70 text-right font-medium"
                  :class="msg.isStaff ? 'text-teal-50' : 'text-gray-400'"
                >
                  {{ formatTime(msg.time) }}
                  <!-- Chỉ hiện nhãn (Bạn) nếu ID trùng với staff đang đăng nhập -->
                  <span v-if="msg.isStaff && String(msg.sender_id) === myId" class="ml-1 italic font-bold">
                    (Bạn)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Input area -->
          <div class="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
            <div class="flex gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <input 
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Viết câu trả lời của bạn..." 
                class="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none"
              />
              <button 
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                class="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-sm"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>

        <!-- Placeholder khi chưa chọn ticket -->
        <div v-else class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-950/50">
          <div class="text-center p-8">
            <div class="mb-6 flex justify-center">
               <div class="p-6 bg-white dark:bg-gray-800 rounded-full shadow-xl">
                 <svg class="w-16 h-16 text-teal-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
               </div>
            </div>
            <p class="text-2xl font-black text-gray-900 dark:text-white">Chào bạn!</p>
            <p class="mt-2 text-sm max-w-xs mx-auto">Chọn một cuộc hội thoại bên trái để bắt đầu hỗ trợ khách hàng ngay.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { useUserStore } from '../../stores/user';
import { useSupportStore } from '../../stores/support';

const user = useUserStore();
const supportStore = useSupportStore();
const socket = ref(null);
const searchQuery = ref('');
const newMessage = ref('');
const chatContainer = ref(null);

const myId = computed(() => String(user.profile?.id || user.id));

const setupSocket = () => {
  socket.value = io('http://localhost:3007');

  socket.value.on('receive_message', (data) => {
    // Nếu đang mở đúng ticket -> Hiện tin nhắn
    if (supportStore.currentTicket?.id === data.ticket_id) {
       if (String(data.sender_id) !== myId.value) {
          supportStore.pushNewMessage({
            text: data.text,
            time: data.time,
            sender_id: data.sender_id,
            isStaff: data.isStaff
          });
          scrollToBottom();
          //user đang mở thì là read
          supportStore.markAsRead(data.ticket_id);
       }
    }
  });

  // Sự kiện cập nhật Sidebar
  socket.value.on('ticket_list_updated', (data) => {
     const ticketInList = supportStore.tickets.find(c => c.id === data.ticket_id);
     if (ticketInList) {
        ticketInList.lastMessage = data.last_message;
        ticketInList.lastMessageTime = data.last_message_at;
        
        // Tăng unread nếu là khách nhắn và user không mở ticket đó
        if (data.sender_type === 'customer' && supportStore.currentTicket?.id !== data.ticket_id) {
           ticketInList.unread_count_staff++;
        }
        
        // Đẩy tin nhắn mới nhất lên đầu danh sách
        sortTickets();
     } else {
        supportStore.fetchAllTickets();
     }
  });
};

const sortTickets = () => {
  supportStore.tickets.sort((a, b) => {
    // những ticket có tin nhắn chưa đọc được xếp lên đầu
    if (a.unread_count_staff > 0 && b.unread_count_staff === 0) return -1;
    if (a.unread_count_staff === 0 && b.unread_count_staff > 0) return 1;
    // đều ủnead thì xét time
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });
};

const filteredConversations = computed(() => {
  const list = supportStore.tickets || [];
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter(c => c.customer.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
});

async function selectConversation(conv) {
  if (!conv?.id) return;
  supportStore.currentTicket = conv;
  
  // lluwu lại ticket đang chat để tự mở lai nếu lỡ reload hoặc logout
  localStorage.setItem('last_staff_active_ticket', conv.id);

  if (socket.value) socket.value.emit('join_ticket', conv.id);

  try {
    await supportStore.fetchTicketDetails(conv.id);
    // Đánh dấu đã đọc
    await supportStore.markAsRead(conv.id);
    scrollToBottom();
  } catch (err) { console.error(err); }
}

async function sendMessage() {
  const ticketId = supportStore.currentTicket?.id;
  if (!newMessage.value.trim() || !ticketId) return;

  const txt = newMessage.value.trim();
  supportStore.pushNewMessage({ text: txt, time: new Date().toISOString(), isStaff: true, sender_id: myId.value });
  
  // Cập nhật sidebar tạm thời và đẩy lên đầu
  supportStore.currentTicket.lastMessage = txt;
  supportStore.currentTicket.lastMessageTime = new Date().toISOString();
  sortTickets();

  scrollToBottom();
  newMessage.value = '';

  try {
    await supportStore.sendChatMessage(ticketId, {
      sender_type: 'staff',
      sender_id: myId.value,
      content: txt
    });
  } catch (err) { console.error(err); }
}

onMounted(async () => {
  await supportStore.fetchAllTickets();
  sortTickets(); // Sắp xếp khi vừa load xong
  setupSocket();

  // tự mở lại đoạn chat đã gần nhất
  const lastActiveId = localStorage.getItem('last_staff_active_ticket');
  if (lastActiveId) {
    const found = supportStore.tickets.find(t => t.id === lastActiveId);
    if (found) selectConversation(found);
  }
});

onUnmounted(() => { if (socket.value) socket.value.disconnect(); });

const formatTime = (t) => t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';
const scrollToBottom = () => nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight; });
</script>
