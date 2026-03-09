const app = require('./app');

const PORT = process.env.PORT || 3007;
const connectDB = require('./config/connectdata'); // hoặc './config/database'


const startServer = async () => {
  await connectDB();           // Kết nối MongoDB trước
  app.listen(PORT, () => {
    console.log(`👨‍💼 Staff Service đang chạy tại http://localhost:${PORT}`);
  });
};

startServer();

