const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate').validate;
const schemas = require('../middlewares/validate').schemas;
const { cacheMiddleware } = require('../middlewares/cache');
const authorize = require('../middlewares/authorize');
const authorizeAdmin = require('../middlewares/authorizeAdmin');
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

// Auth proxy for login/register - specific routing
const authProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: (path) => {
    // Remove /api/v1/users prefix and add /api/auth prefix
    return path.replace(/^\/api\/v1\/users/, '/api/auth');
  },
  logLevel: 'debug',
  ...proxyHelper
});

// User data proxy for user endpoints
const userDataProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: (path) => {
    // Remove /api/v1/users prefix and add /api/users prefix
    return path.replace(/^\/api\/v1\/users/, '/api/users');
  },
  logLevel: 'debug',
  ...proxyHelper
});

// Proxy for avatar upload
const avatarProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: (path) => {
    return path.replace(/^\/api\/v1\/users/, '/api/users');
  },
  logLevel: 'debug'
  // KHÔNG spread ...proxyHelper
});

// Public routes - Auth endpoints
router.post('/register', (req, res, next) => {
  console.log('[User Route] Register request received:', req.path, req.body);
  next();
}, validate(schemas.register), authProxy);

router.post('/login', (req, res, next) => {
  console.log('[User Route] Login request received:', req.path, req.method, req.url);
  console.log('[User Route] Request body:', req.body);
  next();
}, validate(schemas.login), authProxy);

router.post('/forgot-password', (req, res, next) => {
  console.log('[User Route] Forgot password request received:', req.path, req.method, req.url);
  console.log('[User Route] Request body:', req.body);
  next();
}, authProxy);

// Protected routes - User data endpoints (apply auth middleware only to protected routes)
router.get('/', authMiddleware, cacheMiddleware(60), userDataProxy);
// router.get('/me', authMiddleware, cacheMiddleware(60), userDataProxy);
router.get('/:id', authMiddleware,authorize , cacheMiddleware(60), userDataProxy);
router.put('/:id', authMiddleware, authorize, userDataProxy);
router.delete('/:id', authMiddleware, authorize, userDataProxy);
router.put('/:id/role', authMiddleware, authorizeAdmin, userDataProxy);
router.put('/:id/avatar', authMiddleware,authorize, avatarProxy);
router.put('/:id/avatar/multiple', authMiddleware, authorize, avatarProxy);
// router.get('/:id/profile', authMiddleware, cacheMiddleware(60), userDataProxy);
// router.put('/:id/profile', authMiddleware,cacheMiddleware(60), userDataProxy);

module.exports = router;

