// staffController.js
const { Staff } = require('../models/staffModel');
const { deleteOldAvatar } = require('../functions/upload');
const { hashPassword } = require('../functions/password');
// const  UserModel  = require('../../user-service/models/userModel');
const axios = require('axios');
exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'staff-service',
    timestamp: new Date().toISOString()
  });
};

/**
 * Lấy danh sách nhân viên (phân trang, lọc)
 * GET /api/staff
 */
exports.listStaff = async (req, res) => {
  try {
    const result = await Staff.listStaff(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('List staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách nhân viên',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin một nhân viên theo id (number)
 * GET /api/staff/:id
 */
exports.getStaffById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID nhân viên không hợp lệ'
      });
    }

    const staff = await Staff.findOne({ id });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    res.json({
      success: true,
      data: staff.toObject() // hoặc dùng lean() nếu muốn plain object
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin nhân viên',
      error: error.message
    });
  }
};

/**
 * Tạo nhân viên mới
 * POST /api/staff
 * body: {
 *   user_id: number (bắt buộc),
 *   full_name: string (bắt buộc),
 *   email?: string,
 *   phone?: string,
 *   hire_date?: string | Date,
 *   notes?: string
 * }
 */
// exports.createStaff = async (req, res) => {
//   try {
//     const { username, full_name, email, phone, hire_date, notes } = req.body;

//     if (!username || !full_name || !email) {
//       return res.status(400).json({
//         success: false,
//         message: 'username, full_name và email là bắt buộc'
//       });
//     }

//     // const userIdNumber = Number(user_id);
//     // const cleanEmail = email ? String(email).toLowerCase().trim() : null;

//     // // ===== kiểm tra user_id đã tồn tại chưa =====
//     // const existUserId = await Staff.findOne({ user_id: userIdNumber });

//     // if (existUserId) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'user_id đã tồn tại'
//     //   });
//     // }

//     // // ===== kiểm tra email đã tồn tại chưa =====
//     // if (cleanEmail) {
//     //   const existEmail = await Staff.findOne({ email: cleanEmail });

//     //   if (existEmail) {
//     //     return res.status(400).json({
//     //       success: false,
//     //       message: 'email đã tồn tại'
//     //     });
//     //   }
//     // }

//     const staffData = {
//       user_id: userIdNumber,
//       full_name: String(full_name).trim(),
//       email: cleanEmail || undefined,
//       phone: phone ? String(phone).trim() : undefined,
//       hire_date: hire_date ? new Date(hire_date) : undefined,
//       notes: notes ? String(notes).trim() : undefined
//     };

//     const newStaff = await Staff.createStaff(staffData);

//     res.status(201).json({
//       success: true,
//       message: 'Tạo nhân viên mới thành công',
//       data: newStaff
//     });

//   } catch (error) {
//     console.error('Create staff error:', error);

//     res.status(500).json({
//       success: false,
//       message: 'Không thể tạo nhân viên',
//       error: error.message
//     });
//   }
// };


/**
 * Tạo nhân viên mới (tạo User trước → rồi tạo Staff)
 * POST /api/staff
 * body: {
 *   username: string (bắt buộc, unique),
 *   email: string (bắt buộc, unique),
 *   password: string (bắt buộc, sẽ được hash),
 *   full_name: string (bắt buộc),
 *   phone?: string,
 *   hire_date?: string | Date,
 *   notes?: string,
 *   avatar_url?: string   // nếu có sẵn từ trước (ít dùng)
 * }
 */
exports.createStaff = async (req, res) => {
  try {
    const {
      username,
      email,
      full_name,
      phone,
      hire_date,
      notes,
      avatar_url,
    } = req.body;

    // 1. Validate bắt buộc
    if (!username || !email || !full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'thiếu thông tin bắt buộc',
      });
    }

    // // 2. Kiểm tra trùng username / email trước khi tạo (tăng trải nghiệm người dùng)
    // const existingEmail = await UserModel.findByEmail(req.body.email);
    // if (existingEmail) {
    //   return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    // }

    // const existingUsername = await UserModel.findByUsername(req.body.username);
    // if (existingUsername) {
    //   return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
    // }
    
    // 3. Hash password
    // const password = "asdz123456"; // Mật khẩu mặc định cho nhân viên mới (có thể thay đổi sau)
    // const password_hash = await hashPassword(password);

    // 4. Tạo User với role = 'staff'
    // const user = await UserModel.createUser({
    //   username: req.body.username,
    //   email: req.body.email,
    //   password_hash,
    //   full_name: req.body.full_name,
    //   phone: req.body.phone,
    //   avatar_url: req.body.avatar_url,
    //   role: 'staff',
    //   status: 'active'
    // });
    let data = {} ;
    try {
      const response = await axios.post('http://localhost:3001/api/auth/staff', {
        username,
        email,
        phone,
        full_name,
        phone,
        avatar_url,
      });
      console.log('Response from user-service:', response.data);
      if (!response.data.success) {
        return res.status(400).json({
          success: false,
          message: 'Không thể tạo tài khoản nhân viên',
          error: response.data.message || 'Unknown error from user-service'
        });
      }
      data = response.data.data; // chứa user vừa tạo từ user-service
    } catch (error) {
      console.error('Error calling user-service:', error.response ? error.response.data : error.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo tài khoản nhân viên',
        error: error.response ? error.response.data : error.message
      });
    }
    

    // 5. Tạo bản ghi Staff, liên kết với user.id vừa tạo
    const staffData = {
      user_id: data.id,     // ← lấy từ user vừa tạo
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
      hire_date: hire_date ? new Date(hire_date) : undefined,
      notes: notes ? String(notes).trim() : undefined,
    };

    const newStaff = await Staff.createStaff(staffData);

    // 6. Trả về thông tin (không trả password_hash)
    // Gửi notification
    // try {
    //   console.log('[DEBUG] Gọi notification-service để gửi email...');

    //   const notifyRes = await axios.post(
    //     'http://localhost:3005/api/notifications',
    //     {
    //       user_id: user.id,
    //       notification_type: 'create_staff_account',
    //       email_user: user.email,
    //       data: {
    //         password: tempPassword
    //       }
    //     }
    //   );

    //   console.log(
    //     '[DEBUG] Notification gửi THÀNH CÔNG',
    //     'Status:',
    //     notifyRes.status
    //   );

    // } catch (notifyError) {
    //   console.error('[LỖI] Gửi notification THẤT BẠI:', {
    //     message: notifyError.message,
    //     status: notifyError.response?.status,
    //     data: notifyError.response?.data
    //   });
    //   // Không làm fail request
    // }
    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản nhân viên thành công',
      data: newStaff,
    });

  } catch (error) {
    console.error('Create staff (with user) error:', error);

    // Xử lý lỗi trùng lặp từ MongoDB (nếu pre-save không bắt được)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} đã tồn tại`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Không thể tạo nhân viên',
      error: error.message,
    });
  }
};

/**
 * Cập nhật thông tin nhân viên
 * PUT /api/staff/:id
 */
exports.updateStaff = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID nhân viên không hợp lệ'
      });
    }

    const updateData = {};
    const allowedFields = ['full_name', 'email', 'phone', 'hire_date', 'status', 'notes'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'email' && req.body[field]) {
          updateData[field] = String(req.body[field]).toLowerCase().trim();
        } else if (field === 'hire_date' && req.body[field]) {
          updateData[field] = new Date(req.body[field]);
        } else if (field === 'status' && ['active', 'suspended', 'resigned'].includes(req.body[field])) {
          updateData[field] = req.body[field];
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu nào để cập nhật'
      });
    }

    const updatedStaff = await Staff.updateStaff(id, updateData);

    res.json({
      success: true,
      message: 'Cập nhật thông tin nhân viên thành công',
      data: updatedStaff
    });
  } catch (error) {
    console.error('Update staff error:', error);
    const status = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể cập nhật nhân viên',
      error: error.message
    });
  }
};

/**
 * Xóa mềm (chuyển status → resigned)
 * DELETE /api/staff/:id
 */
exports.deleteStaff = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID nhân viên không hợp lệ'
      });
    }

    const result = await Staff.deleteStaff(id);
    res.json(result);
  } catch (error) {
    console.error('Delete staff error:', error);
    const status = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể xóa nhân viên',
      error: error.message
    });
  }
};

/**
 * Xóa cứng (hard delete) - dùng rất cẩn thận!
 * DELETE /api/staff/:id/hard
 */
exports.hardDeleteStaff = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID nhân viên không hợp lệ'
      });
    }

    const result = await Staff.hardDeleteStaff(id);
    res.json(result);
  } catch (error) {
    console.error('Hard delete staff error:', error);
    const status = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể xóa vĩnh viễn nhân viên',
      error: error.message
    });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const staffId = Number(req.params.id);

    if (isNaN(staffId)) {
      return res.status(400).json({
        success: false,
        message: 'ID nhân viên không hợp lệ'
      });
    }

    const staff = await Staff.findOne({ id: staffId });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file avatar'
      });
    }

    const newAvatarUrl = `/uploads/${req.file.filename}`;

    // XÓA AVATAR CŨ
    if (staff.avatar_url) {
      deleteOldAvatar(staff.avatar_url);
    }

    // CẬP NHẬT DATABASE
    staff.avatar_url = newAvatarUrl;
    await staff.save();

    res.json({
      success: true,
      message: 'Cập nhật avatar thành công',
      data: staff
    });

  } catch (error) {
    console.error('Update avatar error:', error);

    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật avatar',
      error: error.message
    });
  }
};