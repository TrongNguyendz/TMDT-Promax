const jwt = require('jsonwebtoken');

const UserModel = require('../models/userModel');

const { hashPassword, comparePassword, generateTempPassword } = require('../functions/password');
const { verifyEmailExists } = require('../functions/checkemail');

const axios = require('axios');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'replace-me', { expiresIn: '24h' });

// ==================== HELPER: GỬI NOTIFICATION KHÔNG BLOCK ====================
const sendNotificationAsync = (payload) => {
  axios.post('http://localhost:3005/api/notifications', payload)
    .then((res) => {
      console.log(`[Notification] Gửi thành công - Type: ${payload.notification_type} | Status: ${res.status}`);
    })
    .catch((err) => {
      console.error(`[Notification] Gửi thất bại - Type: ${payload.notification_type}`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data?.message || err.response?.data
      });
    });
};


exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'staff-service',
    timestamp: new Date().toISOString()
  });
};
// ====================== REGISTER ======================
exports.register = async (req, res) => {
  const requiredFields = ['username', 'email', 'password', 'full_name'];
  const missing = requiredFields.filter((field) => !req.body[field]);
  const emailCheck = await verifyEmailExists(req.body.email);

  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Thiếu các trường bắt buộc: ${missing.join(', ')}`
    });
  }

  if (!emailCheck.valid) {
    return res.status(400).json({
      success: false,
      message: emailCheck.reason
    });
  }

  try {
    const existingEmail = await UserModel.findByEmail(req.body.email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const existingUsername = await UserModel.findByUsername(req.body.username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
    }

    const password_hash = await hashPassword(req.body.password);

    // Tạo user với status inactive
    const user = await UserModel.createUser({
      username: req.body.username,
      email: req.body.email,
      password_hash,
      full_name: req.body.full_name,
      phone: req.body.phone || null,
      avatar_url: req.body.avatar_url || null,
      role: 'customer',
      status: 'inactive'
    });

    // Tạo OTP 6 số
    const otp = UserModel.generateOTP();
    console.log(`[OTP] Mã OTP cho user_id=${user.id}: ${otp}`);

    // Lưu OTP vào DB (hết hạn 15 phút)
    await UserModel.setVerificationOTP(user.id, otp, 15);

    const sanitized = UserModel.sanitizeUser(user);

    // Gửi OTP không block response
    sendNotificationAsync({
      user_id: user.id,
      notification_type: 'email_verification_otp',
      email_user: user.email,
      data: {
        otp: otp,
        full_name: user.full_name,
        expires_in: 15
      }
    });

    // Trả response ngay lập tức cho Frontend
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản.',
      data: { user: sanitized }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể đăng ký người dùng',
      error: error.message
    });
  }
};

// ====================== VERIFY OTP ======================
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Vui lòng cung cấp email và mã OTP' 
    });
  }

  try {
    const user = await UserModel.verifyOTP(email, otp);

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã OTP không đúng hoặc đã hết hạn' 
      });
    }

    const sanitized = UserModel.sanitizeUser(user);

    res.json({
      success: true,
      message: 'Tài khoản đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ.',
      data: { user: sanitized }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi kích hoạt tài khoản',
      error: error.message
    });
  }
};

// ====================== RESEND OTP ======================
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email' });
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'Nếu email tồn tại, chúng tôi đã gửi lại mã OTP.' 
      });
    }

    if (user.status === 'active') {
      return res.json({ success: true, message: 'Tài khoản này đã được kích hoạt.' });
    }

    const result = await UserModel.resendOTP(user.id);
    const otp = result?.otp;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Không thể gửi lại OTP.' });
    }

    // Gửi OTP mới không block
    sendNotificationAsync({
      user_id: user.id,
      notification_type: 'email_verification_otp',
      email_user: user.email,
      data: {
        otp: otp,
        full_name: user.full_name,
        expires_in: 15
      }
    });

    res.json({
      success: true,
      message: 'Đã gửi lại mã OTP. Vui lòng kiểm tra email (và thư rác).'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi gửi lại OTP' });
  }
};

// ====================== LOGIN ======================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
    }

    let isValid = await comparePassword(password, user.password_hash);

    // Kiểm tra mật khẩu tạm (temp_password)
    if (!isValid && user.temp_password && user.temp_password_expires) {
      const now = new Date();
      const expires = new Date(user.temp_password_expires);

      if (now < expires && password === user.temp_password) {
        isValid = true;
        await UserModel.clearTempPassword(user.id || user._id);

        const sanitized = UserModel.sanitizeUser(user);
        const userId = user.id || user._id;

        const token = signToken({ id: userId, email: sanitized.email, role: sanitized.role });

        return res.status(200).json({
          success: true,
          message: 'Đăng nhập thành công bằng mật khẩu phụ. Vui lòng đổi mật khẩu mới ngay!',
          data: { 
            user: { ...sanitized, id: userId },
            token,
            require_password_change: true  
          }
        });
      }
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhập mã OTP để kích hoạt.'
      });
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Đăng nhập thành công
    await UserModel.clearTempPassword(user.id || user._id); 

    const sanitized = UserModel.sanitizeUser(user);
    const userId = user.id || user._id;

    const token = signToken({ id: userId, email: sanitized.email, role: sanitized.role });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { 
        user: { ...sanitized, id: userId },
        token 
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: 'Không thể đăng nhập',
      error: error.message
    });
  }
};

// ====================== FORGOT PASSWORD ======================
exports.forgotPassword = async (req, res) => {
  console.log('========== BẮT ĐẦU FORGOT PASSWORD ==========');
  console.log('[DEBUG] Body nhận được từ client:', req.body);

  const { email } = req.body;

  if (!email) {
    console.warn('[CẢNH BÁO] Không có email trong request');
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp email'
    });
  }

  try {
    const user = await UserModel.findByEmailWithTemp(email);
    console.log(
      '[DEBUG] Kết quả tìm user:',
      user ? `TÌM THẤY (user_id=${user.id})` : 'KHÔNG TÌM THẤY'
    );

    if (!user) {
      console.log('[BẢO MẬT] Email không tồn tại → trả response chung');
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, mật khẩu phụ đã được gửi'
      });
    }

    const tempPassword = generateTempPassword(6);
    console.log('[DEBUG] Mật khẩu phụ được tạo:', tempPassword);

    await UserModel.setTempPassword(user.id, tempPassword, 30);
    console.log('[DEBUG] Lưu mật khẩu phụ vào DB THÀNH CÔNG');

    // Gửi notification không block
    sendNotificationAsync({
      user_id: user.id,
      notification_type: 'password_reset',
      email_user: user.email,
      data: {
        password: tempPassword
      }
    });

    console.log('[DEBUG] Hoàn tất luồng forgot password');
    console.log('========== KẾT THÚC FORGOT PASSWORD ==========');

    res.json({
      success: true,
      message: 'Nếu email tồn tại, mật khẩu phụ đã được gửi'
    });

  } catch (error) {
    console.error('[LỖI NGHIÊM TRỌNG] Forgot password bị lỗi:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra, vui lòng thử lại sau'
    });
  }
};

// ====================== CREATE STAFF ======================
exports.createStaff = async (req, res) => {
  console.log('========== BẮT ĐẦU CREATE STAFF ==========');
  console.log('[DEBUG] Body nhận được từ client:', req.body);

  const requiredFields = ['username', 'email', 'full_name'];
  const missing = requiredFields.filter((field) => !req.body[field]);
  const emailCheck = await verifyEmailExists(req.body.email);

  if (!emailCheck.valid) {
    return res.status(400).json({
      success: false,
      message: emailCheck.reason
    });
  }

  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Thiếu các trường bắt buộc: ${missing.join(', ')}`
    });
  }

  try {
    const existingEmail = await UserModel.findByEmail(req.body.email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const existingUsername = await UserModel.findByUsername(req.body.username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
    }

    const tempPassword = "12345678";
    console.log('[DEBUG] Mật khẩu tạm được tạo:', tempPassword);

    const password_hash = await hashPassword(tempPassword);

    const staff = await UserModel.createUser({
      username: req.body.username,
      email: req.body.email,
      password_hash,
      full_name: req.body.full_name,
      phone: req.body.phone || null,
      avatar_url: req.body.avatar_url || null,
      role: 'staff',
      status: 'active'
    });

    console.log('[DEBUG] Staff đã được tạo:', staff.id);

    // Gửi notification không block
    sendNotificationAsync({
      user_id: staff.id,
      notification_type: 'staff_created',
      email_user: staff.email,
      data: {
        password: tempPassword
      }
    });

    const sanitized = UserModel.sanitizeUser(staff);

    res.status(201).json({
      success: true,
      message: 'Tạo nhân viên thành công',
      data: sanitized
    });

  } catch (error) {
    console.error('[LỖI NGHIÊM TRỌNG] Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo nhân viên',
      error: error.message
    });
  }
};