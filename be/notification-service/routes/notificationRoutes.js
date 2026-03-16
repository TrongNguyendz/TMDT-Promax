const express = require('express');

const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/health', notificationController.healthCheck);
router.get('/', notificationController.listNotifications);
router.get('/:id', notificationController.getNotificationById);
router.post('/', notificationController.createNotification);

// Tùy chọn delete
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;

