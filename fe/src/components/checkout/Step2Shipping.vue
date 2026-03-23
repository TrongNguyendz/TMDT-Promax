<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { useUserStore } from '../../stores/user';
import { useCartStore } from '../../stores/cart';
import { useCheckoutStore } from '../../stores/checkout';
import { formatCurrency } from '../../utils/helpers';
import { calculateShippingFee as ghnCalculateShippingFee } from '../../utils/ghnapi';
import { getProvinces, getDistricts, getWards } from '../../utils/province';
// Import EventBus nếu cần (hiện chưa dùng)
// import { EventBus } from '../../pages/customer/CheckoutPage.vue';

const props = defineProps(['shippingInfo', 'paymentMethod']);
const emit = defineEmits(['next', 'prev', 'update:paymentMethod']);

const user = useUserStore();
const cartStore = useCartStore();
const checkoutStore = useCheckoutStore();
const info = props.shippingInfo;

// Danh sách đổ vào Select
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

// Lưu trữ mã code để gọi API cấp kế tiếp
const selectedProvinceCode = ref('');
const selectedDistrictCode = ref('');
const selectedWardCode = ref('');
const shippingFee = ref(checkoutStore.shippingFee || 0);

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

const errors = reactive({
  fullName: '', email: '', phone: '', address: '', ward: '', district: '', province: '', paymentMethod: ''
});

// --- LOGIC XỬ LÝ API ---

// 1. Load tỉnh khi khởi tạo
const loadProvinces = async () => {
  try {
    const data = await getProvinces();
    provinces.value = data; // Service đã trả về res.data
  } catch (error) {
    console.error('Lỗi tải tỉnh:', error);
  }
};

// 2. Khi chọn Tỉnh
const handleProvinceChange = async () => {
  // Reset dữ liệu cấp dưới
  districts.value = [];
  wards.value = [];
  selectedDistrictCode.value = '';
  selectedWardCode.value = '';
  info.district = '';
  info.ward = '';

  if (!selectedProvinceCode.value) {
    info.province = '';
    return;
  }

  try {
    // Tìm tên tỉnh để lưu vào info
    const p = provinces.value.find(item => item.code == selectedProvinceCode.value);
    info.province = p ? p.name : '';
    
    // Gọi API lấy huyện
    districts.value = await getDistricts(selectedProvinceCode.value);
    await updateShippingFee();
  } catch (error) {
    console.error('Lỗi tải huyện:', error);
  }
};

// 3. Khi chọn Huyện
const handleDistrictChange = async () => {
  // Reset dữ liệu cấp dưới
  wards.value = [];
  selectedWardCode.value = '';
  info.ward = '';

  if (!selectedDistrictCode.value) {
    info.district = '';
    return;
  }

  try {
    // Tìm tên huyện để lưu vào info
    const d = districts.value.find(item => item.code == selectedDistrictCode.value);
    info.district = d ? d.name : '';

    // Gọi API lấy xã
    wards.value = await getWards(selectedDistrictCode.value);
    await updateShippingFee();
  } catch (error) {
    console.error('Lỗi tải xã:', error);
  }
};

// 4. Khi chọn Xã
const handleWardChange = async () => {
  if (!selectedWardCode.value) {
    info.ward = '';
    updateShippingFee(0);
    return;
  }
  const w = wards.value.find(item => item.code == selectedWardCode.value);
  info.ward = w ? w.name : '';

  await updateShippingFee();
};

const computeLocalShippingFee = () => {
  const provinceName = (info.province || '').toLowerCase();
  let base = 30000;
  if (/hồ chí minh|tp\. hồ chí minh|sài gòn/.test(provinceName)) base = 17000;
  else if (/hà nội/.test(provinceName)) base = 16000;
  else if (/đà nẵng/.test(provinceName)) base = 19000;
  else if (/hải phòng/.test(provinceName)) base = 20000;

  const qty = Number(cartStore.itemCount || 1);
  const extra = (qty > 1) ? (qty - 1) * 5000 : 0;
  return Math.max(0, base + extra);
};

const updateShippingFee = async () => {
  if (!info.province || !info.district || !info.ward) {
    updateShippingFeeValue(0);
    return;
  }

  // Nếu GHN API có chạy, thử gọi
  try {
    const payload = {
      // Giá trị mẫu tạm, nếu GHN không có data map đúng, sẽ dùng local fallback
      from_district_id: 1451,
      to_district_id: Number(selectedDistrictCode.value) || 0,
      to_ward_code: selectedWardCode.value || '',
      height: 10,
      length: 20,
      weight: Math.max(1000, cartStore.subtotal ? Math.round(cartStore.subtotal / 1000) * 1000 : 1000),
      width: 10,
      service_id: 53320,
      insurance_value: 0,
      coupon: null
    };

    const resp = await ghnCalculateShippingFee(payload);
    const feeFromApi = Number(resp?.data?.total || resp?.data?.fee || 0);
    if (Number.isFinite(feeFromApi) && feeFromApi > 0) {
      updateShippingFeeValue(feeFromApi);
      return;
    }
  } catch (err) {
    console.warn('Không lấy được phí GHN, dùng giá trị nội bộ', err);
  }

  updateShippingFeeValue(computeLocalShippingFee());
};

const updateShippingFeeValue = (value) => {
  shippingFee.value = Number(value || 0);
  checkoutStore.shippingFee = shippingFee.value;
};

watch(
  () => [info.province, info.district, info.ward],
  () => {
    if (info.province && info.district && info.ward) {
      updateShippingFee();
    }
  },
  { immediate: true }
);

// --- VALIDATION & SUBMIT ---

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9]{10,11}$/.test(phone.toString().replace(/\s/g, ''));
}

const handleSubmit = async () => {
  if (!shippingFee.value && info.province && info.district && info.ward) {
    await updateShippingFee();
  }

  Object.keys(errors).forEach(key => (errors[key] = ''));
  let isValid = true;

  if (!info.fullName?.trim()) { errors.fullName = 'Vui lòng nhập họ và tên'; isValid = false; }
  if (!info.email?.trim() || !validateEmail(info.email)) { errors.email = 'Email không hợp lệ'; isValid = false; }
  if (!info.phone || !validatePhone(info.phone)) { errors.phone = 'Số điện thoại không hợp lệ'; isValid = false; }
  if (!info.province) { errors.province = 'Vui lòng chọn tỉnh/thành'; isValid = false; }
  if (!info.district) { errors.district = 'Vui lòng chọn quận/huyện'; isValid = false; }
  if (!info.ward) { errors.ward = 'Vui lòng chọn phường/xã'; isValid = false; }
  if (!info.address?.trim()) { errors.address = 'Vui lòng nhập địa chỉ cụ thể'; isValid = false; }
  if (!props.paymentMethod) { errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán'; isValid = false; }

  if (isValid) emit('next');
  else window.scrollTo({ top: 100, behavior: 'smooth' });
};

onMounted(() => {
  loadProvinces();
});
</script>

<template>
  <div class="space-y-4">
    <h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Thông tin giao hàng</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên *</label>
          <input v-model="info.fullName" type="text" class="input-field" placeholder="Nhập họ và tên" />
          <p v-if="errors.fullName" class="error-msg">{{ errors.fullName }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
          <input v-model="info.email" type="email" class="input-field" placeholder="Nhập email" />
          <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại *</label>
          <input v-model="info.phone" type="tel" class="input-field" placeholder="Nhập số điện thoại" />
          <p v-if="errors.phone" class="error-msg">{{ errors.phone }}</p>
        </div>
      </div>

      <hr class="border-gray-200 dark:border-gray-800">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tỉnh/Thành phố *</label>
          <select class="input-field" v-model="selectedProvinceCode" @change="handleProvinceChange">
            <option value="">Chọn tỉnh/thành phố</option>
            <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
          </select>
          <p v-if="errors.province" class="error-msg">{{ errors.province }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Quận/Huyện *</label>
          <select class="input-field" v-model="selectedDistrictCode" @change="handleDistrictChange" :disabled="!selectedProvinceCode">
            <option value="">Chọn quận/huyện</option>
            <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
          </select>
          <p v-if="errors.district" class="error-msg">{{ errors.district }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phường/Xã *</label>
          <select class="input-field" v-model="selectedWardCode" @change="handleWardChange" :disabled="!selectedDistrictCode">
            <option value="">Chọn phường/xã</option>
            <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
          </select>
          <p v-if="errors.ward" class="error-msg">{{ errors.ward }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ chi tiết *</label>
          <input v-model="info.address" type="text" class="input-field" placeholder="Số nhà, đường..." />
          <p v-if="errors.address" class="error-msg">{{ errors.address }}</p>
        </div>
      </div>

      <div class="mt-3 rounded-lg border border-gray-200 p-3 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Phí vận chuyển ước tính</span>
          <span class="font-semibold text-green-600">{{ formatCurrency(shippingFee) }}</span>
        </div>
        <p class="text-xs text-gray-500">Phí tự động cập nhật khi chọn tỉnh/huyện/xã. Có thể thay đổi khi tạo đơn với GHN.</p>
      </div>

      <div class="space-y-3 pt-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phương thức thanh toán *</label>
        <div v-for="method in paymentMethods" :key="method.value" @click="$emit('update:paymentMethod', method.value)"
          class="flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all"
          :class="paymentMethod === method.value ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800'">
          <input type="radio" :checked="paymentMethod === method.value" class="h-4 w-4 text-blue-600" />
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">{{ method.label }}</p>
            <p class="text-sm text-gray-500">{{ method.description }}</p>
          </div>
        </div>
        <p v-if="errors.paymentMethod" class="error-msg">{{ errors.paymentMethod }}</p>
      </div>

      <div class="flex gap-3 pt-6">
        <button type="button" @click="$emit('prev')" class="btn-secondary">Quay lại</button>
        <button type="submit" class="btn-primary">Tiếp tục thanh toán</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.input-field {
  @apply mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 outline-none transition-all;
}
.error-msg { @apply mt-1 text-xs text-red-500; }
.btn-primary { @apply flex-1 rounded-lg bg-gray-900 px-4 py-3 text-white font-medium hover:bg-black transition-colors; }
.btn-secondary { @apply flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors dark:text-gray-300 dark:border-gray-700; }
</style>