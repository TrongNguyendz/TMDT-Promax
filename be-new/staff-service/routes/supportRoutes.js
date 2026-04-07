// be-new/staff-service/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Xóa /tickets để khớp với /api/support từ Gateway
router.get('/', supportController.listTickets);
router.get('/:id', supportController.getTicket);
router.post('/', supportController.createTicket);

router.post('/:id/messages', supportController.sendMessage);
router.put('/:id/mark-read', supportController.markAsRead);

// URL mới sẽ là: GET /api/support/user/:userId (Hoàn toàn khớp với Frontend)
router.get('/user/:userId', supportController.getTicketsByUserId);

module.exports = router;