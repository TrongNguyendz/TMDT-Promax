// middlewares/authorize.js
const authorizeAdmin = (req, res, next) => {
  const isAdmin = req.user.role === 'admin';  // hoặc array các role được phép

  if (isAdmin) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bro không phải admin bro không sửa được đâu = ))))'
    });
  }
};

module.exports = authorizeAdmin;