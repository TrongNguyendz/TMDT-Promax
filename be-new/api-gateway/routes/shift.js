// routes/shift.js
const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');

const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { cacheMiddleware } = require('../middlewares/cache');
const authorizeAdmin = require('../middlewares/authorizeAdmin');

// Proxy helper (copy từ file staff.js để dùng chung)
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
    console.error('[Shift Proxy Error]', err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Shift service is unavailable',
        error: err.message
      });
    }
  }
};

// Proxy cho shift
const shiftProxy = createProxyMiddleware({
  target: process.env.STAFF_SERVICE_URL || 'http://localhost:3007', // hoặc env riêng cho shift nếu khác port
  changeOrigin: true,
  pathRewrite: (path) => {
    // Chuyển /api/v1/shifts → /api/shifts (backend shift-service)
    return path.replace(/^\/api\/v1\/shifts/, '/api/shifts');
  },
  logLevel: 'debug',
  ...proxyHelper
});

// Logging cho shift routes
router.use((req, res, next) => {
  console.log(`[Shift Proxy] Request received: ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Shift routes ─────────────────────────────────────────────────────────────

// List shifts
router.get('/', 
  authMiddleware, 
  authorize, 
  cacheMiddleware(60), 
  shiftProxy
); // GET /api/v1/shifts

// Get shift by id
router.get('/:id', 
  authMiddleware, 
  authorize, 
  cacheMiddleware(60), 
  shiftProxy
); // GET /api/v1/shifts/:id

// Create shift
router.post('/', 
  authMiddleware, 
   authorizeAdmin,
  shiftProxy
); // POST /api/v1/shifts

// Update shift
router.put('/:id', 
  authMiddleware, 
   authorizeAdmin,
  shiftProxy
); // PUT /api/v1/shifts/:id

// Soft delete / Cancel shift
router.delete('/:id', 
  authMiddleware, 
   authorizeAdmin,
  shiftProxy
); // DELETE /api/v1/shifts/:id

// Hard delete (chỉ admin)
router.delete('/:id/hard', 
  authMiddleware, 
  authorizeAdmin, 
  shiftProxy
); // DELETE /api/v1/shifts/:id/hard

// (Tùy chọn) Thêm sau nếu cần
// router.put('/:id/checkin', authMiddleware, authorize, shiftProxy);
// router.put('/:id/checkout', authMiddleware, authorize, shiftProxy);
// router.get('/week', authMiddleware, authorize, cacheMiddleware(300), shiftProxy);

module.exports = router;