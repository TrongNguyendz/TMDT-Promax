<template>
  <div class="space-y-4">
    <h2 class="mb-4 text-lg font-semibold">Thông tin giao hàng</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      
      <!-- Grid cho các trường nhập liệu -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">Họ và tên *</label>
          <input v-model="info.fullName" type="text" class="input-field" placeholder="Nhập họ và tên" />
          <p v-if="errors.fullName" class="error-msg">{{ errors.fullName }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium">Email *</label>
          <input v-model="info.email" type="email" class="input-field" placeholder="Nhập email" />
          <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium">Số điện thoại *</label>
          <input v-model="info.phone" type="tel" class="input-field" placeholder="Nhập số điện thoại" />
          <p v-if="errors.phone" class="error-msg">{{ errors.phone }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium">Địa chỉ *</label>
          <input v-model="info.address" type="text" class="input-field" placeholder="Số nhà, tên đường" />
          <p v-if="errors.address" class="error-msg">{{ errors.address }}</p>
        </div>
        <div><input v-model="info.ward" type="text" class="input-field" placeholder="Phường/Xã *" /></div>
        <div><input v-model="info.district" type="text" class="input-field" placeholder="Quận/Huyện *" /></div>
        <div><input v-model="info.province" type="text" class="input-field" placeholder="Tỉnh/Thành phố *" /></div>
      </div>

      <!-- Ghi chú -->
      <div>
        <label class="block text-sm font-medium">Ghi chú (Tùy chọn)</label>
        <textarea v-model="info.note" class="input-field" rows="2"></textarea>
      </div>

      <!-- Lựa chọn thanh toán -->
      <div class="space-y-3">
        <label class="block text-sm font-medium">Phương thức thanh toán *</label>
        <div v-for="method in paymentMethods" :key="method.value" 
          @click="$emit('update:paymentMethod', method.value)"
          class="flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all dark:border-gray-800"
          :class="paymentMethod === method.value ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-900/50' : 'border-gray-300'">
          <input type="radio" :checked="paymentMethod === method.value" class="h-4 w-4" />
          <div>
            <p class="font-semibold">{{ method.label }}</p>
            <p class="text-sm text-gray-500">{{ method.description }}</p>
          </div>
        </div>
      </div>

      <!-- Nút điều hướng -->
      <div class="flex gap-3 pt-4">
        <button type="button" @click="$emit('prev')" class="flex-1 rounded-lg border border-gray-300 px-4 py-3">Quay lại</button>
        <button type="submit" class="flex-1 rounded-lg bg-gray-900 px-4 py-3 text-white">Tiếp tục thanh toán</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useUserStore } from '../../stores/user'
const props = defineProps(['shippingInfo', 'paymentMethod']);
const emit = defineEmits(['next', 'prev', 'update:paymentMethod']);
const user = useUserStore()
// Tham chiếu đến dữ liệu nhận từ props
const info = props.shippingInfo;

const paymentMethods = [
  { 
    value: 'cod', 
    label: 'Thanh toán khi nhận hàng (COD)', 
    description: 'Thanh toán trực tiếp cho nhân viên giao hàng' 
  },
  { 
    value: 'vnpay', 
    label: 'Thanh toán VNPAY (QR Code)', 
    description: 'Quét mã QR thanh toán tức thì qua ứng dụng Ngân hàng' 
  }
];

// Đối tượng chứa các thông báo lỗi
const errors = reactive({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    paymentMethod: ''
});

// Hàm bổ trợ 1: Kiểm tra định dạng Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Hàm bổ trợ 2: Kiểm tra định dạng Số điện thoại (10-11 chữ số)
function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone.toString().replace(/\s/g, ''));
}

// HÀM XỬ LÝ KHI NHẤN "TIẾP TỤC"
const handleSubmit = () => {
    // 1. Reset lại toàn bộ lỗi trước khi kiểm tra mới
    Object.keys(errors).forEach(key => (errors[key] = ''));
    let isValid = true;

    // 2. Kiểm tra Họ tên
    if (!info.fullName || !info.fullName.trim()) {
        errors.fullName = 'Vui lòng nhập họ và tên';
        isValid = false;
    }

    // 3. Kiểm tra Email
    if (!info.email || !info.email.trim()) {
        errors.email = 'Vui lòng nhập email';
        isValid = false;
    } else if (!validateEmail(info.email)) {
        errors.email = 'Định dạng email không hợp lệ';
        isValid = false;
    }

    // 4. Kiểm tra Số điện thoại
    if (!info.phone || !info.phone.toString().trim()) {
        errors.phone = 'Vui lòng nhập số điện thoại';
        isValid = false;
    } else if (!validatePhone(info.phone)) {
        errors.phone = 'Số điện thoại phải từ 10-11 chữ số';
        isValid = false;
    }

    // 5. Kiểm tra Địa chỉ (Số nhà, đường)
    if (!info.address || !info.address.trim()) {
        errors.address = 'Vui lòng nhập địa chỉ cụ thể';
        isValid = false;
    }

    // 6. Kiểm tra Phường/Xã
    if (!info.ward || !info.ward.trim()) {
        errors.ward = 'Vui lòng nhập phường/xã';
        isValid = false;
    }

    // 7. Kiểm tra Quận/Huyện
    if (!info.district || !info.district.trim()) {
        errors.district = 'Vui lòng nhập quận/huyện';
        isValid = false;
    }

    // 8. Kiểm tra Tỉnh/Thành phố
    if (!info.province || !info.province.trim()) {
        errors.province = 'Vui lòng nhập tỉnh/thành phố';
        isValid = false;
    }

    // 9. Kiểm tra Phương thức thanh toán
    if (!props.paymentMethod) {
        errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
        isValid = false;
    }

    // 10. Nếu tất cả đều hợp lệ, phát sự kiện 'next' để chuyển bước
    if (isValid) {
        emit('next');
    } else {
        // Tùy chọn: Cuộn trang lên đầu form để người dùng thấy lỗi
        window.scrollTo({ top: 100, behavior: 'smooth' });
    }
};
</script>

<style scoped>
.input-field { @apply mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900; }
.error-msg { @apply mt-1 text-xs text-red-600; }
</style>