const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.get('/tickets', supportController.listTickets);
router.get('/tickets/:id', supportController.getTicket);
router.post('/tickets', supportController.createTicket);

router.post('/tickets/:id/messages', supportController.sendMessage);
router.put('/tickets/:id/mark-read', supportController.markAsRead);
// ────────────────────────────────────────────────
// API mới: Lấy tất cả ticket của một user cụ thể
// GET /api/support/tickets/user/:userId
// ────────────────────────────────────────────────
router.get('/tickets/user/:userId', supportController.getTicketsByUserId);

module.exports = router;