import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useCartStore } from './cart';
import { useUserStore } from './user';
import { useOrderStore } from './order';
import { useUIStore } from './ui';

export const useCheckoutStore = defineStore('checkout', () => {
    // --- STATE ---
    const currentStep = ref(1); // 1: Review, 2: Shipping, 3: Payment, 4: Success

    const shippingInfo = ref({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        note: ''
    });
    
    const paymentMethod = ref('cod'); // cod | vnpay | momo
    const processing = ref(false);
    // Voucher state
    const voucherCode = ref('');
    const appliedVoucher = ref(null); // { code, type, value, minOrder, expiry }
    const discountAmount = ref(0);

    // --- ACTIONS ---

    // Chuyển bước
    const nextStep = () => { if (currentStep.value < 3) currentStep.value++; };
    const previousStep = () => { if (currentStep.value > 1) currentStep.value--; };
    const goToStep = (step) => { currentStep.value = step; };

    // Reset form
    const reset = () => {
        currentStep.value = 1;
        paymentMethod.value = 'cod';
        voucherCode.value = '';
        appliedVoucher.value = null;
        discountAmount.value = 0;
        // Có thể reset shippingInfo nếu muốn, hoặc giữ lại nhờ persist
    };

    // Voucher helpers
    const applyVoucher = async (code, cartTotal, availableVouchers = []) => {
        // Normalize and guards
        if (!code) return { success: false, message: 'Vui lòng nhập mã' };
        const found = availableVouchers.find(v => v.code.toLowerCase() === code.toLowerCase());
        if (!found) return { success: false, message: 'Mã không tồn tại' };
        // Check expiry
        if (found.expiry && new Date(found.expiry) < new Date()) return { success: false, message: 'Mã đã hết hạn' };
        // Ensure numbers
        const couponValue = Number(found.value ?? found.discountValue ?? 0);
        const total = Number(cartTotal ?? 0);
        if (isNaN(couponValue) || couponValue <= 0) return { success: false, message: 'Giá trị mã không hợp lệ' };
        // Check min order
        if (found.minOrder && total < Number(found.minOrder)) return { success: false, message: `Đơn tối thiểu ${new Intl.NumberFormat('vi-VN').format(found.minOrder)} ₫` };
        // Calculate discount amount
        let discount = 0;
        if (found.type === 'percentage' || found.type === 'Percentage') {
            discount = Math.round((couponValue / 100) * total);
        } else {
            discount = Math.min(Number(couponValue), total);
        }
        // Ensure discount is non-negative integer and not larger than total
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

    // 🟢 HÀM QUAN TRỌNG: Gửi đơn hàng xuống Backend
    const submitOrder = async () => {
        const cartStore = useCartStore();
        const userStore = useUserStore();
        const orderStore = useOrderStore();
        const uiStore = useUIStore();
        
        // 1. Kiểm tra đăng nhập (Sử dụng profile.id như đã sửa ở user store)
        if (!userStore.profile?.id) {
            uiStore.pushToast({ type: 'error', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
            return false;
        }

        // 2. Kiểm tra giỏ hàng
        if (cartStore.items.length === 0) {
            uiStore.pushToast({ type: 'warning', message: 'Giỏ hàng đang trống' });
            return false;
        }

        // 3. Validate thông tin giao hàng
        const info = shippingInfo.value;
        if (!info.fullName || !info.phone || !info.address || !info.province) {
            uiStore.pushToast({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
            return false;
        }

        processing.value = true;

        try {
            // 4. Chuẩn bị dữ liệu (Payload) gửi đi
            // Map từ Cart Item (LocalStorage) sang Order Item (Backend DB)
            const orderItems = cartStore.items.map(item => ({
                product_id: Number(item.product_id), // Đảm bảo là số
                quantity: Number(item.quantity),
                
                // Snapshot dữ liệu (Lưu cứng tên, giá, ảnh lúc mua)
                product_name: item.product_name || item.name, 
                product_image: item.product_image || item.image,
                unit_price: Number(item.price),
                
                // Biến thể (nếu có)
                color: item.color || null,
                size: item.size || null
            }));

            // Tạo chuỗi địa chỉ đầy đủ
            const fullAddressString = `${info.address}, ${info.ward}, ${info.district}, ${info.province}`;

            const payload = {
                user_id: userStore.profile.id, 
                email_user : userStore.profile.email,
                notification_type : "invoice",
                
                items: orderItems,
                shipping_address: {
                    full_name: info.fullName,
                    phone: info.phone,
                    address: fullAddressString,
                    city: info.province
                },
                payment_method: paymentMethod.value,
                shipping_fee: 0, // Tính phí ship sau nếu cần
                notes: info.note,
                voucher: appliedVoucher.value ? appliedVoucher.value.code : null,
                discount_amount: discountAmount.value || 0,
                // Backend có thể cần final_amount để tính toán thanh toán
                // make sure subtotal is a number (cartStore.subtotal may be a computed ref)
                final_amount: Math.round((Number(cartStore.subtotal?.value ?? cartStore.subtotal ?? 0)) - (Number(discountAmount.value) || 0))
            };
            console.log('dữ liệu được truyền đi là ',payload) ;
            // 5. Gọi Order Store để bắn API
            console.log('DEBUG submitOrder payload', { payload, discountAmount: discountAmount.value, appliedVoucher: appliedVoucher.value });
            const newOrder = await orderStore.createOrder(payload);
            console.log('DEBUG submitOrder response', newOrder);

            if (newOrder) {
                // Thành công -> Trả về object đơn hàng để CheckoutPage xử lý tiếp (ví dụ: gọi VNPay)
                return newOrder; 
            }
        } catch (error) {
            console.error("Lỗi submitOrder:", error);
            // Lỗi chi tiết đã được axios interceptor hiển thị toast
            return false;
        } finally {
            processing.value = false;
        }
    };

    return {
        currentStep,
        shippingInfo,
        paymentMethod,
        processing,
        voucherCode,
        appliedVoucher,
        discountAmount,
        nextStep,
        previousStep,
        goToStep,
        reset,
        applyVoucher,
        removeVoucher,
        submitOrder // 👈 ĐÃ CÓ HÀM NÀY
    };
}, {
    // Lưu lại thông tin nhập liệu để F5 không mất
    persist: {
        paths: ['shippingInfo', 'paymentMethod', 'voucherCode', 'appliedVoucher', 'discountAmount']
    }
});