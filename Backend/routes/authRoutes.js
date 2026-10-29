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

router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/resend-registration-otp', resendRegistrationOtp);

router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-login-otp', resendLoginOtp);

router.get('/smtp-status', getSmtpStatus);

module.exports = router;
