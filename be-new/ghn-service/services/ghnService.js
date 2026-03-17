const GHNConfig = require("../configs/ghn");

class GHNService {
  // API Tạo đơn hàng
  async createOrder(data) {
    try {
      console.log("GHNService: Creating order");

      const res = await GHNConfig.ghnAxios.post(
        "/v2/shipping-order/create",
        data,
      );

      console.log("GHN RESPONSE:", res.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // API xem trước đơn hàng
  async getPreview(data) {
    const res = await GHNConfig.ghnAxios.post("/v2/shipping-order/preview", data);
    return res.data;
  }
  // API tính thời gian giao hàng
  async getDeliveryTime(data) {
    const res = await GHNConfig.ghnAxios.post("/v2/shipping-order/leadtime", data);
    return res.data;
  }
  // API hủy đơn hàng
  async cancelOrder(data) {
    console.log(`GHNService: Gửi yêu cầu hủy đơn hàng với mã: ${data}`);
    const payload = {
      order_codes: Array.isArray(data) ? data : [data],
    };
    console.log("Payload gửi đến GHN:", payload);
    const res = await GHNConfig.ghnAxios.post(`/v2/switch-status/cancel`, payload);
    return res.data;
  }
  // API lấy thông tin đơn hàng
  async getOrderInfov2(order_code) {
    // Đổi tên 'data' thành 'order_code' cho dễ hiểu
    console.log(
      `GHNService: Gửi yêu cầu lấy thông tin đơn hàng với mã: ${order_code}`,
    );

    // SỬA TẠI ĐÂY: Đóng gói nó vào một Object có key là 'order_code'
    const payload = { order_code: order_code };

    const res = await GHNConfig.ghnAxios.post(
      `/v2/shipping-order/detail`,
      payload,
    );
    return res.data;
  }
  // API tính phí vận chuyển
  async calculateShippingFee(data) {
    const res = await GHNConfig.ghnAxios.post("/v2/shipping-order/fee", data);
    return res.data;
  }

  // GHN master-data: tỉnh / quận / xã
  async getProvinces() {
    const res = await GHNConfig.ghnAxios.get("/master-data/province");
    return res.data;
  }

  async getDistricts(provinceId) {
    const res = await GHNConfig.ghnAxios.get("/master-data/district", {
      params: { province_id: provinceId },
    });
    return res.data;
  }

  async getWards(districtId) {
    const res = await GHNConfig.ghnAxios.get("/master-data/ward", {
      params: { district_id: districtId },
    });
    return res.data;
  }

  // API lấy thông tin đơn hàng (acter khách hàng)
  async getOrderInfo(orderId) {
    const res = await GHNConfig.ghnAxiosV2.get(
      `/v2/shipping-order/detail/${orderId}`,
    );
    return res.data;
  }
}

// Xuất ra một Object chứa các hàm
module.exports = new GHNService();
