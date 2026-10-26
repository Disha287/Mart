// ============================================================
// AUTH ROUTES — /api/auth
// Handles registration, OTP verification, login 2FA, and SMTP health
// ============================================================

const express = require('express');
const router = express.Router();
const {
    register,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    login,
    verifyLoginOtp,
    resendLoginOtp,
    getSmtpStatus
} = require('../controllers/authController');

// --- Registration Endpoints ---
router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/resend-registration-otp', resendRegistrationOtp);

// --- Login Endpoints ---
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-login-otp', resendLoginOtp);

// --- Operational / Diagnostics ---
router.get('/smtp-status', getSmtpStatus);

module.exports = router;
