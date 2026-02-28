const app = require('./app');

const PORT = process.env.PORT || 3001;
const connectDB = require('./config/connectdata'); // hoặc './config/database'



// app.listen(PORT, () => {
//   console.log(`👤 User Service đang chạy tại http://localhost:${PORT}`);
// });

const startServer = async () => {
  await connectDB();           // Kết nối MongoDB trước
  app.listen(PORT, () => {
    console.log(`👤 User Service đang chạy tại http://localhost:${PORT}`);
  });
};

startServer();

