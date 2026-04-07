const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimitMiddleware = require('./middlewares/rate-limit');
const responseTimeMiddleware = require('./middlewares/response-time');
const logger = require('./middlewares/logger');
const { morganMiddleware } = require('./middlewares/logger');

// Import các routes
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');
const couponRoutes = require('./routes/coupon');
const staffRoutes = require('./routes/staff');
const shiftRoutes = require('./routes/shift');
const supportRoutes = require('./routes/support'); // ✅ Đã thêm Support Routes
const userCategoryRoutes = require('./routes/userCategoryInteractionRoutes'); // ✅ Đã thêm User Category Interaction Routes


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("DEBUG: SUPPORT_SERVICE_URL là:", process.env.SUPPORT_SERVICE_URL);

app.use(responseTimeMiddleware);
app.use(morganMiddleware);
app.use(rateLimitMiddleware);

// Health check endpoint (Đã giữ nguyên logic cũ của bạn)
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: {
      gateway: 'UP',
      user: await checkServiceHealth(process.env.USER_SERVICE_URL),
      product: await checkServiceHealth(process.env.PRODUCT_SERVICE_URL),
      order: await checkServiceHealth(process.env.ORDER_SERVICE_URL),
      payment: await checkServiceHealth(process.env.PAYMENT_SERVICE_URL),
      notification: await checkServiceHealth(process.env.NOTIFICATION_SERVICE_URL),
      admin: await checkServiceHealth(process.env.ADMIN_SERVICE_URL),
      staff: await checkServiceHealth(process.env.STAFF_SERVICE_URL)
    }
  };
  res.json(healthStatus);
});

// API Versioning - v1 routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/user-category', userCategoryRoutes); // ✅ Route User-Category Interaction đã được mở để Gateway hiểu
// ✅ Route Support đã được mở để Gateway hiểu
app.use('/api/v1/support', supportRoutes); 

app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    path: req.path,
    method: req.method,
    error: err.stack
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'làm gì có route này đâu bro = ))))',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Helper function to check service health (Đã giữ nguyên của bạn)
async function checkServiceHealth(url) {
  try {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    return new Promise((resolve) => {
      const request = client.get(`${url}/health`, (res) => {
        resolve(res.statusCode === 200 ? 'UP' : 'DOWN');
      });
      request.on('error', () => resolve('DOWN'));
      request.setTimeout(2000, () => {
        request.destroy();
        resolve('DOWN');
      });
    });
  } catch (error) {
    return 'DOWN';
  }
}

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`\n💡 Test endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/v1/users/login`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/products`);
});