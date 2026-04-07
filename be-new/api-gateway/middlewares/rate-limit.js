const rateLimit = require('express-rate-limit');

// Rate limiting: 100 requests per minute
const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100000, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'bro làm ơn đừng spam request nữa = ))))'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); // Tính lại thời gian chờ chính xác
    res.status(429).json({
      success: false,
      message: 'bro làm ơn đừng spam request nữa = ))))',
      retryAfter: retryAfter + "s"// Thời gian chờ tính bằng giây
    });
  }
});

module.exports = rateLimitMiddleware;


