import axios from 'axios';
import { useUIStore } from '../stores/ui';
import { useUserStore } from '../stores/user'; 

const productApi = axios.create({
  baseURL: 'http://localhost:3000/api/v1', 
  timeout: 15000,
});

// --- Interceptor Request (Gửi Token) ---
productApi.interceptors.request.use(
  (config) => {
    // 2. Lấy Token từ Pinia
    const userStore = useUserStore();
    
    // 3. Nếu User đã đăng nhập, đính kèm Token vào Header
    if (userStore && userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor Response (Xử lý lỗi) ---
productApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const uiStore = useUIStore();
    let message = 'Lỗi Product Service';

    if (error.response) {
      // Lỗi từ Backend trả về (4xx, 5xx)
      message = error.response.data?.message || `Lỗi ${error.response.status}`;
    } else if (error.request) {
      // Lỗi không gọi được Server (Server tắt hoặc sai Port)
      message = 'Không thể kết nối đến Product Service (Port 3002)';
    } else {
      message = error.message;
    }

    // Hiện Toast thông báo lỗi
    if (uiStore && uiStore.pushToast) {
      uiStore.pushToast({ type: 'error', message });
    } else {
      console.error('❌ Product API Error:', message);
    }

    return Promise.reject(error);
  }
);

export const getListProducts = async () => {
    // if (!token) throw new Error('Token is required');
    return productApi.get('/products');
}

export const getmainimagebySKU = async (sku) => {
    // if (!token) throw new Error('Token is required');
    return await axios.get(`http://localhost:3000/api/v1/products/sku/${sku}/primary-image`);
}

export const getTopProducts = async () => {
    // if (!token) throw new Error('Token is required');
    return await productApi.get('http://localhost:3000/api/v1/products/top');
}

export default productApi;