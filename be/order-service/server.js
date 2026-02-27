const app = require('./app');

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`🛒 Order Service đang chạy tại http://localhost:${PORT}`);
});

