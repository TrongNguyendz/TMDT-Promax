const mongoose = require('mongoose');

// Thay đổi URL theo môi trường của bạn (Local hoặc MongoDB Atlas)
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB (payment_service)');
  } catch (err) {
    console.error('❌ Không thể kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

// Gọi hàm kết nối
connectDB();

module.exports = mongoose.connection;