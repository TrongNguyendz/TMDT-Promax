<!-- views/staff/Support.vue -->
<template>
  <div class="space-y-6">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Hỗ trợ khách hàng</h1>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-[calc(100vh-180px)] flex flex-col lg:flex-row">
      
      <!-- Danh sách cuộc hội thoại (Left Sidebar) -->
      <div class="w-full lg:w-80 lg:border-r dark:border-gray-800 flex flex-col">
        <div class="p-4 border-b dark:border-gray-800">
          <h2 class="text-lg font-bold">Cuộc hội thoại</h2>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div 
            v-for="conversation in conversations" 
            :key="conversation.id"
            @click="selectConversation(conversation)"
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition flex items-start gap-3"
            :class="{ 'bg-teal-50 dark:bg-teal-900/20': selectedConversation?.id === conversation.id }"
          >
            <div class="flex-shrink-0">
              <div class="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                {{ conversation.customer.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <p class="font-semibold truncate">{{ conversation.customer }}</p>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(conversation.lastMessageTime) }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ conversation.lastMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Khu vực chat chính (Right Panel) -->
      <div class="flex-1 flex flex-col">
        <div v-if="selectedConversation" class="flex flex-col h-full">
          <!-- Header chat -->
          <div class="p-4 border-b dark:border-gray-800 flex items-center gap-3 bg-gray-50 dark:bg-gray-800">
            <div class="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
              {{ selectedConversation.customer.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold">{{ selectedConversation.customer }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Đang hoạt động</p>
            </div>
          </div>

          <!-- Tin nhắn -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50">
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
                class="max-w-[75%] px-4 py-3 rounded-2xl"
              >
                <p>{{ msg.text }}</p>
                <p class="text-xs mt-1 opacity-70 text-right">{{ formatTime(msg.time) }}</p>
              </div>
            </div>
          </div>

          <!-- Input gửi tin nhắn -->
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

        <!-- Placeholder khi chưa chọn cuộc hội thoại -->
        <div v-else class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-lg font-medium">Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const conversations = ref([
  {
    id: 1,
    customer: 'Nguyễn Văn A',
    lastMessage: 'Áo size M còn không ạ?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    messages: [
      { text: 'Chào shop, áo thun oversize size M còn hàng không?', time: new Date(Date.now() - 1000 * 60 * 15), isStaff: false },
      { text: 'Chào bạn! Size M còn 3 chiếc ạ.', time: new Date(Date.now() - 1000 * 60 * 10), isStaff: true },
      { text: 'Ok bạn cho mình đặt 1 cái nhé', time: new Date(Date.now() - 1000 * 60 * 5), isStaff: false }
    ]
  },
  {
    id: 2,
    customer: 'Trần Thị B',
    lastMessage: 'Ship COD được không shop?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    messages: [
      { text: 'Shop ơi ship COD được không?', time: new Date(Date.now() - 1000 * 60 * 40), isStaff: false },
      { text: 'Dạ được ạ, bạn đặt hàng mình sẽ ship COD nhé!', time: new Date(Date.now() - 1000 * 60 * 35), isStaff: true }
    ]
  },
  {
    id: 3,
    customer: 'Lê Minh C',
    lastMessage: 'Đổi size được không ạ?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 120),
    messages: [
      { text: 'Mình nhận hàng rồi nhưng size hơi rộng, đổi size L được không?', time: new Date(Date.now() - 1000 * 60 * 130), isStaff: false },
      { text: 'Dạ được ạ, bạn gửi lại hàng mình hỗ trợ đổi size L miễn phí nhé.', time: new Date(Date.now() - 1000 * 60 * 125), isStaff: true }
    ]
  }
]);

const selectedConversation = ref(null);
const newMessage = ref('');

function selectConversation(conv) {
  selectedConversation.value = conv;
  // Có thể scroll xuống dưới cùng chat
}

function sendMessage() {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  selectedConversation.value.messages.push({
    text: newMessage.value.trim(),
    time: new Date(),
    isStaff: true
  });

  // Cập nhật last message
  selectedConversation.value.lastMessage = newMessage.value.trim();
  selectedConversation.value.lastMessageTime = new Date();

  newMessage.value = '';

  // Scroll xuống dưới (nếu cần)
  // const chatContainer = document.querySelector('.overflow-y-auto');
  // if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
}
</script>

<style scoped>
/* Tùy chỉnh thêm nếu cần */
</style>