// src/utils/voucher_service_api.js
import axios from 'axios';

// Thay đổi base URL tùy theo backend của bạn
const API_BASE_URL = 'https://tmdt-promax-api-gateway.onrender.com/api/v1'; // hoặc import từ env: import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm chung để thêm token vào header (nếu có)
const getAuthConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Lấy danh sách voucher
export const getListVouchers1 = async () => {
  return await api.get('/coupons');
};

// Tạo voucher mới
export const createVoucher1 = async (voucherData, token) => {
  return await api.post('/coupons', voucherData, getAuthConfig(token));
};

// Cập nhật voucher
export const updateVoucher1 = async (id, voucherData, token) => {
  return await api.put(`/coupons/${id}`, voucherData, getAuthConfig(token));
};

// Xóa voucher
export const deleteVoucher1 = async (id, token) => {
  return await api.delete(`/coupons/${id}`, getAuthConfig(token));
};