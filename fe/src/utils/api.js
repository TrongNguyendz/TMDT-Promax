import axios from 'axios';
import { useUserStore } from '../stores/user';
import { useUIStore } from '../stores/ui';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com',
	timeout: 15000
});

api.interceptors.request.use((config) => {
	const user = useUserStore();
	if (user?.token) {
		config.headers.Authorization = `Bearer ${user.token}`;
	}
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(error) => {
		const ui = useUIStore();
		const message = error?.response?.data?.message || error.message || 'Có lỗi xảy ra';
		ui.pushToast({ type: 'error', message });
		return Promise.reject(error);
	}
);

export default api;


