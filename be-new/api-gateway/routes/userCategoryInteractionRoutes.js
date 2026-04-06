const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');

const authMiddleware = require('../middlewares/auth'); // nếu cần
// const authorize = require('../middlewares/authorize');

// Proxy helper for body forwarding
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

const userCategoryProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: (path) => path.replace(/^\/api\/v1\/user-category/, '/api/user-category'),
  logLevel: 'debug',
  ...proxyHelper // ...proxyHelper nếu cần body forwarding
});

// Public hoặc cần auth nhẹ
router.post('/click', authMiddleware, userCategoryProxy);     // ← thêm authMiddleware nếu controller cần req.user
router.get('/recent', authMiddleware, userCategoryProxy);    // ← thêm authMiddleware

// hoặc nếu bạn muốn hoàn toàn public (không cần userId từ token):
// router.post('/click', userCategoryProxy);
// router.get('/recent', userCategoryProxy);

module.exports = router;