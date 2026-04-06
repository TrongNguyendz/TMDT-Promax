const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// --- API Kiểm tra sức khỏe ---
router.get('/health', paymentController.healthCheck);

// =======================================================
// ❌ CÁC API VNPAY CŨ (ĐÃ COMMENT ĐỂ TRÁNH LỖI UNDEFINED)
// =======================================================
// router.post('/vnpay/create', paymentController.createVnpayPayment);
// router.get('/vnpay/ipn', paymentController.vnpayIpn);
// router.get('/vnpay/vnpay-return', (req, res) => {
//     console.log("Đã vào được route Return URL!");
//     res.json({
//         success: true,
//         message: "Cổng thanh toán VNPAY đã phản hồi về website thành công!",
//         data: req.query 
//     });
// });

// --- CÁC API CƠ BẢN QUẢN LÝ THANH TOÁN ---
router.get('/', paymentController.listPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id/status', paymentController.updatePaymentStatus);
router.delete('/:id', paymentController.deletePayment);

// =======================================================
// 🚀 CÁC API PAYOS (VIETQR) MỚI
// =======================================================
router.post('/payos/create', paymentController.createPayOSPayment);
router.post('/payos/webhook', paymentController.payosWebhook);

module.exports = router;