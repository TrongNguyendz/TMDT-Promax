const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/connectdata');
dotenv.config();
connectDB();

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`🛒 Order Service đang chạy tại http://localhost:${PORT}`);
});

