<template>
  <div class="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] lg:flex font-sans">
    
    <!-- DESKTOP SIDEBAR - STAFF -->
    <aside class="hidden lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-r bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-900 shadow-sm sticky top-0">
      
      <!-- Brand Logo Area -->
      <div class="flex items-center gap-3 px-6 py-8">
        <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md transition-transform hover:scale-105">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <div class="text-lg font-black tracking-tight text-gray-900 dark:text-white uppercase">Goghevent Staff</div>
          <div class="text-[10px] font-bold text-teal-500 dark:text-teal-400 uppercase tracking-wider">Hỗ trợ bán hàng</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar">
        
        <!-- Group 1: Công việc hàng ngày -->
        <div>
          <p class="px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Công việc chính</p>
          <div class="space-y-1">
            <NavItem 
              to="/staff/schedule" 
              label="
              lịch làm việc" 
              :active="$route.path === '/staff/schedule'"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
              </svg>
            </NavItem>
            <NavItem 
              to="/staff/dashboard" 
              label="Tổng quan ca làm" 
              :active="$route.path === '/staff/dashboard'"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
              </svg>
            </NavItem>

            <NavItem 
              to="/staff/packing" 
              label="Xử lý đơn hàng" 
              :active="$route.path.startsWith('/staff/packing')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </NavItem>

            <NavItem 
              to="/staff/orders" 
              label="Đơn hàng" 
              :active="$route.path.startsWith('/staff/orders')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </NavItem>
            <NavItem 
              to="/staff/inventory" 
              label="Kho hàng" 
              :active="$route.path.startsWith('/staff/inventory')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V21M4 11v10l8 4"/>
              </svg>
            </NavItem>

            <NavItem 
              to="/staff/comments" 
              label="Quản lý bình luận" 
              :active="$route.path.startsWith('/staff/comments')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </NavItem>
          </div>
        </div>

        <!-- Group 2: Hỗ trợ -->
        <div>
          <p class="px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Hỗ trợ & Khác</p>
          <div class="space-y-1">
            <NavItem 
              to="/staff/support" 
              label="Yêu cầu hỗ trợ" 
              :active="$route.path.startsWith('/staff/support')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </NavItem>

            <NavItem 
              to="/staff/profile" 
              label="Thông tin cá nhân" 
              :active="$route.path.startsWith('/staff/profile')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </NavItem>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="mt-auto p-4 border-t border-gray-100 dark:border-gray-900">
        <div class="flex items-center gap-3 px-2 py-3 mb-2">
          <div class="h-9 w-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
            {{ user.profile?.username?.charAt(0).toUpperCase() || 'S' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              Xin chào {{ user.profile?.username || 'Staff' }}!
            </div>
            <div class="text-[10px] font-medium text-teal-600 dark:text-teal-400">Nhân viên bán hàng</div>
          </div>
        </div>
        <button 
          @click="logout"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-red-50 hover:text-red-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          ĐĂNG XUẤT
        </button>
      </div>
    </aside>

    <!-- MOBILE HEADER -->
    <div class="lg:hidden flex flex-col w-full border-b bg-white dark:bg-gray-950 dark:border-gray-900 sticky top-0 z-40 px-4 py-4">
      <div class="flex items-center justify-between">
        <button @click="showSidebar = true" class="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <span class="text-lg font-black dark:text-white italic tracking-tight uppercase">Staff Panel</span>
        <div class="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
          {{ user.profile?.username?.charAt(0).toUpperCase() || 'S' }}
        </div>
      </div>

      <!-- Mobile off-canvas -->
      <transition name="slide">
        <div v-if="showSidebar" class="fixed inset-0 z-50 flex">
          <div class="w-64 max-w-[80vw] bg-white dark:bg-gray-950 h-full flex flex-col shadow-2xl">
            <div class="p-5 border-b dark:border-gray-900 flex items-center justify-between">
              <span class="text-lg font-black dark:text-white uppercase tracking-tight">Staff Panel</span>
              <button @click="showSidebar = false" class="p-2 text-gray-400">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <RouterLink @click="showSidebar = false" to="/staff/dashboard" class="mobile-nav-link">Tổng quan ca làm</RouterLink>
              <RouterLink @click="showSidebar = false" to="/staff/packing" class="mobile-nav-link">Xử lý đơn hàng</RouterLink>
              <RouterLink @click="showSidebar = false" to="/staff/orders" class="mobile-nav-link">Đơn hàng</RouterLink>
              <RouterLink @click="showSidebar = false" to="/staff/inventory" class="mobile-nav-link">Kho hàng</RouterLink>
              <RouterLink @click="showSidebar = false" to="/staff/support" class="mobile-nav-link">Yêu cầu hỗ trợ</RouterLink>
              <RouterLink @click="showSidebar = false" to="/staff/profile" class="mobile-nav-link">Thông tin cá nhân</RouterLink>
            </div>
          </div>
          <div @click="showSidebar = false" class="flex-1 bg-black/60 backdrop-blur-sm" />
        </div>
      </transition>
    </div>

    <!-- MAIN CONTENT -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main class="flex-1 relative z-0 overflow-y-auto p-5 lg:p-8">
        <div class="max-w-screen-2xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../../stores/user';
import { useRouter, useRoute, RouterLink } from 'vue-router';

import NavItem from '../admin/AdminNavItem.vue';

const user = useUserStore();
const router = useRouter();
const $route = useRoute();
const showSidebar = ref(false);

function logout() {
  router.push('/').then(() => {
    user.logout();
  });
}
</script>

<style scoped>
.mobile-nav-link {
  @apply block px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-300 transition-all;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>