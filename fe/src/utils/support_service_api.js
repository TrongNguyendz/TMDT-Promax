import axios from 'axios';
import { useUIStore } from '../stores/ui';
import { useUserStore } from '../stores/user';

const supportApi = axios.create({
  baseURL: 'http://localhost:3007/api/support',
  timeout: 15000,
});

supportApi.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore?.token) config.headers.Authorization = `Bearer ${userStore.token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

supportApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const uiStore = useUIStore();
    let message = error.response?.data?.message || 'Lỗi Support Service';
    if (uiStore?.pushToast && !error.config?.url.includes('mark-read')) {
      uiStore.pushToast({ type: 'error', message });
    }
    return Promise.reject(error);
  }
);

export default {
  getTickets: (params) => supportApi.get('/tickets', { params }),
  getTicketsByUserId: (userId, params) => supportApi.get(`/tickets/user/${userId}`, { params }),
  getTicketById: (id) => supportApi.get(`/tickets/${id}`),
  createTicket: (data) => supportApi.post('/tickets', data),
  sendMessage: (ticketId, data) => supportApi.post(`/tickets/${ticketId}/messages`, data),
  markAsRead: (ticketId) => supportApi.put(`/tickets/${ticketId}/mark-read`),
};