const cloudinary = require('cloudinary').v2; // Đảm bảo có '.v2'
require('dotenv').config();

// Kiểm tra xem các biến môi trường có được tải đúng không
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Lỗi: Vui lòng cung cấp đầy đủ thông tin cấu hình Cloudinary trong file .env');
  // Dừng ứng dụng nếu thiếu cấu hình
  process.exit(1); 
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Đảm bảo export đúng đối tượng đã được cấu hình
module.exports = cloudinary;