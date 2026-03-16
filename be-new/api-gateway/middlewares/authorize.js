// middlewares/authorize.js
const authorize = (req, res, next) => {
  const userIdFromToken = req.user.id;        // từ authMiddleware decode ra
  const userIdFromParams = req.params.id;

const isOwner = Number(userIdFromToken) === Number(userIdFromParams);

  const isAdmin = req.user.role === 'admin';  // hoặc array các role được phép

  if (isOwner || isAdmin) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này'
    });
  }
};

module.exports = authorize;