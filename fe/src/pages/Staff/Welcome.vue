<template>
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 dark:bg-[#020617]">
    
    <!-- Trang trí nền -->
    <div class="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-400/20 blur-[100px] dark:bg-blue-600/10"></div>
    <div class="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-[100px] dark:bg-indigo-600/10"></div>

    <div class="relative z-10 w-full max-w-5xl">
      <!-- Header Section -->
      <div class="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div class="mb-6 inline-flex items-center justify-center">
          <div class="relative">
            <div class="absolute inset-0 animate-ping rounded-full bg-blue-500/20"></div>
            <div class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20">
              <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h1 class="mb-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white lg:text-5xl">
          Hệ thống đã <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">sẵn sàng</span>
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400">
          Chào mừng trở lại, 
          <span class="font-bold text-slate-900 dark:text-blue-400 underline decoration-blue-500/30 underline-offset-4">
            {{ staffName }}
          </span>. Hôm nay bạn muốn bán gì?
        </p>
      </div>

      <!-- Features Bento Grid -->
      <div class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- Card: Sản phẩm -->
        <div class="group relative overflow-hidden rounded-[2rem] border border-white bg-white/50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur-md">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 class="mb-2 font-bold text-slate-900 dark:text-white">Kho hàng</h3>
          <p class="text-sm leading-relaxed text-slate-500 dark:text-slate-400">Kiểm tra tồn kho, cập nhật sản phẩm thời trang mới.</p>
          <div class="absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-110">
             <svg class="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
        </div>

        <!-- Card: Đơn hàng -->
        <div class="group relative overflow-hidden rounded-[2rem] border border-white bg-white/50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur-md">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="mb-2 font-bold text-slate-900 dark:text-white">Giao dịch</h3>
          <p class="text-sm leading-relaxed text-slate-500 dark:text-slate-400">Xử lý đơn hàng, theo dõi vận chuyển quần áo.</p>
          <div class="absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-110">
             <svg class="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <!-- Card: Người dùng -->
        <div class="group relative overflow-hidden rounded-[2rem] border border-white bg-white/50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur-md">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 class="mb-2 font-bold text-slate-900 dark:text-white">Khách hàng</h3>
          <p class="text-sm leading-relaxed text-slate-500 dark:text-slate-400">Hỗ trợ mua sắm, quản lý feedback về sản phẩm.</p>
          <div class="absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-110">
             <svg class="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <RouterLink 
          to="/staff/dashboard"
          class="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900 px-10 py-4 font-bold text-white transition-all hover:bg-blue-600 hover:ring-4 hover:ring-blue-500/20 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-50"
        >
          <span class="mr-2">Bắt đầu ca làm</span>
          <svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </RouterLink>
      </div>

      <!-- Footer Info -->
      <div class="mt-16 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
        <span class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          System Version 2.0
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '../../stores/user';

const user = useUserStore();

const staffName = computed(() => {
  return user.profile?.username || 'Nhân viên';
});
</script>

<style scoped>
/* Hiệu ứng mượt mà khi vào trang */
.animate-in {
  animation-delay: 200ms;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-bottom-4 {
  from { transform: translateY(1rem); }
  to { transform: translateY(0); }
}

.fade-in {
  animation: fade-in 1s ease-out;
}

.slide-in-from-bottom-4 {
  animation: slide-in-from-bottom-4 0.8s ease-out;
}
</style>