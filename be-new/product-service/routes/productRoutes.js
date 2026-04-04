// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const reviewController = require('../controllers/reviewController'); 
const upload = require('../functions/upload'); 
const { verifyToken, requireAdmin, requireStaffOrAdmin } = require('../middleware/authMiddleware');


// Thêm dòng mới: lấy ảnh đại diện theo SKU
router.get('/sku/:sku/primary-image', productController.getPrimaryImageBySku);
// --- 1. PUBLIC ---
router.get('/reviews', verifyToken, requireStaffOrAdmin, reviewController.listAllReviews);
router.get('/health', productController.healthCheck);
router.get('/', productController.listProducts);
router.get('/top', productController.getTopProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/download', productController.downloadProductImage);

// --- 2. AUTHENTICATED (Cần đăng nhập) ---
router.put('/:id/stock',  productController.updateStock);

// Các route review (nếu có)
if (reviewController) {
    router.get('/:productId/reviews', reviewController.listReviews);
    router.post('/:productId/reviews', verifyToken, reviewController.createReview);
    router.delete('/reviews/:reviewId', verifyToken, reviewController.deleteReview);
    router.put('/reviews/:reviewId/reply', verifyToken, reviewController.replyReview);
}

// --- 3. ADMIN ONLY ---
router.post('/', verifyToken, requireAdmin, upload.array('images', 10), productController.createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.array('images', 10), productController.updateProduct);
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);


module.exports = router;