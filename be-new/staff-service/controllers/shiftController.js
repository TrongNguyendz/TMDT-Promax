const { Shift } = require('../models/shiftModel');

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
exports.getShiftById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID ca không hợp lệ' });
    }

    const shift = await Shift.findOne({ id });
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc' });
    }

    res.json({ success: true, data: shift.toObject() });
  } catch (error) {
    console.error('Get shift error:', error);
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