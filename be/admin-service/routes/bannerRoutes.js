// routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { upload } = require('../functions/upload'); // dùng chung upload

router.get('/health', bannerController.healthCheck);
router.get('/', bannerController.listBanners);
router.get('/:id', bannerController.getBannerById);

// Upload khi tạo mới (1 file: ảnh hoặc video)
router.post('/', upload.single('media'), bannerController.createBanner);

// Cập nhật banner (có thể có file mới)
router.put('/:id', upload.single('media'), bannerController.updateBanner);

// // Route nâng cao: upload nhiều file, chọn 1 làm chính
// router.put('/:id/media', upload.array('media', 5), bannerController.updateBannerMedia);

router.delete('/:id', bannerController.deleteBanner);

module.exports = router;

