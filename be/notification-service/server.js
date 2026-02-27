const app = require('./app');

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`🔔 Notification Service đang chạy tại http://localhost:${PORT}`);
});

