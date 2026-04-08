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


        <div class="mt-6 flex flex-wrap gap-3">
          <!-- Tăng giảm số lượng -->
          <div class="flex items-center rounded border bg-white dark:bg-gray-900 dark:border-gray-700 h-12">
            <button @click="qty = Math.max(1, qty - 1)" class="px-4 h-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">−</button>
            <input v-model.number="qty" type="number" min="1" :max="product.stock" class="w-12 border-0 bg-transparent text-center focus:ring-0 appearance-none font-medium" />
            <button @click="qty = Math.min(product.stock, qty + 1)" class="px-4 h-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">+</button>
          </div>

          <!-- Nút Yêu thích -->
          <button @click="toggleWishlist" class="rounded-lg border px-4 h-12 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :fill="wishlist.isInWishlist(product.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <!-- Nút Thêm vào giỏ -->
          <button 
            :disabled="!product.inStock" 
            class="flex-1 min-w-[140px] rounded-lg bg-gray-900 h-12 font-bold text-white shadow hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200" 
            @click="addToCart"
          >
            THÊM VÀO GIỎ
          </button>

          <!-- MUA NGAY -->
          <button 
            :disabled="!product.inStock" 
            class="flex-1 min-w-[140px] rounded-lg bg-red-600 h-12 font-bold text-white shadow-lg hover:bg-red-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
            @click="buyNow"
          >
            MUA NGAY
          </button>
        </div>
        <!-- [END CHANGE] -->

        <!-- Try On & Compare Buttons -->
        <div class="flex flex-wrap items-center gap-2 mt-6">
          <RouterLink
            :to="`/try-on/${product.id}`"
            class="rounded-lg w-fit bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 active:scale-[0.98] transition-all text-center"
          >
            THỬ ĐỒ VỚI AI
          </RouterLink>
          <button
            type="button"
            @click="compareStore.addToCompare(product)"
            class="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4H8m9 5h-1v-4h-4m-5 4h-1V8h6M19 7h-1V4H8v3H7a2 2 0 00-2 2v11a2 2 0 002 2h9a2 2 0 002-2V9a2 2 0 00-2-2z" />
            </svg>
            So sánh sản phẩm
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
          <!-- Form Viết đánh giá -->
          <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
            <h3 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">Viết đánh giá của bạn</h3>
            <div v-if="userStore.token">
              <form @submit.prevent="submitReview">
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bạn cảm thấy thế nào?</label>
                  <div class="flex gap-2">
                    <button type="button" v-for="star in 5" :key="star" @click="newReview.rating = star" class="text-2xl transition-transform hover:scale-110" :class="star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'">★</button>
                  </div>
                </div>
                <div class="mb-4">
                  <textarea v-model="newReview.comment" rows="3" class="w-full p-3 rounded border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" placeholder="Chia sẻ cảm nhận..." required></textarea>
                </div>
                <button type="submit" class="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200" :disabled="isSubmitting">{{ isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá' }}</button>
              </form>
            </div>
            <div v-else class="text-center py-4 text-gray-500">
              Vui lòng <router-link to="/auth" class="text-blue-600 hover:underline font-medium">đăng nhập</router-link> để viết đánh giá.
            </div>
          </div>

          <!-- Danh sách đánh giá -->
          <div>
            
            <div v-if="reviews.length === 0" class="text-center py-10 text-gray-500 border border-dashed rounded-lg dark:border-gray-700">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>

            <div v-else class="space-y-8">
              <div v-for="review in reviews" :key="review.id" class="pb-8 border-b dark:border-gray-700 last:border-0 last:pb-0">

                <!-- Header review -->
                <div class="flex justify-between items-start mb-3">
                  <div class="flex gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 shrink-0">
                      {{ (review.user_name || 'K').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <h4 class="font-bold text-gray-900 dark:text-white">{{ review.user_name || 'Khách hàng' }}</h4>
                      <div class="flex text-yellow-400 text-sm mt-0.5">
                        <span v-for="i in 5" :key="i">{{ i <= review.rating ? '★' : '☆' }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="text-xs text-gray-400">{{ formatRelativeTime(review.created_at) }}</span>
                </div>

                <!-- Nội dung comment -->
                <p class="text-gray-700 dark:text-gray-300 ml-13 leading-relaxed">{{ review.comment || '(Chỉ đánh giá sao)' }}</p>

                <!-- Replies với Xem thêm / Thu gọn -->
                <div v-if="review.replies && review.replies.length > 0" class="ml-13 mt-5 space-y-4">
                  <!-- Preview (chỉ 1 reply mới nhất) -->
                  <div v-if="!expandedReviews.has(review.id)">
                    <div
                      v-for="(reply, rIdx) in getPreviewReplies(review.replies)"
                      :key="rIdx"
                      class="p-4 rounded-xl border bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                      :class="['admin', 'staff'].includes(reply.role) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''"
                    >
                      <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          v-if="['admin', 'staff'].includes(reply.role)"
                          class="bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Shop phản hồi
                        </span>
                        <span v-else class="font-bold text-xs text-gray-800 dark:text-gray-200">
                          ↳ {{ reply.user_name }}
                        </span>
                        <span class="text-[10px] text-gray-400">{{ formatRelativeTime(reply.created_at) }}</span>
                      </div>
                      <p class="text-sm text-gray-700 dark:text-gray-300">{{ reply.content }}</p>
                    </div>
                  </div>

                  <!-- Expanded: tất cả trừ reply cuối (đã preview) -->
                  <div v-if="expandedReviews.has(review.id)" class="space-y-4">
                    <div
                      v-for="(reply, rIdx) in getExpandedReplies(review.replies)"
                      :key="rIdx"
                      class="p-4 rounded-xl border bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                      :class="['admin', 'staff'].includes(reply.role) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''"
                    >
                      <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          v-if="['admin', 'staff'].includes(reply.role)"
                          class="bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Shop phản hồi
                        </span>
                        <span v-else class="font-bold text-xs text-gray-800 dark:text-gray-200">
                          ↳ {{ reply.user_name }}
                        </span>
                        <span class="text-[10px] text-gray-400">{{ formatRelativeTime(reply.created_at) }}</span>
                      </div>
                      <p class="text-sm text-gray-700 dark:text-gray-300">{{ reply.content }}</p>
                    </div>
                  </div>

                  <!-- Nút Xem thêm / Thu gọn -->
                  <button
                    v-if="review.replies.length > 1"
                    @click="toggleReplies(review.id)"
                    class="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded px-3 py-1.5"
                  >
                    <span>
                      {{ expandedReviews.has(review.id)
                        ? `Thu gọn phản hồi`
                        : `Xem thêm ${review.replies.length - 1} phản hồi`
                      }}
                    </span>
                    <svg
                      class="w-4 h-4 transition-transform duration-200"
                      :class="expandedReviews.has(review.id) ? 'rotate-180' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <!-- Nút tương tác -->
                <div class="ml-13 mt-4 flex gap-5 items-center text-sm">
                  <button
                    v-if="userStore.token"
                    @click="activeReplyId = review.id"
                    class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Trả lời
                  </button>

                  <button
                    v-if="['admin', 'staff'].includes(userStore.profile?.role) || userStore.profile?.id === review.user_id"
                    @click="handleDeleteReview(review.id)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition"
                  >
                    Xóa
                  </button>
                </div>

                <!-- Input reply -->
                <div v-if="activeReplyId === review.id" class="ml-13 mt-4 flex gap-3">
                  <input
                    v-model="replyText"
                    type="text"
                    :placeholder="`Trả lời ${review.user_name}...`"
                    class="flex-1 text-sm px-4 py-3 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                    @keyup.enter="submitReply(review.id)"
                  />
                  <button
                    @click="submitReply(review.id)"
                    class="px-6 py-3 bg-gray-900 dark:bg-white dark:text-black text-white text-sm font-bold rounded-xl hover:opacity-90 transition"
                  >
                    Gửi
                  </button>
                  <button
                    @click="activeReplyId = null"
                    class="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Size Guide (giữ nguyên) -->
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
  </section>

  <div v-else class="container mx-auto px-4 py-8 animate-pulse">
    <div class="h-64 bg-gray-200 rounded"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, reactive } from "vue";
import { useRoute, useRouter } from 'vue-router'; 
import { useProductsStore } from "../../stores/products";
import { useCartStore } from "../../stores/cart";
import { useWishlistStore } from "../../stores/wishlist";
import { useUserStore } from "../../stores/user";
import { useCompareStore } from "../../stores/compare";
import { useUIStore } from "../../stores/ui";
import api from "../../utils/product_service_api";
import { formatCurrency } from "../../utils/helpers";
import { useCheckoutStore } from '../../stores/checkout'; 

const router = useRouter();
const route = useRoute();
const productStore = useProductsStore();
const cart = useCartStore();
const wishlist = useWishlistStore();
const userStore = useUserStore();
const compareStore = useCompareStore();
const ui = useUIStore(); // nếu bạn dùng toast thì có thể dùng ui.pushToast
const checkoutStore = useCheckoutStore(); 

const showSizeGuide = ref(false);
const sizeTab = ref("Nam");

// Product states
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

// Review states
const activeReplyId = ref(null);
const replyText = ref('');
const expandedReviews = ref(new Set());

// Fetch product & reviews
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

    // Attributes (colors, sizes)
    if (data.attributes) {
      data.attributes.forEach((attr) => {
        const name = attr.attribute_name.toLowerCase();
        if (name === "màu") {
          const match = attr.attribute_value.match(/^(.*)\s\((#.*)\)$/);
          if (match) colors.value.push({ name: match[1], hex: match[2] });
          else colors.value.push({ name: attr.attribute_value, hex: "#000000" });
        } else if (name === "size" || name === "kích cỡ") {
          sizes.value.push(attr.attribute_value);
        }
      });
    }

    if (colors.value.length > 0) selectedColor.value = colors.value[0];
    if (sizes.value.length > 0) selectedSize.value = sizes.value[0];

    // Images
    if (data.images && data.images.length > 0) {
      const sortedImages = [...data.images].sort((a, b) => a.sort_order - b.sort_order);
      productImages.value = sortedImages.map((img) => img.image_url);

      sortedImages.forEach((img, index) => {
        if (img.color) {
          const normalized = img.color.toLowerCase();
          if (imageColorMap.value[normalized] === undefined) {
            imageColorMap.value[normalized] = index;
          }
          imageIndexToColor.value[index] = normalized;
        }
      });
    } else {
      productImages.value = ["https://placehold.co/600x600?text=No+Image"];
    }

    selectedImage.value = productImages.value[0];
    if (product.value) {
      product.value.image = selectedImage.value;
    }
    fetchReviews(id);
  }
});

// Watchers
watch(selectedColor, (newColor) => {
  if (newColor?.hex) {
    const idx = imageColorMap.value[newColor.hex.toLowerCase()];
    if (idx !== undefined) selectImageByIndex(idx);
  }
});

watch(currentImageIndex, (newIndex) => {
  const colorHex = imageIndexToColor.value[newIndex];
  if (colorHex) {
    const match = colors.value.find(c => c.hex.toLowerCase() === colorHex);
    if (match && selectedColor.value?.hex?.toLowerCase() !== colorHex) {
      selectedColor.value = match;
    }
  }
});

// Reply logic
const toggleReplies = (reviewId) => {
  if (expandedReviews.value.has(reviewId)) {
    expandedReviews.value.delete(reviewId);
  } else {
    expandedReviews.value.add(reviewId);
  }
};

const getPreviewReplies = (replies) => {
  if (!replies?.length) return [];
  const sorted = [...replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return [sorted[sorted.length - 1]]; // reply mới nhất
};

const getExpandedReplies = (replies) => {
  if (!replies?.length) return [];
  const sorted = [...replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return sorted;// tất cả reply theo thứ tự thời gian (cũ nhất -> mới nhất)
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} giờ trước`;
  if (diffMin < 10080) return `${Math.floor(diffMin / 1440)} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// API calls
async function fetchReviews(productId) {
  try {
    const res = await api.get(`/products/${productId}/reviews`);
    if (res.data.success) {
      reviews.value = res.data.data;
    }
  } catch (e) {
    console.error("Lỗi tải đánh giá:", e);
  }
}

async function submitReview() {
  if (!newReview.comment.trim()) return;
  isSubmitting.value = true;
  try {
    const payload = {
      user_id: userStore.profile?.id || 99,
      user_name: userStore.profile?.full_name || userStore.profile?.username || 'Khách hàng',
      rating: newReview.rating,
      comment: newReview.comment
    };
    const res = await api.post(`/products/${product.value.id}/reviews`, payload);
    if (res.data.success) {
      newReview.comment = '';
      newReview.rating = 5;
      fetchReviews(product.value.id);
      ui.pushToast({
  message: "Đánh giá đã được gửi!",
  type: "success"
});
    }
  } catch (e) {
    ui.pushToast({
      message: 'Lỗi: ' + (e.response?.data?.message || e.message),
      type: "error"
    });
  } finally {
    isSubmitting.value = false;
  }
}

async function submitReply(reviewId) {
  if (!replyText.value.trim()) return;
  try {
    const payload = {
      reply: replyText.value.trim(),
      user_name: userStore.profile?.full_name || userStore.profile?.username || 'Khách hàng'
    };
    const res = await api.put(`/products/reviews/${reviewId}/reply`, payload);
    if (res.data.success) {
      activeReplyId.value = null;
      replyText.value = '';
      fetchReviews(product.value.id);
    }
  } catch (error) {
    ui.pushToast({
      message: 'Lỗi gửi phản hồi: ' + (error.response?.data?.message || error.message),
      type: "error"
    });
  }
}

async function handleDeleteReview(reviewId) {
  if (!confirm("Xác nhận xóa đánh giá này?")) return;
  try {
    await api.delete(`/products/reviews/${reviewId}`);
    fetchReviews(product.value.id);
  } catch (e) {
    ui.pushToast({
      message: "Lỗi xóa đánh giá",
      type: "error"
    });
  }
}

function handleImageError(e) {
  e.target.src = "https://placehold.co/600x600?text=Error";
}

function nextImage() {
  currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length;
  selectedImage.value = productImages.value[currentImageIndex.value];
}

function previousImage() {
  currentImageIndex.value = (currentImageIndex.value - 1 + productImages.value.length) % productImages.value.length;
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
      selectedColor: selectedColor.value?.name || null,
      selectedSize: selectedSize.value,
    },
    qty.value
  );
}

function buyNow() {
  if (!product.value) return;

  checkoutStore.setDirectBuy({
      id: product.value.id,
      product_id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: selectedImage.value || productImages.value[0],
      selectedColor: selectedColor.value?.name || null,
      selectedSize: selectedSize.value,
      quantity: qty.value
  });

  router.push('/checkout');
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
/* Có thể thêm animation nếu muốn */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>