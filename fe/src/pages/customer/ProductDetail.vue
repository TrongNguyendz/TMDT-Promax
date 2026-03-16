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

        <!-- Try On Button -->
        <RouterLink
          :to="`/try-on/${product.id}`"
          class="block mt-6 rounded-lg w-fit bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 active:scale-[0.98] transition-all text-center"
        >
          THỬ ĐỒ VỚI AI
        </RouterLink>
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
                <h3 class="font-bold text-xl mb-4 text-gray-900 dark:text-white">Khách hàng nhận xét ({{ reviews.length }})</h3>
                <div v-if="reviews.length === 0" class="text-center py-10 text-gray-500 border border-dashed rounded-lg dark:border-gray-700">Chưa có đánh giá nào. Hãy là người đầu tiên!</div>
                
                <div v-else class="space-y-6">
                    <!-- Từng Review -->
                   <!-- Từng Review -->
<div v-for="review in reviews" :key="review.id" class="border-b pb-6 dark:border-gray-700 last:border-0">
    
    <!-- 1. HEADER REVIEW CHÍNH -->
    <div class="flex justify-between items-start mb-2">
        <div class="flex gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                {{ (review.user_name || 'K').charAt(0).toUpperCase() }}
            </div>
            <div>
                <h4 class="font-bold text-gray-900 dark:text-white">{{ review.user_name || 'Khách hàng' }}</h4>
                <div class="flex text-yellow-400 text-sm mt-0.5">
                    <span v-for="i in 5" :key="i">{{ i <= review.rating ? '★' : '☆' }}</span>
                </div>
            </div>
        </div>
        <span class="text-xs text-gray-400">{{ formatDate(review.created_at) }}</span>
    </div>
    
    <!-- 2. NỘI DUNG REVIEW CHÍNH -->
    <p class="text-gray-700 dark:text-gray-300 mt-2 ml-14">{{ review.comment }}</p>
    
    <!-- 3. DANH SÁCH CÁC CÂU TRẢ LỜI LỒNG NHAU (THREAD) -->
    <div v-if="review.replies && review.replies.length > 0" class="ml-14 mt-4 space-y-3">
        <div v-for="(reply, rIdx) in review.replies" :key="rIdx" 
             class="p-3 rounded-xl border" 
             :class="['admin', 'staff'].includes(reply.role) ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'">
            
            <div class="flex items-center gap-2 mb-1">
                <!-- NẾU LÀ SHOP -->
                <span v-if="['admin', 'staff'].includes(reply.role)" class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Shop phản hồi
                </span>
                <!-- NẾU LÀ KHÁCH -->
                <span v-else class="font-bold text-xs text-gray-800 dark:text-gray-200">
                    ↳ {{ reply.user_name }}
                </span>
                
                <span class="text-[10px] text-gray-400">{{ formatDate(reply.created_at) }}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ reply.content }}</p>
        </div>
    </div>

    <!-- 4. CÁC NÚT TƯƠNG TÁC (Đặt ở dưới cùng đoạn chat) -->
    <div class="ml-14 mt-3 flex gap-4 items-center">
        <!-- Nút Trả lời (Bất kỳ ai đăng nhập cũng thấy) -->
        <button v-if="userStore.token" @click="activeReplyId = review.id" class="text-xs font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
            Trả lời
        </button>
        
        <!-- Nút Xóa (Chỉ Admin, Staff hoặc Chính chủ bài viết gốc mới thấy) -->
        <button v-if="['admin', 'staff'].includes(userStore.profile?.role) || userStore.profile?.id === review.user_id" @click="handleDeleteReview(review.id)" class="text-xs text-red-500 hover:text-red-700 font-medium transition">
            Xóa
        </button>
    </div>

    <!-- 5. Ô NHẬP PHẢN HỒI -->
    <div v-if="activeReplyId === review.id" class="ml-14 mt-3 flex gap-2">
        <input v-model="replyText" type="text" :placeholder="`Trả lời ${review.user_name}...`" class="flex-1 text-sm px-4 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" @keyup.enter="submitReply(review.id)" />
        <button @click="submitReply(review.id)" class="px-5 py-2 bg-gray-900 dark:bg-white dark:text-black text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">Gửi</button>
        <button @click="activeReplyId = null" class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">Hủy</button>
    </div>
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
const activeReplyId = ref(null); // ID của bình luận đang được bấm nút "Phản hồi"
const replyText = ref('');  

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


async function submitReview() {
    if (!newReview.comment.trim()) return;
    isSubmitting.value = true;
    try {
        const payload = { 
            user_id: userStore.profile?.id || 99, 
            // Gửi kèm tên để Backend lưu vào DB thay vì hiện "Khách hàng"
            user_name: userStore.profile?.full_name || userStore.profile?.username || userStore.profile?.name || 'Khách hàng',
            rating: newReview.rating, 
            comment: newReview.comment
        };
        const res = await api.post(`/products/${product.value.id}/reviews`, payload);
        if (res.data.success) { 
            alert('Đánh giá thành công!'); 
            newReview.comment = ''; 
            newReview.rating = 5;
            fetchReviews(product.value.id); 
        }
    } catch (e) { alert(e.message); } finally { isSubmitting.value = false; }
}

// 3. THÊM HÀM MỚI: Gửi Phản Hồi (Reply)
async function submitReply(reviewId) {
    if (!replyText.value.trim()) return;
    
    try {
        const payload = { 
            reply: replyText.value.trim(),
            // GỬI KÈM TÊN USER ĐANG ĐĂNG NHẬP
            user_name: userStore.profile?.full_name || userStore.profile?.username || 'Khách hàng' 
        };
        const res = await api.put(`/products/reviews/${reviewId}/reply`, payload);
        
        if (res.data.success) {
            activeReplyId.value = null;
            replyText.value = '';
            fetchReviews(product.value.id);
        }
    } catch (error) {
        alert('Lỗi gửi phản hồi: ' + (error.response?.data?.message || error.message));
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
