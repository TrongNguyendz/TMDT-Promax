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
        fullName: '',
        email: '',
        phone: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        note: ''
    });
    
    const paymentMethod = ref('cod'); 
    const processing = ref(false);
    
    // Voucher state
    const voucherCode = ref('');
    const appliedVoucher = ref(null); 
    const discountAmount = ref(0);

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
    };

    const applyVoucher = async (code, cartTotal, availableVouchers =[]) => {
        if (!code) return { success: false, message: 'Vui lòng nhập mã' };
        const found = availableVouchers.find(v => v.code.toLowerCase() === code.toLowerCase());
        if (!found) return { success: false, message: 'Mã không tồn tại' };
        
        if (found.expiry && new Date(found.expiry) < new Date()) return { success: false, message: 'Mã đã hết hạn' };
        
        const couponValue = Number(found.value ?? found.discountValue ?? 0);
        const total = Number(cartTotal ?? 0);
        if (isNaN(couponValue) || couponValue <= 0) return { success: false, message: 'Giá trị mã không hợp lệ' };
        
        if (found.minOrder && total < Number(found.minOrder)) return { success: false, message: `Đơn tối thiểu ${new Intl.NumberFormat('vi-VN').format(found.minOrder)} ₫` };
        
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

    // 🟢 HÀM QUAN TRỌNG: Gửi đơn hàng xuống Backend
    const submitOrder = async () => {
        const cartStore = useCartStore();
        const userStore = useUserStore();
        const orderStore = useOrderStore();
        const uiStore = useUIStore();
        
        // 1. Kiểm tra đăng nhập 
        const userId = userStore.profile?.id;
        const userEmail = userStore.profile?.email 

        if (!userStore.token || !userId) {
            uiStore.pushToast({ type: 'error', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
            return false;
        }

        // 2. Validate giỏ hàng & địa chỉ
        if (cartStore.items.length === 0) {
            uiStore.pushToast({ type: 'warning', message: 'Giỏ hàng đang trống' });
            return false;
        }

        const info = shippingInfo.value;
        if (!info.fullName || !info.phone || !info.address || !info.province) {
            uiStore.pushToast({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
            return false;
        }

        processing.value = true;

        try {
            // 3. Đóng gói Items
            const orderItems = cartStore.items.map(item => ({
                product_id: item.product_id || item.id, // Vẫn giữ item.id phòng hờ data cũ trong LocalStorage
                quantity: Number(item.quantity),
                product_name: item.product_name || item.name, 
                product_image: item.product_image || item.image,
                unit_price: Number(item.price),
                color: item.color || null,
                size: item.size || null
            }));

            const fullAddressString = `${info.address}, ${info.ward}, ${info.district}, ${info.province}`;

            // 4. Payload chuẩn gửi Order Service
            const payload = {
                user_id: userId, 
                email_user: userEmail,
                notification_type: "invoice", // Phục vụ Notification Service
                
                items: orderItems,
                shipping_address: {
                    full_name: info.fullName,
                    phone: info.phone,
                    address: fullAddressString,
                    city: info.province
                },
                payment_method: paymentMethod.value,
                shipping_fee: 0, 
                notes: info.note,
                
                voucher: appliedVoucher.value ? appliedVoucher.value.code : null,
                discount_amount: discountAmount.value || 0,
                // Tính toán Final Amount ngay tại client
                final_amount: Math.max(0, Math.round((Number(cartStore.subtotal?.value ?? cartStore.subtotal ?? 0)) - (Number(discountAmount.value) || 0)))
            };

            console.log('📦 Payload gửi đi chuẩn:', payload); 

            // 5. Gửi lên Gateway
            const newOrder = await orderStore.createOrder(payload);

            if (newOrder) {
                return newOrder; 
            }
        } catch (error) {
            console.error("❌ Lỗi submitOrder:", error);
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
        submitOrder 
    };
}, {
    persist: {
        paths:['shippingInfo', 'paymentMethod', 'voucherCode', 'appliedVoucher', 'discountAmount']
    }
});