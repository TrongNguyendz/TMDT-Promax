const { Shift } = require('../models/shiftModel');
const { Staff } = require('../models/staffModel'); 

exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'shift-service',
    timestamp: new Date().toISOString()
  });
};

/**
 * GET /api/shifts
 * Danh sách ca làm việc (phân trang + filter)
 */
exports.listShifts = async (req, res) => {
  try {
    const result = await Shift.listShifts(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('List shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách ca làm việc',
      error: error.message
    });
  }
};

/**
 * GET /api/shifts/:id
 */
// exports.getShiftById = async (req, res) => {
//   try {
//     const staff_id = Number(req.params.id);
//     if (isNaN(staff_id)) {
//       return res.status(400).json({ success: false, message: 'ID nhân viên không hợp lệ' });
//     }
//     console.log('Fetching shift for staff_id:', staff_id);
//     const shift = await Shift.findOne({ staff_id });
//     if (!shift) {
//       return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc' });
//     }

//     res.json({ success: true, data: shift.toObject() });
//   } catch (error) {
//     console.error('Get shift error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Không thể lấy thông tin ca',
//       error: error.message
//     });
//   }
// };

// shiftController.js
// exports.getShiftById = async (req, res) => {
//   try {
//     const staffId = Number(req.params.id);
//     if (isNaN(staffId)) {
//       return res.status(400).json({ success: false, message: 'ID nhân viên không hợp lệ' });
//     }

//     console.log('Fetching shifts for staff_id:', staffId);

//     // Đổi findOne → find + sort (mới nhất trước)
//     const shifts = await Shift.find({ staff_id: staffId })
//       .sort({ shift_date: -1, start_time: 1 })   // sắp xếp: ngày mới → cũ, giờ sớm → muộn
//       .lean();  // nhẹ hơn, không cần document mongoose

//     if (shifts.length === 0) {
//       return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc nào cho nhân viên này' });
//     }

//     res.json({ 
//       success: true, 
//       data: shifts,               // giờ là array []
//       count: shifts.length 
//     });
//   } catch (error) {
//     console.error('Get shifts error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Không thể lấy thông tin ca',
//       error: error.message
//     });
//   }
// };

exports.getShiftById = async (req, res) => {
  try {
    const paramId = Number(req.params.id);
    if (isNaN(paramId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    let staffId = paramId;

    // Nếu truyền user_id thay vì staff_id → thử map sang staff_id
    const staffByUser = await Staff.findOne({ user_id: paramId }).lean().select('id');
    if (staffByUser) {
      staffId = staffByUser.id; // ưu tiên dùng user_id nếu tìm thấy
      console.log(`Mapped user_id ${paramId} → staff_id ${staffId}`);
    }

    const shifts = await Shift.find({ staff_id: staffId })
      .sort({ shift_date: -1, start_time: 1 })
      .lean();

    if (shifts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ca làm việc cho nhân viên này'
      });
    }

    res.json({
      success: true,
      data: shifts,
      count: shifts.length,
      used_staff_id: staffId
    });

  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin ca',
      error: error.message
    });
  }
};

/**
 * POST /api/shifts
 */
exports.createShift = async (req, res) => {
  try {
    const newShift = await Shift.createShift(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo ca làm việc thành công',
      data: newShift
    });
  } catch (error) {
    console.error('Create shift error:', error);

    const status = error.message.includes('đã có ca trùng') ? 409 : 500;
    res.status(status).json({
      success: false,
      message: 'Không thể tạo ca làm việc',
      error: error.message
    });
  }
};

/**
 * PUT /api/shifts/:id
 */
exports.updateShift = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID ca không hợp lệ' });
    }

    const updated = await Shift.updateShift(id, req.body);

    res.json({
      success: true,
      message: 'Cập nhật ca làm việc thành công',
      data: updated
    });
  } catch (error) {
    console.error('Update shift error:', error);
    const status = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể cập nhật ca',
      error: error.message
    });
  }
};

/**
 * DELETE /api/shifts/:id  → soft delete (status = cancelled)
 */
exports.deleteShift = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });

    const result = await Shift.deleteShift(id);
    res.json(result);
  } catch (error) {
    console.error('Delete shift error:', error);
    const status = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể hủy ca',
      error: error.message
    });
  }
};

/**
 * DELETE /api/shifts/:id/hard  → hard delete
 */
exports.hardDeleteShift = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });

    const result = await Shift.hardDeleteShift(id);
    res.json(result);
  } catch (error) {
    console.error('Hard delete shift error:', error);
    const status = error.message.includes('Không tìm thấy') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: 'Không thể xóa vĩnh viễn ca',
      error: error.message
    });
  }
};