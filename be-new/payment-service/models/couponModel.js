// 1. Sửa lại đường dẫn require cho đúng cấu trúc thư mục (vào config/database.js)
const mongoose = require('mongoose');

// --- ĐỊNH NGHĨA CẤU TRÚC (Schema) ---
const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, uppercase: true, trim: true },
  description: { type: String, default: null },
  discount_type: { type: String, required: true },
  discount_value: { type: Number, required: true },
  min_order_amount: { type: Number, default: 0 },
  valid_from: { type: Date, default: null },
  valid_until: { type: Date, default: null }
}, { 
  // Tự động quản lý created_at và updated_at
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Khởi tạo Model
const Coupon = mongoose.model('Coupon', couponSchema);

// --- CÁC HÀM TRUY VẤN (Sử dụng async/await) ---

exports.findByCode = async (code) => {
  // MongoDB findOne trả về null nếu không tìm thấy, tương tự db.get của SQLite
  return await Coupon.findOne({ code: code.toUpperCase() });
};

exports.createCoupon = async (payload) => {
  const newCoupon = new Coupon({
    code: payload.code,
    description: payload.description,
    discount_type: payload.discount_type,
    discount_value: Number(payload.discount_value),
    min_order_amount: Number(payload.min_order_amount || 0),
    valid_from: payload.valid_from,
    valid_until: payload.valid_until
  });
  return await newCoupon.save();
};

exports.findById = async (id) => {
  // Lưu ý: id ở đây giờ là MongoDB ObjectId (chuỗi 24 ký tự)
  return await Coupon.findById(id);
};

exports.updateCoupon = async (id, payload) => {
  const updateData = { ...payload };
  if (updateData.code) updateData.code = updateData.code.toUpperCase().trim();

  // findByIdAndUpdate thay thế cho câu lệnh UPDATE SQL phức tạp
  return await Coupon.findByIdAndUpdate(
    id, 
    { $set: updateData }, 
    { new: true, runValidators: true }
  );
};

exports.listCoupons = async (filters = {}) => {
  let query = {};

  if (filters.code) {
    // Sử dụng Regex để tìm kiếm gần đúng (LIKE %code%)
    query.code = { $regex: filters.code.toUpperCase(), $options: 'i' };
  }

  if (filters.valid_only) {
    const now = new Date();
    query.$and = [
      { $or: [{ valid_from: null }, { valid_from: { $lte: now } }] },
      { $or: [{ valid_until: null }, { valid_until: { $gte: now } }] }
    ];
  }

  return await Coupon.find(query).sort({ created_at: -1 });
};

exports.deleteCoupon = async (id) => {
  return await Coupon.findByIdAndDelete(id);
};