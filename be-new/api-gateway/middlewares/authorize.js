// middlewares/authorize.js
const authorize = (req, res, next) => {
  const userIdFromToken = req.user.id;        // từ authMiddleware decode ra
  const userIdFromParams = req.params.id;
  const userIdFromBody = req.body.user_id;

const isOwner = String(userIdFromToken) === String(userIdFromParams);
const isOwnerByBody = String(userIdFromToken) === String(userIdFromBody);
  const isAdmin = req.user.role === 'admin';  // hoặc array các role được phép

  if (isOwner || isOwnerByBody || isAdmin) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này'
    });
  }
};

module.exports = authorize;