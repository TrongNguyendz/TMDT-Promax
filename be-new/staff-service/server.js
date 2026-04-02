// staff-service/server.js
const http = require('http'); 
const { Server } = require('socket.io'); 
const app = require('./app');
const connectDB = require('./config/connectdata');

const PORT = process.env.PORT || 3007;

// 1. Tạo HTTP Server từ Express app
const server = http.createServer(app);

// 2. Khởi tạo Socket.io với cấu hình CORS (cho phép FE truy cập)
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// 3. Lưu đối tượng io vào app để các Controller có thể truy xuất qua req.app.get('socketio')
app.set('socketio', io);

// 4. Cấu hình các sự kiện kết nối cơ bản
io.on('connection', (socket) => {
  console.log(' Một bờ rồ đã kết nối socket:', socket.id);

  // Khi khách hàng hoặc staff vào một ticket cụ thể
  socket.on('join_ticket', (ticketId) => {
    socket.join(ticketId);
    console.log(` Socket ${socket.id} đã tham gia phòng ticket: ${ticketId}`);
  });

  socket.on('disconnect', () => {
    console.log(' Một bờ rồ đã ngắt kết nối');
  });
});

const startServer = async () => {
  try {
    await connectDB(); // Kết nối MongoDB
    
  
    server.listen(PORT, () => {
      console.log(`👨‍💼 Staff Service (Real-time) đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
  }
};

startServer();