<template>
  <section class="py-16 bg-white dark:bg-gray-900">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Tiêu đề -->
      <h2 class="text-3xl font-semibold text-center text-gray-900 dark:text-white mb-12">
      ƯU ĐÃI TUYỆT VỜI , THỬ NGAY !
      </h2>

      <!-- Danh sách mã giảm giá -->
      <div v-if="discounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(discount, index) in discounts"
          :key="index"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <!-- Mã giảm giá - nổi bật nhất -->
          <h3 class="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider mb-4">
            {{ discount.code }}
          </h3>

          <!-- Giá trị giảm -->

          <!-- Giá trị giảm - xử lý cả Percentage và Fixed -->
          <p class="text-lg font-medium text-gray-800 mb-2">
            <template v-if="discount.type === 'percentage'">
              Giảm {{ discount.value }}%
            </template>
            <template v-else-if="discount.type === 'fixed'">
              Giảm {{ formatPrice(discount.value) }} ₫
            </template>
            <template v-else>
              Giảm {{ discount.value }}
            </template>

          </p>

          <!-- Điều kiện đơn tối thiểu -->
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Đơn hàng tối thiểu {{ formatPrice(discount.minOrder) }} ₫
          </p>

          <!-- Ngày hết hạn -->
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-8">
            Hết hạn: {{ discount.expiry }}
          </p>

          <!-- Nút sao chép -->
          <button
            @click="copyCode(discount.code)"
            class="w-full py-3 border border-gray-800 dark:border-gray-300 text-gray-900 dark:text-gray-200 font-medium rounded-md hover:bg-gray-900 dark:hover:bg-gray-200 hover:text-white dark:hover:text-gray-900 transition-colors duration-200"
          >
            Sao chép mã
          </button>
        </div>
      </div>

      <!-- Trường hợp không có mã -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          Hiện tại chưa có mã giảm giá nào.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getListVouchers1} from '../../utils/voucher_service_api.js';
// Dữ liệu mẫu (sau này có thể fetch từ Node.js)
// import { useUserStore } from '@/stores/userStore';
// import { useUIStore } from '@/stores/uiStore';
// const ui = useUIStore();
// const user = useUserStore();
import { useUserStore } from '../../stores/user.js';
import { useUIStore } from '../../stores/ui.js';
const ui = useUIStore();
const user = useUserStore();

const voucherData = ref([]);

const discounts = ref([
  { code: 'SALE20', type: 'Percentage', value: 20, minOrder: 500000, expiry: '31/12/2025' },
  { code: 'NEWUSER15', type: 'Percentage', value: 15, minOrder: 300000, expiry: '15/01/2026' },
  { code: 'FREESHIP', type: 'fixed', value: 100, minOrder: 800000, expiry: '31/12/2025' },
]);

// Load vouchers
async function loadVouchers() {
  try {
    const response = await getListVouchers1();
    const voucherDataRaw = response.data.data || [];
    if (voucherDataRaw.length > 0) {
      discounts.value = voucherDataRaw.map(v => ({
        code: v.code,
        type: v.discount_type,
        value: v.discount_value,
        minOrder: v.min_order_amount,
        expiry: formatExpiryDate(v.valid_until),
      }));
    }
  } catch (err) {
    console.error('Lỗi tải voucher:', err);
    ui.pushToast({ type: 'error', message: 'Không thể tải danh sách voucher' });
  }
}

// Format tiền Việt Nam
const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

// Hàm helper format ngày (tùy backend trả về dạng nào)
function formatExpiryDate(dateStr) {
  if (!dateStr) return 'Không giới hạn';
  
  // Nếu backend trả '2025-12-31'
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
onMounted(() => {
  loadVouchers();
});
// Sao chép mã
const copyCode = (code) => {
  navigator.clipboard.writeText(code).then(() => {
    // alert(`Đã sao chép: ${code}`);
    ui.pushToast({ type: 'true', message: 'Đã sao chép mã giảm giá ' });
  }).catch(() => {
    alert('Không thể sao chép, hãy thử lại.');
  });
};
</script>