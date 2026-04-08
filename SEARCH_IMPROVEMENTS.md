# Search Feature Improvements

## Tóm tắt

Tôi đã cải tiến tính năng tìm kiếm sản phẩm bằng 3 bước:

### 1. ✅ Backend - Chuẩn hóa Tiếng Việt (MongoDB + Node.js)

**Thay đổi:** `be-new/product-service/models/productModel.js`

- ✨ Thêm hàm `normalizeText()` để bỏ dấu Tiếng Việt (dài → dai, để → de, v.v.)
- ✨ Thêm field `normalized_name` vào Product Schema
- ✨ Tạo indexed trên `normalized_name` để tìm kiếm nhanh
- ✨ Thêm middleware `pre('save')` để tự động chuẩn hóa khi lưu sản phẩm
- ✨ Update hàm `listProducts()` để search sử dụng `normalized_name`

**Kết quả:** Khi bạn tìm "dài", backend sẽ match với mọi sản phẩm có chữ "dài" bất kể dấu

### 2. ✅ Frontend - Fuzzy Search Client-Side (Vue 3 + Fuse.js)

**Thay đổi:**
- `fe/src/components/forms/SearchBar.vue` - Bật import Fuse.js (sửa lỗi ReferenceError) ✓
- `fe/src/pages/customer/SearchResults.vue` - Import + sử dụng Fuse.js để filter kết quả thêm lần nữa

**Logic:**
1. Backend trả về ~100 sản phẩm match với search query
2. Frontend dùng Fuse.js để fuzzy search (tìm kiếm mờ) kết quả này
3. Sắp xếp kết quả theo độ match (relevance)

**Kết quả:** Kết quả tìm kiếm chính xác và liểu hợp hơn

### 3. ✅ Database - Migration Script để cập nhật sản phẩm cũ

**Tạo:** `be-new/product-service/scripts/updateNormalizedNames.js`

**Cách chạy:**
```bash
cd be-new/product-service
npm run migrate:normalize
```

Hoặc:
```bash
node scripts/updateNormalizedNames.js
```

**Công dụng:** Cập nhật field `normalized_name` cho tất cả sản phẩm hiện có trong database

---

## Step-by-step Implementation

### Bước 1: Cập nhật Database
```bash
cd be-new/product-service
npm run migrate:normalize
```

### Bước 2: Restart Backend
```bash
cd be-new
npm run start:all
# Hoặc
npm run start # (chạy product-service)
```

### Bước 3: Test
- Gõ vào SearchBar: "dài" → Sẽ thấy các sản phẩm liên quan trong gợi ý
- Nhấn Enter → Chuyển trang Search Results, hiển thị tất cả sản phẩm match

---

## Technical Details

### Normalize Text Function
```javascript
"Áo dài Việt Nam" → "ao dai viet nam"
"Túi xách Đẹp" → "tui xach dep"
```

### Fuse.js Configuration
- **threshold:** 0.3 (độ nhạy tìm kiếm)
- **keys:** ['name', 'category_name']
- **distance:** 100

---

## Công việc còn lại (Optional)

- [ ] Cache search results để tăng tốc độ
- [ ] Thêm analytics để tracking search keywords
- [ ] Thêm auto-suggestions dựa trên trending searches
