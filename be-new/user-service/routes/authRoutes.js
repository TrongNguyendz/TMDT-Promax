const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');

router.get('/health', authController.healthCheck);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/staff', authController.createStaff);
router.post('/verify-otp', authController.verifyOTP);        // Nhập OTP
router.post('/resend-otp', authController.resendOTP);      // Gửi lại OTP mới
module.exports = router;


