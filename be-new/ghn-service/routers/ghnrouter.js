const express = require("express");
const router = express.Router();
const ghnController = require("../controllers/ghnController");

// Định nghĩa các route và liên kết với controller
// Tạo đơn hàng
router.post("/order", ghnController.createOrder);
// Xem trước đơn hàng
router.post("/preview", ghnController.getPreview);
// Tính thời gian giao hàng
router.post("/delivery-time", ghnController.getDeliveryTime);
// Hủy đơn hàng
router.post("/order/cancel", ghnController.cancelOrder);
// Lấy thông tin đơn hàng
router.post("/order/detail", ghnController.getOrderInfov2);
// tính phí vận chuyển
router.post("/order/fee", ghnController.calculateShippingFee);



// Lấy thông tin đơn hàng (acter khách hàng)
router.get("/order/infor", ghnController.getOrderInfo);

// Lấy danh sách tỉnh thành
router.get("/province", ghnController.getProvince);
// Lấy danh sách quận huyện theo tỉnh thành
router.get("/district/:provinceId", ghnController.getDistrict);
// Lấy danh sách phường xã theo quận huyện
router.post("/ward/:districtId", ghnController.getWard);


module.exports = router;
