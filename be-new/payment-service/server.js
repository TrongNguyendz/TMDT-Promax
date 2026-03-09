const app = require('./app');

const http = require('http'); // Thư viện có sẵn của Node.js
const { Server } = require('socket.io'); // Phải cài: npm install socket.io

const PORT = process.env.PORT || 3004;

// 1. Tạo HTTP Server từ Express App
const server = http.createServer(app);

// 2. Khởi tạo Socket.io trên Server đó
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Cho phép chính xác địa chỉ Frontend của bạn
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true // Hỗ trợ thêm các bản socket cũ nếu cần
});

// 3. Đưa đối tượng 'io' vào app để các file Controller có thể lấy ra dùng
app.set('socketio', io);

// 4. Lắng nghe các kết nối từ trình duyệt (Frontend)
io.on('connection', (socket) => {
  console.log(`⚡ Có trình duyệt vừa kết nối Socket: ${socket.id}`);

  // Khi trình duyệt yêu cầu gia nhập phòng theo mã đơn hàng
  socket.on('join-order-room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`✅ Client đã gia nhập phòng: order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Một trình duyệt đã ngắt kết nối');
  });
});

// 5. QUAN TRỌNG: Phải dùng server.listen thay vì app.listen
server.listen(PORT, () => {
  console.log(`💳 Payment Service + Socket.io đang chạy tại http://localhost:${PORT}`);
});

