<template>
  <div class="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] lg:flex font-sans">
    
    <!-- DESKTOP SIDEBAR -->
    <aside class="hidden lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-900 shadow-sm sticky top-0">
      
      <!-- Brand Logo Area -->
      <div class="flex items-center gap-3 px-6 py-10">
        <!-- Logo: Chuyển sang gradient Đen/Xám cao cấp -->
        <div class="h-11 w-11 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 flex items-center justify-center text-white dark:text-black shadow-lg transition-transform hover:rotate-12">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div>
          <div class="text-lg font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">Goghevent Admin</div>
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Quản lí</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        
        <!-- Group 1: Tổng quan -->
        <div>
          <p class="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Báo cáo</p>
          <div class="space-y-1">
            <NavItem to="/admin" label="Dashboard" :active="$route.path === '/admin'">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </NavItem>
            <NavItem to="/admin/reports" label="Reports" :active="$route.path.startsWith('/admin/reports')">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </NavItem>
          </div>
        </div>

        <!-- Group 2: Quản lý -->
        <div>
          <p class="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Management</p>
          <div class="space-y-1">
            <NavItem to="/admin/products" label="Products" :active="$route.path.startsWith('/admin/products')">
<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V21M4 11v10l8 4"/></svg>
            </NavItem>
            <NavItem to="/admin/orders" label="Orders" :active="$route.path.startsWith('/admin/orders')">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </NavItem>
            <NavItem to="/admin/vouchers" label="Vouchers" :active="$route.path.startsWith('/admin/vouchers')">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            </NavItem>
          </div>
        </div>

        <!-- Group 3: Hệ thống -->
        <div>
          <p class="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Settings</p>
          <div class="space-y-1">
            <NavItem to="/admin/users" label="Users" :active="$route.path.startsWith('/admin/users')">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </NavItem>
            <NavItem to="/admin/banners" label="Banners" :active="$route.path.startsWith('/admin/banners')">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </NavItem>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="mt-auto p-4 border-t border-gray-100 dark:border-gray-900">
        <div class="flex items-center gap-3 px-2 py-3 mb-2">
          <!-- Avatar: Tone Gray cao cấp -->
          <div class="h-9 w-9 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-black font-bold text-xs italic">
             {{ user.profile?.username?.charAt(0).toUpperCase() || 'A' }}
          </div> 
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-gray-900 dark:text-white truncate">xin chào {{ user.profile?.username || 'Admin' }}</div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">vui lòng dùng có trách nhiệm</div>
          </div>
        </div>
        <button 
          @click="logout"
class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-bold text-gray-900 transition-all hover:bg-red-50 hover:text-red-600 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          ĐĂNG XUẤT
        </button>
      </div>
    </aside>

    <!-- MOBILE HEADER -->
    <div class="lg:hidden flex flex-col w-full border-b bg-white dark:bg-gray-950 dark:border-gray-900 sticky top-0 z-40 px-4 py-4">
      <div class="flex items-center justify-between">
        <button @click="showSidebar = true" class="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <span class="text-lg font-black dark:text-white italic tracking-tighter uppercase">Luxe Admin</span>
        <div class="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
           {{ user.profile?.username?.charAt(0).toUpperCase() }}
        </div>
      </div>

      <!-- Mobile off-canvas (Improved) -->
      <transition name="slide">
        <div v-if="showSidebar" class="fixed inset-0 z-50 flex">
          <div class="w-72 max-w-[80vw] bg-white dark:bg-gray-950 h-full flex flex-col shadow-2xl">
            <div class="p-6 border-b dark:border-gray-900 flex items-center justify-between">
              <span class="text-lg font-black dark:text-white uppercase italic tracking-tighter">Luxe Admin</span>
              <button @click="showSidebar = false" class="p-2 text-gray-400"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
               <RouterLink @click="showSidebar = false" to="/admin" class="mobile-nav-link">Dashboard</RouterLink>
               <RouterLink @click="showSidebar = false" to="/admin/products" class="mobile-nav-link">Sản phẩm</RouterLink>
               <RouterLink @click="showSidebar = false" to="/admin/orders" class="mobile-nav-link">Đơn hàng</RouterLink>
               <RouterLink @click="showSidebar = false" to="/admin/users" class="mobile-nav-link">Người dùng</RouterLink>
            </div>
          </div>
          <div @click="showSidebar = false" class="flex-1 bg-black/60 backdrop-blur-sm" />
        </div>
      </transition>
    </div>

    <!-- MAIN CONTENT -->
<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main class="flex-1 relative z-0 overflow-y-auto p-6 lg:p-12">
        <div class="max-w-7xl mx-auto">
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

// Component con nội bộ để tái sử dụng style menu
import NavItem from '../admin/AdminNavItem.vue'; // Bạn có thể tách hoặc viết inline

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
/* Mobile Nav Slide Animation */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

.mobile-nav-link {
  @apply block px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
}
</style>