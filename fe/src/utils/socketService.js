// fe/src/utils/socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://tmdt-promax-api-gateway.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      console.log('🔌 Đang kết nối tới Socket server...');
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      this.socket.on('connect', () => {
        console.log('🟢 Socket đã kết nối thành công!');
      });

      this.socket.on('connect_error', (err) => {
        console.error('🔴 Lỗi kết nối Socket:', err.message);
      });
    }
  }

  joinRoom(ticketId) {
    if (this.socket) {
      this.socket.emit('join_ticket', ticketId);
    }
  }

  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  // ✅ HÀM MỚI: Lắng nghe thông báo toàn cục để cập nhật danh sách
  onGlobalUpdate(callback) {
    if (this.socket) {
      this.socket.on('global_ticket_update', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();