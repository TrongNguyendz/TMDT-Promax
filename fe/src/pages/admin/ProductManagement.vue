<template>
  <!-- Header Section: Tinh tế và thoáng đãng -->
  <div class="mb-8 flex items-end justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
    <div>
      <h1 class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
        Quản lý sản phẩm
      </h1>
      <p class="mt-1 text-sm text-gray-500">Danh mục kho hàng và điều phối sản phẩm hệ thống</p>
    </div>
    <button 
      class="group flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-black hover:shadow-xl active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-200" 
      @click="openCreate"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      THÊM SẢN PHẨM
    </button>
  </div>

  <!-- Filter Bar: Đã sửa lỗi lệch hàng bằng items-end -->
  <div class="mb-8 flex flex-wrap items-end gap-4 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    
    <!-- Search Field -->
    <div class="flex-1 min-w-[280px]">
      <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Tìm kiếm</label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </span>
        <input 
          v-model="filters.q" 
          type="text" 
          placeholder="Tên sản phẩm, SKU..." 
          class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3 pl-11 pr-4 text-sm transition-all focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-white"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Category Dropdown -->
    <div class="w-full md:w-64">
      <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Danh mục</label>
      <select 
        v-model="filters.categoryId" 
        class="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus:border-black focus:ring-0 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
      >
        <option value="">Tất cả danh mục</option>
        <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Filter Button: Nằm cùng hàng với các input -->
    <button 
      @click="handleSearch"
class="flex h-[46px] items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 text-sm font-bold tracking-widest text-gray-900 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-800"
    >
      LỌC KẾT QUẢ
    </button>
  </div>

    <!-- Loading -->
    <div v-if="store.loading && items.length === 0" class="py-20 text-center">
        <div class="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
        <p class="mt-2 text-gray-500">Đang tải dữ liệu...</p>
    </div>

    <!-- Table -->
	<div v-else class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
		<table class="min-w-full text-sm">
			<thead class="bg-gray-50 dark:bg-gray-900/50 text-left border-b dark:border-gray-700">
				<tr>
					<th class="p-4 font-semibold text-gray-600 dark:text-gray-300">Sản phẩm</th>
					<th class="p-4 font-semibold text-gray-600 dark:text-gray-300">Danh mục</th>
					<th class="p-4 font-semibold text-gray-600 dark:text-gray-300">Giá bán</th>
                    <th class="p-4 font-semibold text-gray-600 dark:text-gray-300">Kho</th>
					<th class="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Hành động</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
				<tr v-for="p in items" :key="p.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
					<td class="p-4">
                        <div class="flex items-center gap-3">
                            <div class="h-12 w-12 rounded-lg border dark:border-gray-600 overflow-hidden bg-gray-100 flex-shrink-0">
                                <img :src="p.image" class="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div class="font-medium text-gray-900 dark:text-white">{{ p.name }}</div>
                                <div class="text-xs text-gray-500 font-mono">{{ p.sku }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 text-gray-600 dark:text-gray-300">{{ p.category_name }}</td>
					<td class="p-4 font-medium text-gray-900 dark:text-white">{{ formatCurrency(p.price) }}</td>
                    <td class="p-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="p.quantity > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'">
                            {{ p.quantity > 0 ? `Còn ${p.quantity}` : 'Hết hàng' }}
                        </span>
                    </td>
					<td class="p-4 text-right">
						<div class="flex items-center justify-end gap-2">
                            <!-- Nút Review -->
                            <button @click="openReviews(p)" class="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors" title="Xem đánh giá">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </button>
                            <!-- Nút Sửa -->
							<button @click="edit(p)" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Sửa">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
							</button>
                            <!-- Nút Xóa -->
							<button @click="openDeleteConfirm(p)" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Xóa">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

    <!-- Pagination -->
    <div v-if="store.pagination && store.pagination.pages > 1" class="mt-6 flex justify-center gap-2">
        <button @click="changePage(store.pagination.page - 1)" :disabled="store.pagination.page === 1" class="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Trước</button>
        <span class="px-4 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg font-medium border border-blue-100 dark:border-blue-800">{{ store.pagination.page }}</span>
        <button @click="changePage(store.pagination.page + 1)" :disabled="store.pagination.page === store.pagination.pages" class="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50">Sau</button>
    </div>

	<!-- MODAL SẢN PHẨM -->
	<div v-if="showEditModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
				<h2 class="text-xl font-bold text-gray-800 dark:text-white">{{ isCreating ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm' }}</h2>
				<button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">✕</button>
			</div>

			<div class="flex-1 overflow-y-auto p-6">
				<form @submit.prevent="onSubmit" class="space-y-8">
                    <!-- Thông tin chung -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Thông tin chung</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="block text-xs font-medium text-gray-500 mb-1">Tên SP *</label><input v-model="editFormData.name" required class="w-full px-3 py-2 rounded-lg border dark:bg-gray-700" /></div>
                                <div><label class="block text-xs font-medium text-gray-500 mb-1">Mã SKU *</label><input v-model="editFormData.sku" required class="w-full px-3 py-2 rounded-lg border dark:bg-gray-700" /></div>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div><label class="block text-xs font-medium text-gray-500 mb-1">Giá *</label><input v-model="editFormData.price" type="number" required class="w-full px-3 py-2 rounded-lg border dark:bg-gray-700" /></div>
                                <div><label class="block text-xs font-medium text-gray-500 mb-1">Kho *</label><input v-model="editFormData.stock_quantity" type="number" required class="w-full px-3 py-2 rounded-lg border dark:bg-gray-700" /></div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Danh mục *</label>
                                    <div class="flex gap-1">
                                        <select v-model="editFormData.category_id" required class="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 text-sm">
                                            <option value="" disabled>Chọn...</option>
                                            <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                        </select>
                                        <button type="button" @click="showCategoryModal = true" class="px-2 bg-green-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Quản lý danh mục">+</button>
                                    </div>
                                </div>
                            </div>
                            <div><label class="block text-xs font-medium text-gray-500 mb-1">Mô tả</label><textarea v-model="editFormData.description" rows="3" class="w-full px-3 py-2 rounded-lg border dark:bg-gray-700"></textarea></div>
                        </div>

                        <!-- Thuộc tính -->
                        <div class="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border dark:border-gray-700">
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Phân loại</h3>
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <label class="text-xs font-medium text-gray-500">Màu sắc (Định nghĩa trước)</label>
                                </div>
                                
                                <!-- Input thêm màu -->
                                <div class="flex gap-2 mb-3">
                                    <div class="relative group">
                                        <input v-model="newColor.hex" type="color" class="w-9 h-9 p-0 border-0 rounded cursor-pointer overflow-hidden" />
                                        <div class="absolute inset-0 rounded border border-gray-300 pointer-events-none"></div>
                                    </div>
                                    <input v-model="newColor.name" placeholder="Tên màu (VD: Đỏ đô)" class="flex-1 px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none" @keyup.enter="addColor" />
                                    <button type="button" @click="addColor" class="px-3 bg-gray-800 dark:bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">Thêm</button>
                                </div>

                                <!-- List Màu đã chọn -->
                                <div class="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                                    <div v-for="(color, idx) in editFormData.colors" :key="idx" class="flex items-center gap-2 bg-white dark:bg-gray-600 px-3 py-1 rounded-full border shadow-sm group">
                                        <div class="w-3 h-3 rounded-full border" :style="{ backgroundColor: color.hex }"></div>
                                        <span class="text-xs font-medium">{{ color.name }}</span>
                                        <button type="button" @click="removeColor(idx)" class="text-gray-400 hover:text-red-500 ml-1">✕</button>
                                    </div>
                                    <span v-if="editFormData.colors.length === 0" class="text-xs text-gray-400 italic py-1">Chưa có màu nào được chọn</span>
                                </div>

                                <!-- Gợi ý màu -->
                                <div class="flex flex-wrap gap-1.5">
                                    <button v-for="p in colorPresets" :key="p.hex" type="button" @click="() => { newColor.hex = p.hex; newColor.name = p.name; }" class="w-5 h-5 rounded-full border border-gray-300 hover:scale-110 transition-transform" :style="{ backgroundColor: p.hex }" :title="p.name"></button>
                                </div>
                            </div>
                            <hr class="dark:border-gray-600 my-3" />
                            <!-- Size -->
                            <div>
                                <label class="text-xs font-medium text-gray-500 block mb-2">Kích cỡ</label>
                                <div class="flex flex-wrap gap-2">
                                    <label v-for="size in predefinedSizes" :key="size" class="cursor-pointer select-none">
                                        <input type="checkbox" :value="size" v-model="editFormData.sizes" class="hidden peer" />
                                        <span class="block px-3 py-1 rounded border bg-white dark:bg-gray-600 text-xs font-medium peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">{{ size }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr class="dark:border-gray-700" />

                    <!-- Ảnh -->
					<div>
                        <div class="flex justify-between items-end mb-3">
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hình ảnh</h3>
                            <span class="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{{ editFormData.images.length }}/10</span>
                        </div>
                        <div v-if="editFormData.images.length > 0" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div v-for="(img, idx) in editFormData.images" :key="idx" class="relative group bg-white dark:bg-gray-700 p-2 rounded-lg border">
                                <div class="aspect-square rounded overflow-hidden mb-2 relative">
                                    <img :src="img.preview" class="w-full h-full object-contain" />
                                    <button type="button" @click="removeImage(idx)" class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">✕</button>
                                </div>
                                <select v-model="img.selectedColor" class="w-full text-xs py-1 border rounded dark:bg-gray-600">
                                    <option :value="null">Chung</option>
                                    <option v-for="color in editFormData.colors" :key="color.hex" :value="color.hex">{{ color.name }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center cursor-pointer relative">
                            <input type="file" multiple accept="image/*" @change="handleFileChange" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <span class="text-sm text-gray-500">Click để tải ảnh</span>
                        </div>
					</div>
				</form>
			</div>

            <div class="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
                <button type="button" @click="closeEditModal" class="px-5 py-2.5 bg-green border rounded-lg hover:bg-gray-50">Hủy</button>
                <button @click="onSubmit" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700" :disabled="store.loading">{{ store.loading ? 'Đang lưu...' : 'Lưu' }}</button>
            </div>
		</div>
	</div>

    <!-- MODAL QUẢN LÝ DANH MỤC (Nâng cấp) -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 class="text-lg font-bold mb-4 dark:text-white">Quản lý Danh mục</h3>
            
            <!-- List danh mục hiện có -->
            <div class="max-h-60 overflow-y-auto mb-4 border rounded dark:border-gray-700 p-2 space-y-2">
                <div v-if="store.categories.length === 0" class="text-center text-gray-500 text-sm py-4">Chưa có danh mục nào</div>
                <div v-for="cat in store.categories" :key="cat.id" class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded group hover:bg-gray-100 dark:hover:bg-gray-600">
                    <span class="text-sm font-medium">{{ cat.name }}</span>
                    <button @click="deleteCategory(cat.id)" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">✕</button>
                </div>
            </div>

            <!-- Form thêm mới -->
            <div class="flex gap-2 border-t pt-4 dark:border-gray-700">
                <input v-model="newCategoryName" class="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 text-sm" placeholder="Tên danh mục mới..." @keyup.enter="quickAddCategory" />
                <button @click="quickAddCategory" class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">Thêm</button>
            </div>
            
            <div class="mt-4 text-right">
                <button @click="showCategoryModal = false" class="text-sm text-gray-500 hover:underline">Đóng</button>
            </div>
        </div>
    </div>

    <!-- MODAL REVIEW (Đã thêm) -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 class="font-bold text-lg dark:text-white">Đánh giá: {{ currentProductForReview?.name }}</h3>
                <button @click="showReviewModal = false" class="text-gray-500">✕</button>
            </div>
            <div class="p-4 overflow-y-auto flex-1 space-y-4">
                <div v-if="productReviews.length === 0" class="text-center py-10 text-gray-500">Chưa có đánh giá nào.</div>
                <div v-else v-for="review in productReviews" :key="review.id" class="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
                    <div class="flex justify-between">
                        <div class="font-bold text-sm">User #{{ review.user_id }}</div>
                        <div class="text-yellow-500 text-xs"><span v-for="i in 5" :key="i">{{ i <= review.rating ? '★' : '☆' }}</span></div>
                    </div>
                    <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">{{ review.comment }}</p>
                    <div class="mt-3 pt-3 border-t dark:border-gray-600">
                        <div v-if="review.admin_reply" class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
                            <span class="font-bold text-blue-600 text-xs block mb-1">Admin:</span>{{ review.admin_reply }}
                        </div>
                        <div v-else class="flex gap-2 mt-2">
                            <input v-model="review.replyTemp" placeholder="Trả lời..." class="flex-1 px-3 py-1.5 text-sm border rounded dark:bg-gray-600" @keyup.enter="submitReply(review)" />
                            <button @click="submitReply(review)" class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded">Gửi</button>
                        </div>
                    </div>
                    <div class="mt-2 text-right"><button @click="deleteReviewFromModal(review.id)" class="text-xs text-red-500 hover:underline">Xóa</button></div>
                </div>
            </div>
        </div>
    </div>

	<!-- Modal Xóa -->
	<div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
			<h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Xác nhận xóa?</h3>
			<div class="flex gap-3 justify-center mt-4">
				<button @click="showDeleteModal = false" class="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
				<button @click="confirmDelete" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Xóa ngay</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useProductsStore } from '../../stores/products';
import { useUIStore } from '../../stores/ui';
import InputField from '../../components/forms/InputField.vue';
import SelectDropdown from '../../components/forms/SelectDropdown.vue';
import { formatCurrency } from '../../utils/helpers';
import api from '../../utils/product_service_api';

const store = useProductsStore();
const ui = useUIStore();

// STATE QUẢN LÝ MODAL
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showCategoryModal = ref(false);
const showReviewModal = ref(false); // Fix lỗi console
const isCreating = ref(false);

// STATE DỮ LIỆU
const productToDelete = ref(null);
const newCategoryName = ref('');
const currentProductForReview = ref(null); // Fix lỗi console
const productReviews = ref([]); // Fix lỗi console

const editFormData = reactive({
	id: null, name: '', sku: '', price: 0, stock_quantity: 0, category_id: '', description: '',
	images: [], colors: [], sizes: []
});

const newColor = reactive({ hex: '#000000', name: '' });
const colorPresets = [{ name: 'Đỏ', hex: '#FF0000' }, { name: 'Xanh dương', hex: '#0000FF' }, { name: 'Đen', hex: '#000000' }, { name: 'Trắng', hex: '#FFFFFF' }, { name: 'Vàng', hex: '#FFFF00' }, { name: 'Xám', hex: '#808080' }, { name: 'Nâu', hex: '#8B4513' }, { name: 'Hồng', hex: '#FFC0CB' }, { name: 'Xanh lá', hex: '#008000' }, { name: 'Be', hex: '#F5F5DC' }, { name: 'Tím', hex: '#800080' }, { name: 'Cam', hex: '#FFA500' }, { name: 'Xanh navy', hex: '#000080' }, { name: 'Rượu vang', hex: '#800000' }, { name: 'Xanh pastel', hex: '#A7C7E7' }];
const predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FreeSize'];
const filters = reactive({ q: '', categoryId: '' });

// COMPUTED (Có Fallback [] để tránh lỗi map undefined)
const items = computed(() => {
    const list = store.products || [];
    return list.map(p => ({
        id: p.id, sku: p.sku, name: p.name, price: p.price, quantity: p.stock_quantity,
        category_name: p.category_name, 
        image: p.images && p.images.length ? (p.images.find(i=>i.is_primary)?.image_url || p.images[0].image_url) : 'https://via.placeholder.com/100'
    }));
});
const categoryOptions = computed(() => {
    const list = store.categories || [];
    return [{ value: '', label: 'Tất cả' }, ...list.map(c => ({ value: c.id, label: c.name }))];
});

onMounted(() => { store.fetchProducts(); store.fetchCategories(); });
const handleSearch = () => store.fetchProducts({ search: filters.q, categoryId: filters.categoryId, page: 1 });
const changePage = (page) => store.fetchProducts({ page, search: filters.q, categoryId: filters.categoryId });

// --- CÁC HÀM XỬ LÝ SẢN PHẨM ---
function openCreate() {
	isCreating.value = true;
    Object.assign(editFormData, { id: null, name: '', sku: '', price: 0, stock_quantity: 0, category_id: store.categories?.[0]?.id||'', description: '', images: [], colors: [], sizes: [] });
	showEditModal.value = true;
}

function edit(p) {
    store.fetchProductById(p.id).then(() => {
        const data = store.currentProduct;
        if(!data) return;
        isCreating.value = false;
        Object.assign(editFormData, {
            id: data.id, name: data.name, sku: data.sku, price: data.price, stock_quantity: data.stock_quantity,
            category_id: data.category_id, description: data.description || '', colors: [], sizes: []
        });
        
        editFormData.images = data.images ? data.images.map(img => ({ file: null, preview: img.image_url, public_id: img.public_id, selectedColor: img.color || null })) : [];

        if (data.attributes) {
            data.attributes.forEach(attr => {
                if (attr.attribute_name === 'Màu') {
                    const match = attr.attribute_value.match(/^(.*)\s\((#.*)\)$/);
                    if (match) editFormData.colors.push({ name: match[1], hex: match[2] });
                } else if (attr.attribute_name === 'Size') editFormData.sizes.push(attr.attribute_value);
            });
        }
        showEditModal.value = true;
    });
}

function handleFileChange(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    if (editFormData.images.length + files.length > 10) return ui.pushToast({ type: 'warning', message: 'Max 10 ảnh' });
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => editFormData.images.push({ file: file, preview: e.target.result, public_id: null, selectedColor: null });
        reader.readAsDataURL(file);
    });
    event.target.value = '';
}

function removeImage(i) { editFormData.images.splice(i, 1); }
function addColor() { if (newColor.name) { editFormData.colors.push({ ...newColor }); newColor.name = ''; } }
function removeColor(i) { editFormData.colors.splice(i, 1); }

async function onSubmit() {
    if (!editFormData.name || !editFormData.sku) return;
    const formData = new FormData();
    ['name','sku','price','stock_quantity','category_id','description'].forEach(k => formData.append(k, editFormData[k]));

    const existingImages = [], imageColors = [];
    editFormData.images.forEach(img => {
        imageColors.push(img.selectedColor || null);
        if (img.file) formData.append('images', img.file);
        else existingImages.push({ public_id: img.public_id, image_url: img.preview });
    });

    if (!isCreating.value) formData.append('images', JSON.stringify(existingImages));
    formData.append('image_colors', JSON.stringify(imageColors));

    const attrs = [];
    editFormData.colors.forEach(c => attrs.push({ attribute_name: 'Màu', attribute_value: `${c.name} (${c.hex})` }));
    editFormData.sizes.forEach(s => attrs.push({ attribute_name: 'Size', attribute_value: s }));
    formData.append('attributes', JSON.stringify(attrs));

    const res = isCreating.value ? await store.createProduct(formData) : await store.updateProduct(editFormData.id, formData);
    if (res.success) { ui.pushToast({ type: 'success', message: 'Thành công' }); showEditModal.value = false; }
    else ui.pushToast({ type: 'error', message: res.message });
}

function openDeleteConfirm(p) { productToDelete.value = p; showDeleteModal.value = true; }
async function confirmDelete() { if (productToDelete.value) { await store.deleteProduct(productToDelete.value.id); showDeleteModal.value = false; } }
function closeEditModal() { showEditModal.value = false; }

// --- QUẢN LÝ DANH MỤC (Thêm & Xóa) ---
async function quickAddCategory() {
    if(!newCategoryName.value) return;
    const res = await store.createCategory({ name: newCategoryName.value });
    if(res.success) { 
        ui.pushToast({ type:'success', message:'Đã thêm' }); 
        newCategoryName.value=''; 
        // Không đóng modal để user có thể xem/xóa tiếp
        if(store.categories.length) editFormData.category_id=store.categories[store.categories.length-1].id; 
    }
}

async function deleteCategory(id) {
    // Gọi action deleteCategory trong store
    const res = await store.deleteCategory(id);
    if (res.success) {
        ui.pushToast({ type: 'success', message: 'Đã xóa danh mục' });
    } else {
        ui.pushToast({ type: 'error', message: res.message });
    }
}

// --- QUẢN LÝ REVIEW ---
async function openReviews(product) {
    currentProductForReview.value = product;
    showReviewModal.value = true;
    productReviews.value = [];
    try {
        const res = await api.get(`/products/${product.id}/reviews`);
        if (res.data.success) productReviews.value = res.data.data.map(r => ({ ...r, replyTemp: '' }));
    } catch (e) { ui.pushToast({ type: 'error', message: 'Lỗi tải đánh giá' }); }
}

async function submitReply(review) {
    if (!review.replyTemp) return;
    try {
        const res = await api.put(`/products/reviews/${review.id}/reply`, { reply: review.replyTemp });
        if (res.data.success) { ui.pushToast({ type: 'success', message: 'Đã trả lời' }); review.admin_reply = review.replyTemp; review.replyTemp = ''; }
    } catch (e) { ui.pushToast({ type: 'error', message: 'Lỗi' }); }
}

async function deleteReviewFromModal(id) {
    if (!confirm('Xóa?')) return;
    try {
        await api.delete(`/products/reviews/${id}`);
        ui.pushToast({ type: 'success', message: 'Đã xóa' });
        productReviews.value = productReviews.value.filter(r => r.id !== id);
    } catch (e) { ui.pushToast({ type: 'error', message: 'Lỗi xóa' }); }
}
</script>