
// controllers/couponController.js
const CouponModel = require('../models/couponModel');

exports.list = async (req, res) => {
  try {
    const data = await CouponModel.listCoupons(req.query);
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByCode = async (req, res) => {
  try {
    const coupon = await CouponModel.findByCode(req.params.code.toUpperCase());
    if (!coupon) return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại' });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  const required = ['code', 'discount_type', 'discount_value'];
  const missing = required.filter(f => !req.body[f]);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Thiếu trường: ${missing.join(', ')}` });
  }

  try {
    await CouponModel.createCoupon(req.body);
    res.status(201).json({ success: true, message: 'Tạo mã giảm giá thành công' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã tồn tại' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await CouponModel.updateCoupon(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    res.json({ success: true, message: 'Cập nhật thành công', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await CouponModel.deleteCoupon(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }
    res.json({ success: true, message: 'Xóa mã giảm giá thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

