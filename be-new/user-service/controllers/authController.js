const jwt = require('jsonwebtoken');

const UserModel = require('../models/userModel');

const { hashPassword, comparePassword,generateTempPassword } = require('../functions/password');
const { verifyEmailExists } = require('../functions/checkemail');

const axios = require('axios');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'replace-me', { expiresIn: '24h' });

exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
};

// exports.register = async (req, res) => {
//   const requiredFields = ['username', 'email', 'password', 'full_name'];
//   const missing = requiredFields.filter((field) => !req.body[field]);
//   const emailCheck = await verifyEmailExists(req.body.email);
//   if (missing.length) {
//     return res.status(400).json({
//       success: false,
//       message: `Thiếu các trường bắt buộc: ${missing.join(', ')}`
//     });
//   }

//   if (!emailCheck.valid) {
//     return res.status(400).json({
//       success: false,
//       message: emailCheck.reason
//     });
//   }
//   try {
//     const existingEmail = await UserModel.findByEmail(req.body.email);
//     if (existingEmail) {
//       return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
//     }

//     const existingUsername = await UserModel.findByUsername(req.body.username);
//     if (existingUsername) {
//       return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
//     }

//     const password_hash = await hashPassword(req.body.password);
//     const user = await UserModel.createUser({
//       username: req.body.username,
//       email: req.body.email,
//       password_hash,
//       full_name: req.body.full_name,
//       phone: req.body.phone,
//       avatar_url: req.body.avatar_url,
//       role: 'customer',
//       status: 'active'
//     });

//     const sanitized = UserModel.sanitizeUser(user);
//     const token = signToken({ id: sanitized.id, email: sanitized.email, role: sanitized.role });

//     res.status(201).json({
//       success: true,
//       message: 'Đăng ký thành công',
//       data: { user: sanitized, token }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Không thể đăng ký người dùng',
//       error: error.message
//     });
//   }
// };

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
      phone: req.body.phone,
      avatar_url: req.body.avatar_url,
      role: 'customer',
      status: 'inactive'
    });

    // Tạo OTP 6 số
    const otp = UserModel.generateOTP();
    console.log(`mã OTP cho user_id=${user.id}:`, otp);

    // Lưu OTP và thời gian hết hạn vào DB
    await UserModel.setVerificationOTP(user.id, otp, 15); // hết hạn 15 phút

    const sanitized = UserModel.sanitizeUser(user);

    // Gửi OTP qua notification service
    try {
      await axios.post('http://localhost:3005/api/notifications', {
        user_id: user.id,
        notification_type: 'email_verification_otp',
        email_user: user.email,
        data: {
          otp: otp,
          full_name: user.full_name,
          expires_in: 15
        }
      });
    } catch (notifyError) {
      console.error('Gửi OTP thất bại:', notifyError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản.',
      data: { 
        user: sanitized,
        // Không trả token ngay
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể đăng ký người dùng',
      error: error.message
    });
  }
};

// Kích hoạt tài khoản bằng OTP
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

// Gửi lại mã OTP
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

    const { user: updatedUser, otp } = await UserModel.resendOTP(user.id) || {};

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Không thể gửi lại OTP.' });
    }

    // Gửi OTP mới
    await axios.post('http://localhost:3005/api/notifications', {
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
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi gửi lại OTP' });
  }
};



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

    // Ưu tiên kiểm tra mật khẩu chính
    let isValid = await comparePassword(password, user.password_hash);

    // Nếu không khớp, thử mật khẩu phụ (nếu còn hạn)
    if (!isValid && user.temp_password && user.temp_password_expires) {
      const now = new Date();
      const expires = new Date(user.temp_password_expires);

      if (now < expires && password === user.temp_password) {
        isValid = true;
        await UserModel.clearTempPassword(user.id || user._id);

        const sanitized = UserModel.sanitizeUser(user);
        const userId = user.id || user._id; // Lấy ID an toàn

        const token = signToken({ id: userId, email: sanitized.email, role: sanitized.role });

        return res.status(200).json({
          success: true,
          message: 'Đăng nhập thành công bằng mật khẩu phụ. Vui lòng đổi mật khẩu mới ngay!',
          data: { 
            user: { ...sanitized, id: userId }, // Ép ID vào để chắc chắn có
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

    // Đăng nhập thành công bình thường
    await UserModel.clearTempPassword(user.id || user._id); 

    const sanitized = UserModel.sanitizeUser(user);
    const userId = user.id || user._id; // Lấy ID an toàn

    const token = signToken({ id: userId, email: sanitized.email, role: sanitized.role });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { 
        user: { ...sanitized, id: userId }, // 👇 Ép ID vào object user trả về Frontend
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
    console.log('[DEBUG] Bắt đầu tìm user theo email:', email);

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

    // Tạo mật khẩu phụ
    const tempPassword = generateTempPassword(6);
    console.log('[DEBUG] Mật khẩu phụ được tạo:', tempPassword);

    // Lưu DB
    console.log('[DEBUG] Đang lưu mật khẩu phụ vào DB...');
    await UserModel.setTempPassword(user.id, tempPassword, 30);
    console.log('[DEBUG] Lưu mật khẩu phụ vào DB THÀNH CÔNG');

    // Gửi notification
    try {
      console.log('[DEBUG] Gọi notification-service để gửi email...');

      const notifyRes = await axios.post(
        'http://localhost:3005/api/notifications',
        {
          user_id: user.id,
          notification_type: 'password_reset',
          email_user: user.email,
          data: {
            password: tempPassword
          }
        }
      );

      console.log(
        '[DEBUG] Notification gửi THÀNH CÔNG',
        'Status:',
        notifyRes.status
      );

    } catch (notifyError) {
      console.error('[LỖI] Gửi notification THẤT BẠI:', {
        message: notifyError.message,
        status: notifyError.response?.status,
        data: notifyError.response?.data
      });
      // Không làm fail request
    }

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
  console.log ('kiểm tra email xong:', emailCheck);
  
  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Thiếu các trường bắt buộc: ${missing.join(', ')}`
    });
  }

  try {
    // kiểm tra email
    const existingEmail = await UserModel.findByEmail(req.body.email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // kiểm tra username
    const existingUsername = await UserModel.findByUsername(req.body.username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username đã tồn tại'
      });
    }

    // tạo mật khẩu tạm
    const tempPassword = "12345678";
    console.log('[DEBUG] Mật khẩu tạm được tạo:', tempPassword);

    // hash mật khẩu
    const password_hash = await hashPassword(tempPassword);

    // tạo staff
    const staff = await UserModel.createUser({
      username: req.body.username,
      email: req.body.email,
      password_hash,
      full_name: req.body.full_name,
      phone: req.body.phone,
      avatar_url: req.body.avatar_url,
      role: 'staff',
      status: 'active'
    });

    console.log('[DEBUG] Staff đã được tạo:', staff.id);

    // gửi notification
    // try {
    //   console.log('[DEBUG] Gọi notification-service');

    //   const notifyRes = await axios.post(
    //     'http://localhost:3005/api/notifications',
    //     {
    //       user_id: staff.id,
    //       notification_type: 'staff_created',
    //       email_user: staff.email,
    //       data: {
    //         password: tempPassword
    //       }
    //     }
    //   );

    //   console.log(
    //     '[DEBUG] Notification gửi thành công',
    //     notifyRes.status
    //   );

    // } catch (notifyError) {
    //   console.error('[LỖI] Gửi notification thất bại:', notifyError.message);
    // }

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