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

const searchQuery = ref('');
const selectedConversation = ref(null);
const newMessage = ref('');
const isTyping = ref(false);
const chatContainer = ref(null);

const conversations = ref([
  {
    id: 1,
    customer: 'Nguyễn Văn A',
    lastMessage: 'Áo size M còn không ạ?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    messages: [
      { text: 'Chào shop, áo thun oversize size M còn hàng không?', time: new Date(Date.now() - 1000 * 60 * 15), isStaff: false, isRead: true },
      { text: 'Chào bạn! Size M còn 3 chiếc ạ.', time: new Date(Date.now() - 1000 * 60 * 10), isStaff: true, isRead: true },
      { text: 'Ok bạn cho mình đặt 1 cái nhé', time: new Date(Date.now() - 1000 * 60 * 5), isStaff: false, isRead: false }
    ]
  },
  {
    id: 2,
    customer: 'Trần Thị B',
    lastMessage: 'Ship COD được không shop?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    messages: [
      { text: 'Shop ơi ship COD được không?', time: new Date(Date.now() - 1000 * 60 * 40), isStaff: false, isRead: true },
      { text: 'Dạ được ạ, bạn đặt hàng mình sẽ ship COD nhé!', time: new Date(Date.now() - 1000 * 60 * 35), isStaff: true, isRead: true },
      { text: 'Cảm ơn shop nhiều!', time: new Date(Date.now() - 1000 * 60 * 20), isStaff: false, isRead: false }
    ]
  },
  {
    id: 3,
    customer: 'Lê Minh C',
    lastMessage: 'Đổi size được không ạ?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 120),
    messages: [
      { text: 'Mình nhận hàng rồi nhưng size hơi rộng, đổi size L được không?', time: new Date(Date.now() - 1000 * 60 * 130), isStaff: false, isRead: true },
      { text: 'Dạ được ạ, bạn gửi lại hàng mình hỗ trợ đổi size L miễn phí nhé.', time: new Date(Date.now() - 1000 * 60 * 125), isStaff: true, isRead: true }
    ]
  },
  {
    id: 4,
    customer: 'Phạm Hồng D',
    lastMessage: 'Hàng về màu đen chưa shop?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 300),
    messages: [
      { text: 'Hàng màu đen dự kiến về tuần sau ạ.', time: new Date(Date.now() - 1000 * 60 * 310), isStaff: true, isRead: true }
    ]
  }
]);

// Tìm kiếm
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value;
  const q = searchQuery.value.toLowerCase();
  return conversations.value.filter(c => 
    c.customer.toLowerCase().includes(q) || 
    c.lastMessage.toLowerCase().includes(q) ||
    c.messages.some(m => m.text.toLowerCase().includes(q))
  );
});

// Unread count cho mỗi conversation
function getUnreadCount(conv) {
  return conv.messages.filter(m => !m.isStaff && !m.isRead).length;
}

// Chọn conversation → đánh dấu đã đọc + scroll
function selectConversation(conv) {
  selectedConversation.value = conv;
  // Đánh dấu tất cả tin nhắn chưa đọc của khách là đã đọc
  conv.messages.forEach(msg => {
    if (!msg.isStaff) msg.isRead = true;
  });
  nextTick(() => scrollToBottom());
}

// Gửi tin nhắn
function sendMessage() {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  const msg = {
    text: newMessage.value.trim(),
    time: new Date(),
    isStaff: true,
    isRead: true // tin nhắn của staff luôn đã đọc
  };

  selectedConversation.value.messages.push(msg);
  selectedConversation.value.lastMessage = msg.text;
  selectedConversation.value.lastMessageTime = new Date();

  newMessage.value = '';
  nextTick(() => {
    scrollToBottom();
    simulateCustomerReply();
  });
}

// Giả lập khách trả lời
function simulateCustomerReply() {
  if (!selectedConversation.value) return;
  
  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    
    const replies = [
      'Cảm ơn shop nhé!',
      'Mình sẽ chuyển khoản ngay đây ạ.',
      'Size L còn không shop ơi?',
      'Ship nhanh giúp mình nhé, cần gấp.',
      'Hàng đẹp lắm, 5 sao cho shop!',
      'Shop có chương trình giảm giá không ạ?',
      'Mình muốn đổi màu sang trắng được không?'
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    const replyMsg = {
      text: randomReply,
      time: new Date(),
      isStaff: false,
      isRead: false
    };

    selectedConversation.value.messages.push(replyMsg);
    selectedConversation.value.lastMessage = replyMsg.text;
    selectedConversation.value.lastMessageTime = new Date();

    nextTick(() => scrollToBottom());
  }, Math.random() * 2000 + 2000); // 2-4 giây
}

// Format thời gian
function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// Scroll xuống dưới
function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

// Watch để scroll khi thay đổi
watch(selectedConversation, () => nextTick(scrollToBottom));
watch(() => selectedConversation.value?.messages, () => nextTick(scrollToBottom), { deep: true });

// Khởi tạo
onMounted(() => {
  // Tự động chọn conversation đầu tiên nếu có
  if (conversations.value.length > 0) {
    selectConversation(conversations.value[0]);
  }
});
</script>

<style scoped>
/* Tùy chỉnh thêm nếu cần */
.animate-bounce {
  animation: bounce 1.2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>