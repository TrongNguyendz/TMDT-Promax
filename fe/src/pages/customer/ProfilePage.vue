<template>
  <!-- Tăng padding top để thay thế khoảng trống của nút quay lại -->
  <section class="mx-auto max-w-5xl px-4 py-12 lg:py-20">
    <div class="grid gap-10 lg:grid-cols-12 lg:items-start">
      
      <!-- Cột trái: Profile Card (Xem trước & Avatar) -->
      <div class="lg:col-span-4 lg:sticky lg:top-10">
        <div class="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-col items-center text-center">
            <h2 class="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Ảnh đại diện</h2>
            
            <div class="relative group">
              <!-- Avatar Frame với hiệu ứng viền kép -->
              <div class="relative h-44 w-44 overflow-hidden rounded-full border-4 border-white p-1 shadow-2xl ring-1 ring-gray-100 dark:border-gray-800 dark:ring-gray-700">
                <img
                  :src="avatarPreview"
                  alt="Avatar"
                  class="h-full w-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <!-- Nút thay đổi ảnh (Glassmorphism Overlay) -->
              <label
                class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100"
              >
                <div class="text-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <span class="text-[10px] font-bold uppercase tracking-wider">Cập nhật</span>
                </div>
                <input type="file" accept="image/*" @change="onFileChange" class="hidden" />
              </label>

              <!-- Loading khi upload -->
              <div v-if="isUpdatingAvatar" class="absolute inset-0 flex items-center justify-center rounded-full bg-white/60 dark:bg-gray-900/60">
                <div class="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white"></div>
              </div>
            </div>

            <div class="mt-8">
              <h3 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                {{ form.fullName || user.profile?.username }}
              </h3>
              <p class="text-sm font-medium text-gray-400">{{ form.email }}</p>
            </div>

            <!-- Profile Badges -->
<div class="mt-8 flex w-full flex-col gap-3 border-t border-gray-50 pt-8 dark:border-gray-800">
              <div class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Thành viên</span>
                <span class="text-xs font-bold dark:text-gray-200">2024</span>
              </div>
              <div class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Xác minh</span>
                <span class="flex items-center gap-1 text-xs font-bold text-green-500">
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                  Hợp lệ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: Form cài đặt chi tiết -->
      <div class="lg:col-span-8">
        <div class="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:p-12">
          <div class="mb-10">
            <h1 class="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Cài đặt tài khoản</h1>
            <p class="mt-2 text-gray-500">Quản lý thông tin định danh và bảo mật của bạn tại đây.</p>
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
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Điện thoại</label>
                <InputField v-model="form.phone" type="tel" />
              </div>
            </div>

            <!-- Nhóm bảo mật -->
<div class="space-y-3 rounded-3xl bg-gray-50/50 p-6 dark:bg-gray-800/30">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mật khẩu mới</label>
              <InputField 
                v-model="form.password" 
                type="password" 
                placeholder="••••••••" 
              />
              <p class="text-[10px] italic text-gray-400 ml-1">Để trống nếu không có nhu cầu thay đổi mật khẩu.</p>
            </div>

            <!-- Nút Lưu -->
            <div class="pt-6">
              <button
                type="submit"
                class="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 py-4 text-sm font-bold tracking-widest text-white transition-all hover:bg-black hover:shadow-2xl hover:shadow-gray-200 active:scale-[0.97] dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:shadow-none"
                :disabled="isUpdating"
              >
                <svg v-if="isUpdating" class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isUpdating ? 'ĐANG CẬP NHẬT...' : 'LƯU THÔNG TIN' }}</span>
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

// Avatar mặc định (Pepe OK siêu ngầu)
import defaultAvatar from "@/assets/default_user.jpg"; 

const user = useUserStore();
const ui = useUIStore();
const router = useRouter();
const isUpdating = ref(false);
const isUpdatingAvatar = ref(false) ;
// Xem trước avatar khi chọn file
// const avatarPreview = ref(user.profile?.avatar_url || "");
const avatarPreview = computed(() => {
  if (!user.profile?.avatar_url) return defaultAvatar;
  return `http://localhost:3001${user.profile.avatar_url}`;
});
const avatarFile = ref(null); // File để gửi lên server

const form = reactive({
  name: user.profile?.username ?? "",
  email: user.profile?.email ?? "",
  fullName: user.profile?.fullname ?? "",
  phone: user.profile?.phone ?? "",
  passwword: "",
});

// Khi người dùng chọn ảnh
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
  }
  uploadAvatar();
};

// Hàm upload avatar riêng biệt
const uploadAvatar = async () => {
  if (!avatarFile.value) return;

  isUpdating.value = true;
  try {
    const res = await UpdateUserAvatar(user.profile.id, avatarFile.value, user.token);

    if (res.data.success) {
      // Cập nhật store → watch currentAvatarUrl sẽ tự động đổi preview
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
    // Nếu lỗi → quay lại ảnh cũ
    avatarPreview.value = currentAvatarUrl.value;
  } finally {
    isUpdating.value = false;
    avatarFile.value = null; // reset để lần sau vẫn trigger onChange
  }
};

const handleupdate = async () => {
  isUpdating.value = true;
  try {
    // Tạo FormData để gửi cả text + file
    const formData = new FormData();
    formData.append("username", form.name);
    formData.append("email", form.email);
    formData.append("full_name", form.fullName);
    formData.append("phone", form.phone);
    // CHỈ GỬI PASSWORD NẾU NGƯỜI DÙNG NHẬP MỚI
    if (form.password && form.password.trim() !== '') {
      formData.append("password", form.password);
    }
    // if (avatarFile.value) {
    //   formData.append("avatar", avatarFile.value);
    // }

    const res = await UpdateProfile(user.profile.id, formData, user.token);
    const result = res.data;

    if (result.success) {
      // Cập nhật store
      user.updateProfile({
        username: result.data.username,
        email: result.data.email,
        fullname: result.data.full_name,
        phone: result.data.phone,
        avatar_url: result.data.avatar_url,

        // || avatarPreview.value,
      });

      // Xóa file tạm nếu thành công
      avatarFile.value = null;

      ui.pushToast({ type: "success", message: "Cập nhật hồ sơ thành công!" });
    } else {
      ui.pushToast({
        type: "error",
        message: result.message || "Cập nhật thất bại",
      });
    }
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    ui.pushToast({ type: "error", message: "Có lỗi xảy ra, vui lòng thử lại" });
  } finally {
    isUpdating.value = false;
  }
};

function goBack() {
  router.back();
}
</script>

<style scoped>
/* Tùy chỉnh thêm nếu cần */
</style>