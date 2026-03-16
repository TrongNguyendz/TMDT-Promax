// test-insert.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/connectdata');   // ← sửa ở đây
const User = require('./models/User');

async function testInsert() {
  await connectDB();

  try {
    const newUser = await User.create({
      name: 'Nguyễn Văn A',
      email: 'vana@example.com',
      age: 25,
    });

    console.log('Đã tạo user thành công:', newUser);

    // Xem tất cả users
    const allUsers = await User.find();
    console.log('Tất cả users:', allUsers);

  } catch (err) {
    console.error('Lỗi:', err.message);
  } finally {
    await mongoose.connection.close();   // thêm await cho an toàn
  }
}

testInsert();