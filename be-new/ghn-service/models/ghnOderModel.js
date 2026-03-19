const mongoose = require("mongoose");

const GHNOrderSchema = new mongoose.Schema(
  {
    // 1. MÃ ĐỊNH DANH (Của GHN trả về sau khi tạo)
    order_code: { type: String, unique: true, sparse: true }, // Mã đơn hàng GHN
    client_order_code: { type: String, default: "" }, // Mã đơn của shop bạn

    // 2. THÔNG TIN NGƯỜI GỬI (FROM)
    from_name: { type: String, required: true },
    from_phone: { type: String, required: true },
    from_address: { type: String, required: true },
    from_ward_name: { type: String },
    from_district_name: { type: String },
    from_province_name: { type: String },

    // 3. THÔNG TIN NGƯỜI NHẬN (TO)
    to_name: { type: String, required: true },
    to_phone: { type: String, required: true },
    to_address: { type: String, required: true },
    to_ward_name: { type: String },
    to_district_name: { type: String },
    to_province_name: { type: String },

    // 4. THÔNG SỐ GÓI HÀNG (PACKAGE)
    weight: { type: Number, required: true }, // gram
    length: { type: Number, required: true }, // cm
    width: { type: Number, required: true }, // cm
    height: { type: Number, required: true }, // cm

    // 5. CHI TIẾT SẢN PHẨM (ITEMS)
    items: [
      {
        name: { type: String },
        code: { type: String },
        quantity: { type: Number },
        price: { type: Number },
        category: {
          level1: { type: String },
        },
      },
    ],

    // 6. THÔNG TIN THANH TOÁN & DỊCH VỤ
    payment_type_id: { type: Number, enum: [1, 2], default: 2 }, // 1: Shop trả, 2: Khách trả
    cod_amount: { type: Number, default: 0 },
    cod_failed_amount: { type: Number, default: 0 },
    insurance_value: { type: Number, default: 0 },
    service_type_id: { type: Number, default: 2 }, // 2: Chuyển phát chuẩn

    // 7. GHI CHÚ & HẸN GIỜ
    note: { type: String },
    required_note: {
      type: String,
      enum: ["CHOTOT", "CHOXEMHANGKHONGTHU", "KHONGCHOXEMHANG"],
      default: "KHONGCHOXEMHANG",
    },
    pickup_time: { type: Date }, // Sẽ được convert từ Unix timestamp
    pick_shift: [{ type: Number }], // Ca lấy hàng

    // 8. ĐỊA CHỈ TRẢ HÀNG (RETURN)
    return_phone: { type: String },
    return_address: { type: String },

    // Trạng thái nội bộ hệ thống bạn
    status: { type: String, default: "ready_to_pick" },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  },
);

module.exports = mongoose.model("GHNOrder", GHNOrderSchema);
