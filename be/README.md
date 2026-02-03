# 🚀 E-commerce Microservices Architecture

Hệ thống microservices hoàn chỉnh cho e-commerce với API Gateway và 5 microservices.

## 📁 Cấu trúc Project

```
/project-root
  /api-gateway          # API Gateway với đầy đủ middleware
  /user-service         # Quản lý người dùng
  /product-service      # Quản lý sản phẩm
  /order-service        # Quản lý đơn hàng
  /payment-service      # Quản lý thanh toán
  /notification-service # Quản lý thông báo
  package.json          # Script chạy tất cả services
```


## ⚙️ Tính năng API Gateway

| Tính năng | Mô tả |
|-----------|-------|
| ✔ Routing | Chuyển request đến đúng microservice |
| ✔ CORS | Cho phép FE truy cập |
| ✔ JWT Authentication | Kiểm tra token trước khi chuyển tiếp |
| ✔ Rate Limiting | Chống spam 100 req/phút |
| ✔ Caching | Cache dữ liệu như /products (in-memory) |
| ✔ Request Validation | Kiểm tra input trước khi gọi xuống service |
| ✔ Centralized Logging | Ghi log ra file logs/access.log |
| ✔ Error Handling | Xử lý lỗi đồng nhất |
| ✔ Health Check | Kiểm tra mỗi service còn sống |
| ✔ API Versioning | /api/v1/... |
| ✔ Response Time Logging | Tính thời gian xử lý của từng request |

## 🚀 Cài đặt và Chạy

### 1. Cài đặt dependencies cho root
```bash
npm install
```

### 2. Cài đặt dependencies cho từng service
```bash
cd api-gateway && npm install && cd ..
cd user-service && npm install && cd ..
cd product-service && npm install && cd ..
cd order-service && npm install && cd ..
cd payment-service && npm install && cd ..
cd notification-service && npm install && cd ..
```

Hoặc chạy tất cả cùng lúc:
```bash
npm install && cd api-gateway && npm install && cd .. && cd user-service && npm install && cd .. && cd product-service && npm install && cd .. && cd order-service && npm install && cd .. && cd payment-service && npm install && cd .. && cd notification-service && npm install
```

### 3. Chạy tất cả services
```bash
npm run start:all
```

Hoặc chạy từng service riêng:
```bash
npm run start:gateway     # Port 3000
npm run start:user        # Port 3001
npm run start:product     # Port 3002
npm run start:order       # Port 3003
npm run start:payment     # Port 3004
npm run start:notification # Port 3005
```

## 📡 API Endpoints

### API Gateway: http://localhost:3000

#### Health Check
```
GET /health
```

#### User Service (via Gateway)
```
POST   /api/v1/users/register
POST   /api/v1/users/login
GET    /api/v1/users              # Protected
GET    /api/v1/users/:id          # Protected
PUT    /api/v1/users/:id          # Protected
DELETE /api/v1/users/:id          # Protected
GET    /api/v1/users/:id/profile  # Protected
```

#### Product Service (via Gateway)
```
GET    /api/v1/products           # Public
GET    /api/v1/products/:id       # Public
POST   /api/v1/products           # Protected
PUT    /api/v1/products/:id       # Protected
DELETE /api/v1/products/:id       # Protected
```

#### Order Service (via Gateway)
```
GET    /api/v1/orders             # Protected
GET    /api/v1/orders/:id         # Protected
POST   /api/v1/orders             # Protected
PUT    /api/v1/orders/:id/status  # Protected
DELETE /api/v1/orders/:id         # Protected
```

#### Payment Service (via Gateway)
```
GET    /api/v1/payments           # Protected
GET    /api/v1/payments/:id       # Protected
POST   /api/v1/payments           # Protected
POST   /api/v1/payments/:id/verify # Protected
```

#### Notification Service (via Gateway)
```
GET    /api/v1/notifications      # Protected
GET    /api/v1/notifications/:id  # Protected
PUT    /api/v1/notifications/:id/read # Protected
DELETE /api/v1/notifications/:id  # Protected
```

## 🔐 Authentication

### Đăng ký
```bash
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "phone": "0123456789"
}
```

### Đăng nhập
```bash
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Sử dụng Token
```bash
Authorization: Bearer <your-token>
```

## 👤 Test Users

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

## 📝 Logs

Logs được lưu trong `api-gateway/logs/`:
- `access.log` - HTTP access logs
- `error.log` - Error logs
- `combined.log` - Combined logs

## 🔧 Environment Variables

Tạo file `.env` trong `api-gateway/`:
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005
```

## 🎯 Tính năng nổi bật

1. **Rate Limiting**: 100 requests/phút/IP
2. **Caching**: Tự động cache GET requests (có thể tùy chỉnh TTL)
3. **Request Validation**: Validate input với Joi schemas
4. **Health Check**: Kiểm tra trạng thái tất cả services
5. **Centralized Logging**: Tất cả logs được ghi tập trung
6. **Error Handling**: Xử lý lỗi thống nhất
7. **Response Time**: Header `X-Response-Time` cho mỗi request
8. **API Versioning**: Hỗ trợ versioning qua `/api/v1/`

## 📌 Lưu ý

- Hiện tại các services sử dụng dữ liệu mẫu (in-memory)
- Chưa kết nối database thật
- JWT secret nên được thay đổi trong production
- Cần cài đặt `concurrently` package để chạy nhiều services cùng lúc

