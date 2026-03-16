const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');

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
const notificationServiceProxy = createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: function (path, req) {
    // Remove /api/v1/notifications prefix
    return path.replace(/^\/api\/v1\/notifications/, '') || '/';
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Notification service is unavailable',
      error: err.message
    });
  },
  ...proxyHelper
});

// Tất cả routes đều yêu cầu authentication
router.use(authMiddleware);

router.get('/', cacheMiddleware(30), notificationServiceProxy);
router.get('/:id', cacheMiddleware(30), notificationServiceProxy);
router.put('/:id/read', notificationServiceProxy);
router.delete('/:id', notificationServiceProxy);

module.exports = router;

