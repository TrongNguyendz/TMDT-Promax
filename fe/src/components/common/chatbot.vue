<template>
  <!-- Chatbot Container -->
  <div class="fixed bottom-6 right-6 z-[60] font-sans">
    
    <!-- Cửa sổ chat (Luxe Design) -->
    <transition
      enter-active-class="transition duration-400 cubic-bezier(0.34, 1.56, 0.64, 1)"
      enter-from-class="transform scale-75 translate-y-20 opacity-0"
      enter-to-class="transform scale-100 translate-y-0 opacity-100"
      leave-active-class="transition duration-250 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-75 translate-y-10 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-20 right-0 w-[380px] h-[550px] flex flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
      >
        <!-- Header: Cao cấp với Đen tuyền -->
        <div class="bg-gray-900 px-6 py-5 text-white dark:bg-black">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="h-10 w-10 rounded-full border border-gray-700 bg-gray-800 p-1">
                  <img src="@/assets/logoweb.png" alt="Bot" class="h-full w-full object-contain rounded-full" />
                </div>
                <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500"></span>
              </div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-widest italic">Goghevent AI</h3>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Hỗ trợ trực tuyến</p>
              </div>
            </div>
            <button
              @click="isOpen = false"
              class="rounded-full p-2 transition-colors hover:bg-white/10"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Nội dung tin nhắn -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto bg-gray-50/50 p-5 space-y-6 dark:bg-gray-900/20 custom-scrollbar">
          <div v-for="(msg, i) in messages" :key="i" :class="msg.isBot ? 'flex justify-start' : 'flex justify-end'">
            <div class="group max-w-[85%]">
              <div
                :class="msg.isBot
                  ? 'bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                  : 'bg-black text-white rounded-2xl rounded-tr-none shadow-lg dark:bg-white dark:text-black'"
                class="px-4 py-3 transition-all"
              >
                <!-- Text -->
<p class="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">{{ msg.text }}</p>

                <!-- Product Image -->
            <!-- Trong phần tin nhắn bot -->
            <div v-if="msg.isBot && Object.keys(msg.imageUrls || {}).length > 0" class="mt-3 grid grid-cols-2 gap-3">
              <div 
                v-for="(url, sku) in msg.imageUrls" 
                :key="sku" 
                class="overflow-hidden rounded-xl border dark:border-gray-700"
              >
                <img
                  :src="url"
                  :alt="`Sản phẩm ${sku}`"
                  class="h-40 w-full object-cover transition-transform hover:scale-105"
                  @error="() => { delete msg.imageUrls[sku] }" 
                />
                <p class="text-center text-[10px] text-gray-500 mt-1">Mã : {{ sku }}</p>
              </div>
            </div>
              </div>
              <!-- Time -->
              <p :class="msg.isBot ? 'text-left' : 'text-right'" class="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                {{ msg.time }}
              </p>
            </div>
          </div>
        </div>

        <!-- Input gửi tin nhắn -->
        <div class="border-t border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div class="relative flex items-center">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Hỏi bất cứ điều gì..."
              class="w-full rounded-2xl border-none bg-gray-100 px-5 py-3.5 text-xs font-medium focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:focus:ring-white"
            />
            <button
              @click="sendMessage"
              class="absolute right-2 h-9 w-9 flex items-center justify-center rounded-xl bg-gray-900 text-white transition-all hover:bg-black active:scale-90 dark:bg-white dark:text-black"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>
          <p class="mt-2 text-center text-[9px] font-medium text-gray-400">nơi định nghĩa lại thời trang thế giới</p>
        </div>
      </div>
    </transition>

    <!-- Nút Trigger nổi -->
    <button
      @click="toggleChat"
      class="group relative h-16 w-16 flex items-center justify-center transition-all duration-500 active:scale-90"
    >
      <!-- Lớp nền (Black/White Layer) -->
      <div class="absolute inset-0 rounded-full bg-black shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:bg-white"></div>
      
      <!-- Hiệu ứng viền phát sáng nhẹ khi hover -->
      <div class="absolute inset-0 rounded-full border border-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ring-4 ring-black/5 dark:ring-white/10"></div>

      <div v-if="!isOpen" class="relative z-10 flex items-center justify-center">
        <!-- Icon Chat Bubble Sleek -->
        <svg
class="h-8 w-8 text-white transition-all duration-500 dark:text-black" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          
          <!-- Thay dấu + bằng 3 dấu chấm "đang tư duy" (Thinking Dots) -->
          <circle cx="8" cy="12" r="0.5" class="fill-current animate-[pulse_1.5s_infinite_0ms]" />
          <circle cx="12" cy="12" r="0.5" class="fill-current animate-[pulse_1.5s_infinite_200ms]" />
          <circle cx="16" cy="12" r="0.5" class="fill-current animate-[pulse_1.5s_infinite_400ms]" />
        </svg>

        <!-- Badge thông báo tinh tế hơn -->
        <div class="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40"></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full border border-black bg-red-500 dark:border-white"></span>
        </div>
      </div>

      <!-- Icon Đóng (X) khi đang mở chat -->
      <svg 
        v-else 
        class="relative z-10 h-6 w-6 text-white transition-all duration-500 rotate-0 group-hover:rotate-90 dark:text-black" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>

      <!-- Tooltip label -->
      <div class="absolute right-20 scale-75 whitespace-nowrap rounded-full bg-black/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 blur-sm transition-all duration-300 group-hover:right-24 group-hover:scale-100 group-hover:opacity-100 group-hover:blur-0 dark:bg-white/90 dark:text-black shadow-2xl">
        Trò chuyện với AI
      </div>
    </button>
  </div>
</template>

<style scoped>
/* Tùy chỉnh thanh cuộn cho chuyên nghiệp */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
}

/* Hiệu ứng mượt cho các bóng chat */
.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}
</style>

<script setup>
import { ref, nextTick, onMounted, watch, computed } from 'vue'
import { GoogleGenAI } from '@google/genai'
import { getmainimagebySKU } from '../../utils/product_service_api.js' // Chỉ giữ lại cái lấy ảnh

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Nhận props từ HomePage
const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  }
})

const isOpen = ref(false)
const newMessage = ref('')

const messages = ref([
  {
    text: 'Xin chào! Mình là trợ lý hỗ trợ mua sắm quần áo trên website của chúng ta. Bạn cần tư vấn sản phẩm nào hôm nay ạ?',
    isBot: true,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
])

const messagesContainer = ref(null)
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

// Xóa hoàn toàn phần onMounted load sản phẩm cũ
// Xóa biến products và systemPrompt cũ

// Tạo system prompt động từ props.products (luôn mới nhất)
const systemPrompt = computed(() => {
  if (!props.products || props.products.length === 0) {
    return `Bạn là trợ lý bán hàng nhiệt tình của shop thời trang. Hiện tại đang cập nhật sản phẩm mới, vui lòng thông cảm với khách nhé! Trả lời ngắn gọn, thân thiện bằng tiếng Việt.`
  }

  const productText = props.products.map(p => {
    const colors = [...new Set(
      (p.attributes || [])
        .filter(a => a.attribute_name === 'Màu')
        .map(a => a.attribute_value)
    )].join(', ') || 'Đa dạng'

    const sizes = [...new Set(
      (p.attributes || [])
        .filter(a => a.attribute_name === 'Size')
        .map(a => a.attribute_value)
    )].join(', ') || 'Đa dạng'

    const primaryImg = (p.images || []).find(img => img.is_primary === 1)
    const imgUrl = primaryImg ? primaryImg.image_url : (p.images?.[0]?.image_url || 'Không có ảnh')

    return `- Tên: ${p.name} (Mã SKU: ${p.sku || 'Không có'})
      Giá: ${p.price?.toLocaleString('vi-VN')} VND
      Danh mục: ${p.category_name || 'Chưa phân loại'}
      Màu sắc: ${colors}
      Size: ${sizes}
      Còn hàng: ${p.stock_quantity || 0} cái
      Ảnh chính: ${imgUrl}`
  }).join('\n\n')

  return `Bạn là trợ lý bán hàng chính thức của shop thời trang trực tuyến này. 
QUAN TRỌNG:
- Luôn đóng vai nhân viên bán hàng nhiệt tình, thân thiện: dùng từ "em", "bên em", "shop mình".
- KHÔNG BAO GIỜ nói bạn là AI hoặc không hiển thị được ảnh.
- Chatbot này CÓ THỂ hiển thị ảnh sản phẩm trực tiếp trong khung chat.
- Khi tư vấn sản phẩm, BẮT BUỘC phải nhắc rõ mã SKU (ví dụ: "mã SKU: MKA").
- Không cần chèn link ảnh hay nói "em gửi ảnh nhé" — hệ thống sẽ tự động hiển thị ảnh khi bạn nhắc đúng SKU.
- Trả lời ngắn gọn (3-4 câu), khuyến khích khách mua hàng.
- Tư vấn khoảng 2 đến 3 sản phẩm theo yêu cầu hoặc câu hỏi của khách (nếu có nhiều sản phẩm thì lựa chọn các sản phẩm có giá cao nhất , còn lại sẽ là câu "còn rất nhiều sản phẩm tương tự ạ")
- không chào khách mỗi khi được hỏi mà thay bằng từ "dạ vâng"
- Chỉ dùng thông tin từ danh sách sản phẩm dưới đây.

Danh sách sản phẩm:

${productText}

Luôn trả lời bằng tiếng Việt, nhiệt tình và chuyên nghiệp!`
})

// Các hàm còn lại giữ nguyên, chỉ sửa phần sendMessage để dùng systemPrompt.value
const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) nextTick(() => scrollToBottom())
}

const extractSKU = (text) => {
  const upperText = text.toUpperCase()
  const regex = /(?:SKU[:\s]*|MÃ[:\s]*SKU[:\s]*|MÃ[:\s]*)(([A-Z0-9\-]+))/gi
  const matches = [...upperText.matchAll(regex)]
  return matches.length > 0 ? matches[0][1].trim() : null
}

const sendMessage = async () => {
  const messageText = newMessage.value.trim()
  if (!messageText) return

  messages.value.push({
    text: messageText,
    isBot: false,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  })
  newMessage.value = ''
  nextTick(() => scrollToBottom())

  try {
    const contents = [
      { role: "user", parts: [{ text: systemPrompt.value }] },
      { role: "model", parts: [{ text: "Đã hiểu! Em sẽ hỗ trợ khách hàng nhiệt tình như nhân viên shop." }] },
      ...messages.value.slice(0, -1).flatMap(msg => [
        { role: msg.isBot ? "model" : "user", parts: [{ text: msg.text }] }
      ]),
      { role: "user", parts: [{ text: messageText }] }
    ]

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents
    })

// ... (phần trên giữ nguyên)

const botResponseRaw = response.text || "Dạ em chưa hiểu rõ ạ, anh/chị nói lại giúp em nhé!"
const botResponse = botResponseRaw
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/__(.*?)__/g, '$1')
  .replace(/\*(.*?)\*/g, '$1')
  .trim()

// Tìm TẤT CẢ các SKU trong câu trả lời
const extractAllSKUs = (text) => {
  const upperText = text.toUpperCase()
  const regex = /(?:SKU[:\s]*|MÃ[:\s]*SKU[:\s]*|MÃ[:\s]*)(([A-Z0-9\-]+))/gi
  const matches = [...upperText.matchAll(regex)]
  return matches.map(m => m[1].trim()) // trả về mảng các SKU duy nhất
}

const skus = extractAllSKUs(botResponse)
const imageUrls = {} // lưu dạng { sku: url } để render nhiều ảnh nếu cần

if (skus.length > 0) {
  for (const sku of skus) {
    try {
      const imgRes = await getmainimagebySKU(sku)
      if (imgRes.data?.success && imgRes.data?.data?.image_url) {
        imageUrls[sku] = imgRes.data.data.image_url
      }
    } catch (err) {
      console.error(`Lỗi lấy ảnh cho SKU ${sku}:`, err)
    }
  }
}

// Khi push tin nhắn bot, thay vì chỉ 1 imageUrl, ta truyền object imageUrls
messages.value.push({
  text: botResponse,
  isBot: true,
  imageUrls,      // object { "ABC123": "https://...", "XYZ456": "https://..." }
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
})

  } catch (error) {
    console.error("Lỗi Gemini:", error)
    messages.value.push({
      text: 'Xin lỗi, hệ thống đang bận. Bạn thử lại sau ít phút nhé!',
      isBot: true,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    })
  }

  nextTick(() => scrollToBottom())
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Lưu tin nhắn
watch(messages, (newMessages) => {
  localStorage.setItem('chatMessages', JSON.stringify(newMessages))
}, { deep: true })

// Load tin nhắn cũ khi mount
onMounted(() => {
  const savedMessages = localStorage.getItem('chatMessages')
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  }
})
</script>