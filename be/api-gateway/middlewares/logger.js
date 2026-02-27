const fs = require('fs');
const path = require('path');
const winston = require('winston');
const morgan = require('morgan');

// Tạo thư mục logs nếu chưa có
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Cấu hình Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  ]
});

// Thêm console transport cho development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Morgan middleware để log HTTP requests
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const morganMiddleware = morgan('combined', {
  stream: accessLogStream,
  skip: (req, res) => {
    // Bỏ qua health check requests
    return req.path === '/health';
  }
});

module.exports = logger;
module.exports.morganMiddleware = morganMiddleware;

