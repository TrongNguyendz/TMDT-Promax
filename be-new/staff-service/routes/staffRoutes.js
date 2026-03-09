// staffRoutes.js
const express = require('express');

const router = express.Router();
const staffController = require('../controllers/staffController');
const { upload } = require('../functions/upload');  // multer config chung

// Health check (tùy chọn, giống user)
router.get('/health', staffController.healthCheck);

// ─── CRUD cơ bản ────────────────────────────────────────────────
router.get('/', staffController.listStaff);                    // GET /api/staff     → danh sách + filter + phân trang
router.get('/:id', staffController.getStaffById);              // GET /api/staff/:id
// router.get('/code/:code', staffController.getStaffByCode);     // GET /api/staff/code/NV001

router.post('/', upload.single('avatar'), staffController.createStaff);                 // POST /api/staff    → tạo nhân viên mới

router.put('/:id', staffController.updateStaff);               // PUT /api/staff/:id → cập nhật thông tin

router.delete('/:id', staffController.deleteStaff);            // DELETE /api/staff/:id → xóa mềm (status = resigned)
router.delete('/:id/hard', staffController.hardDeleteStaff);   // DELETE /api/staff/:id/hard → xóa cứng (cẩn thận!)

// ─── Avatar ─────────────────────────────────────────────────────
// Cập nhật avatar (1 ảnh - field name: avatar)
router.put('/:id/avatar', upload.single('avatar'), staffController.updateAvatar);

// (Tùy chọn) Nếu sau này muốn hỗ trợ upload nhiều ảnh giống user
// router.put('/:id/avatar/multiple', upload.array('avatars', 5), staffController.updateAvatarMultiple);

// ─── Các endpoint khác có thể thêm sau ──────────────────────────
// router.get('/position/:positionId', staffController.getStaffByPosition);
// router.put('/:id/status', staffController.updateStaffStatus);
// router.get('/stats', staffController.getStaffStats);           // số lượng theo trạng thái, vị trí...

module.exports = router;