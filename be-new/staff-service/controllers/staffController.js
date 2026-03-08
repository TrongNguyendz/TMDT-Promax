// staffController.js
const { Staff, sanitizeStaff } = require('../models/staffModel');
const UserModel = require('../../user-service/models/userModel'); // để kiểm tra/tạo user nếu cần
const { hashPassword } = require('../functions/password');
// Nếu bạn có hàm upload avatar tương tự user thì import ở đây
const { deleteOldAvatar } = require('../functions/upload');

exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'staff-service',
    timestamp: new Date().toISOString()
  });
};

/**
 * Lấy danh sách nhân viên (có phân trang, lọc)
 * GET /api/staff
 */
exports.listStaff = async (req, res) => {
  try {
    const result = await Staff.listStaff(req.query);
    res.json({
      success: true,
      data: result.data,           // đã được sanitize
      pagination: result.pagination
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách nhân viên',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin một nhân viên theo ID
 * GET /api/staff/:id
 */
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    res.json({
      success: true,
      data: sanitizeStaff(staff)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin nhân viên',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin nhân viên theo staff_code
 * GET /api/staff/code/:code
 */
exports.getStaffByCode = async (req, res) => {
  try {
    const staff = await Staff.findByStaffCode(req.params.code);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên với mã này'
      });
    }

    res.json({
      success: true,
      data: sanitizeStaff(staff)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm nhân viên theo mã',
      error: error.message
    });
  }
};

/**
 * Tạo nhân viên mới
 * POST /api/staff
 * body: {
 *   user_id (bắt buộc),
 *   staff_code,
 *   full_name,
 *   position_id?,
 *   email?,
 *   phone?,
 *   hire_date?,
 *   notes?
 * }
 */
exports.createStaff = async (req, res) => {
  try {
    // Kiểm tra user_id tồn tại
    // const user = await UserModel.findById(req.body.user_id);
    // if (!user) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'user_id không tồn tại'
    //   });
    // }

    const staffData = {
      user_id: req.body.user_id,
      staff_code: req.body.staff_code,
      full_name: req.body.full_name,
      position_id: req.body.position_id,
      email: req.body.email,
      phone: req.body.phone,
      hire_date: req.body.hire_date,
      notes: req.body.notes,
      status: req.body.status || 'active'
    };

    const newStaff = await Staff.createStaff(staffData);

    res.status(201).json({
      success: true,
      message: 'Tạo nhân viên mới thành công',
      data: newStaff
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Không thể tạo nhân viên',
      error: error.message
    });
  }
};

/**
 * Cập nhật thông tin nhân viên
 * PUT /api/staff/:id
 */
exports.updateStaff = async (req, res) => {
  try {
    const updateData = {
      full_name: req.body.full_name,
      position_id: req.body.position_id,
      email: req.body.email,
      phone: req.body.phone,
      hire_date: req.body.hire_date,
      status: req.body.status,
      notes: req.body.notes,
      avatar_url: req.body.avatar_url
    };

    const updatedStaff = await Staff.updateStaff(req.params.id, updateData);

    res.json({
      success: true,
      message: 'Cập nhật thông tin nhân viên thành công',
      data: updatedStaff
    });
  } catch (error) {
    console.error(error);
    const status = error.message.includes('không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể cập nhật nhân viên',
      error: error.message
    });
  }
};

/**
 * Xóa mềm nhân viên (chuyển status → resigned)
 * DELETE /api/staff/:id
 */
exports.deleteStaff = async (req, res) => {
  try {
    const result = await Staff.deleteStaff(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
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
    const result = await Staff.hardDeleteStaff(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    const status = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể xóa vĩnh viễn nhân viên',
      error: error.message
    });
  }
};

/**
 * (Tùy chọn) Cập nhật avatar nhân viên - tương tự user
 * PUT /api/staff/:id/avatar
 */
exports.updateAvatar = async (req, res) => {
  try {
    const staffId = req.params.id;
    const staff = await Staff.findById(staffId);
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

    // Xóa avatar cũ nếu có (tùy chọn)
    if (staff.avatar_url) {
      deleteOldAvatar(staff.avatar_url);
    }

    const updatedStaff = await Staff.updateStaff(staffId, { avatar_url: newAvatarUrl });

    res.json({
      success: true,
      message: 'Cập nhật avatar nhân viên thành công',
      data: updatedStaff
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật avatar',
      error: error.message
    });
  }
};
