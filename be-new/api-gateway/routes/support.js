// api-gateway/routes/support.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

const SUPPORT_SERVICE_URL = process.env.SUPPORT_SERVICE_URL || 'http://localhost:3007';

router.use('/', createProxyMiddleware({
  target: SUPPORT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/support': '/api/support', // Khớp nối với Staff-Service
  },
  onProxyReq: (proxyReq, req, res) => {
    // 1. Chuyển tiếp Token xác thực
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }

    // 2. Cực kỳ quan trọng: Khôi phục Body (Chống lỗi BadRequestError: request aborted)
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy Support Error:', err);
    res.status(500).json({ success: false, message: 'Support Service đang bận hoặc không phản hồi' });
  }
}));

module.exports = router;