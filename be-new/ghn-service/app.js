const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();

const ghnRoutes = require('./routers/ghnrouter');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.use('/api/ghn', ghnRoutes);

// Route kiểm tra sức khỏe server
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'GHN Service' });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error("🔥 App Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Lỗi hệ thống nội bộ",
  });
});

module.exports = app;