<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kết quả tìm kiếm</h1>
        <p class="text-gray-500 mt-1">
            Từ khóa: <span class="font-bold text-gray-800 dark:text-gray-200">"{{ route.query.q }}"</span> 
            ({{ items.length }} kết quả)
        </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Không tìm thấy sản phẩm nào</h3>
        <p class="text-gray-500 mt-2">Thử tìm kiếm với từ khóa khác xem sao.</p>
        <router-link to="/" class="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Về trang chủ</router-link>
    </div>

    <!-- Product Grid -->
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
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import ProductCard from '../components/common/ProductCard.vue';

const route = useRoute();
const productStore = useProductsStore();
const cart = useCartStore();

const loading = ref(false);

// Map dữ liệu chuẩn cho ProductCard
const items = computed(() => {
    return (productStore.products || []).map(p => {
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
    });
});

async function performSearch() {
    const query = route.query.q;
    if (!query) return;

    loading.value = true;
    try {
        // Gọi API search vào Store
        await productStore.fetchProducts({ 
            search: query, 
            limit: 50 // Lấy nhiều kết quả chút
        });
    } finally {
        loading.value = false;
    }
}

// Khi URL thay đổi (?q=...) thì tìm kiếm lại
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