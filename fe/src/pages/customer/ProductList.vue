<template>
  <section>
    <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Danh sách sản phẩm</h1>
        <span class="text-sm text-gray-500">Tìm thấy {{ productsStore.pagination?.total || 0 }} kết quả</span>
    </div>

    <div class="grid gap-8 md:grid-cols-[260px_1fr]">
      <!-- SIDEBAR BỘ LỌC -->
      <aside class="space-y-6">
        <!-- Tìm kiếm -->
        <div class="space-y-2">
            <label class="text-sm font-semibold">Tìm kiếm</label>
            <InputField 
              v-model="filters.q" 
              @keyup.enter="applyFilters"
              placeholder="Tên sản phẩm, SKU..." 
            />
        </div>

        <!-- Danh mục -->
        <div class="space-y-2">
            <label class="text-sm font-semibold">Danh mục</label>
            <select 
                v-model="filters.categoryId" 
                @change="applyFilters"
                class="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-gray-900"
            >
                <option value="">Tất cả danh mục</option>
                <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>
        
        <!-- Sắp xếp -->
        <div class="space-y-2">
            <label class="text-sm font-semibold">Sắp xếp theo</label>
            <SelectDropdown 
              v-model="filters.sort" 
              :options="sortOptions"
              @update:modelValue="applyFilters"
              />
        </div>
        
        <!-- Khoảng giá -->
        <div class="space-y-2">
            <label class="text-sm font-semibold">Khoảng giá</label>
            <div class="grid grid-cols-2 gap-2">
                <InputField v-model="filters.min" type="number" placeholder="Min" />
                <InputField v-model="filters.max" type="number" placeholder="Max" />
            </div>
        </div>
        
        <button 
          class="w-full rounded-lg bg-gray-900 py-2.5 text-white font-medium hover:bg-black transition-all active:scale-95 dark:bg-white dark:text-black" 
          @click="applyFilters"
        >
          Áp dụng bộ lọc
        </button>
      </aside>

      <!-- DANH SÁCH SẢN PHẨM -->
      <div>
        <!-- Loading State -->
        <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="i in 8" :key="i" class="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <svg class="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>Không tìm thấy sản phẩm nào phù hợp.</p>
            <button @click="resetFilters" class="mt-4 text-blue-600 hover:underline">Xóa bộ lọc</button>
        </div>

        <!-- Product Grid -->
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard 
            v-for="p in items" 
            :key="p.id" 
            :product="p" 
            @add="addToCart" 
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="h-10 w-10 flex items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          
          <div class="px-4 py-2 rounded-full bg-gray-100 font-bold text-sm">
             {{ currentPage }} / {{ totalPages }}
          </div>
          
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="h-10 w-10 flex items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, computed, ref, watch } from 'vue';
import { useProductsStore } from '../../stores/products';
import { useCartStore } from '../../stores/cart';
import InputField from '../../components/forms/InputField.vue';
import SelectDropdown from '../../components/forms/SelectDropdown.vue';
import ProductCard from '../../components/common/ProductCard.vue';

// Init Stores
const productsStore = useProductsStore();
const cartStore = useCartStore();

// State
const loading = computed(() => productsStore.loading);
const filters = reactive({ q: '', sort: 'newest', min: '', max: '', categoryId: '' });
const currentPage = ref(1);
const itemsPerPage = ref(24);

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' }
];

// --- MAPPING DỮ LIỆU ---
const items = computed(() => {
  const list = productsStore.products || [];
  return list.map((p) => {
    let imageUrl = 'https://via.placeholder.com/400x533?text=No+Img';
    if (p.images && p.images.length > 0) {
      const primary = p.images.find(img => img.is_primary);
      imageUrl = primary ? primary.image_url : p.images[0].image_url;
    }

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      brand: p.category_name || 'YODY Basic', 
      stock_quantity: p.stock_quantity,
      image: imageUrl,
      attributes: p.attributes || [], 
      images: p.images || [], 
      discount: p.discount_percent || 0
    };
  });
});

const totalPages = computed(() => {
  if (productsStore.pagination && productsStore.pagination.pages) {
    return productsStore.pagination.pages;
  }
  return 1;
});

async function fetchProducts() {
  const params = {
    page: currentPage.value,
    limit: itemsPerPage.value,
  };

  if (filters.q) params.search = filters.q;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.min) params.minPrice = Number(filters.min);
  if (filters.max) params.maxPrice = Number(filters.max);

  // === THÊM XỬ LÝ SẮP XẾP ===
  if (filters.sort) {
    if (filters.sort === 'newest') {
      params.sort = 'created_at_desc';     // Hoặc 'newest', 'id_desc' tùy backend
    } else if (filters.sort === 'price_asc') {
      params.sort = 'price_asc';
    } else if (filters.sort === 'price_desc') {
      params.sort = 'price_desc';
    }
    // Nếu backend dùng định dạng khác (ví dụ: order=price&direction=asc), bạn chỉnh lại ở đây
  }

  await productsStore.fetchProducts(params);
}

onMounted(() => {
  productsStore.fetchCategories();
  fetchProducts();
});

watch(currentPage, () => {
  fetchProducts();
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
});

function applyFilters() {
  currentPage.value = 1;
  fetchProducts();
}

function resetFilters() {
    filters.q = '';
    filters.min = '';
    filters.max = '';
    filters.categoryId = '';
    filters.sort = 'newest'; 
    applyFilters();
}

function addToCart(product) {
  cartStore.addToCart(product, 1);
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
</script>