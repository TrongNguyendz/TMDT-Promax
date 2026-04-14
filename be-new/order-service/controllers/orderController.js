const OrderModel = require("../models/orderModel");

const axios = require("axios");

// Cấu hình URL Gateway
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000/api/v1";

exports.createOrder = async (req, res) => {
  let createdOrderId = null;
  try {
    console.log("📦 Bắt đầu tạo đơn hàng ...");
    // --- BƯỚC 1: CHUẨN HÓA DỮ LIỆU (FIX LỖI UNDEFINED & NaN) ---
    const {
      user_id,
      userId,
      items,
      shipping_address,
      address,
      total_amount,
      totalAmount,
      amount,
      customer_name,
      fullName,
      customer_email,
      email_user,
      customer_phone,
      phone,
      payment_method,
      final_amount, // 👈 THÊM: Lấy từ frontend gửi (đã trừ discount)
      discount_amount, // 👈 Để debug nếu cần
      delivery_type,
    } = req.body;

    // Gán giá trị ưu tiên: nếu cái này undefined thì lấy cái kia
    const final_user_id = user_id || userId;
    const final_shipping_address = shipping_address || address;
    const final_total_amount = total_amount || totalAmount;
    const final_customer_name = customer_name || fullName;
    const final_customer_email = customer_email || email_user;
    const final_customer_phone = customer_phone || phone;

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (
      !final_user_id ||
      !items ||
      items.length === 0 ||
      !final_shipping_address ||
      !delivery_type
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Dữ liệu không hợp lệ: Thiếu thông tin bắt buộc",
        });
    }
    // 👇 SỬA Ở ĐÂY: Lưu total_amount = final_amount (sau giảm giá) từ frontend
    // Đảm bảo là số hợp lệ, fallback về total_amount cũ nếu không có
    const calculated_total = Number(
      final_amount || total_amount || totalAmount || amount || 0,
    );
    if (isNaN(calculated_total) || calculated_total < 0) {
      throw new Error("Số tiền không hợp lệ");
    }
    // Tạo object payload sạch để gửi vào Model
    const orderPayload = {
      user_id: final_user_id,
      customer_name: final_customer_name,
      customer_email: final_customer_email,
      customer_phone: final_customer_phone,
      shipping_address: final_shipping_address,
      payment_method: payment_method || "vnpay",
      items: items,
      status: req.body.status || "pending",
      shipping_fee: Number(req.body.shipping_fee || 0),
      discount_amount: Number(req.body.discount_amount || 0),
      coupon_code: req.body.voucher || null,
      notes: req.body.notes || "",
      delivery_type: delivery_type || 2,
    };
    console.log(orderPayload);
    // 1. Lưu đơn hàng vào Database
    const orderResult = await OrderModel.createOrder(orderPayload);
    createdOrderId = orderResult.id;
    console.log(`✅ delivery_type đã được lưu: ${orderResult.delivery_type}`);
    console.log(`✅ Đã lưu đơn hàng thành công vào DB #${createdOrderId}`);

    // 2. Trừ tồn kho (Gọi sang Product Service qua Gateway)
    const token = req.headers.authorization;

    for (const item of items) {
      try {
        // Chú ý: dùng product_id hoặc productId tùy theo item gửi lên
        const pId = item.product_id || item.productId;
        const productUrl = `${GATEWAY_URL}/products/${pId}`;

        console.log(`📡 [DEBUG] Đang kiểm tra kho cho SP: ${pId}`);

        // A. Lấy thông tin sản phẩm hiện tại
        const productRes = await axios.get(productUrl);
        const productData = productRes.data.data || productRes.data;

        if (!productData) throw new Error(`Không tìm thấy sản phẩm ${pId}`);

        const currentStock = parseInt(productData.stock_quantity || 0);
        const buyQty = parseInt(item.quantity || 0);
        const newStock = currentStock - buyQty;

        if (newStock < 0) {
          throw new Error(
            `Sản phẩm ${productData.name} đã hết hàng (Chỉ còn ${currentStock})`,
          );
        }

        // B. Cập nhật số lượng tồn kho mới
        console.log(`🧮 Trừ kho SP ${pId}: ${currentStock} -> ${newStock}`);
        await axios.put(
          `${productUrl}/stock`,
          { stock_quantity: newStock },
          { headers: { Authorization: token } },
        );
      } catch (stockError) {
        console.error(`❌ Lỗi xử lý kho cho sản phẩm:`, stockError.message);

        // ROLLBACK: Nếu trừ kho thất bại, xóa đơn hàng vừa tạo để đảm bảo tính toàn vẹn
        if (createdOrderId) {
          await OrderModel.deleteOrder(createdOrderId);
          console.log(
            `⚠️ Đã Rollback (Xóa) đơn hàng #${createdOrderId} do lỗi kho`,
          );
        }
        throw new Error(stockError.message || "Lỗi cập nhật tồn kho");
      }
    }

    // Tăng sold
    await axios.post(
      `${GATEWAY_URL}/products/increase-sold`,
      {
        items: items,
      },
      {
        headers: { Authorization: token },
      },
    );

    // 👇 THÊM PHẦN NÀY SAU KHI TRỪ KHO THÀNH CÔNG (trước res.status(201).json)
    try {
      console.log("📧 Bắt đầu chuẩn bị gửi hóa đơn qua email...");

      // Tạo mã hóa đơn đẹp: HD + YYYYMMDD + -XXX (dùng orderId)
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // 20251230
      const invoiceNumber = `HD${dateStr}-${String(createdOrderId).padStart(3, "0")}`;

      // Lấy thông tin khách hàng từ shipping_address (ưu tiên) hoặc từ body
      const customerName =
        final_shipping_address?.full_name || final_customer_name || "Khách lẻ";
      const customerPhone =
        final_shipping_address?.phone || final_customer_phone || "";
      const customerEmail = final_customer_email || ""; // bắt buộc có

      // Địa chỉ giao hàng đầy đủ
      const fullAddressParts = [
        final_shipping_address?.address,
        final_shipping_address?.ward,
        final_shipping_address?.district,
        // final_shipping_address?.city
      ].filter(Boolean);

      const customerAddress =
        fullAddressParts.join(", ") || "Không có thông tin địa chỉ";

      // Xử lý màu sắc: color có thể là object { name: 'Đen' } hoặc string
      const getColorName = (color) => {
        if (!color) return "";
        if (typeof color === "string") return color;
        if (typeof color === "object" && color.name) return color.name;
        return "";
      };

      // Map items cho hóa đơn
      const invoiceItems = items.map((item) => {
        const colorName = getColorName(item.color);
        const size = item.size || "";
        const variant = [colorName, size].filter(Boolean).join(" - ");

        const description =
          `${item.product_name || "Sản phẩm"} ${variant ? `(${variant})` : ""}`.trim();

        const quantity = parseInt(item.quantity) || 1;
        const unitPrice = parseInt(item.unit_price || item.price || 0);
        const total = quantity * unitPrice;

        return {
          description,
          quantity,
          unitPrice,
          total,
        };
      });

      // Tính subtotal (trước giảm giá) và các phí khác
      const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
      const discount = parseInt(req.body.discount_amount || 0);
      const shippingFee = parseInt(req.body.shipping_fee || 0);
      const finalTotal = calculated_total; // đã là số sau giảm giá

      // Dữ liệu hóa đơn đầy đủ theo đúng format mà notification service mong đợi
      const invoiceData = {
        invoiceNumber,
        date: today.toLocaleDateString("vi-VN"), // 30/12/2025
        company: {
          name: "GOGHEVENT Fashion",
          slogan: "Thời trang hiện đại - Phong cách riêng",
          address: "127 tổ 9 Nhân Trạch Phú Lương Hà Đông",
          phone: "0912 260 352",
          website: "https://goghievent.vn",
          taxCode: "0101234567",
        },
        customer: {
          name: customerName,
          address: customerAddress,
          phone: customerPhone,
          email: customerEmail,
        },
        items: invoiceItems,
        subtotal: subtotal,
        discount: discount,
        shippingFee: shippingFee,
        tax: (10 * finalTotal) / 100, // nếu chưa áp dụng thuế
        total: finalTotal,
        notes: req.body.notes
          ? `Ghi chú: ${req.body.notes}. `
          : "" +
            `Phương thức thanh toán: ${payment_method.toUpperCase()}. Cảm ơn quý khách đã mua sắm tại GOGHEVENT Fashion!`,
      };

      // Payload gửi sang Notification Service
      const notificationPayload = {
        user_id: final_user_id,
        notification_type: "invoice",
        email_user: customerEmail,
        data: invoiceData,
      };

      // Gửi bất đồng bộ (fire-and-forget) - không làm chậm response tạo order
      axios
        .post("http://localhost:3005/api/notifications", notificationPayload)
        .then((response) => {
          console.log(
            "✅ Đã gửi yêu cầu tạo & gửi hóa đơn PDF thành công:",
            response.data,
          );
        })
        .catch((err) => {
          console.error(
            "⚠️ Lỗi gửi yêu cầu hóa đơn (đơn hàng vẫn tạo thành công):",
            err.response?.data || err.message,
          );
        });
    } catch (notifyError) {
      console.error(
        "⚠️ Lỗi chuẩn bị dữ liệu hóa đơn (không ảnh hưởng đến đơn hàng):",
        notifyError.message,
      );
    }
    // Trả về kết quả thành công
    res.status(201).json({
      success: true,
      message:
        "đặt hàng thành công , vui lòng check hóa đơn được gửi đến gmail",
      data: orderResult,
    });
  } catch (error) {
    console.error("🚨 Create Order Error:", error.message);
    console.error("message:", error.message);
    console.error("response data:", error.response?.data);
    console.error("response status:", error.response?.status);
    console.error("stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi tạo đơn hàng",
    });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const currentUserId = req.headers["x-user-id"];
    const currentUserRole = req.headers["x-user-role"];

    let targetUserId = req.query.user_id;

        // Nếu là khách thường -> Ép buộc targetUserId phải là ID của chính nó (Bỏ qua query từ Frontend)
        if (!['admin', 'staff'].includes(currentUserRole)) {
            targetUserId = currentUserId;
        }
        
        const data = await OrderModel.listOrders(targetUserId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDetail = async (req, res) => {
  try {
    const currentUserId = req.headers["x-user-id"];
    const currentUserRole = req.headers["x-user-role"];

    const data = await OrderModel.getOrderById(req.params.id);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    // Bảo mật: Nếu không phải admin và ID người mua khác ID người đang login -> Cút!
    if (
      currentUserRole !== "admin" &&
      String(data.user_id) !== String(currentUserId)
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Không có quyền truy cập đơn hàng này",
        });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái (Admin/Shipper)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    // 👇 THÊM 2 DÒNG LOG NÀY ĐỂ DEBUG 👇
    console.log(`📡 [DEBUG] Nhận yêu cầu update Order #${id}`);
    console.log(`   -> Body nhận được:`, JSON.stringify(req.body));

    // Gọi Model
    const data = await OrderModel.updateStatus(id, status, payment_status);

    res.json({ success: true, message: "Đã cập nhật trạng thái", data });
  } catch (error) {
    console.error("❌ Lỗi update:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hủy đơn hàng (User/Admin) + Hoàn kho
exports.cancelOrder = async (req, res) => {
  try {
    const currentUserId = req.headers["x-user-id"];
    const currentUserRole = req.headers["x-user-role"];
    const { id } = req.params;

    const order = await OrderModel.getOrderById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });

    // Bảo mật: Chặn quyền
    if (
      currentUserRole !== "admin" &&
      String(order.user_id) !== String(currentUserId)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền hủy đơn này" });
    }

    if (
      !["pending", "shipping", "delivered", "unpaid"].includes(order.status)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Không thể hủy đơn hàng này" });
    }

    // Hoàn lại kho
    const token = req.headers.authorization;
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        try {
          const productUrl = `${GATEWAY_URL}/products/${item.product_id}`;
          const productRes = await axios.get(productUrl);
          const product = productRes.data.data || productRes.data;

          if (product) {
            const newStock =
              parseInt(product.stock_quantity || 0) + parseInt(item.quantity);

            await axios.put(
              `${productUrl}/stock`,
              { stock_quantity: newStock },
              { headers: { Authorization: token } },
            );

            console.log(`♻️ Đã hoàn kho SP ${item.product_id}: -> ${newStock}`);
          }
        } catch (e) {
          console.error(`Lỗi hoàn kho SP ${item.product_id}:`, e.message);
        }
      }
    }

    await OrderModel.updateStatus(id, "cancelled");
    res.json({ success: true, message: "Đã hủy đơn hàng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const success = await OrderModel.deleteOrder(req.params.id);
    if (!success)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn" });
    res.json({ success: true, message: "Đã xóa đơn hàng" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReportStats = async (req, res) => {
  try {
    const stats = await OrderModel.getStats();

    // --- 1. XỬ LÝ DOANH THU 6 THÁNG  ---
    const filledRevenue = [];
    const today = new Date();

    // Vòng lặp tạo 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

      const found = stats.revenueByMonth.find((item) => item.name === monthStr);

      filledRevenue.push({
        name: monthStr,
        value: found ? found.value : 0,
      });
    }

    // --- 2. XỬ LÝ TRẠNG THÁI ĐƠN HÀNG (Gán màu & Label) ---
    const statusConfig = {
      pending: { label: "Chờ xác nhận", color: "#FBBF24" },
      confirmed: { label: "Đã xác nhận", color: "#3B82F6" },
      packed: { label: "Đã đóng gói", color: "#8B5CF6" },
      shipping: { label: "Đang giao", color: "#ff7f17" },
      delivered: { label: "Đã giao", color: "#10B981" },
      cancelled: { label: "Đã hủy", color: "#EF4444" },
    };

    // Tạo danh sách đầy đủ các trạng thái (để biểu đồ luôn đủ màu)
    const filledStatus = Object.keys(statusConfig).map((key) => {
      // Tìm số lượng trong DB
      const found = stats.orderStatus.find((s) => s.name === key);
      return {
        name: key,
        count: found ? found.count : 0,
        label: statusConfig[key].label,
        color: statusConfig[key].color,
      };
    });

    // Tính tổng đơn để tính phần trăm
    const totalOrdersForCalc =
      filledStatus.reduce((sum, item) => sum + item.count, 0) || 1;
    const finalStatusData = filledStatus.map((item) => ({
      ...item,
      percentage: Math.round((item.count / totalOrdersForCalc) * 100),
    }));

    // --- 3. TRẢ VỀ KẾT QUẢ ---
    const avgOrderValue =
      stats.kpi.total_orders > 0
        ? stats.kpi.total_revenue / stats.kpi.total_orders
        : 0;

    res.json({
      success: true,
      data: {
        kpi: stats.kpi,
        revenueWeek: stats.revenueWeek,
        payingUsers: stats.payingUsers || 0,
        revenueByMonth: filledRevenue,
        topProducts: stats.topProducts,
        orderStatus: finalStatusData,
        avgOrderValue,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
