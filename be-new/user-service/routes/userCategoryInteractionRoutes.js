const express = require('express');
const router = express.Router();

const categoryInteractionController = require('../controllers/userCategoryInteractionController');

// Ghi nhận click danh mục (thường gọi từ frontend khi user click vào category)
router.post('/click', categoryInteractionController.recordCategoryClick);

// Lấy danh sách category_id user hay xem nhất (dùng để recommend sản phẩm)
router.get('/recent', categoryInteractionController.getRecentCategories);

// Lấy chi tiết kèm số lần click (dùng cho debug hoặc admin)
router.get('/recent/detail', categoryInteractionController.getRecentCategoriesWithCount);

module.exports = router;