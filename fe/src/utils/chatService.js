// fe/src/utils/chatService.js
import axios from 'axios';
import { useUserStore } from '@/stores/user';

const API_BASE = 'https://tmdt-promax-api-gateway.onrender.com/api/v1/support';

const getAuthHeaders = () => {
  const userStore = useUserStore();
  const token = userStore.token; // Lấy từ Pinia

  if (!token) {
    console.warn("⚠️ Cảnh báo: Không tìm thấy Token trong Store!");
  }

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

export const chatService = {
  // ==========================================
  // DÀNH CHO ADMIN / STAFF
  // ==========================================
  
  // Lấy danh sách tất cả các ticket (để hiện bên Sidebar)
  getTickets: async (params = {}) => {
    return await axios.get(`${API_BASE}`, { ...getAuthHeaders(), params });
  },

  // Đánh dấu đã đọc tin nhắn
  markAsRead: async (ticketId, readerType) => {
    return await axios.put(`${API_BASE}/${ticketId}/mark-read`, { reader_type: readerType }, getAuthHeaders());
  },

  // ✅ HÀM MỚI ĐƯỢC THÊM VÀO: Cập nhật trạng thái Ticket (Ví dụ: Đóng chat)
  updateTicketStatus: async (ticketId, payload) => {
    // Dùng PATCH để cập nhật 1 phần dữ liệu (ở đây là status)
    return await axios.patch(`${API_BASE}/${ticketId}/status`, payload, getAuthHeaders());
  },

  // ==========================================
  // DÀNH CHO CUSTOMER
  // ==========================================

  // Lấy ticket hiện có của một User
  getUserTickets: async (userId) => {
    return await axios.get(`${API_BASE}/user/${userId}`, getAuthHeaders());
  },

  // Tạo ticket mới khi bắt đầu chat
  createTicket: async (payload) => {
    return await axios.post(`${API_BASE}`, payload, getAuthHeaders());
  },

  // ==========================================
  // DÙNG CHUNG (CẢ ADMIN & CUSTOMER)
  // ==========================================

  // Lấy chi tiết lịch sử tin nhắn của 1 phiên chat
  getTicketDetail: async (ticketId) => {
    return await axios.get(`${API_BASE}/${ticketId}`, getAuthHeaders());
  },

  // Gửi tin nhắn mới
  sendMessage: async (ticketId, payload) => {
    return await axios.post(`${API_BASE}/${ticketId}/messages`, payload, getAuthHeaders());
  }
};