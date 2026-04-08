<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kết quả tìm kiếm</h1>
        <p class="text-gray-500 mt-1">
            Từ khóa: <span class="font-bold text-gray-800 dark:text-gray-200">"{{ route.query.q }}"</span> 
            ({{ isNotFound ? 0 : items.length }} kết quả)
        </p>
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
    </div>

    <div v-else>
        <div v-if="isNotFound" class="space-y-12">
            <div class="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/20">
                <div class="text-5xl mb-4">🔍</div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Không tìm thấy sản phẩm khớp với từ khóa của bạn</h3>
                <p class="text-gray-500 mt-2">Đừng lo, hãy tham khảo các sản phẩm nổi bật dưới đây nhé!</p>
            </div>

            <div>
                <div class="flex items-center gap-4 mb-6">
                    <h2 class="text-xl font-black uppercase tracking-tight">Sản phẩm bạn có thể thích</h2>
                    <div class="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                </div>
                
                <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <ProductCard 
                        v-for="p in suggestedItems" 
                        :key="p.id" 
                        :product="p" 
                        @add="addToCart" 
                        @wishlist="addToWishlist"
                    />
                </div>
            </div>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <ProductCard 
                v-for="p in items" 
                :key="p.id" 
                :product="p" 
                @add="addToCart" 
                @wishlist="addToWishlist"
            />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '../../stores/products';
import { useCartStore } from '../../stores/cart';
import ProductCard from '../../components/common/ProductCard.vue';
import Fuse from 'fuse.js';

const route = useRoute();
const productStore = useProductsStore();
const cart = useCartStore();

const loading = ref(false);
const suggestedProducts = ref([]); // Lưu sản phẩm gợi ý khi không tìm thấy kết quả
const isNotFound = ref(false);
const allRawProducts = ref([]); // Lưu tất cả sản phẩm để fuzzy search

/**
 * Chuẩn hóa text: Bỏ dấu Tiếng Việt và xóa khoảng trắng
 */
const simplifyText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')                // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd')              // Sửa chữ đ
    .replace(/\s+/g, '');            // Xóa mọi khoảng trắng
};

/**
 * Cấu hình Fuse.js cho fuzzy search
 */
const fuseOptions = {
  keys: ['name', 'category_name'],
  threshold: 0.3,   // Độ nhạy tìm kiếm mờ
  distance: 100,
  ignoreLocation: true,
  getFn: (obj, key) => {
    // Fuse sẽ lấy bản "đã làm sạch" để đối chiếu
    return simplifyText(obj[key]);
  }
};

// Hàm helper để map dữ liệu chuẩn cho ProductCard
const mapProductData = (p) => {
    let imageUrl = 'https://placehold.co/400x533?text=No+Img';
    if (p.images && p.images.length > 0) {
        const primary = p.images.find(img => img.is_primary);
        imageUrl = primary ? primary.image_url : p.images[0].image_url;
    }
    return {
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.category_name || 'Fashion',
        image: imageUrl,
        attributes: p.attributes || [],
        images: p.images || [],
        discount: p.discount_percent
    };
};

// Map danh sách tìm kiếm (được filter bởi Fuse.js)
const items = computed(() => (productStore.products || []).map(mapProductData));

// Map danh sách gợi ý
const suggestedItems = computed(() => suggestedProducts.value.map(mapProductData));

async function performSearch() {
    const query = route.query.q;
    if (!query) return;

    console.log('🔍 Searching for:', query);
    loading.value = true;
    isNotFound.value = false;
    
    try {
        // 1. Gọi API search - lấy nhiều kết quả để rồi filter
        const res = await productStore.fetchProducts({ 
            search: query, 
            limit: 100  // Lấy nhiều hơn để fuzzy search lọc lại
        });

        const rawProducts = productStore.products || [];
        console.log('📦 Raw products from API:', rawProducts.length);
        allRawProducts.value = rawProducts;

        if (!rawProducts || rawProducts.length === 0) {
            isNotFound.value = true;
            // Gọi API lấy sản phẩm mới nhất để gợi ý
            await productStore.fetchProducts({ 
                limit: 8
            });
            suggestedProducts.value = productStore.products; 
        } else {
            // 2. Dùng Fuse.js để fuzzy search thêm lần nữa (client-side)
            const searchPattern = simplifyText(query);
            console.log('🔬 Search pattern after simplify:', searchPattern);
            
            const fuse = new Fuse(rawProducts, fuseOptions);
            const results = fuse.search(searchPattern);
            console.log('🎯 Fuse.js results:', results.length);
            
            // Update store.products với kết quả đã filter
            productStore.products = results.map(r => r.item);
            console.log('✅ Final products to display:', productStore.products.length);
            isNotFound.value = false;
        }
    } catch (error) {
        console.error("Search error:", error);
    } finally {
        loading.value = false;
    }
}

watch(() => route.query.q, () => {
    performSearch();
});

onMounted(() => {
    performSearch();
});

function addToCart(p) {
    cart.addItem(p, 1);
}
function addToWishlist() {}
</script>