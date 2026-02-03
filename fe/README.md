# E-Commerce Frontend (Vue 3 + Vite + Tailwind)

A complete, course-ready Frontend for an E-commerce website implementing the full user flow: browse → cart → checkout → order history, plus an Admin area. Built with Vue 3, Vite, Tailwind, Pinia (persist), Vue Router, and Axios (with interceptors).

## Tech Stack
- Vue 3, Vite
- Tailwind CSS (+ @tailwindcss/forms)
- Vue Router (route guards for auth/admin)
- Pinia + pinia-plugin-persistedstate
- Axios with request/response interceptors

## Features
- Core pages: Home, Product List, Product Detail, Cart, Checkout, Auth
- User pages: Profile, Wishlist, Order History, Order Detail, Tracking
- Admin pages: Dashboard, Products, Orders, Users, Banners, Reports
- Dark mode toggle (persisted), Toast notifications
- Search with loading states; lazy-loaded routes; responsive UI
- Mocked/demo data via `dummyjson.com` by default; switchable via env

## Getting Started
1) Install dependencies
```bash
npm install
```
2) Run in development
```bash
npm run dev
```
3) Build for production
```bash
npm run build
```
4) Preview production build
```bash
npm run preview
```

## Environment
Create an `.env` file to point to your API (optional):
```
VITE_API_BASE_URL=https://your-backend.example.com
```
If not provided, the app uses `https://dummyjson.com` for demo endpoints.

## Scripts
- `npm run dev`: Start Vite dev server
- `npm run build`: Production build
- `npm run preview`: Preview prod build

## Project Structure
```
src/
├── assets/
│   └── tailwind.css
├── components/
│   ├── common/
│   │   ├── Footer.vue
│   │   ├── Header.vue
│   │   ├── ProductCard.vue
│   │   └── Toast.vue
│   ├── forms/
│   │   ├── InputField.vue
│   │   ├── SearchBar.vue
│   │   └── SelectDropdown.vue
│   └── layout/
│       ├── AdminLayout.vue
│       └── DefaultLayout.vue
├── pages/
│   ├── AboutPage.vue
│   ├── AuthPage.vue
│   ├── CartPage.vue
│   ├── CheckoutPage.vue
│   ├── ContactPage.vue
│   ├── HomePage.vue
│   ├── OrderDetail.vue
│   ├── OrderHistory.vue
│   ├── OrderTracking.vue
│   ├── PolicyPage.vue
│   ├── ProductDetail.vue
│   ├── ProductList.vue
│   ├── SearchResults.vue
│   ├── WishlistPage.vue
│   └── admin/
│       ├── AdminDashboard.vue
│       ├── BannerManagement.vue
│       ├── OrderManagement.vue
│       ├── ProductManagement.vue
│       ├── ReportPage.vue
│       └── UserManagement.vue
├── router/
│   └── index.js
├── stores/
│   ├── cart.js
│   ├── products.js
│   ├── ui.js
│   └── user.js
├── utils/
│   ├── api.js
│   ├── constants.js
│   └── helpers.js
├── App.vue
└── main.js
```

## Auth and Admin
- Demo login is implemented in `AuthPage.vue`. It sets a token, mock profile, and role (default user).
- To simulate admin, set role to `admin` after login (e.g., via store or mock button), or adapt to your backend.
- Router guards redirect unauthenticated users from protected routes and non-admins from admin routes.

## Notes
- Replace dummy data/API calls when backend is ready.
- Extend the UI with animations, i18n, testing (Vitest/Jest) as desired.
- Tailwind dark mode is class-based; theme is stored in Pinia and persisted.

## License
For educational purposes. Adapt as needed for your coursework or demos.

## Hướng dẫn sử dụng (Step-by-step – Tiếng Việt)

### 1) Yêu cầu hệ thống
- Node.js LTS (khuyến nghị ≥ 18.x)
- npm (đi kèm Node) hoặc pnpm/yarn (tùy bạn)

Kiểm tra phiên bản:
```bash
node -v
npm -v
```

### 2) Tải mã nguồn và cài đặt
Nếu bạn đã có source trong thư mục hiện tại, bỏ qua bước clone.
```bash
# Clone (nếu cần)
git clone <repo-url> ecommerce-frontend
cd ecommerce-frontend

# Cài dependencies
npm install
```

### 3) Chạy môi trường phát triển
```bash
npm run dev
```
Vite sẽ mở tại `http://localhost:5173` (có thể khác nếu port bận).

### 4) Cấu hình môi trường (tùy chọn)
Tạo file `.env` ở thư mục gốc nếu bạn có backend thật:
```
VITE_API_BASE_URL=https://your-backend.example.com
```
Nếu không thiết lập, dự án dùng `https://dummyjson.com` để demo (sẵn code mẫu).

### 5) Dùng thử nhanh (Demo flows)
- Khách vãng lai:
  1. Vào trang chủ, xem sản phẩm
  2. Vào trang sản phẩm, thêm vào giỏ
  3. Mở giỏ hàng (`/cart`) → Thanh toán (`/checkout`)
  4. Điền địa chỉ + chọn phương thức → Đặt hàng (demo)
- Đăng nhập người dùng:
  1. Mở `/auth` → điền email/mật khẩu bất kỳ → Đăng nhập (demo)
  2. Sau khi đăng nhập có thể truy cập `/profile`, `/orders`, theo dõi đơn
- Giả lập Admin:
  1. Sau khi đăng nhập, vào DevTools → trong Pinia `user` đổi `role` thành `admin`
  2. Hoặc sửa nhanh trong `AuthPage.vue` để set role 'admin'
  3. Truy cập `/admin` và các trang quản trị

### 6) Các trang chính để đánh giá nhanh
- Khách: `/`, `/products`, `/product/:id`, `/cart`, `/checkout`, `/search`, `/auth`
- User: `/profile`, `/orders`, `/orders/:id`, `/tracking/:orderId`, `/wishlist`
- Admin: `/admin`, `/admin/products`, `/admin/orders`, `/admin/users`, `/admin/banners`, `/admin/reports`

### 7) Build và preview bản production
```bash
npm run build
npm run preview
```
Output mặc định ở thư mục `dist/`.

### 8) Triển khai (Deploy)
- Vercel: import repo → Framework: Vite → Build Command: `npm run build` → Output: `dist`
- Netlify: `ntl deploy` hoặc qua dashboard → Build: `npm run build` → Publish directory: `dist`
- Static hosting khác: upload toàn bộ `dist/`

### 9) Tùy biến giao diện
- Dark mode: nút chuyển ngay trên `Header`. Trạng thái lưu trong Pinia (persisted).
- Tailwind: chỉnh trong `tailwind.config.cjs` và `src/assets/tailwind.css`
- Components dùng chung: `src/components/common/` và `src/components/forms/`

### 10) Tích hợp API backend thật
- Cập nhật `.env` với `VITE_API_BASE_URL`
- Kiểm tra `src/utils/api.js`:
  - Request interceptor tự gắn `Authorization: Bearer <token>`
  - Response interceptor show toast khi lỗi
- Cập nhật các store/page để gọi endpoint thật (thay `dummyjson`):
  - Sản phẩm: `src/stores/products.js`, `HomePage.vue`, `ProductList.vue`, `ProductDetail.vue`, `SearchResults.vue`
  - Đơn hàng/Thanh toán: `CheckoutPage.vue`, `OrderHistory.vue`, `OrderDetail.vue`
  - Admin CRUD: các trang trong `src/pages/admin/`

### 11) Thêm trang mới (ví dụ)
1. Tạo file `src/pages/MyNewPage.vue`
2. Khai báo route trong `src/router/index.js`:
```js
{ path: '/my-new-page', component: () => import('../pages/MyNewPage.vue') }
```
3. Điều hướng từ Header/Footer hoặc nơi phù hợp

### 12) Thêm store mới với Pinia (ví dụ)
1. Tạo `src/stores/myStore.js`:
```js
import { defineStore } from 'pinia';
export const useMyStore = defineStore('myStore', {
  state: () => ({ value: 0 }),
  actions: { increment() { this.value++; } },
  persist: true
});
```
2. Dùng trong component:
```js
import { useMyStore } from '../stores/myStore';
const my = useMyStore();
my.increment();
```

### 13) Troubleshooting (thường gặp)
- Port 5173 bận: đổi trong `vite.config.js` hoặc chạy `npm run dev -- --port=5174`
- Lỗi Node version: nâng cấp Node LTS
- Không load CSS: đảm bảo `import './assets/tailwind.css'` trong `src/main.js`
- API CORS: thiết lập CORS ở backend hoặc dùng proxy dev server


