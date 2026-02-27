const express = require('express');

const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/stats', orderController.getReportStats);//CHANGE
router.post('/', orderController.createOrder);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getDetail);

router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;

