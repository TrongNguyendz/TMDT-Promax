const NodeCache = require('node-cache');

// Tạo cache instance với TTL 5 phút
const cache = new NodeCache({ stdTTL: 300 });

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Chỉ cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Ghi đè res.json để cache response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      cache.set(key, body, duration);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

// Xóa cache khi có thay đổi dữ liệu
const clearCache = (pattern) => {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.del(key);
    }
  });
};

module.exports = { cacheMiddleware, clearCache };

