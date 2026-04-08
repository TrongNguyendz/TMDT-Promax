import axios from "axios";

// GHN API tạo đơn hàng
const createOrder = async (data) => {
  try {
    const res = await axios.post("https://tmdt-promax-ghn-service.onrender.com/api/ghn/order", data);
    return res.data;
  } catch (error) {
    console.error("🔥 GHN ERROR:", error.response?.data || error.message);
    throw error;
  }
};
// GHN API xem trước đơn hàng
const getPreview = async (data) => {
  try {
    const res = await axios.post("https://tmdt-promax-ghn-service.onrender.com/api/ghn/preview", data);
    return res.data;
  } catch (error) {
    console.error("🔥 GHN ERROR:", error.response?.data || error.message);
    throw error;
  }
};
// GHN API tính thời gian giao hàng
const getDeliveryTime = async (data) => {
  try {
    const res = await axios.post(
      "https://tmdt-promax-ghn-service.onrender.com/api/ghn/delivery-time",
      data,
    );
    return res.data;
  } catch (error) {
    console.error("🔥 GHN ERROR:", error.response?.data || error.message);
    throw error;
  }
};
// GHN API hủy đơn hàng
const cancelOrder = async (data) => {
  try {
    const res = await axios.post(
      "https://tmdt-promax-ghn-service.onrender.com/api/ghn/order/cancel",
      data,
    );
    return res.data;
  } catch (error) {
    console.error("🔥 GHN ERROR:", error.response?.data || error.message);
    throw error;
  }
};
// GHN API tính phí vận chuyển
const calculateShippingFee = async (data) => {
  try {
    const res = await axios.post(
      "https://tmdt-promax-ghn-service.onrender.com/api/ghn/order/fee",
      data,
    );
    return res.data;
  } catch (error) {
    console.error("🔥 GHN ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// GHN API lấy thông tin đơn hàng (acter khách hàng)
const getOrderInfov2 = async (order_code) => {
  try {
    const res = await axios.post("https://tmdt-promax-ghn-service.onrender.com/api/ghn/order/detail", {
      order_code,
    });
    return res.data;
  } catch (error) {
    console.error("🔥 GHN ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// API lấy danh sách tỉnh thành

export {
  createOrder,
  getPreview,
  getDeliveryTime,
  cancelOrder,
  getOrderInfov2,
  calculateShippingFee,
};
