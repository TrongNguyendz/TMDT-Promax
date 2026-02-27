<template>
  <section v-if="product">
    <!-- Breadcrumb -->
    <nav class="mb-4 text-sm text-gray-500">
      <RouterLink to="/" class="hover:underline">Trang chủ</RouterLink> /
      <RouterLink to="/products" class="hover:underline">Sản phẩm</RouterLink> /
      <span class="text-gray-700 dark:text-gray-300 font-medium">{{
        product.name
      }}</span>
    </nav>

    <div class="grid gap-8 md:grid-cols-2">
      <!-- CỘT TRÁI: ẢNH SẢN PHẨM -->
      <div>
        <div
          class="relative h-[500px] w-full rounded-lg border bg-gray-50 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-center overflow-hidden"
        >
          <img
            :src="selectedImage"
            :alt="product.name"
            @error="handleImageError"
            class="max-h-full max-w-full object-contain transition-opacity duration-300"
          />

          <button
            v-if="productImages.length > 1"
            @click="previousImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 transition"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            v-if="productImages.length > 1"
            @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 transition"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <div
            v-if="productImages.length > 1"
            class="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm"
          >
            {{ currentImageIndex + 1 }} / {{ productImages.length }}
          </div>
        </div>

        <div
          v-if="productImages.length > 1"
          class="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
        >
          <img
            v-for="(img, idx) in productImages"
            :key="idx"
            :src="img"
            @click="selectImageByIndex(idx)"
            @error="
              $event.target.src = 'https://placehold.co/100x100?text=No+Img'
            "
            class="h-20 w-20 shrink-0 cursor-pointer rounded border bg-white object-contain p-1 transition-all hover:border-gray-400 dark:bg-gray-800 dark:border-gray-700"
            :class="{
              'ring-2 ring-gray-900 dark:ring-gray-100 border-transparent':
                selectedImage === img,
            }"
          />
        </div>
      </div>

      <!-- CỘT PHẢI: THÔNG TIN -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ product.name }}
        </h1>
        <p class="mt-2 text-sm text-gray-500 font-mono">
          SKU: {{ product.sku }}
        </p>

        <div class="mt-3 flex items-center gap-2">
          <div class="flex items-center text-yellow-400 text-lg">
            <span v-for="i in 5" :key="i">{{
              i <= Math.round(product.rating || 5) ? "★" : "☆"
            }}</span>
          </div>
          <span
            class="text-sm text-blue-600 hover:underline cursor-pointer"
            @click="activeTab = 'reviews'"
          >
            ({{ product.reviews || 0 }} đánh giá)
          </span>
        </div>

        <p class="mt-4 text-3xl font-bold text-red-600 dark:text-red-400">
          {{ formatCurrency(product.price) }}
        </p>

        <!-- 1. CHỌN MÀU SẮC -->
        <div v-if="colors.length > 0" class="mt-6">
          <label class="block text-sm font-semibold mb-2"
            >Màu sắc:
            <span class="text-gray-600 font-normal">{{
              selectedColor?.name
            }}</span></label
          >
          <div class="flex gap-3">
            <button
              v-for="color in colors"
              :key="color.hex"
              @click="selectedColor = color"
              class="h-8 w-8 rounded-full border-2 transition-all relative shadow-sm"
              :style="{ backgroundColor: color.hex }"
              :class="{
                'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 border-transparent':
                  selectedColor?.hex === color.hex,
                'border-gray-300 dark:border-gray-600':
                  selectedColor?.hex !== color.hex,
              }"
              :title="color.name"
            ></button>
          </div>
        </div>

        <!-- 2. CHỌN KÍCH CỠ -->
        <div class="mt-6">
          <div class="flex justify-between items-end mb-2">
            <label class="block text-sm font-semibold"
              >Kích cỡ:
              <span class="text-gray-600 font-normal">{{
                selectedSize
              }}</span></label
            >
            <button
              @click="showSizeGuide = true"
              class="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Hướng dẫn chọn size
            </button>
          </div>

          <div v-if="sizes.length > 0" class="flex gap-2 flex-wrap">
            <button
              v-for="size in sizes"
              :key="size"
              @click="selectedSize = size"
              class="rounded border px-4 py-2 font-medium transition-all min-w-[3rem]"
              :class="{
                'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-black':
                  selectedSize === size,
                'border-gray-300 hover:border-gray-400 text-gray-700 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800':
                  selectedSize !== size,
              }"
            >
              {{ size }}
            </button>
          </div>
          <div v-else class="text-sm text-gray-500 italic">
            Freesize / Một kích cỡ
          </div>
        </div>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800/50">
          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {{ product.shortDescription || product.description }}
          </p>
        </div>

        <div class="mt-6 flex items-center gap-2">
          <div
            class="h-2.5 w-2.5 rounded-full"
            :class="product.inStock ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <p
            v-if="product.inStock"
            class="text-sm font-semibold text-green-600 dark:text-green-400"
          >
            Còn hàng ({{ product.stock }})
          </p>
          <p
            v-else
            class="text-sm font-semibold text-red-600 dark:text-red-400"
          >
            Hết hàng
          </p>
        </div>

        <div class="mt-6 flex gap-3">
          <div
            class="flex items-center rounded border bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <button
              @click="qty = Math.max(1, qty - 1)"
              class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              −
            </button>
            <input
              v-model.number="qty"
              type="number"
              min="1"
              :max="product.stock"
              class="w-12 border-0 bg-transparent text-center focus:ring-0 appearance-none"
            />
            <button
              @click="qty = Math.min(product.stock, qty + 1)"
              class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              +
            </button>
          </div>
          <button
            :disabled="!product.inStock"
            class="flex-1 rounded-lg bg-gray-900 px-6 py-3 font-bold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200"
            @click="addToCart"
          >
            THÊM VÀO GIỎ HÀNG
          </button>
          <button
            @click="toggleWishlist"
            class="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              :fill="
                wishlist.isInWishlist(product.id) ? 'currentColor' : 'none'
              "
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
      </div>
    </div>

    <!-- TABS -->
    <div class="mt-16 border-t pt-8 dark:border-gray-800">
      <div class="flex gap-8 border-b dark:border-gray-800 overflow-x-auto">
        <button
          @click="activeTab = 'description'"
          class="pb-4 text-lg font-semibold transition-colors relative whitespace-nowrap"
          :class="
            activeTab === 'description'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          Mô tả
          <div
            v-if="activeTab === 'description'"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white"
          ></div>
        </button>
        <button
          @click="activeTab = 'reviews'"
          class="pb-4 text-lg font-semibold transition-colors relative whitespace-nowrap"
          :class="
            activeTab === 'reviews'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          Đánh giá ({{ product.reviews }})
          <div
            v-if="activeTab === 'reviews'"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white"
          ></div>
        </button>
        <button
          @click="activeTab = 'tryon'"
          class="pb-4 text-lg font-semibold transition-colors relative whitespace-nowrap"
          :class="
            activeTab === 'tryon'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          Thử đồ với AI
          <div
            v-if="activeTab === 'tryon'"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white"
          ></div>
        </button>
      </div>

      <div class="py-8 min-h-[300px]">
        <!-- 1. Mô tả -->
        <div
          v-if="activeTab === 'description'"
          class="prose max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
        >
          <p class="whitespace-pre-line leading-relaxed text-lg">
            {{ product.description || "Chưa có mô tả chi tiết." }}
          </p>
        </div>

        <!-- 2. Đánh giá -->
        <div v-else-if="activeTab === 'reviews'" class="space-y-8">
          <div
            class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700"
          >
            <h3 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              Viết đánh giá của bạn
            </h3>
            <div v-if="userStore.token">
              <form @submit.prevent="submitReview">
                <div class="mb-4">
                  <label
                    class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >Bạn cảm thấy thế nào?</label
                  >
                  <div class="flex gap-2">
                    <button
                      type="button"
                      v-for="star in 5"
                      :key="star"
                      @click="newReview.rating = star"
                      class="text-2xl transition-transform hover:scale-110"
                      :class="
                        star <= newReview.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      "
                    >
                      ★
                    </button>
                  </div>
                </div>
                <div class="mb-4">
                  <label
                    class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >Nội dung đánh giá</label
                  >
                  <textarea
                    v-model="newReview.comment"
                    rows="3"
                    class="w-full p-3 rounded border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    placeholder="Chia sẻ cảm nhận..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  class="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? "Đang gửi..." : "Gửi đánh giá" }}
                </button>
              </form>
            </div>
            <div v-else class="text-center py-4 text-gray-500">
              Vui lòng
              <router-link
                to="/auth"
                class="text-blue-600 hover:underline font-medium"
                >đăng nhập</router-link
              >
              để viết đánh giá.
            </div>
          </div>

          <div>
            <h3 class="font-bold text-xl mb-4 text-gray-900 dark:text-white">
              Khách hàng nhận xét ({{ reviews.length }})
            </h3>
            <div
              v-if="reviews.length === 0"
              class="text-center py-10 text-gray-500 border border-dashed rounded-lg"
            >
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
            <div v-else class="space-y-6">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="border-b pb-6 dark:border-gray-700 last:border-0"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                    >
                      {{ (review.author || "U").charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <h4 class="font-bold text-gray-900 dark:text-white">
                        {{ review.author || "Người dùng" }}
                      </h4>
                      <div class="flex text-yellow-400 text-sm mt-0.5">
                        <span v-for="i in 5" :key="i">{{
                          i <= review.rating ? "★" : "☆"
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="text-xs text-gray-400">{{
                    formatDate(review.created_at)
                  }}</span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mt-2 ml-14">
                  {{ review.comment }}
                </p>

                <div
                  v-if="review.admin_reply"
                  class="ml-14 mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      class="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                      >Shop phản hồi</span
                    >
                    <span class="text-xs text-gray-400">{{
                      formatDate(review.updated_at)
                    }}</span>
                  </div>
                  <p class="text-sm text-gray-800 dark:text-gray-200">
                    {{ review.admin_reply }}
                  </p>
                </div>

                <!-- <div class="ml-14 mt-2" v-if="userStore.profile?.role === 'admin' || userStore.profile?.id === review.user_id">
                            <button @click="handleDeleteReview(review.id)" class="text-xs text-red-500 hover:text-red-700 hover:underline font-medium transition-colors">Xóa bình luận này</button>
                        </div> -->
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Nội dung Thử đồ -->
        <div v-else-if="activeTab === 'tryon'" class="mt-2">
          <br />
          <h3 class="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Phòng thử đồ ảo
            <!-- CHANGE -->
            <button
              @click="showTryOnGuide = true"
              class="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Yêu cầu về ảnh
            </button>
            <!-- END CHANGE -->
          </h3>

          <!-- Giai đoạn 1: Chọn ảnh người dùng + Chọn màu sản phẩm -->
          <transition name="fade" mode="out-in">
            <div
              v-if="!isTryingOn"
              key="select"
              class="grid gap-8 md:grid-cols-2"
            >
              <!-- Cột 1: Upload ảnh người dùng -->
              <div class="h-full flex flex-col">
                <div
                  class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex-1 flex flex-col items-center justify-center relative overflow-hidden group"
                >
                  <div v-if="!tryOnImage">
                    <svg
                      class="mx-auto mb-4 h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p class="mb-4 text-gray-600 dark:text-gray-400">
                      Kéo thả hoặc chọn ảnh của bạn
                    </p>
                    <button
                      @click="$refs.fileInput.click()"
                      class="inline-block rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black transition"
                    >
                      Chọn ảnh
                    </button>
                  </div>
                  <div
                    v-else
                    class="relative w-full h-full flex items-center justify-center"
                  >
                    <img
                      :src="tryOnImage"
                      class="max-h-[400px] max-w-full rounded shadow-md object-contain"
                      alt="Ảnh của bạn"
                    />
                    <button
                      @click="clearTryOnImage"
                      class="absolute top-2 right-2 bg-white/90 text-red-600 p-2 rounded-full hover:bg-white shadow-sm transition"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleTryOnImageUpload"
                    class="hidden"
                  />
                </div>
              </div>

              <!-- Cột 2: Chọn màu sản phẩm -->
              <div class="flex flex-col h-full">
                <div
                  v-if="colors.length === 0"
                  class="p-6 text-center text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  Sản phẩm này chưa có biến thể màu sắc để thử.
                </div>
                <div v-else class="flex-1 flex flex-col">
                  <h4 class="mb-3 font-semibold text-gray-800 dark:text-white">
                    Chọn mẫu thử:
                    <span
                      v-if="tryOnSelectedColor"
                      class="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    >
                      {{ tryOnSelectedColor.name }}
                    </span>
                  </h4>
                  <div
                    class="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar"
                  >
                    <div
                      v-for="color in colors"
                      :key="color.hex"
                      @click="tryOnSelectColor(color)"
                      class="cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 relative group bg-white dark:bg-gray-800"
                      :class="
                        tryOnSelectedColor?.hex === color.hex
                          ? 'border-gray-900 dark:border-gray-100 shadow-md ring-2 ring-gray-300 dark:ring-gray-700 scale-[1.02]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      "
                    >
                      <div
                        class="aspect-[3/4] w-full bg-gray-100 dark:bg-gray-900 relative"
                      >
                        <img
                          v-if="getColorImage(color.hex)"
                          :src="getColorImage(color.hex)"
                          class="w-full h-full object-cover"
                          :alt="color.name"
                        />
                        <div
                          v-else
                          class="w-full h-full flex flex-col items-center justify-center text-gray-400"
                        >
                          <svg
                            class="w-8 h-8 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span class="text-[10px]">Chưa có ảnh</span>
                        </div>
                        <div
                          v-if="tryOnSelectedColor?.hex === color.hex"
                          class="absolute top-2 right-2 bg-gray-900 text-white rounded-full p-0.5 shadow-sm dark:bg-white dark:text-black"
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div
                        class="p-2 text-center border-t dark:border-gray-600"
                      >
                        <div class="flex items-center justify-center gap-1.5">
                          <div
                            class="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                            :style="{ backgroundColor: color.hex }"
                          ></div>
                          <span
                            class="text-xs font-medium truncate max-w-[80px]"
                            >{{ color.name }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Nút bắt đầu thử đồ -->
                <div class="mt-6">
                  <button
                    @click="startTryOn"
                    :disabled="!tryOnImage || !tryOnSelectedColor"
                    class="w-full rounded-lg bg-gray-900 py-3.5 font-bold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    <span>🤖</span>
                    <span>BẮT ĐẦU THỬ ĐỒ NGAY</span>
                  </button>
                  <p
                    v-if="!tryOnImage"
                    class="text-xs text-center mt-2 text-red-500 animate-pulse"
                  >
                    * Vui lòng tải ảnh của bạn lên trước
                  </p>
                  <p
                    v-if="tryOnImage && !tryOnSelectedColor"
                    class="text-xs text-center mt-2 text-red-500 animate-pulse"
                  >
                    * Vui lòng chọn một màu sản phẩm
                  </p>
                </div>
              </div>
            </div>

            <!-- Giai đoạn 2: Đang hiển thị kết quả thử đồ -->
            <div v-else key="result" class="relative">
              <!-- Nút quay lại -->
              <button
                @click="backToSelection"
                class="mb-6 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay lại chọn màu khác
              </button>

              <!-- Khu vực hiển thị kết quả thử đồ -->
              <div class="grid gap-8 md:grid-cols-2 items-center">
                <!-- Ảnh người dùng gốc -->
                <div class="text-center">
                  <p
                    class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3"
                  >
                    Ảnh của bạn
                  </p>
                  <div
                    class="rounded-lg border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 inline-block"
                  >
                    <img
                      :src="tryOnImage"
                      class="max-h-[500px] max-w-full rounded object-contain shadow-lg"
                      alt="Ảnh gốc"
                    />
                  </div>
                </div>

                <!-- Kết quả thử đồ (giả lập - bạn sẽ thay bằng ảnh từ AI sau) -->
                <!-- Kết quả thử đồ -->
                <div class="text-center">
                  <p
                    class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center justify-center gap-2"
                  >
                    Kết quả thử đồ
                    <span
                      class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-300"
                    >
                      Màu: {{ tryOnSelectedColor.name }}
                    </span>
                  </p>

                  <div
                    class="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[500px] flex items-center justify-center overflow-hidden shadow-lg"
                  >
                    <!-- Đang xử lý -->
                    <div v-if="isProcessing" class="text-center py-12">
                      <div
                        class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mb-4"
                      ></div>
                      <p
                        class="text-lg font-medium text-gray-700 dark:text-gray-300"
                      >
                        Đang xử lý thử đồ ảo...
                      </p>
                      <p class="text-sm text-gray-500 mt-2">
                        Đang xử lý thử đồ ảo... ({{ pollAttempts }} /
                        {{ pollMaxAttempts }}) <br />Có thể mất 30–120 giây tùy
                        ảnh
                      </p>
                    </div>

                    <!-- Đã có kết quả -->
                    <img
                      v-else-if="tryOnResultImage"
                      :src="tryOnResultImage"
                      class="max-h-[500px] max-w-full rounded object-contain"
                      alt="Kết quả thử đồ ảo"
                    />

                    <!-- Lỗi hoặc chưa có -->
                    <div
                      v-else
                      class="text-center text-gray-500 dark:text-gray-400"
                    >
                      <svg
                        class="mx-auto mb-4 h-20 w-20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p class="text-lg font-medium">Không thể tạo kết quả</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
  <div v-else class="container mx-auto px-4 py-8 animate-pulse">
    <div class="h-64 bg-gray-200 rounded"></div>
  </div>

  <!-- MODAL SIZE GUIDE -->
  <div
    v-if="showSizeGuide"
    class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
    @click.self="showSizeGuide = false"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div
        class="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Bảng quy đổi kích cỡ
        </h3>
        <button
          @click="showSizeGuide = false"
          class="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="flex border-b dark:border-gray-700">
        <button
          v-for="tab in ['Nam', 'Nữ', 'Trẻ em']"
          :key="tab"
          @click="sizeTab = tab"
          class="flex-1 py-3 text-sm font-bold transition-colors relative"
          :class="
            sizeTab === tab
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          "
        >
          {{ tab }}
          <div
            v-if="sizeTab === tab"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"
          ></div>
        </button>
      </div>
      <div class="p-6 overflow-y-auto custom-scrollbar text-sm">
        <div v-if="sizeTab === 'Nam'" class="space-y-8 animate-fade-in">
          <div>
            <h4
              class="font-bold text-lg mb-3 dark:text-white border-l-4 border-blue-600 pl-2"
            >
              Áo Nam
            </h4>
            <div class="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table class="w-full text-center">
                <thead class="bg-gray-100 dark:bg-gray-700 font-bold">
                  <tr>
                    <th class="p-2">Size</th>
                    <th class="p-2">Chiều cao (cm)</th>
                    <th class="p-2">Cân nặng (kg)</th>
                    <th class="p-2">Rộng vai</th>
                    <th class="p-2">Vòng ngực</th>
                  </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-600">
                  <tr>
                    <td class="p-2 font-bold">S</td>
                    <td>160-165</td>
                    <td>50-54</td>
                    <td>41</td>
                    <td>82-86</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">M</td>
                    <td>160-165</td>
                    <td>55-61</td>
                    <td>42</td>
                    <td>86-90</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">L</td>
                    <td>166-172</td>
                    <td>62-68</td>
                    <td>43.5</td>
                    <td>90-94</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">XL</td>
                    <td>172-177</td>
                    <td>69-75</td>
                    <td>45</td>
                    <td>94-98</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">2XL</td>
                    <td>177-184</td>
                    <td>76-84</td>
                    <td>46.5</td>
                    <td>98-102</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">3XL</td>
                    <td>184-192</td>
                    <td>85-90</td>
                    <td>48</td>
                    <td>102-106</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4
              class="font-bold text-lg mb-3 dark:text-white border-l-4 border-blue-600 pl-2"
            >
              Quần Nam
            </h4>
            <div class="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table class="w-full text-center">
                <thead class="bg-gray-100 dark:bg-gray-700 font-bold">
                  <tr>
                    <th class="p-2">Size</th>
                    <th class="p-2">Chiều cao</th>
                    <th class="p-2">Cân nặng</th>
                    <th class="p-2">Vòng bụng</th>
                    <th class="p-2">Vòng mông</th>
                  </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-600">
                  <tr>
                    <td class="p-2 font-bold">S/28</td>
                    <td>160-165</td>
                    <td>50-54</td>
                    <td>68-72</td>
                    <td>84-88</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">M/29</td>
                    <td>160-165</td>
                    <td>55-61</td>
                    <td>72-76</td>
                    <td>88-92</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">L/30</td>
                    <td>166-172</td>
                    <td>62-68</td>
                    <td>76-80</td>
                    <td>92-95</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">XL/31</td>
                    <td>172-177</td>
                    <td>69-75</td>
                    <td>80-84</td>
                    <td>95-98</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">2XL/32</td>
                    <td>177-184</td>
                    <td>76-84</td>
                    <td>84-88</td>
                    <td>98-101</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else-if="sizeTab === 'Nữ'" class="space-y-8 animate-fade-in">
          <div>
            <h4
              class="font-bold text-lg mb-3 dark:text-white border-l-4 border-pink-500 pl-2"
            >
              Áo Nữ
            </h4>
            <div class="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table class="w-full text-center">
                <thead class="bg-gray-100 dark:bg-gray-700 font-bold">
                  <tr>
                    <th class="p-2">Size</th>
                    <th class="p-2">Chiều cao</th>
                    <th class="p-2">Cân nặng</th>
                    <th class="p-2">Rộng vai</th>
                    <th class="p-2">Vòng ngực</th>
                  </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-600">
                  <tr>
                    <td class="p-2 font-bold">XS</td>
                    <td>145-150</td>
                    <td>35-39</td>
                    <td>35</td>
                    <td>74-77</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">S</td>
                    <td>150-155</td>
                    <td>40-45</td>
                    <td>36</td>
                    <td>78-82</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">M</td>
                    <td>156-160</td>
                    <td>46-51</td>
                    <td>37</td>
                    <td>83-87</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">L</td>
                    <td>161-164</td>
                    <td>52-57</td>
                    <td>38</td>
                    <td>87-91</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4
              class="font-bold text-lg mb-3 dark:text-white border-l-4 border-pink-500 pl-2"
            >
              Quần Nữ
            </h4>
            <div class="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table class="w-full text-center">
                <thead class="bg-gray-100 dark:bg-gray-700 font-bold">
                  <tr>
                    <th class="p-2">Size</th>
                    <th class="p-2">Chiều cao</th>
                    <th class="p-2">Cân nặng</th>
                    <th class="p-2">Vòng bụng</th>
                    <th class="p-2">Vòng mông</th>
                  </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-600">
                  <tr>
                    <td class="p-2 font-bold">XS/25</td>
                    <td>145-150</td>
                    <td>35-39</td>
                    <td>52-62</td>
                    <td>82-86</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">S/26</td>
                    <td>150-155</td>
                    <td>40-45</td>
                    <td>62-66</td>
                    <td>86-90</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">M/27</td>
                    <td>156-160</td>
                    <td>46-51</td>
                    <td>66-70</td>
                    <td>90-94</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">L/28</td>
                    <td>161-164</td>
                    <td>52-57</td>
                    <td>70-74</td>
                    <td>94-98</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else class="space-y-8 animate-fade-in">
          <div>
            <h4
              class="font-bold text-lg mb-3 dark:text-white border-l-4 border-green-500 pl-2"
            >
              Áo Trẻ Em
            </h4>
            <div class="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table class="w-full text-center">
                <thead class="bg-gray-100 dark:bg-gray-700 font-bold">
                  <tr>
                    <th class="p-2">Size</th>
                    <th class="p-2">Chiều cao</th>
                    <th class="p-2">Cân nặng</th>
                    <th class="p-2">Vòng ngực</th>
                  </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-600">
                  <tr>
                    <td class="p-2 font-bold">98 (2-3)</td>
                    <td>93-101</td>
                    <td>13-16</td>
                    <td>53-56</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">104 (4-5)</td>
                    <td>101-107</td>
                    <td>16-19</td>
                    <td>56-58</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">110 (6-7)</td>
                    <td>107-113</td>
                    <td>19-22</td>
                    <td>58-60</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">116 (8)</td>
                    <td>113-119</td>
                    <td>22-25</td>
                    <td>60-62</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4
              class="font-bold text-lg mb-3 dark:text-white border-l-4 border-green-500 pl-2"
            >
              Quần Trẻ Em
            </h4>
            <div class="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table class="w-full text-center">
                <thead class="bg-gray-100 dark:bg-gray-700 font-bold">
                  <tr>
                    <th class="p-2">Size</th>
                    <th class="p-2">Chiều cao</th>
                    <th class="p-2">Cân nặng</th>
                    <th class="p-2">Vòng bụng</th>
                    <th class="p-2">Vòng mông</th>
                  </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-600">
                  <tr>
                    <td class="p-2 font-bold">104 (4-5)</td>
                    <td>101-107</td>
                    <td>16-19</td>
                    <td>48-50</td>
                    <td>57-60</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">110 (6-7)</td>
                    <td>107-113</td>
                    <td>19-22</td>
                    <td>50-52</td>
                    <td>60-63</td>
                  </tr>
                  <tr>
                    <td class="p-2 font-bold">116 (8)</td>
                    <td>113-119</td>
                    <td>22-25</td>
                    <td>52-54</td>
                    <td>63-66</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL HƯỚNG DẪN THỬ ĐỒ AI -->
  <div v-if="showTryOnGuide"
    class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
    @click.self="showTryOnGuide = false">
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div
        class="flex justify-between items-center p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Hướng dẫn chụp ảnh để thử đồ AI
        </h3>
        <button
          @click="showTryOnGuide = false"
          class="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Nội dung chính -->
      <div
        class="p-6 overflow-y-auto custom-scrollbar text-sm space-y-6 text-gray-700 dark:text-gray-300"
      >
        <p class="font-medium text-base">
          Để AI xử lý chính xác và cho kết quả thử đồ đẹp nhất, vui lòng tuân
          thủ các yêu cầu sau:
        </p>

        <ul class="list-disc pl-5 space-y-3">
          <li><strong>Định dạng ảnh:</strong> JPG, JPEG, PNG</li>
          <li>
            <strong>Dung lượng ảnh:</strong> Không quá
            <span class="font-semibold text-blue-600 dark:text-blue-400"
              >3 MB</span
            >
          </li>
          <li>
            <strong>Độ phân giải ảnh:</strong> Nhỏ hơn
            <span class="font-semibold text-blue-600 dark:text-blue-400"
              >4096 × 4096 px</span
            >
          </li>
          <li>
            <strong>Yêu cầu về tư thế (ảnh người mặc):</strong>
            <ul
              class="list-circle pl-5 mt-1 space-y-1 text-gray-600 dark:text-gray-400"
            >
              <li>Ảnh chụp <strong>toàn thân chính diện</strong></li>
              <li>
                Hai tay phải được nhìn thấy rõ (không che khuất, không bắt chéo)
              </li>
              <li>
                Tránh các tư thế dang tay rộng, bắt chéo tay hoặc động tác quá
                phô trương
              </li>
            </ul>
          </li>
          <li>
            <strong>Loại trang phục phù hợp:</strong> Hoa văn và họa tiết
            <strong>đơn giản</strong>. Ví dụ: quần jean, áo polo, đồ tập yoga,
            váy, vest, áo thun, v.v.
          </li>
          <li>
            <strong>Ảnh quần áo (flat-lay):</strong>
            <ul
              class="list-circle pl-5 mt-1 space-y-1 text-gray-600 dark:text-gray-400"
            >
              <li>
                Ảnh <strong>trải phẳng</strong> (flat-lay), rõ nét và ngay ngắn
              </li>
              <li><strong>Phông nền</strong> đơn giản, sạch sẽ, đủ ánh sáng</li>
              <li>Chỉ hiển thị <strong>một món đồ duy nhất</strong></li>
              <li>Không xếp chồng hoặc phối cùng các trang phục khác</li>
              <li>
                Trang phục phải <strong>chiếm phần lớn khung hình</strong>
              </li>
            </ul>
          </li>
        </ul>

        <!-- PHẦN ẢNH VÍ DỤ MỚI -->

        <!-- PHẦN ẢNH MINH HỌA ĐÚNG / SAI -->
        <div class="mt-6">
          <h4
            class="font-semibold text-base mb-4 text-gray-800 dark:text-gray-200"
          >
            Ảnh minh họa đúng / sai
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Ảnh ĐÚNG -->
            <div class="space-y-3">
              <div
                class="relative rounded-lg overflow-hidden border border-green-200 dark:border-green-800 shadow-sm bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[300px]"
              >
                <img
                  src="https://ai-resource.ailabtools.com/try-on-clothes/doc/example/CorrectExample-1.webp"
                  alt="Ảnh đúng: rõ nét, nền trắng, chỉ 1 món đồ"
                  class="w-full max-h-[70vh] h-auto object-contain p-4 mx-auto"
                  loading="lazy"
                />
                <div
                  class="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded shadow"
                >
                  ĐÚNG
                </div>
              </div>
              <p class="text-sm text-center text-green-700 dark:text-green-400">
                Ảnh rõ nét, nền trắng, chỉ 1 món đồ
              </p>
            </div>

            <!-- Ảnh SAI -->
            <div class="space-y-3">
              <div
                class="relative rounded-lg overflow-hidden border border-red-200 dark:border-red-800 shadow-sm bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[300px]"
              >
                <img
                  src="https://ai-resource.ailabtools.com/try-on-clothes/doc/example/SideView-1.webp"
                  alt="Ảnh sai: người bị che, nền phức tạp, không rõ nét"
                  class="w-full max-h-[70vh] h-auto object-contain p-4 mx-auto"
                  loading="lazy"
                />
                <div
                  class="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow"
                >
                  SAI
                </div>
              </div>
              <p class="text-sm text-center text-red-700 dark:text-red-400">
                Ảnh người bị che, nền phức tạp, không rõ nét
              </p>
            </div>
          </div>

          <p
            class="text-xs text-gray-500 dark:text-gray-400 mt-6 italic text-center"
          >
            Ảnh ví dụ chỉ mang tính minh họa. Hãy chụp ảnh thật theo đúng hướng
            dẫn để có kết quả tốt nhất.
          </p>
        </div>

        <div
          class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800"
        >
          <p class="text-sm font-medium text-blue-800 dark:text-blue-300">
            Lưu ý: Ảnh không đáp ứng yêu cầu có thể dẫn đến kết quả thử đồ không
            chính xác hoặc thất bại.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right"
      >
        <button
          @click="showTryOnGuide = false"
          class="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  </div>
  <!-- END CHANGE -->
</template>

<script setup>
import { onMounted, ref, watch, reactive, computed } from "vue";
import { useRoute } from "vue-router";
import { useProductsStore } from "../../stores/products";
import { useCartStore } from "../../stores/cart";
import { useWishlistStore } from "../../stores/wishlist";
import { useUserStore } from "../../stores/user";
import { useUIStore } from "../../stores/ui";
import api from "../../utils/product_service_api";
import { formatCurrency } from "../../utils/helpers";
import { postAIRequest, getAIResponse } from "../../utils/AI_service";
const route = useRoute();
const productStore = useProductsStore();
const cart = useCartStore();
const wishlist = useWishlistStore();
const userStore = useUserStore();
const ui = useUIStore();

const showSizeGuide = ref(false);
const sizeTab = ref("Nam");

// State Product Detail
const product = ref(null);
const reviews = ref([]);
const newReview = reactive({ rating: 5, comment: "" });
const isSubmitting = ref(false);
const qty = ref(1);
const activeTab = ref("description");
const selectedImage = ref("");
const productImages = ref([]);
const currentImageIndex = ref(0);
const colors = ref([]);
const sizes = ref([]);
const selectedColor = ref(null);
const selectedSize = ref("");
const imageColorMap = ref({});
const imageIndexToColor = ref({});

// State Try On
const tryOnImage = ref("");
const tryOnSelectedColor = ref(null);
const fileInput = ref(null);

// Thêm vào phần ref/reactive hiện có
const isTryingOn = ref(false); // Trạng thái đang thử đồ hay chưa

const pollAttempts = ref(0);
const pollMaxAttempts = ref(40); // Tăng lên 40 lần x 5s = 200 giây (đôi khi AI chậm)

//biến mở thử đồ
const showTryOnGuide = ref(false);

// // Hàm bắt đầu thử đồ
// function startTryOn() {
//   if (!tryOnImage.value || !tryOnSelectedColor.value) return;

//   isTryingOn.value = true;
//   isProcessing.value = true;
//   tryOnResultImage.value = ''; // Reset ảnh cũ

//   // Giả lập chờ 4 giây rồi hiện kết quả
//   setTimeout(() => {
//     isProcessing.value = false;

//     // === LINK ẢNH GIẢ LẬP Ở ĐÂY ===
//     // Thay bằng link ảnh thật khi có API
//     tryOnResultImage.value = 'https://ailab-result-rapidapi.oss-accelerate.aliyuncs.com/faceBody/clothes/2025-12-15/7ffe4ebf-ac28-4b3f-a00b-885a4b8810c8_1765785333.png';

//     // Ví dụ link khác (có người mặc áo):
//     // 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

//     // Hoặc link placeholder hài hước để test:
//     // 'https://placehold.co/600x800?text=Kết+Quả+Thử+Đồ+Ảo%0AÁo+' + encodeURIComponent(tryOnSelectedColor.value.name);
//   }, 4000); // 4000ms = 4 giây
// }
// Thay toàn bộ hàm startTryOn cũ bằng hàm mới này
// Import (đảm bảo đã có)

/**
 * Chuyển bất kỳ URL ảnh (webp, avif, jpg, png...) về Blob định dạng PNG
 * @param {string} imageUrl - URL ảnh gốc
 * @returns {Promise<Blob>} Blob định dạng image/png
 */
async function convertImageToPNG(imageUrl) {
  // Tạo img element để load ảnh
  const img = new Image();
  img.crossOrigin = "anonymous"; // Quan trọng nếu ảnh từ domain khác (có thể bị CORS, xem note bên dưới)

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Tạo canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Chuyển về Blob PNG (chất lượng tốt, kích thước vừa phải)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Chuyển đổi thất bại"));
          }
        },
        "image/png",
        0.95,
      ); // 0.95 = chất lượng cao
    };

    img.onerror = () => reject(new Error("Không load được ảnh"));
    img.src = imageUrl;
  });
}

// Nếu muốn JPEG thay vì PNG (kích thước nhỏ hơn, nhưng có thể mất chi tiết)
async function convertImageToJPEG(imageUrl, quality = 0.92) {
  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Chuyển đổi thất bại"));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

async function startTryOn() {
  if (!tryOnImage.value || !tryOnSelectedColor.value) return;

  isTryingOn.value = true;
  isProcessing.value = true;
  tryOnResultImage.value = "";
  pollAttempts.value = 0; // Reset counter

  try {
    // === Phần chuẩn bị file (giữ nguyên như debug cũ) ===
    const personBlob = dataURLtoBlob(tryOnImage.value);
    const personFile = new File([personBlob], "person.jpg", {
      type: "image/jpeg",
    });

    const clothesUrl =
      getColorImage(tryOnSelectedColor.value.hex) || productImages.value[0];
    // const clothesBlob = await urlToBlob(clothesUrl);
    // const clothesFile = new File([clothesBlob], "clothes.jpg", { type: "image/jpeg" });
    // === Ảnh quần áo (sản phẩm) - BẮT BUỘC chuyển về PNG/JPEG ===
    let clothesBlob;
    try {
      // Dùng PNG để an toàn nhất (AILab chấp nhận tốt)
      clothesBlob = await convertImageToPNG(clothesUrl);
      // Hoặc dùng JPEG nếu muốn file nhẹ hơn:
      // clothesBlob = await convertImageToJPEG(clothesUrl, 0.92);
    } catch (err) {
      console.error("Lỗi chuyển đổi ảnh sản phẩm:", err);
      alert("Ảnh sản phẩm không tương thích, không thể thử đồ ảo");
      isProcessing.value = false;
      return;
    }

    const clothesFile = new File([clothesBlob], "clothes.png", {
      type: "image/png",
    });
    // Nếu dùng JPEG: "clothes.jpg", { type: "image/jpeg" }
    const payload = {
      task_type: "async",
      person_image: personFile,
      clothes_image: clothesFile,
      clothes_type: "upper_body",
    };

    // === Gửi POST ===
    const postResponse = await postAIRequest(payload);
    const taskId = postResponse.data.task_id;

    if (!taskId) throw new Error("Không nhận được task_id");

    console.log("✅ Task đã tạo:", taskId);

    // === Poll kết quả ===
    while (pollAttempts.value < pollMaxAttempts.value) {
      pollAttempts.value++;
      console.log(`🔄 Poll lần ${pollAttempts.value}...`);

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Chờ 5 giây

      const pollResponse = await getAIResponse(taskId);
      const resultData = pollResponse.data;

      console.log("📥 Poll response:", resultData);

      // 1. THÀNH CÔNG: task_status === 2 và có ảnh
      if (resultData.task_status === 2 && resultData.data?.image) {
        tryOnResultImage.value = resultData.data.image;
        isProcessing.value = false;
        console.log("🎉 THÀNH CÔNG! Ảnh thử đồ:", tryOnResultImage.value);
        return;
      }

      // 2. THẤT BẠI: error_code !== 0 hoặc có error_msg
      if (resultData.error_code !== 0 || resultData.error_msg) {
        throw new Error(
          resultData.error_msg || "AI xử lý thất bại (mã lỗi từ server)",
        );
      }

      // 3. VẪN ĐANG XỬ LÝ: task_status === 0 → tiếp tục poll
      if (resultData.task_status === 0) {
        console.log("⏳ Đang xử lý... tiếp tục chờ");
        // Không throw, chỉ continue
        continue;
      }

      // 4. Các trạng thái khác (an toàn)
      console.log(
        "⏳ Trạng thái task:",
        resultData.task_status,
        "- Chưa xong, chờ thêm...",
      );
    }

    throw new Error("⏰ Timeout: Đã chờ quá lâu mà AI chưa xử lý xong");
  } catch (error) {
    console.error("❌ Lỗi thử đồ ảo:", error);
    alert(`Không thể thử đồ: ${error.message || "Lỗi không xác định"}`);
    isProcessing.value = false;
    tryOnResultImage.value = "";
  }
}
// Helper: DataURL → Blob
function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

// Helper: URL ảnh → Blob (để upload)
async function urlToBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Không tải được ảnh quần áo");
  const blob = await response.blob();
  return blob;
}
// Hàm quay lại màn hình chọn
function backToSelection() {
  isTryingOn.value = false;
}

const tryOnResultImage = ref(""); // Ảnh kết quả từ AI (ban đầu rỗng)
const isProcessing = ref(false); // Trạng thái đang xử lý

onMounted(async () => {
  const id = route.params.id;
  await productStore.fetchProductById(id);
  const data = productStore.currentProduct;

  if (data) {
    product.value = {
      id: data.id,
      sku: data.sku,
      name: data.name,
      price: data.price,
      description: data.description,
      stock: data.stock_quantity,
      inStock: data.stock_quantity > 0,
      rating: data.rating || 0,
      reviews: data.review_count || 0,
    };

    if (data.attributes) {
      data.attributes.forEach((attr) => {
        const name = attr.attribute_name.toLowerCase();
        if (name === "màu") {
          const match = attr.attribute_value.match(/^(.*)\s\((#.*)\)$/);
          if (match) colors.value.push({ name: match[1], hex: match[2] });
          else
            colors.value.push({ name: attr.attribute_value, hex: "#000000" });
        } else if (name === "size" || name === "kích cỡ") {
          sizes.value.push(attr.attribute_value);
        }
      });
    }

    // Auto select
    if (colors.value.length > 0) {
      selectedColor.value = colors.value[0];
      tryOnSelectedColor.value = colors.value[0];
    }
    if (sizes.value.length > 0) selectedSize.value = sizes.value[0];

    // Xử lý Ảnh
    if (data.images && data.images.length > 0) {
      const sortedImages = [...data.images].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      productImages.value = sortedImages.map((img) => img.image_url);

      imageColorMap.value = {};
      imageIndexToColor.value = {};

      sortedImages.forEach((img, index) => {
        if (img.color) {
          const normalizedColor = img.color.toLowerCase();
          // Map Màu -> Ảnh (Chỉ lấy ảnh đầu tiên của màu đó)
          if (imageColorMap.value[normalizedColor] === undefined) {
            imageColorMap.value[normalizedColor] = index;
          }
          // Map Ảnh -> Màu (Tất cả ảnh)
          imageIndexToColor.value[index] = normalizedColor;
        }
      });
    } else {
      productImages.value = ["https://placehold.co/600x600?text=No+Image"];
    }

    selectedImage.value = productImages.value[0];
    fetchReviews(id);
  }
});

// Watch: Chọn Màu -> Đổi Ảnh
watch(selectedColor, (newColor) => {
  if (newColor && newColor.hex) {
    const targetIndex = imageColorMap.value[newColor.hex.toLowerCase()];
    if (targetIndex !== undefined) selectImageByIndex(targetIndex);
  }
});

// Watch: Lướt Ảnh -> Đổi Màu (Reverse)
watch(currentImageIndex, (newIndex) => {
  const colorHex = imageIndexToColor.value[newIndex];
  if (colorHex) {
    const matchingColor = colors.value.find(
      (c) => c.hex.toLowerCase() === colorHex,
    );
    if (matchingColor && selectedColor.value?.hex.toLowerCase() !== colorHex) {
      selectedColor.value = matchingColor;
    }
  }
});

// Helper lấy ảnh cho Try On
function getColorImage(hex) {
  const idx = imageColorMap.value[hex.toLowerCase()];
  if (idx !== undefined) return productImages.value[idx];
  return productImages.value[0]; // Fallback
}

// Handler lỗi ảnh
function handleImageError(e) {
  e.target.src = "https://placehold.co/600x600?text=Error";
}

function tryOnSelectColor(color) {
  tryOnSelectedColor.value = color;
}
function handleTryOnImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => (tryOnImage.value = e.target.result);
  reader.readAsDataURL(file);
}
function clearTryOnImage() {
  tryOnImage.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

async function submitReview() {
  if (!newReview.comment.trim()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      user_id: userStore.profile?.id || 99,
      rating: newReview.rating,
      comment: newReview.comment,
      title: "Đánh giá",
    };
    const res = await api.post(
      `/products/${product.value.id}/reviews`,
      payload,
    );
    if (res.data.success) {
      alert("Đánh giá thành công!");
      newReview.comment = "";
      fetchReviews(product.value.id);
    }
  } catch (e) {
    alert(e.message);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDeleteReview(reviewId) {
  if (!confirm("Xóa bình luận?")) return;
  try {
    await api.delete(`/products/reviews/${reviewId}`);
    alert("Đã xóa");
    fetchReviews(product.value.id);
  } catch (e) {
    alert("Lỗi xóa");
  }
}

async function fetchReviews(productId) {
  try {
    const res = await api.get(`/products/${productId}/reviews`);
    if (res.data.success) reviews.value = res.data.data;
  } catch (e) {
    console.error(e);
  }
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN");
}
function nextImage() {
  if (!productImages.value.length) return;
  currentImageIndex.value =
    (currentImageIndex.value + 1) % productImages.value.length;
  selectedImage.value = productImages.value[currentImageIndex.value];
}
function previousImage() {
  if (!productImages.value.length) return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + productImages.value.length) %
    productImages.value.length;
  selectedImage.value = productImages.value[currentImageIndex.value];
}
function selectImageByIndex(idx) {
  currentImageIndex.value = idx;
  selectedImage.value = productImages.value[idx];
}

function addToCart() {
  if (!product.value) return;
  cart.addToCart(
    {
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: selectedImage.value,
      selectedColor: selectedColor.value?.name || selectedColor.value || null,
      selectedSize: selectedSize.value,
    },
    qty.value,
  );
}
function toggleWishlist() {
  if (!product.value) return;
  wishlist.toggleWishlist({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: selectedImage.value,
  });
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
