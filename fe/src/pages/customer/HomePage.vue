<template>
  <section>
    <!-- 1. Banner -->
    <BannerCarousel :slides="bannerData" class="mb-6" />
    <voucher />
    <!-- 2. THANH DANH MỤC (CUỘN NGANG) -->
    <div ref="productSection" class="mb-8">
      <h3 class="text-lg font-bold mb-4 px-1">Danh mục</h3>
      <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <!-- Nút Tất cả -->
        <div
          @click="selectCategory('')"
          class="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group"
        >
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all group-hover:shadow-md"
            :class="
              selectedCategoryId === ''
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700'
            "
          >
            <span class="font-bold text-sm">ALL</span>
          </div>
          <span
            class="text-xs font-medium text-center truncate w-full"
            :class="
              selectedCategoryId === ''
                ? 'text-gray-900 font-bold dark:text-white'
                : 'text-gray-500'
            "
            >Tất cả</span
          >
        </div>
        <!-- Các danh mục từ DB -->
        <div
          v-for="cat in productsStore.categories"
          :key="cat.id"
          @click="selectCategory(cat.id)"
          class="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group"
        >
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all overflow-hidden group-hover:shadow-md relative"
            :class="
              selectedCategoryId === cat.id
                ? 'border-gray-900 ring-2 ring-gray-200 dark:border-white dark:ring-gray-700'
                : 'border-gray-200 bg-white hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700'
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              :class="
                selectedCategoryId === cat.id
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400'
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <span
            class="text-xs font-medium text-center truncate w-20"
            :class="
              selectedCategoryId === cat.id
                ? 'text-gray-900 font-bold dark:text-white'
                : 'text-gray-500'
            "
            >{{ cat.name }}</span
          >
        </div>
      </div>
    </div>

    <h2 class="mb-3 flex items-center justify-between text-lg font-semibold">
      <span>Sản phẩm nổi bật</span>
      <span class="text-xs text-gray-400 font-normal">
        (Tổng: {{ productsStore.pagination?.total || 0 }} - Trang: {{ page }}/{{
          totalPages
        }})
      </span>
    </h2>

    <!-- Trong template của HomePage.vue -->

    <Chatbot :products="productsStore.products" />

    <!-- Loading -->

    <div
      v-if="productsStore.loading"
      class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
      ></div>
    </div>

    <!-- Product Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <ProductCard
        v-for="p in productsList"
        :key="p.id"
        :product="p"
        @add="addToCart"
        @wishlist="addWishlist"
      />
    </div>

    <div
      v-if="totalPages > 1"
      class="mt-6 flex items-center justify-center space-x-3"
    >
      <button
        @click="prevPage"
        :disabled="page === 1"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        <span class="sr-only">Trang trước</span
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
        >Trang <span class="font-bold">{{ page }}</span> /
        <span class="font-bold">{{ totalPages }}</span></span
      >
      <button
        @click="nextPage"
        :disabled="page === totalPages"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        <span class="sr-only">Trang kế tiếp</span
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import ProductCard from "../../components/common/ProductCard.vue";
import BannerCarousel from "../../components/common/BannerCarousel.vue";

import Chatbot from "../../components/common/chatbot.vue";
import { useCartStore } from "../../stores/cart";
import { useProductsStore } from "../../stores/products";
import { getListBanners } from "../../utils/banner_service_api";
import voucher from "../../components/common/voucher.vue";
import { getRecentCategoryIds } from "../../utils/user-category";
import { useUserStore } from "../../stores/user";

const cart = useCartStore();
const productsStore = useProductsStore();
const defaultBannerUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop';

const userStore = useUserStore();
const page = ref(1);
const pageSize = 12;
const selectedCategoryId = ref("");
const isChangingPage = ref(false);
const productSection = ref(null);

const bannerData = ref([]);
const bannerLoading = ref(true);

async function loadBanners() {
  try {
    bannerLoading.value = true;
    const response = await getListBanners();
    const rawBanners = response.data.data || [];

    if (rawBanners.length > 0) {
      bannerData.value = rawBanners.map((banner) => ({
        type: banner.link_type === "video" ? "video" : "image",
        src: banner.image_url.startsWith("https")
          ? banner.image_url
          : `https://tmdt-promax-admin-service.onrender.com${banner.image_url}`,
// Debug URL
        title: banner.title,
        subtitle: banner.description,
        link: banner.link || null,
      }));
    } else {
      throw new Error("No data");
    }
  } catch (err) {
    bannerData.value = [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop",
        title: "Mùa hè",
        subtitle: "Giảm giá đặc biệt.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        title: "Cuối tuần",
        subtitle: "Ưu đãi tuyệt vời.",
      }
    ];
  } finally {
    bannerLoading.value = false;
  }
}

const productsList = computed(() => {
  const items = productsStore.products || [];
  return items.map((p) => {
    let imageUrl = "https://via.placeholder.com/400x400?text=No+Image";
    if (p.images && p.images.length > 0) {
      const primary = p.images.find((img) => img.is_primary);
      imageUrl = primary ? primary.image_url : p.images[0].image_url;
    }

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      brand: p.category_name || "Fashion",
      rating: p.rating || 0,
      reviews: p.review_count || 0,
      image: imageUrl,
      discount: p.discount_percent,
      attributes: p.attributes || [],
      images: p.images || [],
      stock_quantity: p.stock_quantity,
      category_id: p.category_id,
    };
  });
});

const totalPages = computed(() => {
  const pagination = productsStore.pagination || {};
  if (pagination.pages) return pagination.pages;
  const total = pagination.total || 0;
  return total > 0 ? Math.ceil(total / pageSize) : 1;
});

async function loadPage() {
  const params = {
    page: page.value,
    limit: pageSize,
    categoryId: selectedCategoryId.value,
  };
  await productsStore.fetchProducts(params);
  if (isChangingPage.value && productSection.value) {
    productSection.value.scrollIntoView({ behavior: "smooth", block: "start" });
    isChangingPage.value = false;
  }
}

function prevPage() {
  if (page.value > 1) {
    isChangingPage.value = true;
    page.value -= 1;
  }
}
function nextPage() {
  if (page.value < totalPages.value) {
    isChangingPage.value = true;
    page.value += 1;
  }
}

function selectCategory(id) {
  selectedCategoryId.value = id;
  page.value = 1;
  isChangingPage.value = true;
  loadPage();
}
function addToCart(p) {
  cart.addItem(p, 1);
}
function addWishlist() {}

watch(page, () => {
  loadPage();
});

async function RecommentCategories() {
  // Thêm async ở đây
  try {
    if (userStore.token && userStore.profile?.id) {
      // Thêm await để đợi dữ liệu thực tế trả về
      const result = await getRecentCategoryIds(
        userStore.profile.id,
        userStore.token,
      );

      if (
        result &&
        result.recent_category_ids &&
        result.recent_category_ids.length > 0
      ) {
        // Gán ID danh mục đầu tiên từ mảng
        selectedCategoryId.value = result.recent_category_ids[0];
        page.value = 1;
        isChangingPage.value = true;

        // Goi loadPage để lấy sản phẩm của danh mục đó
        await loadPage();
      } else {
        console.log(
          "Không có gợi ý danh mục nào cho user này, sẽ load mặc định.",
        );
        await loadPage(); // Load mặc định nếu không có gợi ý
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy gợi ý danh mục:", error);
  }
}

onMounted(async () => {
  console.log("--- ONMOUNTED START ---");

  // 1. Load các dữ liệu tĩnh trước
  // 2. Kiểm tra token (nếu Store trống, thử lấy từ localStorage)
  const token = userStore.token || localStorage.getItem("token");
  console.log("Token check:", token);

  if (token) {
    // Nếu có token nhưng chưa có profile, hãy load profile trước khi gợi ý
    if (!userStore.profile?.id) {
      console.log("Đang lấy lại profile...");
      // await userStore.fetchProfile(); // Đảm bảo bạn có hàm này trong userStore
    }
    await RecommentCategories();
  } else {
    console.log("Khách vãng lai - Load mặc định");
    await loadPage();
  }
  await Promise.all([productsStore.fetchCategories(), loadBanners()]);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
