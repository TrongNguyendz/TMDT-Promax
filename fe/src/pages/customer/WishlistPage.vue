<template>
  <section class="mx-auto max-w-7xl px-4 py-12 lg:py-16">
    
    <!-- Header -->
    <div class="mb-12 flex flex-col gap-2 border-b border-gray-100 pb-8 dark:border-gray-800">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
        Sản phẩm yêu thích
      </h1>
      <p class="text-base text-gray-500 dark:text-gray-400">
        Danh sách tuyển chọn của bạn đang có <span class="font-semibold text-black dark:text-white">{{ count }} món đồ</span>.
      </p>
    </div>

    <!--[CHANGE] Thêm trạng thái Loading -->
    <div v-if="isLoadingDetails" class="flex flex-col items-center justify-center py-20">
       <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
       <p class="mt-4 text-gray-500">Đang tải thông tin sản phẩm...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="count === 0" class="flex flex-col items-center justify-center py-32 text-center">
      <div class="mb-6 rounded-full bg-gray-50 p-10 dark:bg-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h2 class="text-2xl font-medium text-gray-900 dark:text-white">Danh sách yêu thích đang trống</h2>
      <p class="mt-2 text-gray-500">Hãy thêm những món đồ bạn ưng ý vào đây nhé.</p>
    </div>

    <!-- Wishlist Items -->
    <div v-else class="relative">
      <TransitionGroup name="list" tag="div" class="space-y-6">
        <!-- [CHANGE] Sử dụng vòng lặp qua mảng enrichedItems đã được đắp dữ liệu -->
        <div 
          v-for="item in enrichedItems" 
          :key="item.product_id"
          class="group relative flex flex-col gap-8 overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 transition-all duration-500 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:shadow-none sm:flex-row sm:items-center"
        >
          <!-- 1. Ảnh sản phẩm -->
          <div class="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 sm:h-32 sm:w-32 lg:h-44 lg:w-44">
            <img 
              :src="item.image || 'https://via.placeholder.com/300'" 
              :alt="item.name"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          </div>

          <!-- 2. Thông tin sản phẩm -->
          <div class="flex flex-1 flex-col justify-center min-w-0">
            <span class="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              SKU: {{ item.sku || item.product_id }}
            </span>
            <RouterLink
              :to="`/product/${item.product_id}`" 
              class="text-xl font-extrabold leading-tight text-gray-900 hover:text-red-600 dark:text-white dark:hover:text-red-400 lg:text-2xl transition-colors truncate"
            >
              {{ item.name }}
            </RouterLink>
          </div>

          <!-- 3. Giá và Nút hành động -->
          <div class="flex flex-col items-start justify-between gap-6 border-t border-gray-50 pt-6 sm:items-end sm:border-none sm:pt-0">
            <div class="text-left sm:text-right">
              <p class="text-xs font-medium uppercase tracking-widest text-gray-400">Giá niêm yết</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white lg:text-3xl">
                {{ formatCurrency(item.price) }}
              </p>
            </div>
            
            <div class="flex w-full items-center gap-3 sm:w-auto">
                <RouterLink 
                    :to="`/product/${item.product_id}`"
                    class="flex flex-1 items-center justify-center gap-3 rounded-full bg-gray-900 px-8 py-4 text-xs font-bold tracking-widest text-white transition-all hover:bg-black hover:shadow-xl active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:flex-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    XEM CHI TIẾT
                </RouterLink>
              
              <button 
                @click="handleRemove(item.product_id)"
                class="group/btn flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-red-900/20"
                title="Xóa khỏi yêu thích"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useWishlistStore } from '../../stores/wishlist';
import { useUIStore } from '../../stores/ui';
import { formatCurrency } from '../../utils/helpers';
import axios from 'axios'; //Import axios để gọi API Product Service

const wishlistStore = useWishlistStore();
const uiStore = useUIStore();

const count = computed(() => wishlistStore.count);

// Biến lưu trữ dữ liệu đã được đắp thông tin chi tiết
const enrichedItems = ref([]);
const isLoadingDetails = ref(true);

onMounted(async () => {
    isLoadingDetails.value = true;
    
    // 1. Tải danh sách ID từ Order Service (DB)
    await wishlistStore.fetchWishlist();

    const tempItems =[];

    // 2. Duyệt qua từng ID và gọi Product Service để lấy chi tiết
    for (const item of wishlistStore.items) {
        // Nếu item đã có sẵn tên (do vừa mới bấm thả tim xong) -> Giữ nguyên
        if (item.name || item.product_name) {
            tempItems.push({
                product_id: item.product_id || item.id,
                name: item.name || item.product_name,
                price: item.price || item.unit_price,
                image: item.image || item.product_image,
                sku: item.sku || ''
            });
            continue;
        }

        // -> Gọi API lấy thông tin
        try {
            const res = await axios.get(`https://tmdt-promax-api-gateway.onrender.com/api/v1/products/${item.product_id}`);
            if (res.data.success) {
                const p = res.data.data;
                
                // Lấy ảnh primary
                let imgUrl = 'https://via.placeholder.com/300';
                if (p.images && p.images.length > 0) {
                    const primary = p.images.find(img => img.is_primary);
                    imgUrl = primary ? primary.image_url : p.images[0].image_url;
                }

                tempItems.push({
                    product_id: item.product_id,
                    name: p.name,
                    price: p.price,
                    image: imgUrl,
                    sku: p.sku
                });
            }
        } catch (error) {
            console.error(`Không thể lấy chi tiết sản phẩm ID: ${item.product_id}`);
        }
    }

    // 3. Cập nhật mảng hiển thị
    enrichedItems.value = tempItems;
    isLoadingDetails.value = false;
});

// Xóa khỏi wishlist
const handleRemove = async (productId) => {
  if (!productId) return;

  // 1. Gọi store để xóa trong DB
  await wishlistStore.toggleWishlist({ id: productId });
  
  // 2. Xóa khỏi mảng hiển thị hiện tại để UI mất ngay lập tức
  enrichedItems.value = enrichedItems.value.filter(i => i.product_id !== productId);

};
</script>