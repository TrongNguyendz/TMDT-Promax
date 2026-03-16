
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');


router.get('/health', paymentController.healthCheck);
router.post('/vnpay/create', paymentController.createVnpayPayment);
router.get('/vnpay/ipn', paymentController.vnpayIpn);
router.get('/vnpay/vnpay-return', (req, res) => {
    console.log("Đã vào được route Return URL!");
    res.json({
        success: true,
        message: "Cổng thanh toán VNPAY đã phản hồi về website thành công!",
        data: req.query // Hiển thị các tham số VNPAY trả về để bạn kiểm tra
    });
});
router.get('/', paymentController.listPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id/status', paymentController.updatePaymentStatus);
router.delete('/:id', paymentController.deletePayment);


module.exports = router;