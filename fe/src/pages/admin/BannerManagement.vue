<template>
  <div class="space-y-10 pb-10">
    <!-- 1. Header Section -->
    <div class="flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
      <div>
        <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
          Quản lý Banner
        </h1>
        <p class="mt-1 text-sm text-gray-500">Cấu hình hình ảnh và video hiển thị tại trang chủ</p>
      </div>
      <button @click="openCreateModal"
        class="group flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:rotate-90" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        THÊM BANNER
      </button>
    </div>

    <!-- 2. Banner Grid -->
    <div class="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <div v-for="b in bannerData" :key="b.id"
        class="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-2 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none">
        <!-- Media Preview Area -->
        <div class="relative aspect-[21/9] overflow-hidden rounded-[1.8rem] bg-gray-100 dark:bg-gray-950">
          <img v-if="b.type === 'image'" :src="b.media" :alt="b.title"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <video v-else :src="b.media"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" muted loop
            @mouseenter="$event.target.play()" @mouseleave="$event.target.pause()" />

          <!-- Glassmorphism Badge -->
          <div
            class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/10">
            <span v-if="b.type === 'image'">🖼️ Image</span>
            <span v-else class="flex items-center gap-1.5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Video
            </span>
          </div>

          <!-- Hidden Actions (Reveal on Hover) -->
          <div
            class="absolute inset-0 flex items-center justify-center gap-4 bg-black/5 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
            <button @click="editBanner(b)"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl transition-transform hover:scale-110 active:scale-95">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button @click="deleteBanner(b)"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-xl transition-transform hover:scale-110 active:scale-95">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Banner Info -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white truncate pr-4">
              {{ b.title }}
            </h3>
            <span class="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-tighter italic">ID: {{ b.id
              }}</span>
          </div>
          <p class="mt-2 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1 italic">
            "{{ b.description || 'Không có mô tả chi tiết' }}"
          </p>
        </div>
      </div>
    </div>

    <!-- 3. Create/Edit Modal (Premium Design) -->
    <div v-if="showModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-gray-950 border border-white/10">
        <div class="bg-gray-900 px-8 py-6 text-white dark:bg-black">
          <h2 class="text-xl font-black uppercase tracking-widest italic">
            {{ editingId ? 'Cập nhật Banner' : 'Thiết kế Banner mới' }}
          </h2>
        </div>

        <form @submit.prevent="saveBanner" class="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <!-- Title & Link -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Tiêu đề Banner
                *</label>
              <input v-model="formData.title" type="text"
                class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                required />
            </div>
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Đường dẫn liên
                kết</label>
              <input v-model="formData.link" type="url" placeholder="https://..."
                class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Mô tả hiển thị</label>
            <textarea v-model="formData.description" rows="2"
              class="w-full rounded-2xl border-gray-100 bg-gray-50 px-5 py-3.5 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white"></textarea>
          </div>

          <!-- Media Type & Upload Section -->
          <div class="rounded-[2rem] border border-gray-100 bg-gray-50/50 p-8 dark:border-gray-800 dark:bg-gray-900/50">
            <!-- Header của Section -->
            <div class="flex items-center justify-between mb-8 border-b border-gray-100 pb-4 dark:border-gray-800">
              <label class="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white italic">
                Nội dung đa phương tiện
              </label>

              <!-- Radio Group hiện đại hơn -->
              <div class="flex items-center gap-6">
                <label class="flex cursor-pointer items-center gap-2 group">
                  <input type="radio" v-model="formData.type" value="image"
                    class="h-4 w-4 border-gray-300 text-black focus:ring-black dark:bg-gray-800" />
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">🖼️
                    Image</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2 group">
                  <input type="radio" v-model="formData.type" value="video"
                    class="h-4 w-4 border-gray-300 text-black focus:ring-black dark:bg-gray-800" />
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">🎬
                    Video</span>
                </label>
              </div>
            </div>

            <!-- Grid Layout: Đảm bảo cân bằng chiều cao -->
            <div class="grid gap-10 md:grid-cols-2">
              <!-- Cột trái: Upload Area -->
              <div class="space-y-3">
                <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Bước 1: Tải lên tệp tin
                </label>
                <div
                  class="relative group aspect-video w-full overflow-hidden rounded-[1.5rem] bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 transition-all hover:border-black dark:hover:border-white flex items-center justify-center shadow-sm">
                  <input type="file" :accept="formData.type === 'image' ? 'image/*' : 'video/*'"
                    @change="handleMediaUpload" class="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div class="text-center transition-transform group-hover:scale-110">
                    <div
                      class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:text-black dark:group-hover:text-white">
                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p
                      class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-black dark:group-hover:text-white">
                      TẢI TỪ THIẾT BỊ</p>
                  </div>
                </div>
              </div>

              <!-- Cột phải: Preview Area -->
              <div class="space-y-3">
                <label class="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Bước 2: Xem trước hiển thị
                </label>
                <div
                  class="relative aspect-video w-full overflow-hidden rounded-[1.5rem] bg-gray-200 dark:bg-black shadow-inner border border-gray-100 dark:border-gray-800">
                  <!-- Image Preview -->
                  <img v-if="formData.media && formData.type === 'image'" :src="formData.media"
                    class="h-full w-full object-cover animate-in fade-in zoom-in-95 duration-500" />
                  <!-- Video Preview -->
                  <video v-else-if="formData.media && formData.type === 'video'" :src="formData.media" controls
                    class="h-full w-full object-cover animate-in fade-in duration-500" />
                  <!-- Placeholder khi chưa có dữ liệu -->
                  <div v-else class="flex h-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50">
                    <div class="h-8 w-8 text-gray-300 mb-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Waiting for media...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-6">
            <button type="button" @click="closeModal"
              class="flex-1 rounded-2xl bg-gray-100 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-200 dark:bg-gray-800">HỦY
              BỎ</button>
            <button type="submit"
              class="flex-1 rounded-2xl bg-gray-900 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-black dark:bg-white dark:text-black shadow-xl">XÁC
              NHẬN LƯU</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 4. Delete Confirmation (Luxe Red Accent) -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        class="w-full max-w-sm rounded-[2.5rem] bg-white p-10 text-center shadow-2xl dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
        <div
          class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30">
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4v2m0 0a9 9 0 11-9-9m9 9a9 9 0 109-9" />
          </svg>
        </div>
        <h3 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Xóa Banner?</h3>
        <p class="mt-3 text-sm font-medium text-gray-500 leading-relaxed italic">Hành động này sẽ xóa vĩnh viễn <span
            class="text-gray-900 dark:text-white font-black underline">"{{ bannerToDelete?.title }}"</span> khỏi hệ
          thống.</p>
        <div class="mt-10 flex gap-3">
          <button @click="showDeleteModal = false"
            class="flex-1 rounded-xl bg-gray-50 py-4 text-xs font-black uppercase tracking-widest dark:bg-gray-900 dark:text-gray-400">QUAY
            LẠI</button>
          <button @click="confirmDelete"
            class="flex-1 rounded-xl bg-red-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 dark:shadow-none transition-transform active:scale-95">XÓA
            NGAY</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar Customization */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
}

/* Hover Effects */
.group:hover {
  transform: translateY(-4px);
}
</style>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AdminLayout from '../../components/layout/AdminLayout.vue';
import { useUIStore } from '../../stores/ui';
import { useUserStore } from '../../stores/user';
import { getListBanners, updateBanner, createBanner, deleteBannerhehe } from '../../utils/banner_service_api';
const ui = useUIStore();
const user = useUserStore();
// ===== BANNER =====
const bannerData = ref([]);
const bannerLoading = ref(true);
// Thêm biến để lưu File Object
const fileToUpload = ref(null);


async function loadBanners() {
  try {
    bannerLoading.value = true;

    const response = await getListBanners(user.token);

    const rawBanners = response.data.data; // mảng banner từ API

    bannerData.value = rawBanners.map(banner => ({
      id: banner.id,
      //   type: banner.link_type === 'video' ? 'video' : 'image',
      //   src: banner.link_type === 'video' ? `http://localhost:3006${banner.image_url}` : `http://localhost:3006${banner.image_url}`,
      title: banner.title,
      description: banner.description,
      type: banner.link_type === 'video' ? 'video' : 'image',
      media: banner.link_type === 'video' ? `https://tmdt-promax-admin-service.onrender.com${banner.image_url}` : `https://tmdt-promax-admin-service.onrender.com${banner.image_url}`,
      link: banner.link || null
    }));
  } catch (err) {
    console.error('Lỗi tải banner:', err);
    // Nếu lỗi vẫn hiển thị banner mẫu để không bị trắng trang
    bannerData.value = [
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop',
        title: 'Đang tải banner...',
        subtitle: 'Vui lòng thử lại sau.'
      }
    ];
  } finally {
    bannerLoading.value = false;
  }
}




// Load persisted banners from localStorage if present
onMounted(async () => {
  // try {
  // 	const raw = localStorage.getItem('admin_banners');
  // 	if (raw) {
  // 		const parsed = JSON.parse(raw);
  // 		if (Array.isArray(parsed)) banners.value = parsed;
  // 	}
  // } catch (e) {
  // 	console.error('Failed to load banners from localStorage', e);
  // }
  await loadBanners();  // Tải banner trước
});

const showModal = ref(false);
const showDeleteModal = ref(false);
const editingId = ref(null);
const bannerToDelete = ref(null);

const formData = reactive({
  title: '',
  description: '',
  type: 'image',
  media: '',
  link: ''
});

function openCreateModal() {
  editingId.value = null;
  formData.title = '';
  formData.description = '';
  formData.type = 'image';
  formData.media = '';
  formData.link = '';
  showModal.value = true;
}

function editBanner(banner) {
  editingId.value = banner.id;
  formData.title = banner.title;
  formData.description = banner.description;
  formData.type = banner.type;
  formData.media = banner.media;
  formData.link = banner.link || '';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

function handleMediaUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const maxSize = formData.type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeInMB = Math.round(maxSize / 1024 / 1024);
    ui.pushToast({ type: 'error', message: `File quá lớn (max ${sizeInMB}MB)` });
    return;
  }
  // Lưu File Object gốc vào biến mới
  fileToUpload.value = file; // <--- THÊM DÒNG NÀY
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.media = e.target?.result || '';
    ui.pushToast({ type: 'success', message: 'Tải file thành công' });
  };
  reader.readAsDataURL(file);
}

const saveBanner = async () => {
  // ... (Validate required fields) ...

  // 1. Chuẩn bị dữ liệu cơ bản
  const dataToSend = {
    title: formData.title,
    description: formData.description,
    link_type: formData.type,
    link: formData.link
  };

  // 2. Xử lý trường media
  if (fileToUpload.value) {
    // Nếu có file mới, gửi File Object dưới trường 'media'
    dataToSend.media = fileToUpload.value;
  }
  // else {
  //     // Nếu tạo mới mà không có file: Báo lỗi vì media là bắt buộc
  //     ui.pushToast({ type: 'error', message: 'Vui lòng chọn ảnh hoặc video' });
  //     return;
  // }


  try {
    if (editingId.value) {
      // Cập nhật banner
      const res = await updateBanner(editingId.value, dataToSend, user.token);
      if (res.data.success) {
        ui.pushToast({ type: 'success', message: 'Cập nhật banner thành công' });
      } else {
        ui.pushToast({ type: 'error', message: 'Cập nhật banner thất bại' });
      }

    } else {
      // Tạo banner mới
      const res = await createBanner(dataToSend, user.token);
      if (res.data.success) {
        ui.pushToast({ type: 'success', message: 'Thêm banner thành công' });
      } else {
        ui.pushToast({ type: 'error', message: 'Thêm banner thất bại' });
      }
    }

    // Reset fileToUpload sau khi gửi thành công
    fileToUpload.value = null;

    await loadBanners();
    closeModal();
  } catch (err) {
    console.error('Lỗi lưu banner:', err);
    ui.pushToast({ type: 'error', message: 'Lưu banner thất bại, vui lòng thử lại' });
  }
};
function deleteBanner(banner) {
  bannerToDelete.value = banner;
  showDeleteModal.value = true;
}

// function confirmDelete() {
// 	if (bannerToDelete.value) {
// 		banners.value = banners.value.filter(b => b.id !== bannerToDelete.value.id);
// 		localStorage.setItem('admin_banners', JSON.stringify(banners.value));
// 		ui.pushToast({ type: 'success', message: 'Xóa banner thành công' });
// 		showDeleteModal.value = false;
// 		bannerToDelete.value = null;
// 	}
// }
const confirmDelete = async () => {
  if (bannerToDelete.value) {
    try {
      const res = await deleteBannerhehe(bannerToDelete.value.id, user.token);
      if (res.data.success) {
        ui.pushToast({ type: 'success', message: 'Xóa banner thành công' });
        await loadBanners();
      } else {
        ui.pushToast({ type: 'error', message: 'Xóa banner thất bại' });
      }
    } catch (err) {
      console.error('Lỗi xóa banner:', err);
      ui.pushToast({ type: 'error', message: 'Xóa banner thất bại, vui lòng thử lại' });
    } finally {
      showDeleteModal.value = false;
      bannerToDelete.value = null;
    }
  }
  else {
    ui.pushToast({ type: 'error', message: 'Không tìm thấy banner để xóa' });
    showDeleteModal.value = false;
    bannerToDelete.value = null;
  }
};

</script>
