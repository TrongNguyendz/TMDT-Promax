const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');

// Health check
router.get('/health', shiftController.healthCheck);

// CRUD
router.get('/', shiftController.listShifts);            // GET /api/shifts
router.get('/:id', shiftController.getShiftById);       // GET /api/shifts/:id
router.post('/', shiftController.createShift);          // POST /api/shifts
router.put('/:id', shiftController.updateShift);        // PUT /api/shifts/:id
router.delete('/:id', shiftController.deleteShift);     // DELETE /api/shifts/:id
router.delete('/:id/hard', shiftController.hardDeleteShift); // DELETE /api/shifts/:id/hard

// Có thể thêm sau:
// router.get('/today', ...)              → ca hôm nay
// router.get('/staff/:staffId/week', ...) → lịch tuần của 1 nhân viên
// router.put('/:id/checkin', ...)        → cập nhật actual_start
// router.put('/:id/checkout', ...)       → cập nhật actual_end

module.exports = router;