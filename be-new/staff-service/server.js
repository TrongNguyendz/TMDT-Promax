// be-new/staff-service/server.js
const http = require('http'); // Thêm module http
const { Server } = require('socket.io'); // Thêm socket.io
const app = require('./app');
const connectDB = require('./config/connectdata');
const supportRoutes = require('./routes/supportRoutes');

const PORT = process.env.PORT || 3007;

// 1. Tạo HTTP Server từ App Express
const server = http.createServer(app);

// 2. Khởi tạo Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi nguồn kết nối (Có thể siết chặt sau)
    methods: ["GET", "POST"]
  }
});

// 3. Gắn io vào app để các Controller có thể lấy ra sử dụng qua req.app.get('io')
app.set('io', io);
app.use('/api/support', supportRoutes);
// 4. Cấu hình các sự kiện Socket cơ bản
io.on('connection', (socket) => {
  console.log('🟢 Thiết bị kết nối Socket mới:', socket.id);

  // Tham gia vào phòng chat riêng của mỗi Ticket
  socket.on('join_ticket', (ticketId) => {
    socket.join(ticketId);
    console.log(`User ${socket.id} đã vào phòng: ${ticketId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Thiết bị đã ngắt kết nối:', socket.id);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    // 5. QUAN TRỌNG: Đổi từ app.listen sang server.listen
    server.listen(PORT, () => {
      console.log(`👨‍💼 Staff Service & Socket.io đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
  }
};

startServer();