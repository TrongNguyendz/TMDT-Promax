<template>
  <form @submit.prevent="submit" class="relative z-50 w-full max-w-xl group">
    <div class="relative flex items-center transition-all duration-500">
      <input
        v-model="q"
        @input="onInput"
        @focus="showSuggestions = true"
        @blur="closeSuggestions"
        type="search"
        placeholder="Tìm sản phẩm (ví dụ: q u a n, a o s o m i...)"
        class="w-full h-10 lg:h-11 rounded-full border border-gray-200/80 bg-gray-50/50 pl-11 pr-12 text-sm font-medium tracking-tight transition-all duration-500 
               placeholder:text-gray-400 placeholder:font-normal
               focus:bg-white focus:border-black focus:ring-[3px] focus:ring-black/5 
               dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-black dark:focus:border-white dark:focus:ring-white/10 shadow-sm"
      />
      
      <div class="absolute left-4 flex items-center justify-center pointer-events-none">
        <svg 
          class="h-4 w-4 text-gray-400 transition-colors duration-300 group-focus-within:text-black dark:group-focus-within:text-white" 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
    </div>

    <transition name="portal">
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="absolute left-0 right-0 top-full mt-4 overflow-hidden rounded-[2rem] border border-gray-100 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95"
      >
        <div class="flex items-center gap-4 px-6 pt-5 pb-2">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">Gợi ý thông minh</span>
          <div class="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
        </div>

        <div class="max-h-[360px] overflow-y-auto px-3 custom-scrollbar">
          <div v-for="product in suggestions" :key="product.id" class="mb-1 last:mb-0">
            <button
              type="button"
              @click="selectSuggestion(product)"
              @mousedown.prevent
              class="group/item flex w-full items-center gap-5 rounded-2xl p-3 text-left transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-100/50 dark:border-gray-800">
                <img 
                  :src="getProductImage(product)" 
                  :alt="product.name"
                  class="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover/item:scale-110" 
                />
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  {{ product.category_name || 'Sản phẩm' }}
                </p>
                <p class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">
                  {{ product.name }}
                </p>
                <p class="mt-1 text-sm font-black text-red-600 dark:text-red-500">
                  {{ formatPrice(product.price) }}
                </p>
              </div>

              <div class="pr-2 opacity-0 -translate-x-2 transition-all duration-300 group-hover/item:opacity-100 group-hover/item:translate-x-0 text-gray-300 dark:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <button
          @click="submit"
          @mousedown.prevent
          class="group/footer flex w-full items-center justify-center gap-2 border-t border-gray-50 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-black dark:border-gray-800 dark:hover:text-white transition-all"
        >
          XEM TẤT CẢ CHO "{{ q }}"
          <svg class="h-3 w-3 transition-transform group-hover/footer:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 5l7 7-7 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </transition>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../utils/product_service_api'; 
import Fuse from 'fuse.js';

const router = useRouter();
const q = ref('');
const showSuggestions = ref(false);
const suggestions = ref([]);
let debounceTimer = null;

/**
 * Hàm chuẩn hóa: Bỏ dấu Tiếng Việt và xóa sạch khoảng trắng
 * Dùng để đưa Data và Input về cùng một định dạng so sánh
 */
const simplifyText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')               // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd')             // Sửa chữ đ
    .replace(/\s+/g, '');           // Xóa mọi khoảng trắng
};

/**
 * Cấu hình Fuse.js
 */
const fuseOptions = {
  keys: ['name', 'category_name'],
  threshold: 0.3,   // Độ nhạy tìm kiếm mờ (0.0 -> 1.0)
  distance: 100,
  ignoreLocation: true,
  getFn: (obj, key) => {
    // Fuse sẽ lấy bản "đã làm sạch" của Tên sản phẩm để đối chiếu
    return simplifyText(obj[key]);
  }
};

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const getProductImage = (p) => {
    if (p.images?.length > 0) {
        return p.images.find(img => img.is_primary)?.image_url || p.images[0].image_url;
    }
    return 'https://placehold.co/100?text=No+Img';
};

/**
 * Logic xử lý tìm kiếm khi gõ
 */
async function onInput() {
    showSuggestions.value = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    
    const rawValue = q.value.trim();
    if (!rawValue) {
        suggestions.value = [];
        return;
    }

    // Chuẩn hóa chuỗi người dùng nhập (ví dụ: "q u a n" -> "quan")
    const searchPattern = simplifyText(rawValue);

    debounceTimer = setTimeout(async () => {
        try {
            // Vẫn gọi API lấy dữ liệu thô (giữ nguyên Database gốc)
            const res = await api.get('/products', { 
                params: { search: rawValue, limit: 15 } 
            });
            
            if (res.data.success && res.data.data.length > 0) {
                const rawProducts = res.data.data;
                
                // Khởi tạo máy lọc Fuse.js
                const fuse = new Fuse(rawProducts, fuseOptions);
                
                // Tìm kiếm bằng chuỗi đã chuẩn hóa
                const results = fuse.search(searchPattern);
                
                // Trả kết quả về danh sách hiển thị
                suggestions.value = results.map(r => r.item).slice(0, 5);
            } else {
                suggestions.value = [];
            }
        } catch (e) {
            console.error("Search error:", e);
        }
    }, 300);
}

function closeSuggestions() {
  setTimeout(() => { showSuggestions.value = false; }, 200);
}

function selectSuggestion(product) {
  q.value = product.name;
  showSuggestions.value = false;
  router.push(`/product/${product.id}`);
}

function submit() {
  if (!q.value?.trim()) return;
  showSuggestions.value = false;
  router.push({ path: '/search', query: { q: q.value.trim() } });
}
</script>

<style scoped>
/* Hiệu ứng Portal mượt mà */
.portal-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.portal-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 1, 1); }
.portal-enter-from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
.portal-leave-to { opacity: 0; transform: translateY(8px); }

/* Custom Scrollbar cho bảng gợi ý */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2d2d; }

/* Ẩn các nút cancel mặc định của trình duyệt trong input search */
input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-results-button,
input[type="search"]::-webkit-search-results-decoration {
  display: none;
}
</style>