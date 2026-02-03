# 📊 Thiết kế CSDL Microservices - Database Per Service (Độc Lập)

## 1. Tổng Quan Kiến Trúc

**Database Per Service Pattern** - Mỗi microservice có database **hoàn toàn độc lập**.

### ⚠️ Nguyên Tắc Quan Trọng:
- ❌ **KHÔNG có Foreign Key** trỏ sang database khác
- ❌ **KHÔNG có relationship** giữa các database
- ✅ **Mỗi service chỉ chứa dữ liệu của chính mình**
- ✅ **Gọi API** khi cần dữ liệu từ service khác
- ✅ **Lưu ID tham chiếu** (không Foreign Key)

### Các CSDL Độc Lập:
1. **user_db** - User Service (3 bảng)
2. **product_db** - Product Service (5 bảng)
3. **order_db** - Order Service (7 bảng)
4. **payment_db** - Payment Service (4 bảng)
5. **notification_db** - Notification Service (2 bảng)
6. **admin_db** - Admin Service (3 bảng)

---

## 2. USER SERVICE DATABASE (`user_db`)

**Chứa:** Chỉ thông tin người dùng

### Bảng: `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
);
```

### Bảng: `user_profiles`
```sql
CREATE TABLE user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  company_name VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  UNIQUE KEY unique_user (user_id)
);
```

### Bảng: `user_addresses`
```sql
CREATE TABLE user_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  address_type ENUM('home', 'office', 'other') DEFAULT 'home',
  full_name VARCHAR(100),
  phone VARCHAR(20),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(50) NOT NULL,
  state_province VARCHAR(50),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (is_default)
);
```

**API cung cấp:**
```
GET    /api/users/:id
GET    /api/users/email/:email
POST   /api/users
PUT    /api/users/:id
GET    /api/users/:id/addresses
POST   /api/users/:id/addresses
```

---

## 3. PRODUCT SERVICE DATABASE (`product_db`)

**Chứa:** Chỉ dữ liệu sản phẩm (KHÔNG chứa user_id từ user_db)

### Bảng: `categories`
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  parent_id INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order)
);
```

### Bảng: `products`
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description LONGTEXT,
  short_description VARCHAR(500),
  category_id INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_sku (sku),
  INDEX idx_slug (slug),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_is_featured (is_featured),
  INDEX idx_price (price),
  FULLTEXT INDEX ft_name_description (name, description)
);
```

### Bảng: `product_images`
```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_sort_order (sort_order)
);
```

### Bảng: `product_attributes`
```sql
CREATE TABLE product_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  attribute_name VARCHAR(100) NOT NULL,
  attribute_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);
```

### Bảng: `product_reviews`
⭐ **Chỉ lưu user_id (không Foreign Key)**
```sql
CREATE TABLE product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_rating (rating)
);
```

**Ghi Chú:** `user_id` là ID tham chiếu, khi cần thông tin user thì gọi User Service API.

**API cung cấp:**
```
GET    /api/products (pagination, filter)
GET    /api/products/:id
GET    /api/products/:id/reviews
POST   /api/products/:id/reviews
GET    /api/categories
GET    /api/search?q=keyword
PUT    /api/products/:id/stock (cập nhật kho)
```

---

## 4. ORDER SERVICE DATABASE (`order_db`)

**Chứa:** Đơn hàng, giỏ hàng, wishlist
**KHÔNG chứa:** user_id từ user_db, product_id từ product_db (chỉ lưu ID)

### Bảng: `wishlists`
⭐ **Lưu user_id, product_id (chỉ là ID reference)**
```sql
CREATE TABLE wishlists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_wishlist (user_id, product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at)
);
```

### Bảng: `carts`
⭐ **Lưu user_id, product_id (chỉ là ID reference)**
```sql
CREATE TABLE carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_cart (user_id, product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id)
);
```

### Bảng: `orders`
⭐ **Lưu user_id (chỉ là ID reference)**
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  shipping_status ENUM('pending', 'in_transit', 'delivered') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_order_number (order_number),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at)
);
```

### Bảng: `order_items`
⭐ **Lưu product_id, product details (snapshot)**
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(255),
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);
```

**Ghi Chú:** Lưu thông tin sản phẩm như snapshot (tại thời điểm đặt hàng) vì giá có thể thay đổi.

### Bảng: `shipping_addresses`
⭐ **Lưu user_id, order_id**
```sql
CREATE TABLE shipping_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(50) NOT NULL,
  state_province VARCHAR(50),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

### Bảng: `shipments`
```sql
CREATE TABLE shipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  tracking_number VARCHAR(100) UNIQUE,
  carrier VARCHAR(50),
  estimated_delivery DATE,
  actual_delivery DATE,
  status ENUM('pending', 'picked_up', 'in_transit', 'delivered', 'returned') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_tracking_number (tracking_number)
);
```

### Bảng: `shipment_tracking_logs`
```sql
CREATE TABLE shipment_tracking_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shipment_id INT NOT NULL,
  status VARCHAR(50),
  location VARCHAR(255),
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  INDEX idx_shipment_id (shipment_id)
);
```

**API cung cấp:**
```
GET    /api/orders/user/:userId
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id/status
GET    /api/wishlists/user/:userId
POST   /api/wishlists
DELETE /api/wishlists/:id
GET    /api/carts/user/:userId
POST   /api/carts
PUT    /api/carts/:itemId
DELETE /api/carts/:itemId
GET    /api/tracking/:orderId
GET    /api/shipments/:orderId
```

---

## 5. PAYMENT SERVICE DATABASE (`payment_db`)

**Chứa:** Thanh toán, khuyến mãi, hoàn tiền
**KHÔNG chứa:** user_id, order_id (chỉ lưu ID)

### Bảng: `coupons`
```sql
CREATE TABLE coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  max_usage INT,
  usage_count INT DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_status (status)
);
```

### Bảng: `coupon_usage`
⭐ **Lưu user_id, order_id (chỉ là ID reference)**
```sql
CREATE TABLE coupon_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  discount_amount DECIMAL(10, 2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id)
);
```

### Bảng: `payments`
⭐ **Lưu order_id, user_id (chỉ là ID reference)**
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  payment_method ENUM('credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cash_on_delivery') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  transaction_id VARCHAR(100) UNIQUE,
  gateway_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status)
);
```

### Bảng: `refunds`
⭐ **Lưu payment_id, order_id (chỉ là ID reference)**
```sql
CREATE TABLE refunds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  refund_amount DECIMAL(12, 2) NOT NULL,
  reason VARCHAR(255),
  status ENUM('pending', 'approved', 'processed', 'rejected') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
);
```

**API cung cấp:**
```
POST   /api/payments
GET    /api/payments/:id
PUT    /api/payments/:id/status
POST   /api/coupons/validate
GET    /api/coupons/:code
POST   /api/refunds
GET    /api/refunds/:id
```

---

## 6. NOTIFICATION SERVICE DATABASE (`notification_db`)

**Chứa:** Thông báo, cài đặt thông báo
**KHÔNG chứa:** user_id (chỉ lưu ID)

### Bảng: `notifications`
⭐ **Lưu user_id (chỉ là ID reference)**
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type ENUM('order', 'payment', 'shipping', 'promotion', 'system', 'review', 'wishlist') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id INT,
  related_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_notification_type (notification_type)
);
```

### Bảng: `notification_preferences`
⭐ **Lưu user_id (chỉ là ID reference)**
```sql
CREATE TABLE notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  promotional_emails BOOLEAN DEFAULT TRUE,
  order_updates BOOLEAN DEFAULT TRUE,
  payment_updates BOOLEAN DEFAULT TRUE,
  shipping_updates BOOLEAN DEFAULT TRUE,
  review_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user (user_id)
);
```

**API cung cấp:**
```
GET    /api/notifications/user/:userId
PUT    /api/notifications/:id/read
PUT    /api/notifications/user/:userId/preferences
GET    /api/notifications/user/:userId/preferences
POST   /api/notifications
```

---

## 7. ADMIN SERVICE DATABASE (`admin_db`)

**Chứa:** Quản lý, báo cáo, lịch sử tìm kiếm
**KHÔNG chứa:** user_id (chỉ lưu ID)

### Bảng: `banners`
```sql
CREATE TABLE banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255) NOT NULL,
  link VARCHAR(255),
  link_type ENUM('product', 'category', 'external', 'none') DEFAULT 'none',
  status ENUM('active', 'inactive') DEFAULT 'active',
  display_position ENUM('homepage_hero', 'homepage_middle', 'category_top', 'sidebar') DEFAULT 'homepage_hero',
  sort_order INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_display_position (display_position)
);
```

### Bảng: `search_history`
⭐ **Lưu user_id (chỉ là ID reference)**
```sql
CREATE TABLE search_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  search_keyword VARCHAR(255),
  results_count INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_keyword (search_keyword),
  INDEX idx_created_at (created_at)
);
```

### Bảng: `reports`
⭐ **Lưu generated_by (user_id, chỉ là ID reference)**
```sql
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_type ENUM('sales', 'products', 'users', 'payment', 'inventory') NOT NULL,
  period_start DATE,
  period_end DATE,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_discount DECIMAL(10, 2) DEFAULT 0,
  average_order_value DECIMAL(10, 2) DEFAULT 0,
  total_customers INT DEFAULT 0,
  new_customers INT DEFAULT 0,
  generated_by INT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_report_type (report_type),
  INDEX idx_generated_at (generated_at)
);
```

**API cung cấp:**
```
GET    /api/admin/banners
POST   /api/admin/banners
PUT    /api/admin/banners/:id
DELETE /api/admin/banners/:id
GET    /api/admin/reports
POST   /api/admin/reports/generate
GET    /api/admin/search-history
```

---

## 8. Service-to-Service Communication

### Khi Order Service cần dữ liệu từ User Service:
```javascript
// Order Service
const order = await getOrderById(123);
const userResponse = await userServiceAPI.get(`/users/${order.user_id}`);
const userData = userResponse.data;
```

### Khi Product Service cần dữ liệu từ Order Service:
```javascript
// Product Service
const reviews = await getProductReviews(456);
// reviews[].user_id chỉ là ID
// Khi cần thông tin user, gọi User Service
const userResponse = await userServiceAPI.get(`/users/${reviews[0].user_id}`);
```

### Khi Payment Service cần dữ liệu Order:
```javascript
// Payment Service
const payment = await getPaymentById(789);
const orderResponse = await orderServiceAPI.get(`/orders/${payment.order_id}`);
const orderData = orderResponse.data;
```

---

## 9. API Gateway (Để Gọi Các Service)

**Example API Gateway config:**
```javascript
// Định nghĩa các service
const SERVICES = {
  USER_SERVICE: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  PRODUCT_SERVICE: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  ORDER_SERVICE: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  PAYMENT_SERVICE: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  ADMIN_SERVICE: process.env.ADMIN_SERVICE_URL || 'http://localhost:3006',
};

// Gọi service từ một service khác
async function callService(serviceName, endpoint, method = 'GET', data = null) {
  const url = `${SERVICES[serviceName]}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : null
  });
  return response.json();
}

// Sử dụng
const user = await callService('USER_SERVICE', '/api/users/123');
```

---

## 10. Database Independence Checklist

✅ **user_db** - Hoàn toàn độc lập
- ✓ Chỉ chứa dữ liệu user
- ✓ Không FK sang DB khác
- ✓ Cung cấp API để lấy user data

✅ **product_db** - Hoàn toàn độc lập
- ✓ Chỉ chứa dữ liệu product
- ✓ user_id ở reviews là reference (không FK)
- ✓ Cung cấp API để lấy product data

✅ **order_db** - Hoàn toàn độc lập
- ✓ Chỉ chứa order, cart, wishlist
- ✓ user_id, product_id là reference (không FK)
- ✓ Cung cấp API để lấy order data

✅ **payment_db** - Hoàn toàn độc lập
- ✓ Chỉ chứa payment, coupon, refund
- ✓ user_id, order_id là reference (không FK)
- ✓ Cung cấp API để lấy payment data

✅ **notification_db** - Hoàn toàn độc lập
- ✓ Chỉ chứa notification
- ✓ user_id là reference (không FK)
- ✓ Cung cấp API để lấy notification data

✅ **admin_db** - Hoàn toàn độc lập
- ✓ Chỉ chứa banner, reports, search history
- ✓ user_id là reference (không FK)
- ✓ Cung cấp API để lấy admin data

---

## 11. Ví Dụ: Flow Tạo Đơn Hàng

```
1. Frontend gửi đơn hàng → Order Service
   
2. Order Service:
   - Kiểm tra user_id bằng cách gọi: GET /api/users/:id (User Service)
   - Kiểm tra product_id bằng cách gọi: GET /api/products/:id (Product Service)
   - Kiểm tra coupon bằng cách gọi: GET /api/coupons/:code (Payment Service)
   - Tạo order trong order_db
   - Trả về kết quả cho frontend

3. Payment Service tạo payment:
   - Gọi Order Service để lấy order data
   - Tạo payment record
   
4. Notification Service gửi thông báo:
   - Gọi User Service để lấy email user
   - Gửi email thông báo
```

---

## 12. Ưu Điểm & Nhược Điểm

### ✅ Ưu Điểm:
- ✓ Mỗi service hoàn toàn độc lập
- ✓ Dễ scale riêng từng service
- ✓ Không xung đột dữ liệu
- ✓ Dễ deploy, rollback riêng
- ✓ High availability

### ⚠️ Nhược Điểm:
- ✗ Cần nhiều API calls (có thể slow)
- ✗ Phức tạp hơn (cần API Gateway)
- ✗ Khó maintain data consistency
- ✗ Cần caching để tối ưu

---

## 13. Giải Pháp Tối Ưu

### Sử dụng Caching (Redis)
```javascript
// Cache user data
async function getUser(userId) {
  // Kiểm tra cache
  let user = await cache.get(`user:${userId}`);
  if (!user) {
    // Gọi User Service
    user = await userService.getUser(userId);
    // Lưu cache 1 hour
    await cache.set(`user:${userId}`, user, 3600);
  }
  return user;
}
```

### Message Queue (RabbitMQ/Redis) cho Async Operations
```javascript
// Khi order được tạo
orderCreated(order) {
  // Gửi message tới queue
  queue.publish('order.created', {
    orderId: order.id,
    userId: order.user_id,
    productIds: order.products
  });
}

// Notification Service lắng nghe
queue.subscribe('order.created', (message) => {
  // Tạo notification
  createNotification(message.userId, 'Order created');
});
```

---

## 14. Database Schema Triggers (Chỉ Trong Service Của Nó)

### Product Service Trigger
```sql
DELIMITER //
CREATE TRIGGER update_product_rating AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products 
  SET rating = (
    SELECT ROUND(AVG(rating), 2) 
    FROM product_reviews 
    WHERE product_id = NEW.product_id AND status = 'approved'
  ),
  review_count = (
    SELECT COUNT(*) 
    FROM product_reviews 
    WHERE product_id = NEW.product_id AND status = 'approved'
  )
  WHERE id = NEW.product_id;
END //
DELIMITER ;
```

### Payment Service Trigger
```sql
DELIMITER //
CREATE TRIGGER increment_coupon_usage AFTER INSERT ON coupon_usage
FOR EACH ROW
BEGIN
  UPDATE coupons 
  SET usage_count = usage_count + 1
  WHERE id = NEW.coupon_id;
END //
DELIMITER ;
```

---

## 15. Tổng Kết

**Kiến Trúc Tối Ưu:**
- 📊 6 Database hoàn toàn độc lập
- 🔗 Không Foreign Key giữa các database
- 📡 Gọi API để lấy dữ liệu từ service khác
- 💾 Lưu reference ID (user_id, product_id, order_id)
- ⚡ Sử dụng cache để tối ưu
- 📨 Sử dụng message queue cho async ops

**Danh Sách Service & Bảng:**
1. **user_db**: users, user_profiles, user_addresses (3 bảng)
2. **product_db**: categories, products, product_images, product_attributes, product_reviews (5 bảng)
3. **order_db**: wishlists, carts, orders, order_items, shipping_addresses, shipments, shipment_tracking_logs (7 bảng)
4. **payment_db**: coupons, coupon_usage, payments, refunds (4 bảng)
5. **notification_db**: notifications, notification_preferences (2 bảng)
6. **admin_db**: banners, search_history, reports (3 bảng)

**Tổng: 24 bảng, 6 Database độc lập** 🚀
