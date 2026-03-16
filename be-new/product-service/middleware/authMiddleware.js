const jwt = require('jsonwebtoken');

// 1. Xác thực đăng nhập chung
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập (Thiếu Token)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.user = decoded; 
    next();
  } catch (err) {
    console.error('Lỗi giải mã token tại Product Service:', err.message);
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// 2. Chỉ cho phép Admin
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Yêu cầu quyền Admin' });
  }
};

// 3. Cho phép Admin, Manager HOẶC Staff (Fix lỗi 403 ở đây)
exports.requireStaffOrAdmin = (req, res, next) => {
  if (req.user && req.user.role) {
    const userRole = req.user.role.toLowerCase(); // Ép về chữ thường để so sánh
    const allowedRoles =['admin', 'manager', 'staff']; // Thêm Manager vào danh sách được phép

    if (allowedRoles.includes(userRole)) {
      return next();
    }
  }
  
  // Nếu là 'customer' hoặc không khớp
  return res.status(403).json({ 
      success: false, 
      message: `Bạn không có quyền truy cập. Quyền hiện tại: ${req.user?.role || 'Khách'}` 
  });
};