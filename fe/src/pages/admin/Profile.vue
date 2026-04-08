<template>
  <!-- Tăng padding top để thay thế khoảng trống của nút quay lại -->
  <section class="mx-auto max-w-6xl px-4 py-12 lg:py-20">
    <div class="grid gap-10 lg:grid-cols-12 lg:items-start">
      
      <!-- Cột trái: Profile Card (Admin Style) -->
      <div class="lg:col-span-4 lg:sticky lg:top-10">
        <div class="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-col items-center text-center">
            <h2 class="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">ADMIN PROFILE</h2>
            
            <div class="relative group">
              <!-- Avatar Frame với hiệu ứng mạnh mẽ hơn cho Admin -->
              <div class="relative h-44 w-44 overflow-hidden rounded-3xl border-4 border-white p-1 shadow-2xl ring-2 ring-indigo-100 dark:border-gray-800 dark:ring-indigo-900">
                <img
                  :src="avatarPreview"
                  alt="Admin Avatar"
                  class="h-full w-full rounded-3xl object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <!-- Nút thay đổi ảnh -->
              <label
                class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-3xl bg-black/50 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100"
              >
                <div class="text-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-7 w-7 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <span class="text-xs font-bold uppercase tracking-widest">Cập nhật ảnh</span>
                </div>
                <input type="file" accept="image/*" @change="onFileChange" class="hidden" />
              </label>

              <!-- Loading -->
              <div v-if="isUpdatingAvatar" class="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/70 dark:bg-gray-900/70">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            </div>

            <div class="mt-8">
              <h3 class="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                {{ form.fullName || user.profile?.username }}
              </h3>
              <p class="text-sm font-medium text-gray-500">{{ form.email }}</p>
            </div>

            <!-- Admin Badges -->
            <div class="mt-8 flex w-full flex-col gap-3 border-t border-gray-100 pt-8 dark:border-gray-800">
              <div class="flex items-center justify-between rounded-2xl bg-indigo-50 px-5 py-3.5 dark:bg-indigo-950/30">
                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Vai trò</span>
                <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  Administrator
                </span>
              </div>

              <div class="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-3.5 dark:bg-gray-800/50">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trạng thái</span>
                <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Hoạt động
                </span>
              </div>

              <div class="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-3.5 dark:bg-gray-800/50">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tham gia</span>
                <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Tháng 01/2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: Form cài đặt chi tiết -->
      <div class="lg:col-span-8">
        <div class="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:p-12">
          <div class="mb-10">
            <h1 class="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Cài đặt Admin</h1>
            <p class="mt-2 text-gray-500">Quản lý thông tin tài khoản quản trị viên và quyền hạn.</p>
          </div>
          
          <form @submit.prevent="handleupdate" class="space-y-8">
            <!-- Nhóm thông tin cơ bản -->
            <div class="grid gap-8 md:grid-cols-2">
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Username</label>
                <InputField v-model="form.name" />
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email</label>
                <InputField v-model="form.email" type="email" />
              </div>
            </div>

            <!-- Nhóm thông tin cá nhân -->
            <div class="grid gap-8 md:grid-cols-2">
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Họ và tên</label>
                <InputField v-model="form.fullName" />
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Số điện thoại</label>
                <InputField v-model="form.phone" type="tel" />
              </div>
            </div>

            <!-- Nhóm quyền hạn (Admin specific) -->
            <div class="rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950/30 dark:to-violet-950/30">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-1 mb-4 block">Quyền quản trị</label>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <input type="checkbox" checked disabled class="h-4 w-4 accent-indigo-600" />
                  <span class="text-gray-700 dark:text-gray-300">Quản lý người dùng</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" checked disabled class="h-4 w-4 accent-indigo-600" />
                  <span class="text-gray-700 dark:text-gray-300">Quản lý nội dung</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" checked disabled class="h-4 w-4 accent-indigo-600" />
                  <span class="text-gray-700 dark:text-gray-300">Quản lý hệ thống</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" checked disabled class="h-4 w-4 accent-indigo-600" />
                  <span class="text-gray-700 dark:text-gray-300">Xem báo cáo</span>
                </div>
              </div>
            </div>

            <!-- Nhóm bảo mật -->
            <div class="space-y-3 rounded-3xl bg-gray-50/70 p-6 dark:bg-gray-800/30">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mật khẩu mới</label>
              <InputField 
                v-model="form.password" 
                type="password" 
                placeholder="••••••••" 
              />
              <p class="text-[10px] italic text-gray-400 ml-1">Để trống nếu không muốn thay đổi mật khẩu.</p>
            </div>

            <!-- Nút Lưu -->
            <div class="pt-6">
              <button
                type="submit"
                class="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-sm font-bold tracking-widest text-white transition-all hover:brightness-110 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.97] disabled:opacity-70"
                :disabled="isUpdating"
              >
                <svg v-if="isUpdating" class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isUpdating ? 'ĐANG CẬP NHẬT...' : 'LƯU THÔNG TIN ADMIN' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useUserStore } from "../../stores/user";
import { useUIStore } from "../../stores/ui";
import { useRouter } from "vue-router";
import InputField from "../../components/forms/InputField.vue";
import { UpdateProfile, UpdateUserAvatar } from "../../utils/user_service_api";

// Avatar mặc định
import defaultAvatar from "@/assets/default_user.jpg"; 

const user = useUserStore();
const ui = useUIStore();
const router = useRouter();

const isUpdating = ref(false);
const isUpdatingAvatar = ref(false);

const avatarPreview = computed(() => {
  if (!user.profile?.avatar_url) return defaultAvatar;
  return `https://tmdt-promax-user-service.onrender.com${user.profile.avatar_url}`;
});

const avatarFile = ref(null);

const form = reactive({
  name: user.profile?.username ?? "",
  email: user.profile?.email ?? "",
  fullName: user.profile?.fullname ?? "",
  phone: user.profile?.phone ?? "",
  password: "",   // sửa lỗi typo từ "passwword"
});

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);   // Vue 3 computed không gán trực tiếp, nhưng vì bạn đang dùng .value trong code cũ, tôi giữ tương thích
  }
  uploadAvatar();
};

const uploadAvatar = async () => {
  if (!avatarFile.value) return;

  isUpdatingAvatar.value = true;
  try {
    const res = await UpdateUserAvatar(user.profile.id, avatarFile.value, user.token);

    if (res.data.success) {
      user.updateProfile({
        avatar_url: res.data.data.avatar_url
      });
      ui.pushToast({ type: "success", message: "Đổi ảnh đại diện thành công!" });
    }
  } catch (err) {
    ui.pushToast({
      type: "error",
      message: err.response?.data?.message || "Đổi ảnh thất bại"
    });
  } finally {
    isUpdatingAvatar.value = false;
    avatarFile.value = null;
  }
};

const handleupdate = async () => {
  isUpdating.value = true;
  try {
    const formData = new FormData();
    formData.append("username", form.name);
    formData.append("email", form.email);
    formData.append("full_name", form.fullName);
    formData.append("phone", form.phone);

    if (form.password && form.password.trim() !== '') {
      formData.append("password", form.password);
    }

    const res = await UpdateProfile(user.profile.id, formData, user.token);
    const result = res.data;

    if (result.success) {
      user.updateProfile({
        username: result.data.username,
        email: result.data.email,
        fullname: result.data.full_name,
        phone: result.data.phone,
        avatar_url: result.data.avatar_url,
      });

      avatarFile.value = null;
      ui.pushToast({ type: "success", message: "Cập nhật hồ sơ Admin thành công!" });
    } else {
      ui.pushToast({ type: "error", message: result.message || "Cập nhật thất bại" });
    }
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    ui.pushToast({ type: "error", message: "Có lỗi xảy ra, vui lòng thử lại" });
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
/* Có thể thêm style riêng cho Admin nếu cần */
</style>