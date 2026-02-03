const db = require('./db');
const { generateTransactionId } = require('../functions/id');

exports.listPayments = async (filters = {}) => {
  let sql = 'SELECT * FROM payments WHERE 1 = 1';
  const params = [];

  if (filters.user_id) {
    sql += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.order_id) {
    sql += ' AND order_id = ?';
    params.push(filters.order_id);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.payment_method) {
    sql += ' AND payment_method = ?';
    params.push(filters.payment_method);
  }

  sql += ' ORDER BY created_at DESC';
  return db.all(sql, params);
};

exports.findById = (id) => db.get('SELECT * FROM payments WHERE id = ?', [id]);

exports.createPayment = async (payload) => {
  const now = new Date().toISOString();
  const transactionId = payload.transaction_id || generateTransactionId();

  const result = await db.run(
    `INSERT INTO payments
      (order_id, user_id, amount, currency, payment_method, status, transaction_id, gateway_response, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [

      payload.order_id,
      payload.user_id,

      Number(payload.amount),
      payload.currency || 'VND',
      payload.payment_method,
      payload.status || 'pending',
      transactionId,
      payload.gateway_response || null,
      now,
      now
    ]
  );

  return exports.findById(result.lastID);
};

exports.updatePaymentStatus = async (id, status, gatewayResponse) => {
  const now = new Date().toISOString();
  await db.run(
    `UPDATE payments SET status = ?, gateway_response = ?, updated_at = ? WHERE id = ?`,
    [status, gatewayResponse || null, now, id]
  );
  return exports.findById(id);
};

exports.deletePayment = async (id) => {
  const result = await db.run('DELETE FROM payments WHERE id = ?', [id]);
  return result.changes > 0;
};


