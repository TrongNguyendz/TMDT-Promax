// src/utils/order_service_api.js
import axios from 'axios';
import { useUIStore } from '../stores/ui';
import { useUserStore } from '../stores/user';

const orderApi = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 15000,
});

orderApi.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore && userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

orderApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const uiStore = useUIStore();
    let message = 'Lỗi Order Service';

    if (error.response) {
      message = error.response.data?.message || `Lỗi ${error.response.status}`;
    } else if (error.request) {
      message = 'Không thể kết nối đến Order Service';
    } else {
      message = error.message;
    }

    // Không hiện toast cho lỗi wishlist (vì đang offline)
    if (!error.config?.url.includes('wishlist')) {
      if (uiStore && uiStore.pushToast) {
        uiStore.pushToast({ type: 'error', message });
      }
    }

    return Promise.reject(error);
  }
);

export default {
  // ORDER - giữ nguyên
  createOrder(data) {
    return orderApi.post('/orders', data);
  },
  getOrders(params) {
    return orderApi.get('/orders', { params });
  },
  getOrderById(id) {
    return orderApi.get(`/orders/${id}`);
  },
  cancelOrder(orderId, userId, reason = '') {
    return orderApi.put(`/orders/${orderId}/cancel`, { user_id: userId, reason });
  },
  updateOrderStatus(id, status) {
    return orderApi.put(`/orders/${id}/status`, { status });
  },
  deleteOrder(id) {
    return orderApi.delete(`/orders/${id}`);
  },

  getWishlist() {
    return orderApi.get('/wishlists', { params: { user_id: userId } });
  },

  toggleWishlist(productId) {
    // Giả lập API thành công ngay lập tức
    return Promise.resolve({
      data: { success: true }
    });
  },
  //CHANGE
  getReportStats() {
    return orderApi.get('/orders/stats');
  }
};