<template>
  <header class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80 transition-all duration-300">
    <!-- Container chính: Chiều cao chuẩn 64px cho Desktop và 56px cho Mobile -->
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 h-14 lg:h-16">
      
      <!-- 1. LOGO SECTION -->
      <RouterLink to="/" class="group flex shrink-0 items-center">
        <!-- 
          Container Logo: 
          Desktop: 48px (lg:h-12) | Mobile: 40px (h-10)
        -->
        <div class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md dark:border-gray-700 dark:bg-gray-900 lg:h-12 lg:w-12">
          <img 
            :src="logoUrl" 
            alt="Home" 
            class="h-full w-full object-cover" 
          />
          <!-- Glow effect khi hover -->
          <div class="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
        </div>
      </RouterLink>

      <!-- 2. SEARCH BAR SECTION -->
      <div class="hidden max-w-md flex-1 px-6 md:block lg:max-w-lg">
        <SearchBar @search="onSearch" />
      </div>

      <!-- 3. ACTIONS NAV SECTION -->
      <nav class="flex items-center gap-1.5 lg:gap-3">
        
        <!-- Theme Toggle -->
        <button 
          @click="toggleTheme" 
          class="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          :title="isDark ? 'Chế độ sáng' : 'Chế độ tối'"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 6.343l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Cart Icon -->
        <RouterLink to="/cart" class="group relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg class="h-5 w-5 text-gray-600 transition-colors group-hover:text-black dark:text-gray-400 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
</svg>
          <span v-if="cartCount" class="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm">
            {{ cartCount }}
          </span>
        </RouterLink>

        <!-- Profile / Dropdown -->
        <div class="relative ml-1">
          <!-- Trường hợp: Đã đăng nhập -->
          <div v-if="isAuth" class="flex items-center">
            <button 
              @click.stop="isDropdownOpen = !isDropdownOpen" 
              class="flex items-center gap-1.5 overflow-hidden rounded-full border border-gray-100 p-0.5 transition-all hover:border-gray-200 hover:shadow-sm dark:border-gray-800 dark:hover:border-gray-700"
            >
              <img 
                :src="userAvatar" 
                alt="Avatar" 
                class="h-8 w-8 rounded-full object-cover"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-1 h-3.5 w-3.5 text-gray-400 transition-transform" :class="{'rotate-180': isDropdownOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <transition name="fade-slide">
              <div v-if="isDropdownOpen" class="absolute right-0 top-full mt-2 w-52 divide-y divide-gray-50 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 dark:divide-gray-800 dark:bg-gray-900 dark:ring-white/10">
                <div class="px-4 py-2.5">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tài khoản</p>
                  <p class="truncate text-sm font-bold text-gray-900 dark:text-white">{{ user.profile?.fullname || user.profile?.username }}</p>
                </div>
                <div class="py-1">
                  <RouterLink to="/profile" @click="isDropdownOpen = false" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    Trang cá nhân
                  </RouterLink>
                  <RouterLink to="/orders" @click="isDropdownOpen = false" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    Đơn hàng của tôi
                  </RouterLink>
                  <RouterLink to="/wishlist" @click="isDropdownOpen = false" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    Yêu thích
                  </RouterLink>
                </div>
                <div class="py-1">
                  <button @click="logoutAndClose" class="flex w-full items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Đăng xuất
</button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Trường hợp: Chưa đăng nhập -->
          <RouterLink v-else to="/auth" class="inline-flex h-9 items-center justify-center rounded-full bg-gray-900 px-5 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-black hover:shadow-lg dark:bg-white dark:text-black">
            Đăng nhập
          </RouterLink>
        </div>
      </nav>
    </div>

    <!-- SEARCH BAR MOBILE -->
    <div class="px-4 pb-3 md:hidden">
      <SearchBar @search="onSearch" />
    </div>
  </header>
</template>


<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cart';
import { useUserStore } from '../../stores/user';
import { useUIStore } from '../../stores/ui';
import SearchBar from '../forms/SearchBar.vue';

const logoUrl = new URL('../../assets/logoweb.png', import.meta.url).href;
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=random';

const router = useRouter();
const cart = useCartStore();
const user = useUserStore();
const ui = useUIStore();

const cartCount = computed(() => cart.itemCount);
const isAuth = computed(() => user.isAuthenticated);
const isDark = computed(() => ui.isDarkMode);
const isDropdownOpen = ref(false);

const userAvatar = computed(() => {
  if (user.profile?.avatar_url) return `http://localhost:3001${user.profile.avatar_url}`;
  return defaultAvatar;
});

// Đóng dropdown khi click ra ngoài
const closeDropdown = (e) => {
  if (!e.target.closest('.relative')) isDropdownOpen.value = false;
};
onMounted(() => window.addEventListener('click', closeDropdown));
onUnmounted(() => window.removeEventListener('click', closeDropdown));

function onSearch(q) {
  router.push({ path: '/search', query: { q } });
}

function toggleTheme() {
  ui.setTheme(ui.isDarkMode ? 'light' : 'dark');
}

/** 
 * LOGIC ĐĂNG XUẤT MỚI:
 * Đảm bảo xóa sạch state và chuyển hướng về trang chủ
 */
async function logout() {
  try {
    // 1. Gọi hành động logout từ store (xóa token, xóa localStorage)
    await user.logout();
    
    // 2. Chuyển hướng về trang chủ
    // Dùng .then để đảm bảo việc chuyển hướng xảy ra sau khi state đã sạch
    await router.push('/');
    
    // 3. (Tùy chọn) Reload lại trang nếu bạn muốn reset hoàn toàn mọi Store về mặc định
    // window.location.reload(); 
    
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    // Vẫn đẩy về home dù có lỗi để đảm bảo an toàn
    router.push('/');
  }
}

function logoutAndClose() {
  isDropdownOpen.value = false;
  logout();
}
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease-out;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>