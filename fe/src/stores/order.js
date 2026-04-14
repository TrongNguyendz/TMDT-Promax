import { defineStore } from 'pinia';
import { ref } from 'vue';
import OrderService from '../utils/order_service_api';
import { useUserStore } from './user';
import { useUIStore } from './ui';

export const useOrderStore = defineStore('order', () => {
    // --- STATE ---
    const orders = ref([]);         // Danh sách đơn hàng
    const currentOrder = ref(null); // Chi tiết đơn hàng đang xem
    const loading = ref(false);

    // --- ACTIONS ---

    // 1. Lấy danh sách đơn hàng của user hiện tại
    const fetchMyOrders = async () => {
        const userStore = useUserStore();
        console.log('🚀 User Store khi fetchMyOrders:', userStore); // Debug user profile
        // SỬA: Kiểm tra an toàn, tránh lỗi undefined
        if (!userStore.isAuthenticated || !userStore.profile?.id) {
            orders.value = [];
            return;
        }

        loading.value = true;
        try {
            const res = await OrderService.getOrders({ user_id: userStore.profile.id });
            if (res.data?.success) {
                orders.value = res.data.data || [];
            } else {
                orders.value = [];
            }
        } catch (error) {
            console.error('Lỗi tải lịch sử đơn:', error);
            orders.value = [];
        } finally {
            loading.value = false;
        }
    };

    // 2. Lấy tất cả đơn hàng (dành cho Admin)
    const fetchAllOrders = async () => {
        loading.value = true;
        try {
            const res = await OrderService.getOrders({}); // Không truyền user_id → backend hiểu là lấy tất cả
            
            if (res.data?.success) {
                orders.value = res.data.data || [];
            } else {
                orders.value = [];
            }
        } catch (error) {
            console.error('Lỗi tải danh sách Admin:', error);
            orders.value = [];
        } finally {
            loading.value = false;
        }
    };

    // 3. Lấy chi tiết một đơn hàng
    const fetchOrderById = async (orderId) => {
        loading.value = true;
        currentOrder.value = null;
        try {
            const res = await OrderService.getOrderById(orderId);
            if (res.data?.success) {
                currentOrder.value = res.data.data;
                return res.data.data;
            }
        } catch (error) {
            console.error('Lỗi lấy chi tiết đơn:', error);
        } finally {
            loading.value = false;
        }
    };

    // 4. Tạo đơn hàng mới (từ Checkout)
    const createOrder = async (payload) => {
        const uiStore = useUIStore();
        loading.value = true;
        console.log('🚀 Payload gửi lên API tạo đơn:',payload); // Debug payload trước khi gửi
        try {
            const res = await OrderService.createOrder(payload);
            if (res.data?.success) {
                // Thêm vào đầu danh sách local để UI cập nhật ngay
                orders.value.unshift(res.data.data);
                
                uiStore.pushToast({ type: 'success', message: 'Đặt hàng thành công!' });
                return res.data.data;
            }
        } catch (error) {
            console.error('Lỗi tạo đơn hàng:', error);
            throw error; // Để checkout xử lý lỗi
        } finally {
            loading.value = false;
        }
    };

    // 5. Hủy đơn hàng
    const cancelOrder = async (orderId, reason = 'Khách hàng hủy') => {
        const userStore = useUserStore();
        const uiStore = useUIStore();

        // Kiểm tra đăng nhập
        if (!userStore.isAuthenticated || !userStore.profile?.id) {
            uiStore.pushToast({ type: 'warning', message: 'Vui lòng đăng nhập' });
            return false;
        }

        try {
            const res = await OrderService.cancelOrder(orderId, userStore.profile.id, reason);
            
            if (res.data?.success) {
                uiStore.pushToast({ type: 'success', message: 'Đã hủy đơn hàng thành công' });
                
                // Cập nhật trạng thái ngay trên UI (Optimistic Update)
                const orderIndex = orders.value.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    orders.value[orderIndex].status = 'cancelled';
                }
                
                if (currentOrder.value?.id === orderId) {
                    currentOrder.value.status = 'cancelled';
                }
                
                return true;
            }
        } catch (error) {
            console.error('Lỗi hủy đơn:', error);
            uiStore.pushToast({ type: 'error', message: 'Không thể hủy đơn hàng' });
            return false;
        }
    };

    return {
        orders,
        currentOrder,
        loading,
        fetchMyOrders,
        fetchAllOrders,
        fetchOrderById,
        createOrder,
        cancelOrder
    };
});