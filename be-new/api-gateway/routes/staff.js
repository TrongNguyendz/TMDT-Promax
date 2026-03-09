// routes/staff.js
const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');

const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { cacheMiddleware } = require('../middlewares/cache');
const validate = require('../middlewares/validate').validate;
const schemas = require('../middlewares/validate').schemas;
const authorizeAdmin = require('../middlewares/authorizeAdmin');

// routes/staff.js – thêm ở đầu file, ngay sau const router = ...

// Proxy helper cho các route có body JSON
const proxyHelper = {
  onProxyReq: (proxyReq, req, res) => {
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('[Staff Proxy Error]', err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Staff service is unavailable',
        error: err.message
      });
    }
  }
};
// routes/staff.js – thêm ở đầu file, ngay sau const router = ...
router.use((req, res, next) => {
  console.log(`[Staff Proxy] Request received: ${req.method} ${req.originalUrl}`);
  next();
});
// Proxy chung cho hầu hết các endpoint staff
const staffProxy = createProxyMiddleware({
  target: process.env.STAFF_SERVICE_URL || 'http://localhost:3007',
  changeOrigin: true,
  pathRewrite: (path) => {
    // Chuyển /api/v1/staff → /api/staff
    return path.replace(/^\/api\/v1\/staff/, '/api/staff');
  },
  logLevel: 'debug',
  ...proxyHelper
});

// Proxy dành riêng cho upload avatar (multipart/form-data → không dùng proxyHelper)
const avatarProxy = createProxyMiddleware({
  target: process.env.STAFF_SERVICE_URL || 'http://localhost:3007',
  changeOrigin: true,
  pathRewrite: (path) => {
    return path.replace(/^\/api\/v1\/staff/, '/api/staff');
  },
  logLevel: 'debug'
  // Không spread ...proxyHelper vì đây là multipart
});

// ─── Public routes (nếu có) ──────────────────────────────────────
// Hiện tại staff không có public endpoint nào giống register/login
// Nếu sau này cần → thêm ở đây

// ─── Protected routes ─────────────────────────────────────────────
router.get('/', authMiddleware,authorizeAdmin, cacheMiddleware(60), staffProxy);                    // GET /api/v1/staff
router.get('/:id', authMiddleware, authorize, cacheMiddleware(60), staffProxy);     // GET /api/v1/staff/:id
router.get('/code/:code', authMiddleware, authorizeAdmin, cacheMiddleware(60), staffProxy); // GET /api/v1/staff/code/NV001

router.post('/', authMiddleware, staffProxy); // POST /api/v1/staff

router.put('/:id', authMiddleware, authorizeAdmin, staffProxy);                          // PUT /api/v1/staff/:id
router.delete('/:id', authMiddleware, authorizeAdmin, staffProxy);                       // DELETE /api/v1/staff/:id (soft)
router.delete('/:id/hard', authMiddleware, authorizeAdmin, staffProxy);                  // DELETE /api/v1/staff/:id/hard

// Đặc biệt: upload avatar
router.put('/:id/avatar', authMiddleware, authorize, avatarProxy);                  // PUT /api/v1/staff/:id/avatar

// (Tùy chọn) Nếu sau này hỗ trợ multiple avatars giống user
// router.put('/:id/avatar/multiple', authMiddleware, authorize, avatarProxy);

// (Tùy chọn) Các route khác bạn có thể thêm
// router.put('/:id/status', authMiddleware, authorize, staffProxy);
// router.get('/stats', authMiddleware, authorize, cacheMiddleware(300), staffProxy);

module.exports = router;