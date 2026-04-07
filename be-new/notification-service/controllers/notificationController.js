const NotificationModel = require('../models/notificationModel');


const { createAndSendInvoice,sendPasswordEmail,sendActivationOTP } = require('../functions/CreatAndSendInvoice');


exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
};

exports.listNotifications = async (req, res) => {
  try {
    const result = await NotificationModel.listNotifications(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: 'Không thể lấy danh sách thông báo',

      error: error.message
    });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông báo',
      error: error.message
    });
  }
};


exports.createNotification = async (req, res) => {
  const required = ['user_id', 'notification_type', 'email_user'];
  const missing = required.filter(field => !req.body[field]);

  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Thiếu các trường bắt buộc: ${missing.join(', ')}`
    });
  }

  const { user_id, notification_type, email_user, data } = req.body;

  try {
    // BƯỚC 1: Gửi email (PDF hoặc mật khẩu) - KHÔNG ĐỢI KẾT QUẢ LƯU DB TRƯỚC
    if (notification_type === 'invoice') {
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu dữ liệu hóa đơn (data) để tạo PDF'
        });
      }

      await createAndSendInvoice(data); // Hàm này tự tạo PDF + gửi email
      console.log('✅ Đã gửi hóa đơn PDF thành công đến:', email_user);
    } 
    else if (notification_type === 'password_reset') {
      const password = req.body.password || data?.password;
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu mật khẩu để gửi email đặt lại'
        });
      }

      await sendPasswordEmail(email_user, password);
      console.log('✅ Đã gửi email đặt lại mật khẩu đến:', email_user);
    }
    else if (notification_type === 'email_verification_otp') {
      const otp = req.body.otp || data?.otp;
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu OTP để gửi email xác thực'
        });
      }

      await sendActivationOTP(email_user, otp);
      console.log('✅ Đã gửi OTP xác thực email đến:', email_user);
    }

    else if (notification_type === 'staff_created') {
      const password = req.body.password || data?.password;
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu mật khẩu để gửi email'
        });
      }

      await sendPasswordEmail(email_user, password);
      console.log('✅ Đã gửi mật khẩu đến :', email_user);
    }
    // BƯỚC 2: Lưu record vào DB (chỉ lưu thông tin cơ bản - KHÔNG lưu data)
    const payloadForDB = {
      user_id,
      notification_type,
      email_user
    };

    const notification = await NotificationModel.createNotification(payloadForDB);
    console.log('📌 Đã lưu lịch sử thông báo vào DB:', notification.id);

    res.status(201).json({
      success: true,
      message: 'Gửi thông báo và lưu lịch sử thành công',
      data: notification
    });

  } catch (error) {
    console.error('Lỗi trong createNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể gửi thông báo',
      error: error.message
    });
  }
};

// Tùy chọn delete

exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await NotificationModel.deleteNotification(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    res.json({ success: true, message: 'Đã xóa lịch sử thông báo' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa thông báo',
      error: error.message
    });
  }

};

