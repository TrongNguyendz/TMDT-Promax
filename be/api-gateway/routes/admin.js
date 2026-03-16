const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const authorizeAdmin = require('../middlewares/authorizeAdmin');
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
    console.error('[Proxy Error]', err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'User service is unavailable',
        error: err.message
      });
    }
  }
};

// Proxy configuration
const adminServiceProxy = createProxyMiddleware({
  target: process.env.ADMIN_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
  pathRewrite: (path) => {
    // /api/v1/admin/banners → /api/banners
    return path.replace(/^\/api\/v1\/admin/, '/api');
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Admin service is unavailable',
      error: err.message
    });

  }
});

router.get('/banners', cacheMiddleware(60), adminServiceProxy);
// Tất cả routes đều cần authentication (chỉ admin mới dùng)

// Banner routes
// router.get('/banners', cacheMiddleware(60), adminServiceProxy);
router.get('/banners/:id',authMiddleware ,authorizeAdmin, cacheMiddleware(60), adminServiceProxy);
router.post('/banners',authMiddleware,authorizeAdmin, adminServiceProxy);
router.put('/banners/:id', authMiddleware,authorizeAdmin, adminServiceProxy);
router.delete('/banners/:id', authMiddleware,authorizeAdmin, adminServiceProxy);

// Search history routes
router.get('/search-history', authMiddleware, cacheMiddleware(30), adminServiceProxy);
router.post('/search-history', authMiddleware, adminServiceProxy);
router.get('/search-history/popular', authMiddleware, cacheMiddleware(300), adminServiceProxy);

// Report routes
router.get('/reports', authMiddleware, cacheMiddleware(60), adminServiceProxy);
router.get('/reports/:id', authMiddleware, cacheMiddleware(60), adminServiceProxy);
router.post('/reports/generate', authMiddleware, adminServiceProxy);
router.delete('/reports/:id', authMiddleware, adminServiceProxy);

module.exports = router;


