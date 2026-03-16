// const responseTimeMiddleware = (req, res, next) => {
//   const startTime = Date.now();

//   res.on('finish', () => {
//     const duration = Date.now() - startTime;
//     res.setHeader('X-Response-Time', `${duration}ms`);
//     req.responseTime = duration;
//   });

//   next();
// };

// module.exports = responseTimeMiddleware;
const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();

  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;

    // Chỉ set header nếu chưa gửi
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${duration}ms`);
    }

    // Lưu vào request để logging
    req.responseTime = duration;

    // Gọi hàm end gốc để gửi response
    originalEnd.apply(res, args);
  };

  next();
};

module.exports = responseTimeMiddleware;

