const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/connectdata');
dotenv.config();
connectDB();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(` Product Service đang chạy tại http://localhost:${PORT}`);
});