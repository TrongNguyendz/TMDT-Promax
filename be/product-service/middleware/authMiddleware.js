const jwt = require('jsonwebtoken');

// Middleware 1: Xác thực đăng nhập (Để biết ai đang comment)
exports.verifyToken = (req, res, next) => {
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1]; 

  // if (!token) {
  //   return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập (Thiếu Token)' });
  // }

  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  //   req.user = decoded; 
    next();
  // } catch (err) {
  //   return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  // }
};

// Middleware 2: Chỉ cho phép Admin (Dùng cho xóa/sửa sản phẩm)
exports.requireAdmin = (req, res, next) => {
  // if (req.user && req.user.role === 'admin') {
    next();
  // } else {
  //   return res.status(403).json({ success: false, message: 'Yêu cầu quyền Admin' });
  // }
};