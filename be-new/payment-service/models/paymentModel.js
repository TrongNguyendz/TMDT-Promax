const mongoose = require('mongoose');
const { generateTransactionId } = require('../functions/id');

const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'VND' },
  payment_method: { type: String, required: true },
  status: { type: String, default: 'pending' },
  transaction_id: { type: String, unique: true, sparse: true },
  gateway_response: { type: String, default: null },
}, { 
  // Tự động tạo và cập nhật created_at, updated_at
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

const Payment = mongoose.model('Payment', paymentSchema);

// --- CÁC HÀM LOGIC (Export để Controller sử dụng) ---

exports.listPayments = async (filters = {}) => {
  let query = {};
  if (filters.user_id) query.user_id = filters.user_id;
  if (filters.order_id) query.order_id = filters.order_id;
  if (filters.status) query.status = filters.status;
  if (filters.payment_method) query.payment_method = filters.payment_method;

  return await Payment.find(query).sort({ created_at: -1 });
};

exports.findById = async (id) => {
  return await Payment.findById(id);
};

exports.createPayment = async (payload) => {
  const transactionId = payload.transaction_id || generateTransactionId();
  
  const newPayment = new Payment({
    ...payload,
    transaction_id: transactionId,
    amount: Number(payload.amount)
  });

  return await newPayment.save();
};

exports.updatePaymentStatus = async (id, status, gatewayResponse) => {
  return await Payment.findByIdAndUpdate(
    id,
    { $set: { status, gateway_response: gatewayResponse || null } },
    { new: true }
  );
};

exports.deletePayment = async (id) => {
  const result = await Payment.findByIdAndDelete(id);
  return !!result;
};

// Export model nếu cần dùng trực tiếp ở nơi khác
exports.PaymentModel = Payment;