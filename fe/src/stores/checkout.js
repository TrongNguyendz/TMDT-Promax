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
        ward: '', district: '', province: '', note: ''
    });
    
    const paymentMethod = ref('cod'); 
    const processing = ref(false);
    
    // Voucher state
    const voucherCode = ref('');
    const appliedVoucher = ref(null); 
    const discountAmount = ref(0);
    const shippingFee = ref(0);
    
    //  State Mua ngay
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

    // Mua ngay
    const setDirectBuy = (item) => {
        isDirectBuy.value = true;
        directBuyItem.value = item;
    };

    const clearDirectBuy = () => {
        isDirectBuy.value = false;
        directBuyItem.value = null;
    };

    // 🟢 HÀM QUAN TRỌNG: Gửi đơn hàng xuống Backend
    const submitOrder = async () => {
        const cartStore = useCartStore();
        const userStore = useUserStore();
        const orderStore = useOrderStore();
        const uiStore = useUIStore();
        
<<<<<<< Updated upstream
        const userId = userStore.profile?.id;
        const userEmail = userStore.profile?.email;
=======
        // 1. Kiểm tra đăng nhập 
        const userId = userStore.profile?.id;
        const userEmail = userStore.profile?.email 
>>>>>>> Stashed changes

        if (!userStore.token || !userId) {
            uiStore.pushToast({ type: 'error', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
            return false;
        }

        // Mua ngay hay Mua từ giỏ
        const sourceItems = (isDirectBuy.value && directBuyItem.value) 
            ? [directBuyItem.value] 
            : cartStore.items;

        //  Kiểm tra dựa trên sourceItems
        if (sourceItems.length === 0) {
            uiStore.pushToast({ type: 'warning', message: 'Không có sản phẩm để thanh toán' });
            return false;
        }

        const info = shippingInfo.value;
        if (!info.fullName || !info.phone || !info.address || !info.province) {
            uiStore.pushToast({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
            return false;
        }

        processing.value = true;

        try {
            // Lấy dữ liệu từ sourceItems thay vì cartStore.items
            const orderItems = sourceItems.map(item => ({
                product_id: item.product_id || item.id,
                quantity: Number(item.quantity),
                product_name: item.product_name || item.name, 
                product_image: item.product_image || item.image,
                unit_price: Number(item.price),
                color: item.color || item.selectedColor || null, // Hỗ trợ cả 2 tên biến
                size: item.size || item.selectedSize || null
            }));

            const fullAddressString = `${info.address}, ${info.ward}, ${info.district}, ${info.province}`;

            // Tính tiền dựa trên nguồn hàng
            const currentSubtotal = (isDirectBuy.value && directBuyItem.value)
                ? (Number(directBuyItem.value.price) * Number(directBuyItem.value.quantity))
                : (Number(cartStore.subtotal?.value ?? cartStore.subtotal ?? 0));

            const payload = {
                user_id: userId, 
                email_user: userEmail,
                notification_type: "invoice",
                items: orderItems,
                shipping_address: {
                    full_name: info.fullName,
                    phone: info.phone,
                    address: fullAddressString,
                    city: info.province
                },
                payment_method: paymentMethod.value,
                shipping_fee: Number(shippingFee.value || 0), 
                notes: info.note,
                voucher: appliedVoucher.value ? appliedVoucher.value.code : null,
                discount_amount: discountAmount.value || 0,
                
                
                final_amount: Math.max(0, Math.round(currentSubtotal + Number(shippingFee.value || 0) - (Number(discountAmount.value) || 0)))
            };

            const newOrder = await orderStore.createOrder(payload);

            if (newOrder) {
                // // Chỉ xóa giỏ hàng nếu MUA TỪ GIỎ
                // if (!isDirectBuy.value) {
                //     cartStore.clearCart();
                // }
                // // Luôn tắt chế độ Mua ngay sau khi xong
                // clearDirectBuy();

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
        shippingFee,
        
        // 👇 [CHANGE] Bắt buộc export các biến/hàm này ra ngoài
        isDirectBuy,
        directBuyItem,
        setDirectBuy,
        clearDirectBuy,
        
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
        // 👇 [CHANGE] Thêm 2 biến này vào persist để lỡ User F5 trang Checkout thì món hàng Mua Ngay không bị mất
        paths:['shippingInfo', 'paymentMethod', 'voucherCode', 'appliedVoucher', 'discountAmount', 'shippingFee', 'isDirectBuy', 'directBuyItem']
    }
});