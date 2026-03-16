// File: gateway/routes/product.js
const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth'); 
const { cacheMiddleware, clearCache } = require('../middlewares/cache');

const proxyHelper = {
  onProxyReq: (proxyReq, req, res) => {
    const contentType = req.headers['content-type'];
    // Nếu là upload ảnh -> Để nguyên stream
    if (contentType && contentType.includes('multipart/form-data')) return;
    
    // Nếu là JSON -> Gói lại body để gửi đi
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    if (!res.headersSent) res.status(503).json({ message: 'Product Service Unavailable' });
  }
};

const productServiceProxy = createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/products': '/api/products',
    '^/api/v1/categories': '/api/categories'
  },
  ...proxyHelper
});


// --- PUBLIC (Xem) ---
router.get('/products', cacheMiddleware(300), productServiceProxy);
router.get('/products/:id', cacheMiddleware(300), productServiceProxy);
router.get('/categories', cacheMiddleware(300), productServiceProxy);
router.get('/products/:id/download', productServiceProxy); 
router.get('/products/:id/reviews', productServiceProxy); 
router.get('/products/sku/:sku/primary-image', cacheMiddleware(300), productServiceProxy);
// --- CAN XAC THUC ---
router.post('/products', authMiddleware, (req, res, next) => {
  clearCache('/api/v1/products'); // Xóa cache cũ
  next();
}, productServiceProxy);

router.put('/products/:id', authMiddleware, (req, res, next) => {
  clearCache('/api/v1/products');
  next();
}, productServiceProxy);

router.delete('/products/:id', authMiddleware, (req, res, next) => {
  clearCache('/api/v1/products');
  next();
}, productServiceProxy);

router.post('/categories', authMiddleware, (req, res, next) => {
  clearCache('/api/v1/categories');
  next();
}, productServiceProxy);

router.post('/products/:id/reviews', authMiddleware, productServiceProxy);

router.delete('/products/reviews/:id', authMiddleware, (req, res, next) =>{
    clearCache('/api/v1/products'); 
    next();
}, productServiceProxy);

router.put('/products/reviews/:id/reply', authMiddleware, (req, res, next) => {
  clearCache('/api/v1/products'); 
    next();
}, productServiceProxy);

router.put('/categories/:id', authMiddleware, (req, res, next) => {
  clearCache('/api/v1/categories');
  next();
}, productServiceProxy);

router.delete('/categories/:id', authMiddleware, (req, res, next) => {
  clearCache('/api/v1/categories');
  next();
}, productServiceProxy);

router.put('/products/:id/stock', authMiddleware, (req, res, next) => {
clearCache('/api/v1/products'); // Xóa cache sản phẩm để cập nhật số lượng mới
  next();
}, productServiceProxy);

module.exports = router;
