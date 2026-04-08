const PaymentModel = require('../models/paymentModel');
const axios = require('axios');
const { PayOS } = require('@payos/node');

// 1. KHỞI TẠO CHUẨN SDK MỚI (Dùng Object {})
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

// ========================================================
// 🚀 HÀM 1: TẠO MÃ VIETQR (Dùng order_code số nguyên)
// ========================================================
exports.createPayOSPayment = async (req, res) => {
  const { orderId, amount, userId } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ success: false, message: 'Thiếu orderId hoặc amount' });
  }

  try {
    const orderCode = Number(String(Date.now()).slice(-9));

    // 1. Lưu DB
    await PaymentModel.createPayment({
      order_id: orderId,      
      order_code: orderCode,  
      user_id: userId || 'GUEST',
      amount: Number(amount),
      payment_method: 'VIETQR_PAYOS',
      status: 'pending'
    });

    const requestData = {
      orderCode: orderCode,
      amount: Number(amount),
      description: `Thanh toan DH ${orderCode}`.substring(0, 25),
      returnUrl: 'http://localhost:5173/payment-success',
      cancelUrl: 'http://localhost:5173/payment-cancel'
    };

    const paymentLink = await payos.paymentRequests.create(requestData);

    res.status(200).json({
      success: true,
      qrCodeData: paymentLink.qrCode, 
      paymentUrl: paymentLink.checkoutUrl,
      orderCode: orderCode
    });

  } catch (error) {
    console.error("❌ Lỗi PayOS Create:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// 🔔 HÀM 2: WEBHOOK (Tìm kiếm bằng order_code)
// ========================================================
exports.payosWebhook = async (req, res) => {
  try {
    const webhookBody = req.body;

    // Bỏ qua nếu là request Test từ giao diện cài đặt PayOS
    if (webhookBody.data && webhookBody.data.description === 'Ma test giao dich') {
        return res.status(200).json({ success: true });
    }

    const webhookDataVerified = payos.webhooks.verify(webhookBody);
    
    // Lấy orderCode từ data đã được verify
    const orderCode = webhookDataVerified.orderCode || webhookBody.data.orderCode;
    const code = webhookBody.code;

    if (code === '00' || webhookBody.desc === 'success') {
      const payments = await PaymentModel.listPayments({ order_code: orderCode });
      const payment = (payments && payments.length > 0) ? payments[0] : null;

      if (payment && payment.status !== 'COMPLETED') {
        await PaymentModel.updatePaymentStatus(payment._id, 'COMPLETED', JSON.stringify(webhookDataVerified));

        try {
          // Báo cho Order Service chốt đơn
          await axios.put(`https://tmdt-promax-order-service.onrender.com/api/orders/${payment.order_id}/status`, { 
            status: 'processing',
            payment_status: 'paid',
            paid_at: new Date().toISOString()
          });
          console.log(`✅ Đã chốt đơn hàng: ${payment.order_id}`);
        } catch (err) {
          console.error("❌ Lỗi gọi Order Service:", err.message);
        }

        // Bắn Socket cho Frontend nhảy trang
        const io = req.app.get('socketio');
        if (io) {
          io.to(`order_${payment.order_id}`).emit('payment-success', { orderId: payment.order_id });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi Webhook:", err.message);
    return res.status(400).json({ success: false });
  }
};
// ========================================================
// CÁC HÀM CŨ GIỮ NGUYÊN BÊN DƯỚI (Không đụng chạm)
// ========================================================
// ==========================================
// CÁC HÀM QUẢN LÝ CƠ BẢN (TRÁNH LỖI UNDEFINED)
// ==========================================

exports.healthCheck = (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Payment Service' });
};

exports.listPayments = async (req, res) => {
  try {
      const payments = await PaymentModel.listPayments(req.query);
      res.status(200).json({ success: true, data: payments });
  } catch (err) {
      res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
      const payment = await PaymentModel.findById(req.params.id);
      if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: payment });
  } catch (err) {
      res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
      const newPayment = await PaymentModel.createPayment(req.body);
      res.status(201).json({ success: true, data: newPayment });
  } catch (err) {
      res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
      const { status, gatewayResponse } = req.body;
      const updated = await PaymentModel.updatePaymentStatus(req.params.id, status, gatewayResponse);
      res.status(200).json({ success: true, data: updated });
  } catch (err) {
      res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
      const success = await PaymentModel.deletePayment(req.params.id);
      res.status(200).json({ success });
  } catch (err) {
      res.status(500).json({ success: false, message: err.message });
  }
};