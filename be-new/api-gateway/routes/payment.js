const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate').validate;
const schemas = require('../middlewares/validate').schemas;
const { cacheMiddleware } = require('../middlewares/cache');

// Cấu hình Proxy
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';

const paymentServiceProxy = createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    // 🟢 SỬA LẠI DÒNG NÀY CHO KHỚP VỚI BACKEND:
    '^/api/v1/payments': '/api/payments', 
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.body && Object.keys(req.body).length) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    if (!res.headersSent) {
      res.status(503).json({ success: false, message: 'Payment service unavailable', error: err.message });
    }
  }
});

// --- 1. NHÓM VNPAY (Ưu tiên, KHÔNG Validate Schema cũ) ---
router.get('/vnpay/ipn', paymentServiceProxy);
router.post('/vnpay/create',  paymentServiceProxy);

// --- 2. NHÓM THANH TOÁN THƯỜNG ---
router.use(authMiddleware);
router.get('/', cacheMiddleware(30), paymentServiceProxy);
router.get('/:id', cacheMiddleware(30), paymentServiceProxy);
router.post('/', validate(schemas.createPayment), paymentServiceProxy);
router.post('/:id/verify', paymentServiceProxy);

module.exports = router;