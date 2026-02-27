const app = require('./app');

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`🔧 Admin Service đang chạy tại http://localhost:${PORT}`);
});

