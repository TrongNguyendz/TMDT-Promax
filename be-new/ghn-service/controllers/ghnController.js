 const GHNService = require("../services/ghnService");
const GHNOrderSchema = require("../models/ghnOderModel");

const ghnController = {
  // 1. API Tạo đơn hàng
  createOrder: async (req, res) => {
    try {
      // 1. Gọi sang Service để đẩy đơn sang GHN
      const result = await GHNService.createOrder(req.body);
      console.log("🚀 GHNController: Kết quả từ GHNService.createOrder:", result);
      // 2. Kiểm tra nếu GHN trả về thành công (GHN thường trả về code 200)
      if (result && result.code === 200) {
        // Lưu vào database của bạn để quản lý
        const newOrder = new GHNOrderSchema({
          ...req.body, // Dữ liệu từ Postman
          order_code: result.data.order_code, // Mã vận đơn GHN cấp
          status: "ready_to_pick",
        });
        await newOrder.save();
        console.log(`✅ Đã lưu đơn hàng ${result.data.order_code} vào DB`);
      }

      // 3. Trả phản hồi lại cho Postman
      res.json(result);
    } catch (error) {
      // Log lỗi chi tiết để debug
      console.error(
        "🔥 Error in Controller:",
        error.response?.data || error.message,
      );
      res.status(500).json({
        success: false,
        error: error.response?.data || error.message,
      });
    }
  },

  // API xem trước đơn hàng
  getPreview: async (req, res) => {
    try {
      const result = await GHNService.getPreview(req.body);
      res.json(result);
    } catch (error) {
      console.error(
        "🔥 Error in Controller:",
        error.response?.data || error.message,
      );
      res.status(500).json({ error: error.message });
    }
  },

  // API tính thời gian giao hàng
  getDeliveryTime: async (req, res) => {
    try {
      const result = await GHNService.getDeliveryTime(req.body);
      res.json(result);
    } catch (error) {
      console.error(
        "🔥 Error in Controller:",
        error.response?.data || error.message,
      );
      res.status(500).json({ error: error.message });
    }
  },

  // API hủy đơn hàng
  cancelOrder: async (req, res) => {
    try {
      const { order_codes } = req.body; // Postman: { "order_codes": ["GNS6V1"] }

      // 1. Gọi Service để hủy trên hệ thống GHN
      const result = await GHNService.cancelOrder(order_codes);

      // 2. Nếu GHN phản hồi thành công (thường là code 200)
      if (result && result.code === 200) {
        // 3. TÌM KIẾM VÀ XÓA TRONG MONGODB
        // Sử dụng $in để xóa tất cả các mã có trong mảng order_codes
        const deletedResult = await GHNOrderSchema.deleteMany({
          order_code: { $in: order_codes },
        });

        console.log(
          `✅ GHN đã hủy đơn. MongoDB đã xóa ${deletedResult.deletedCount} bản ghi.`,
        );

        return res.json({
          success: true,
          ghn_message: result.message,
          db_message: `Đã xóa ${deletedResult.deletedCount} đơn hàng khỏi database.`,
        });
      } else {
        // Trường hợp GHN trả về lỗi (ví dụ 404 mã không tồn tại)
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error(
        "🔥 Error in cancelOrder Controller:",
        error.response?.data || error.message,
      );
      res.status(500).json({
        success: false,
        error: error.response?.data || error.message,
      });
    }
  },
  // API lấy thông tin đơn hàng
  getOrderInfov2: async (req, res) => {
    const { order_code } = req.body; // Postman: { "order_code": "GNS6V1" }
    console.log(
      `🚀 GHNController: Nhận yêu cầu lấy thông tin đơn hàng với mã: ${order_code}`,
    );
    try {
      const result = await GHNService.getOrderInfov2(order_code);
      res.json(result);
    } catch (error) {
      console.error("🔥 Error in Controller:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // API tính phí vận chuyển
  calculateShippingFee: async (req, res) => {
    try {
      const result = await GHNService.calculateShippingFee(req.body);
      res.json(result);
    } catch (error) {
      console.error("🔥 Error in Controller:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  //lấy thông tin đơn hàng (acter khách hàng)
  getOrderInfo: async (req, res) => {
    try {
      const result = await GHNService.getOrderInfo(req.params.orderId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  //lấy danh sách tỉnh thành
  getProvince: async (req, res) => {
    try {
      const result = await GHNService.getProvince();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  //lấy danh sách quận huyện theo tỉnh thành
  getDistrict: async (req, res) => {
    try {
      const result = await GHNService.getDistrict(req.params.provinceId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  //lấy danh sách phường xã theo quận huyện
  getWard: async (req, res) => {
    try {
      const result = await GHNService.getWard(req.params.districtId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

// Xuất ra một Object chứa các hàm
module.exports = ghnController;
