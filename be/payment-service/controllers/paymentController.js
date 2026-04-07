const PaymentModel = require('../models/paymentModel');

const moment = require('moment');
const qs = require('qs');
const crypto = require("crypto");
const axios = require('axios'); // Để gọi sang Order Service
const vnpayConfig = require('../config/vnpay'); // Đảm bảo bạn đã tạo file này
const { sortObject } = require('../functions/vnpayUtils'); // Đảm bảo bạn đã tạo file này


exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
};


// --- CHỨC NĂNG VNPAY MỚI ---

/**
 * Tạo URL thanh toán VNPAY (Dùng để gen mã QR ở Frontend)
 */
exports.createVnpayPayment = async (req, res) => {
  const { orderId, amount, userId, order_info } = req.body;
  
  console.log("Dữ liệu nhận được từ Gateway:", req.body);

  if (!orderId || !amount) {
    return res.status(400).json({ success: false, message: 'Thiếu orderId hoặc amount' });
  }

   const dataToSave = {
            order_id: orderId,
            user_id: userId || 'GUEST', // Dùng GUEST nếu userId rỗng
            amount: amount,
            payment_method: 'vnpay',
            status: 'PENDING'
        };

  try {
    // 1. Lưu thông tin thanh toán tạm thời vào Database của Payment Service
    await PaymentModel.createPayment({
      order_id: orderId,
      user_id: userId || 'GUEST',
      amount,
      payment_method: 'VNPAY_QR',
      status: 'PENDING'
    });
    console.log("DỮ LIỆU SẮP LƯU VÀO DB:", dataToSave); 

    // 2. Cấu hình tham số gửi sang VNPAY
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let vnp_Params = {
      'vnp_Version': '2.1.0',
      'vnp_Command': 'pay',
      'vnp_TmnCode': vnpayConfig.vnp_TmnCode,
      'vnp_Locale': 'vn',
      'vnp_CurrCode': 'VND',
      'vnp_TxnRef': orderId, // Mã đơn hàng của bạn
      'vnp_OrderInfo': order_info || `Thanh toan don hang ${orderId}`,
      'vnp_OrderType': 'other',
      'vnp_Amount': amount * 100, // VNPAY đơn vị là xu
      'vnp_ReturnUrl': vnpayConfig.vnp_ReturnUrl,
      'vnp_IpAddr': ipAddr,
      'vnp_CreateDate': createDate
    };

    // 3. Sắp xếp và tạo chữ ký băm
    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;

    // 4. Tạo URL cuối cùng
    const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    res.status(200).json({
      success: true,
      message: 'Tạo URL thanh toán thành công',
      paymentUrl // Trả về link này để Frontend tạo QR
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Xử lý IPN (VNPAY gọi trực tiếp cho Backend để cập nhật trạng thái)
 */
exports.vnpayIpn = async (req, res) => {
    console.log("===> ĐÃ NHẬN ĐƯỢC REQUEST IPN TỪ VNPAY! <===");
    
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        // Lưu lại hash để kiểm tra, sau đó xóa khỏi params để chuẩn bị hash lại
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // 1. Sắp xếp và hash dữ liệu để kiểm tra tính toàn vẹn (Checksum)
        vnp_Params = sortObject(vnp_Params);
        let secretKey = vnpayConfig.vnp_HashSecret;
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];
            const vnpAmount = vnp_Params['vnp_Amount']; // Số tiền VNPAY trả về (đã nhân 100)

            // 2. Kiểm tra đơn hàng trong Database của Payment Service
            const payments = await PaymentModel.listPayments({ order_id: orderId });
            const payment = (payments && payments.length > 0) ? payments[0] : null;

            if (!payment) {
                console.log(`❌ Không tìm thấy đơn hàng: ${orderId}`);
                return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }

            // 3. Kiểm tra số tiền (Rất quan trọng để tránh hacker giả mạo số tiền)
            // Lưu ý: VNPAY trả về amount * 100
            const checkAmount = payment.amount * 100;
            if (checkAmount !== parseInt(vnpAmount)) {
                console.log(`❌ Sai lệch số tiền! DB: ${checkAmount}, VNPAY: ${vnpAmount}`);
                return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
            }

            // 4. Kiểm tra trạng thái đơn hàng (Tránh xử lý lặp lại nếu đã COMPLETED)
            if (payment.status === 'COMPLETED') {
                console.log(`⚠️ Đơn hàng ${orderId} đã được xử lý trước đó rồi.`);
                return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            // 5. Cập nhật kết quả thanh toán
            if (rspCode === '00') {
                // --- TRƯỜNG HỢP: THANH TOÁN THÀNH CÔNG ---
                console.log(`✅ Xác nhận thanh toán thành công đơn hàng: ${orderId}`);

                // A. Cập nhật trạng thái tại Payment Service DB
                await PaymentModel.updatePaymentStatus(payment.id, 'COMPLETED', JSON.stringify(vnp_Params));

                // B. Gọi sang Order Service để cập nhật trạng thái đơn hàng (PAID)
                // Lưu ý: Sử dụng localhost:3003 hoặc qua API Gateway 3000 tùy kiến trúc của bạn
                try {
                    await axios.put(`http://localhost:3003/api/orders/${orderId}/status`, { 
                        status: 'processing',
                        payment_status: 'paid',        // ← THÊM DÒNG NÀY
                        paid_at: new Date().toISOString()  // Tùy chọn: thêm thời gian thanh toán
                    });
                    console.log(`   -> Đã cập nhật Order Service: ${orderId} sang PAID`);
                } catch (orderErr) {
                    console.error("   -> Lỗi khi gọi Order Service:", orderErr.message);
                }

                // C. PHÁT TÍN HIỆU SOCKET.IO ĐỂ WEB TỰ ĐỘNG NHẢY TRANG (QUYẾT ĐỊNH UX)
                const io = req.app.get('socketio');
                if (io) {
                    const roomName = `order_${orderId}`;
                    console.log(`📢 Bắn tín hiệu Socket thành công tới Room: ${roomName}`);
                    io.to(roomName).emit('payment-success', {
                        orderId: orderId,
                        status: 'PAID',
                        message: 'Payment verified by VNPAY IPN'
                    });
                } else {
                    console.log("⚠️ Không tìm thấy đối tượng Socket.io trong App!");
                }

            } else {
                // --- TRƯỜNG HỢP: THANH TOÁN THẤT BẠI ---
                console.log(`❌ Giao dịch VNPAY thất bại (RspCode: ${rspCode})`);
                await PaymentModel.updatePaymentStatus(payment.id, 'FAILED', JSON.stringify(vnp_Params));
            }

            // PHẢN HỒI CHO VNPAY (Bắt buộc phải trả về RspCode: 00 để VNPAY ngừng gọi lại)
            return res.status(200).json({ RspCode: '00', Message: 'Success' });

        } else {
            // Trường hợp sai chữ ký (Checksum fail)
            console.log(`❌ Sai chữ ký Checksum!`);
            return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
        }
    } catch (err) {
        console.error("💥 LỖI HỆ THỐNG IPN:", err.message);
        // Trả về lỗi 99 cho VNPAY để họ có thể gọi lại sau
        return res.status(200).json({ RspCode: '99', Message: 'Internal Error' });
    }
};

// --- CÁC HÀM CŨ CỦA BẠN (GIỮ NGUYÊN) ---


exports.listPayments = async (req, res) => {
  try {
    const data = await PaymentModel.listPayments(req.query);
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách thanh toán',
      error: error.message
    });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thanh toán',
      error: error.message
    });
  }
};

exports.createPayment = async (req, res) => {

    // Giữ nguyên code tạo payment thủ công của bạn
    const required = ['orderId', 'user_id', 'amount', 'payment_method'];
    const missing = required.filter((field) => !req.body[field] && req.body[field] !== 0);
  
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Thiếu các trường: ${missing.join(', ')}`
      });
    }
  
    try {
      const payment = await PaymentModel.createPayment(req.body);
      res.status(201).json({
        success: true,
        message: 'Khởi tạo thanh toán thành công',
        data: payment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Không thể tạo thanh toán',
        error: error.message
      });
    }

};

exports.updatePaymentStatus = async (req, res) => {
  if (!req.body.status) {
    return res.status(400).json({ success: false, message: 'Thiếu trạng thái mới' });
  }

  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }

    const updated = await PaymentModel.updatePaymentStatus(
      req.params.id,
      req.body.status,
      req.body.gateway_response
    );
    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật thanh toán',
      error: error.message
    });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const deleted = await PaymentModel.deletePayment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }
    res.json({ success: true, message: 'Xóa thanh toán thành công' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa thanh toán',
      error: error.message
    });
  }

};

