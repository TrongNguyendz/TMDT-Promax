<template>
  <aside class="h-fit rounded-lg border border-gray-200 p-6 dark:border-gray-800">
    <h2 class="mb-4 text-lg font-semibold">Tóm tắt đơn hàng</h2>

    <div class="mb-4 space-y-2 border-b pb-4 dark:border-gray-700">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Số lượng:</span>
        <span class="font-medium">{{ cart.itemCount }} sản phẩm</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Tổng tiền hàng:</span>
        <span class="font-medium">{{ formatCurrency(cart.subtotal) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Vận chuyển:</span>
        <span class="font-medium text-green-600">{{ formatCurrency(shippingFeeValue) }}</span>
      </div>
    </div>

    <div class="mb-4 space-y-2">
      <div class="flex items-center gap-2">
        <input v-model="codeInput" type="text" placeholder="Nhập mã giảm giá" class="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none" />
        <button @click="applyCode" class="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white">Áp dụng</button>
      </div>
      <div v-if="applied" class="flex items-center gap-3 text-sm text-green-700">
        <p>Đã áp dụng: <span class="font-medium">{{ applied.code }}</span> — <span>{{ formatDiscountText(applied) }}</span></p>
        <button @click="removeCode" class="text-sm text-gray-600 hover:text-gray-800">(Huỷ)</button>
      </div>
      <p v-else-if="lastMessage" class="text-sm text-red-600">{{ lastMessage }}</p>
    </div>

    <div class="mb-2 flex justify-between text-sm text-gray-600">
      <span>Giảm giá:</span>
      <span class="font-medium">-{{ formatCurrency(checkout.discountAmount || 0) }}</span>
    </div>
    <div class="mb-6 flex justify-between">
      <span class="font-semibold">Tổng cộng:</span>
      <span class="text-2xl font-bold">{{ formatCurrency(finalTotal) }}</span>
    </div>

    <!-- Thông tin bước hiện tại -->
    <div class="rounded-lg bg-gray-50 p-3 text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
      <p class="font-semibold">
        Bước {{ currentStep }}/4:
        <span v-if="currentStep === 1">Xem lại đơn hàng</span>
        <span v-else-if="currentStep === 2">Nhập thông tin giao hàng</span>
        <span v-else>Xác nhận đơn hàng</span>
      </p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, toRef } from 'vue';
import { formatCurrency } from '../../utils/helpers';
import { useCheckoutStore } from '../../stores/checkout';
import { useUIStore } from '../../stores/ui';
import { getListVouchers1 } from '../../utils/voucher_service_api';

const props = defineProps({ cart: Object, currentStep: Number });
const cart = toRef(props, 'cart');

const checkout = useCheckoutStore();
const ui = useUIStore();

const codeInput = ref('');
const lastMessage = ref('');

const applied = computed(() => checkout.appliedVoucher);
// Ensure subtotal is a number (cart.subtotal may be a computed ref)
const subtotalValue = computed(() => Number(cart.value?.subtotal?.value ?? cart.value?.subtotal ?? 0));
const shippingFeeValue = computed(() => Number(checkout.shippingFee || 0));
const finalTotal = computed(() => Math.max(0, Math.round(subtotalValue.value + shippingFeeValue.value - (Number(checkout.discountAmount) || 0))));

function formatDiscountText(v) {
  if (!v) return '';
  if (v.type === 'percentage' || v.type === 'Percentage') return `Giảm ${v.value}%`;
  return `Giảm ${formatCurrency(v.value)}`;
}

async function applyCode() {
  lastMessage.value = '';
  try {
    const resp = await getListVouchers1();
    const raw = resp.data.data || [];
    const vouchers = raw.map(v => ({
      code: v.code,
      type: v.discount_type || v.type || 'fixed',
      value: v.discount_value || v.value,
      minOrder: v.min_order_amount || v.minOrder || 0,
      expiry: v.valid_until || v.expiry || null
    }));

    const cartTotal = Number(cart.value?.subtotal?.value ?? cart.value?.subtotal ?? 0);
    const result = await checkout.applyVoucher(codeInput.value.trim(), cartTotal, vouchers);
    if (!result.success) {
      lastMessage.value = result.message;
      ui.pushToast({ type: 'error', message: result.message });
    } else {
      ui.pushToast({ type: 'success', message: 'Áp dụng mã thành công' });
      codeInput.value = '';
    }
  } catch (err) {
    console.error('Lỗi áp dụng mã:', err);
    ui.pushToast({ type: 'error', message: 'Không thể áp dụng mã' });
  }
}

function removeCode() {
  checkout.removeVoucher();
  ui.pushToast({ type: 'info', message: 'Đã huỷ mã giảm giá' });
}
</script>