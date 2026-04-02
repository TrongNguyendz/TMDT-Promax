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

const route = useRoute();
const productStore = useProductsStore();
const cart = useCartStore();

const loading = ref(false);
const suggestedProducts = ref([]); // Lưu sản phẩm gợi ý khi không tìm thấy kết quả
const isNotFound = ref(false);

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

// Map danh sách tìm kiếm
const items = computed(() => (productStore.products || []).map(mapProductData));

// Map danh sách gợi ý
const suggestedItems = computed(() => suggestedProducts.value.map(mapProductData));

async function performSearch() {
    const query = route.query.q;
    if (!query) return;

    loading.value = true;
    isNotFound.value = false;
    
    try {
        // 1. Gọi API search
        await productStore.fetchProducts({ 
            search: query, 
            limit: 50 
        });

        // 2. Kiểm tra nếu kết quả rỗng
        if (!productStore.products || productStore.products.length === 0) {
            isNotFound.value = true;
            // Gọi API lấy sản phẩm mới nhất hoặc nổi bật để gợi ý
            const res = await productStore.fetchProducts({ 
                limit: 8,
                sort: 'newest' // Giả sử store/api hỗ trợ sort
            });
            // Vì fetchProducts của bạn có thể ghi đè store, ta nên lưu vào biến cục bộ
            suggestedProducts.value = productStore.products; 
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