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

// GHN Master data endpoints
router.get("/province", ghnController.getProvinces);
router.get("/district/:provinceId", ghnController.getDistricts);
router.get("/ward/:districtId", ghnController.getWards);

module.exports = router;
