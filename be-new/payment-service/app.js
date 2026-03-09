const express = require('express');
const cors = require('cors');

require('dotenv').config();
require('./config/database');

const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
// const refundRoutes = require('./routes/refundRoutes');
// const couponUsageRoutes = require('./routes/couponUsageRoutes');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Routes
// 👇 SỬA LẠI CÁC DÒNG NÀY (Bỏ chữ /v1 đi để khớp với Gateway)
app.use('/api/payments', paymentRoutes);      // Cũ: /api/v1/payments
app.use('/api/coupons', couponRoutes);        // Cũ: /api/v1/coupons
// app.use('/api/coupon-usage', couponUsageRoutes); // Cũ: /api/v1/coupon-usage
// app.use('/api/refunds', refundRoutes);        // Cũ: /api/v1/refunds

// 3. Xử lý các Route không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại trên Payment Service`
  });
});

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Payment Service Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống nội bộ',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;

