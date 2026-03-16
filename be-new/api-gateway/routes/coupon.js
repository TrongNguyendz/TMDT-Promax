// routes/couponProxy.js
const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const authorizeAdmin = require('../middlewares/authorizeAdmin');
const rateLimitMiddleware = require('../middlewares/rate-limit');
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

const proxy = createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/coupons': '/api/coupons',  // /api/v1/coupons/* → /api/coupons/*
  },
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Payment service unavailable' });
  },
  ...proxyHelper
});



router.get('/', cacheMiddleware(60), proxy);
router.get('/:code', rateLimitMiddleware,authMiddleware, cacheMiddleware(60), proxy);
router.post('/',  authMiddleware , authorizeAdmin, proxy);
router.put('/:id', authMiddleware, authorizeAdmin, proxy);
router.delete('/:id', authMiddleware,authorizeAdmin, proxy);

module.exports = router;