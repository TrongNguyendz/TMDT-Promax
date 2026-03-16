
// models/couponModel.js
const db = require('./db');

exports.findByCode = (code) => {
  return db.get('SELECT * FROM coupons WHERE code = ?', [code]);
};

exports.createCoupon = (payload) => {
  const now = new Date().toISOString();
  return db.run(
    `INSERT INTO coupons 
      (code, description, discount_type, discount_value, min_order_amount, valid_from, valid_until, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.code.toUpperCase(),
      payload.description || null,
      payload.discount_type,        // 'percent' hoặc 'fixed'
      Number(payload.discount_value),
      Number(payload.min_order_amount || 0),
      payload.valid_from || null,
      payload.valid_until || null,
      now,
      now
    ]
  );
};

// models/couponModel.js - phần liên quan

exports.updateCoupon = async (id, payload) => {
  const now = new Date().toISOString();

  const fields = [];
  const values = [];

  // === CHO PHÉP UPDATE CODE (nếu bạn muốn) ===
  if (payload.code !== undefined) {
    const newCode = payload.code.toUpperCase().trim();
    if (newCode === '') {
      throw new Error('Mã giảm giá không được để trống');
    }
    fields.push('code = ?');
    values.push(newCode);
  }

  if (payload.description !== undefined) {
    fields.push('description = ?');
    values.push(payload.description || null);
  }

  if (payload.discount_type !== undefined) {  // Sửa: dùng !== undefined
    fields.push('discount_type = ?');
    values.push(payload.discount_type);
  }

  if (payload.discount_value !== undefined) {
    fields.push('discount_value = ?');
    values.push(Number(payload.discount_value));
  }

  if (payload.min_order_amount !== undefined) {
    fields.push('min_order_amount = ?');
    values.push(Number(payload.min_order_amount || 0));
  }

  if (payload.valid_from !== undefined) {
    fields.push('valid_from = ?');
    values.push(payload.valid_from || null);
  }

  if (payload.valid_until !== undefined) {
    fields.push('valid_until = ?');
    values.push(payload.valid_until || null);
  }

  if (fields.length === 0) {
    return await exports.findById(id); // Không thay đổi gì → trả về cũ
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id); // WHERE id = ?

  const sql = `UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`;

  await db.run(sql, values);
  return await exports.findById(id);
};

exports.findById = async (id) => {
  return await db.get('SELECT * FROM coupons WHERE id = ?', [id]);
};


exports.listCoupons = async (filters = {}) => {
  let sql = 'SELECT * FROM coupons WHERE 1 = 1';
  const params = [];


  if (filters.code) {
    // Nếu muốn tìm chính xác: = ?
    // Nếu muốn tìm gần đúng: LIKE ?
    sql += ' AND code LIKE ?';
    params.push(`%${filters.code.toUpperCase()}%`);
  }

  if (filters.valid_only) {
    const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    sql += ' AND (valid_from IS NULL OR valid_from <= ?) AND (valid_until IS NULL OR valid_until >= ?)';
    params.push(now, now);
  }

  sql += ' ORDER BY created_at DESC';
  return await db.all(sql, params);
};

exports.deleteCoupon = (id) => {
  return db.run('DELETE FROM coupons WHERE id = ?', [id]);
};

