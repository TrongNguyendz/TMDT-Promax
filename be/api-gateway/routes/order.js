// api-gateway(Trojng)/routes/order.js
const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate').validate;
const schemas = require('../middlewares/validate').schemas;

// Helper: Xử lý lại Body khi dùng Proxy (Fix lỗi gửi body rỗng sang Service)
const proxyHelper = {
  onProxyReq: (proxyReq, req, res) => {
    // 1. THÊM ĐOẠN NÀY TỪ FILE PRODUCT SANG
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('multipart/form-data')) return;
    
    // 2. Xử lý JSON body
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Order Service is unavailable',
        error: err.message
      });
    }
  }
};

// Cấu hình Proxy trỏ về Order Service (Port 3003)
const orderServiceProxy = createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
   '^/api/v1/orders': '/api/orders',
    '^/api/v1/wishlists': '/api/wishlists',
    // '^/api/v1/shipments': '/api/shipments',
  },
  ...proxyHelper
});

router.use(authMiddleware);

// --- ĐỊNH NGHĨA ROUTES ---
// 1. ORDER ROUTES
router.get('/orders/stats', orderServiceProxy);//CHANGE
router.get('/orders', orderServiceProxy);
router.get('/orders/:id', orderServiceProxy);
router.post('/orders', orderServiceProxy);
router.put('/orders/:id/status', orderServiceProxy);
router.delete('/orders/:id', orderServiceProxy);
router.put('/orders/:id/cancel', orderServiceProxy);

// 2. WISHLIST ROUTES
router.get('/wishlists/:userId', orderServiceProxy);
router.post('/wishlists/:userId', orderServiceProxy);
router.delete('/wishlists/:userId/:productId', orderServiceProxy);

module.exports = router;
