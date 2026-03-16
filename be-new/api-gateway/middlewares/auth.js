const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const publicRoutes = [
    '/health',
    '/api/v1/users/register',
    '/api/v1/users/login',
    '/api/v1/products',
    '/api/v1/products/:id'
    ];

  // Check exact path or regex pattern
  const isPublicRoute = publicRoutes.some(route => {
    // Convert route pattern to regex
    const regexPattern = '^' + route.replace(/:\w+/g, '([^/]+)') + '$';
    const regex = new RegExp(regexPattern);
    return regex.test(req.path);
  });

  if (isPublicRoute) {
    return next();
  }

  // Kiểm tra token cho các route protected
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Thiếu hoặc sai định dạng Token'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.user = decoded;
    console.log('thông tin người dùng là ', decoded);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: lỗi xác thực',
    });
  }
};

module.exports = authMiddleware;

