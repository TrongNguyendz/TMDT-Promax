const express = require('express');

const router = express.Router();
const couponController = require('../controllers/couponController');


router.get('/', couponController.list);
router.get('/:code', couponController.getByCode);
// router.get('/:id', couponController.getCouponById);
router.post('/', couponController.create);
router.put('/:id', couponController.update);
router.delete('/:id', couponController.delete);
// router.post('/validate', couponController.validateCoupon);


module.exports = router;


