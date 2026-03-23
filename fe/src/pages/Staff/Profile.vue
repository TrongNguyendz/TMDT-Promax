<!-- views/staff/Profile.vue -->
<template>
  <div class="space-y-8 max-w-3xl mx-auto">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Thông tin cá nhân</h1>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 border border-gray-200 dark:border-gray-800">
      <div class="flex flex-col md:flex-row gap-8 items-start">
        <div class="flex-shrink-0">
          <div class="h-32 w-32 rounded-full bg-teal-600 flex items-center justify-center text-white text-5xl font-bold">
            {{ user.username?.charAt(0).toUpperCase() || 'S' }}
          </div>
          <button class="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200">
            Thay đổi ảnh
          </button>
        </div>

        <div class="flex-1 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ & tên</label>
            <input v-model="user.fullName" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên đăng nhập</label>
            <input v-model="user.username" disabled class="w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input v-model="user.email" type="email" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
            <input v-model="user.phone" class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>

          <div class="pt-6 border-t dark:border-gray-800">
            <button class="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition">
              Cập nhật thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();
const user = ref({
  username: userStore.profile?.username || 'ko có dữ liệu bro ơi',
  fullName: userStore.profile?.fullName || 'ko có dữ liệu bro ơi',
  email: userStore.profile?.email || 'ko có dữ liệu bro ơi',
  phone: userStore.profile?.phone || 'ko có dữ liệu bro ơi',
});
</script>