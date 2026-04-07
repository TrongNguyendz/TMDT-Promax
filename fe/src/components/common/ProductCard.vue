// src/components/common/ProductCard.vue
<template>
  <div class="group relative flex flex-col gap-2">
    <!-- 1. ẢNH SẢN PHẨM -->
    <div
      class="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 dark:border-gray-800 dark:bg-gray-900"
    >
      <!-- Link chi tiết -->
      <div
        @click="handleProductClick"
        class="block h-full w-full cursor-pointer"
      >
        <img
          :src="currentImage"
          :alt="product.name"
          class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          :class="{ 'opacity-60 grayscale': isOutOfStock }"
          @error="handleImageError"
          loading="lazy"
        />

        <!-- BADGE HẾT HÀNG -->
        <div
          v-if="isOutOfStock"
          class="absolute inset-0 flex items-center justify-center bg-black/40 z-10"
        >
          <span
            class="rotate-12 rounded bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg border-2 border-white"
          >
            HẾT HÀNG
          </span>
        </div>

        <!-- BADGE SALE -->
        <div
          v-else-if="product.discount_percent > 0"
          class="absolute top-2 left-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white z-10"
        >
          -{{ product.discount_percent }}%
        </div>
      </div>

      <!-- NÚT YÊU THÍCH -->
      <button
        @click.prevent="toggleWishlist"
        class="absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-20"
        :class="
          wishlist.isInWishlist(product.id)
            ? 'bg-red-50 text-red-500'
            : 'bg-white/90 text-gray-900 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-red-500/20 dark:hover:text-red-400'
        "
        :aria-label="
          wishlist.isInWishlist(product.id)
            ? 'Bỏ yêu thích'
            : 'Thêm vào yêu thích'
        "
        title="Yêu thích"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          :fill="wishlist.isInWishlist(product.id) ? 'currentColor' : 'none'"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </div>

    <!-- 2. THÔNG TIN -->
    <div class="flex flex-col px-1">
      <!-- Tên sản phẩm -->
      <RouterLink
        :to="`/product/${product.id}`"
        class="text-base text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold line-clamp-1 mt-0.5"
        :title="product.name"
      >
        {{ product.name }}
      </RouterLink>

      <!-- Swatch màu -->
      <div class="flex items-center gap-1.5 h-6 mb-1">
        <template v-if="colors.length > 0">
          <div
            v-for="(color, index) in colors"
            :key="`color-${index}`"
            @mouseenter="previewImageByColor(color.hex)"
            @mouseleave="resetPreviewImage"
            @click.prevent="previewImageByColor(color.hex)"
            class="p-[1px] rounded-full border transition-all duration-200 cursor-pointer hover:scale-110"
            :class="[
              selectedColor === color.hex
                ? 'border-gray-900 scale-110 shadow-md dark:border-gray-300'
                : 'border-transparent hover:border-gray-400 dark:hover:border-gray-500',
            ]"
            :title="color.name"
          >
            <div
              class="w-4 h-4 rounded-full border border-white/80 shadow-sm"
              :style="{ backgroundColor: color.hex }"
            ></div>
          </div>
          <span
            v-if="remainingColors > 0"
            class="text-[10px] text-gray-500 dark:text-gray-400 ml-1"
            >+{{ remainingColors }}</span
          >
        </template>
        <span v-else class="text-[10px] text-gray-500 dark:text-gray-400 italic"
          >Tiêu chuẩn</span
        >
      </div>

      <!-- Giá  -->
      <div class="flex items-center justify-between gap-2 mt-1">
        <!-- Phần giá bên trái -->
        <div class="flex items-center gap-2">
          <!-- Giá hiện tại (sau giảm hoặc giá gốc nếu không giảm) -->
          <span
            class="text-base font-bold text-red-600 dark:text-red-500"
            :class="{ 'text-gray-400 line-through': isOutOfStock }"
          >
            {{ formatCurrency(product.price) }}
          </span>

          <!-- Giá gốc bị gạch ngang khi có giảm giá -->
          <span
            v-if="product.discount_percent > 0"
            class="text-sm text-gray-400 dark:text-gray-500 line-through"
          >
            {{ formatCurrency(originalPrice) }}
          </span>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <div class="flex items-center text-yellow-400 text-lg">
          <span v-for="i in 5" :key="i">{{
            i <= Math.round(product.rating || 5) ? "★" : "☆"
          }}</span>
        </div>
        <span
          class="text-sm text-blue-600 hover:underline cursor-pointer"
          @click="router.push(`/product/${product.id}?tab=reviews`)"
        >
          ({{ product.reviews || 0 }} đánh giá)
        </span>
      </div>
      <!-- end CHANGE -->
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useWishlistStore } from "../../stores/wishlist";
import { formatCurrency } from "../../utils/helpers";
import { postuserCategoryInteraction } from "../../utils/user-category";
import { useUserStore } from "../../stores/user";
import { useProductsStore } from "../../stores/products";

const router = useRouter();
const wishlist = useWishlistStore();
const userStore = useUserStore();
const productsStore = useProductsStore();

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

// --- CLICK SẢN PHẨM ---
const handleProductClick = async () => {
  console.log(
    "User clicked on product:",
    localStorage.getItem("user_id"),
  );

  // Gửi tương tác nếu user đã đăng nhập
  if (userStore.profile?.id && props.product.category_id) {
    const payload = {
      userId: userStore.profile.id,
      category_id: props.product.category_id._id,
    };

    const result = await postuserCategoryInteraction(payload, userStore.token);
    console.log("Interaction result:", result);
  }

  // Điều hướng tới trang chi tiết
  router.push(`/product/${props.product.id}`);
}

// --- STATE ---
const currentImage = ref("");
const selectedColor = ref(null);
const productImages = ref([]);
const imageColorMap = ref({});

// --- BUILD IMAGE MAP ---
function buildImageMap() {
  productImages.value = [];
  imageColorMap.value = {};

  if (props.product.images?.length) {
    const sorted = [...props.product.images].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
    );

    productImages.value = sorted.map((img) => img.image_url || img);

    sorted.forEach((img, index) => {
      if (img.color) {
        const norm = img.color.toLowerCase().trim();

        if (norm && !imageColorMap.value[norm]) {
          imageColorMap.value[norm] = index;
        }
      }
    });
  }
}

// --- INIT IMAGE ---
function initImage() {
  buildImageMap();

  if (productImages.value.length > 0) {
    currentImage.value = productImages.value[0];
  } else {
    currentImage.value =
      props.product.image || "https://via.placeholder.com/400x533?text=No+Img";
  }
}

// --- COLORS ---
const colors = computed(() => {
  const list = [];
  const attrs = props.product.attributes || [];

  attrs.forEach((attr) => {
    if (attr.attribute_name?.toLowerCase() === "màu") {
      const val = attr.attribute_value?.trim();

      if (!val) return;

      const match = val.match(/^(.*)\s*\((#[0-9a-fA-F]{3,8})\)$/i);

      if (match) {
        list.push({
          name: match[1].trim(),
          hex: match[2].toLowerCase(),
        });
      } else if (val.startsWith("#")) {
        list.push({
          name: val,
          hex: val.toLowerCase(),
        });
      } else {
        list.push({
          name: val,
          hex: "#eeeeee",
        });
      }
    }
  });

  const unique = new Map();
  list.forEach((item) => unique.set(item.hex, item));

  return Array.from(unique.values()).slice(0, 5);
});

const remainingColors = computed(() => {
  const total =
    props.product.attributes?.filter(
      (attr) => attr.attribute_name?.toLowerCase() === "màu",
    ).length || 0;

  return Math.max(0, total - 5);
});

// --- PREVIEW IMAGE THEO MÀU ---
function previewImageByColor(hex) {
  if (!hex) return;

  selectedColor.value = hex;

  const norm = hex.toLowerCase().trim();
  const idx = imageColorMap.value[norm];

  if (idx !== undefined) {
    currentImage.value = productImages.value[idx];
  }
}

function resetPreviewImage() {
  initImage();
  selectedColor.value = null;
}

// --- PRICE ---
const originalPrice = computed(() => {
  if (props.product.discount_percent > 0) {
    return Math.round(
      props.product.price / (1 - props.product.discount_percent / 100),
    );
  }

  return props.product.price;
});

// --- STOCK ---
const inventoryCount = computed(() => {
  return props.product.stock_quantity ?? props.product.stock ?? null;
});

const isOutOfStock = computed(() => {
  return inventoryCount.value !== null && inventoryCount.value <= 0;
});

// --- WISHLIST ---
function toggleWishlist() {
  wishlist.toggleWishlist({
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: currentImage.value,
  });
}

// --- IMAGE ERROR ---
function handleImageError(e) {
  e.target.src = "https://placehold.co/400x533?text=No+Image";
}

// --- WATCH PRODUCT CHANGE ---
watch(
  () => props.product,
  () => {
    initImage();
    selectedColor.value = null;
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>
