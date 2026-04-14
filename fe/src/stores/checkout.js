import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useCartStore } from './cart';
import { useUserStore } from './user';
import { useOrderStore } from './order';
import { useUIStore } from './ui';

export const useCheckoutStore = defineStore('checkout', () => {
    // --- STATE ---
    const currentStep = ref(1); 

    const shippingInfo = ref({
        fullName: '', email: '', phone: '', address: '',
        ward: '', district: '', province: '', note: '',deliveryType: 2
    });
    
    const paymentMethod = ref('cod'); 
    const processing = ref(false);
    
    // Voucher state
    const voucherCode = ref('');
    const appliedVoucher = ref(null); 
    const discountAmount = ref(0);
    const shippingFee = ref(0);
    
    // State Mua ngay
    const isDirectBuy = ref(false);
    const directBuyItem = ref(null);
    

    // --- ACTIONS ---

    const nextStep = () => { if (currentStep.value < 3) currentStep.value++; };
    const previousStep = () => { if (currentStep.value > 1) currentStep.value--; };
    const goToStep = (step) => { currentStep.value = step; };

    const reset = () => {
        currentStep.value = 1;
        paymentMethod.value = 'cod';
        voucherCode.value = '';
        appliedVoucher.value = null;
        discountAmount.value = 0;
        shippingFee.value = 0;
        isDirectBuy.value = false;
        directBuyItem.value = null;
    };

    const applyVoucher = async (code, cartTotal, availableVouchers = []) => {
        if (!code) return { success: false, message: 'Vui lòng nhập mã' };
        const found = availableVouchers.find(v => v.code.toLowerCase() === code.toLowerCase());
        
        if (!found) return { success: false, message: 'Mã không tồn tại' };
        if (found.expiry && new Date(found.expiry) < new Date()) return { success: false, message: 'Mã đã hết hạn' };
        
        const couponValue = Number(found.value ?? found.discountValue ?? 0);
        const total = Number(cartTotal ?? 0);
        
        if (isNaN(couponValue) || couponValue <= 0) return { success: false, message: 'Giá trị mã không hợp lệ' };
        if (found.minOrder && total < Number(found.minOrder)) {
            return { success: false, message: `Đơn tối thiểu ${new Intl.NumberFormat('vi-VN').format(found.minOrder)} ₫` };
        }
        
        let discount = 0;
        if (found.type === 'percentage' || found.type === 'Percentage') {
            discount = Math.round((couponValue / 100) * total);
        } else {
            discount = Math.min(Number(couponValue), total);
        }
        
        discount = Number.isFinite(discount) ? Math.max(0, Math.round(discount)) : 0;
        voucherCode.value = code;
        appliedVoucher.value = found;
        discountAmount.value = discount;
        return { success: true, discount };
    };

    const removeVoucher = () => {
        voucherCode.value = '';
        appliedVoucher.value = null;
        discountAmount.value = 0;
    };

    const setDirectBuy = (item) => {
        isDirectBuy.value = true;
        directBuyItem.value = item;
    };

    const clearDirectBuy = () => {
        isDirectBuy.value = false;
        directBuyItem.value = null;
    };

    // 🟢 ACTION CHỦ CHỐT: Gửi đơn hàng
    const submitOrder = async () => {
        const cartStore = useCartStore();
        const userStore = useUserStore();
        const orderStore = useOrderStore();
        const uiStore = useUIStore();
        
        const userId = userStore.profile?.id;
        if (!userStore.token || !userId) {
            uiStore.pushToast({ type: 'error', message: 'Phiên đăng nhập hết hạn.' });
            return false;
        }

        // Xác định nguồn hàng
        const sourceItems = (isDirectBuy.value && directBuyItem.value) ? [directBuyItem.value] : cartStore.items;
        if (sourceItems.length === 0) {
            uiStore.pushToast({ type: 'warning', message: 'Giỏ hàng trống' });
            return false;
        }

        processing.value = true;

        try {
            // Chuẩn hóa dữ liệu sản phẩm
            const orderItems = sourceItems.map(item => ({
                product_id: item.product_id || item.id || item._id,
                quantity: Number(item.quantity),
                product_name: item.product_name || item.name, 
                product_image: item.product_image || item.image,
                unit_price: Number(item.price),
                color: item.color || item.selectedColor || null,
                size: item.size || item.selectedSize || null
            }));

            const info = shippingInfo.value;
            const fullAddressString = `${info.address}, ${info.ward}, ${info.district}, ${info.province}`;

            // Tính toán tổng tiền
            const currentSubtotal = (isDirectBuy.value && directBuyItem.value)
                ? (Number(directBuyItem.value.price) * Number(directBuyItem.value.quantity))
                : (Number(cartStore.total ?? 0));

            const payload = {
                user_id: userId, 
                email_user: userStore.profile?.email,
                notification_type: "invoice",
                items: orderItems,
                shipping_address: {
                    full_name: info.fullName,
                    phone: info.phone,
                    address: fullAddressString,
                    city: info.province
                },
                delivery_type: info.deliveryType || 2, // Lấy deliveryType từ shippingInfo
                payment_method: paymentMethod.value,
                shipping_fee: Number(shippingFee.value || 0), 
                notes: info.note,
                voucher: appliedVoucher.value?.code || null,
                discount_amount: discountAmount.value || 0,
                final_amount: Math.max(0, Math.round(currentSubtotal + Number(shippingFee.value) - discountAmount.value))
            };

            // 🚀 GỌI API TẠO ĐƠN
            console.log('🚀 Payload gửi lên API tạo đơn:', payload); // Debug payload trước khi gửi
            const newOrder = await orderStore.createOrder(payload);

            if (newOrder) {
                // Nếu thanh toán COD thành công, chúng ta có thể xóa giỏ ngay
                // Nhưng nếu là VietQR, chúng ta để trang Success xử lý xóa giỏ để an toàn
                return newOrder; 
            }
        } catch (error) {
            console.error("❌ Lỗi submitOrder:", error);
            uiStore.pushToast({ type: 'error', message: 'Lỗi hệ thống khi tạo đơn hàng' });
            return false;
        } finally {
            processing.value = false;
        }
    };

    return {
        currentStep, shippingInfo, paymentMethod, processing,
        voucherCode, appliedVoucher, discountAmount, shippingFee,
        isDirectBuy, directBuyItem, setDirectBuy, clearDirectBuy,
        nextStep, previousStep, goToStep, reset, applyVoucher, removeVoucher, submitOrder 
    };
}, {
    persist: {
        paths:['shippingInfo', 'paymentMethod', 'voucherCode', 'appliedVoucher', 'discountAmount', 'shippingFee', 'isDirectBuy', 'directBuyItem']
    }
});