// ============================================================
// CAMPUSMART BACKEND — Authentication Controller
// Production-Ready Email OTP Verification, Login 2FA & Welcome Email
// ============================================================

const UserModel = require('../models/userModel');
const config = require('../config/config');
const otpService = require('../services/otpService');
const {
    sanitizeAndValidateEmail,
    isEducationalEmail,
    sendRegistrationOtpEmail,
    sendLoginOtpEmail,
    sendWelcomeEmail,
    getSmtpDiagnosticStatus
} = require('../utils/emailUtils');
const jwt = require('jsonwebtoken');
const JWT_SECRET = config.JWT_SECRET || process.env.JWT_SECRET || 'campusmart_jwt_secret_key_2026';

function generateToken(user, role) {
    return jwt.sign(
        {
            id: user.id || user._id,
            email: user.email,
            role: role || user.role,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

const {
    hashPassword,
    comparePassword,
    validatePasswordStrength
} = require('../utils/securityUtils');

// ============================================================
// 1. POST /api/auth/register
// Initiate registration, create unverified user, issue OTP challenge
// Security: Never issue or persist a session token before verification!
// ============================================================
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, college, hostel } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required fields.'
            });
        }

        const sanitizedEmail = sanitizeAndValidateEmail(email);
        if (!sanitizedEmail) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // Educational domain policy check
        const eduCheck = isEducationalEmail(sanitizedEmail);
        if (!eduCheck.valid) {
            console.log(`[Register] Rejected non-educational email: ${sanitizedEmail}`);
            return res.status(400).json({
                success: false,
                message: eduCheck.reason
            });
        }

        const pwdValidation = validatePasswordStrength(password);
        if (!pwdValidation.valid) {
            return res.status(400).json({
                success: false,
                message: pwdValidation.message
            });
        }

        const userRole = ['buyer', 'seller'].includes(role) ? role : 'buyer';
        const existingUser = await UserModel.findByEmail(sanitizedEmail);

        // Check if verified account already exists
        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists. Please sign in.'
            });
        }

        // Hash password securely
        const hashedPassword = await hashPassword(password);
        let userRecord = null;

        if (existingUser && !existingUser.isVerified) {
            // Update unverified user record without duplicating
            userRecord = await UserModel.findByEmailAndUpdate(sanitizedEmail, {
                name: name.trim(),
                password: hashedPassword,
                phone: phone ? phone.trim() : null,
                role: userRole,
                college: college ? college.trim() : null,
                hostel: hostel ? hostel.trim() : null
            });
        } else {
            // Create brand new unverified user
            userRecord = await UserModel.create({
                name: name.trim(),
                email: sanitizedEmail,
                password: hashedPassword,
                phone: phone ? phone.trim() : null,
                role: userRole,
                college: college ? college.trim() : null,
                hostel: hostel ? hostel.trim() : null,
                isVerified: false,
                welcomeEmailSent: false
            });
        }

        // Create OTP challenge
        const challenge = await otpService.createChallenge({
            email: sanitizedEmail,
            userId: userRecord.id,
            purpose: 'registration',
            metadata: { role: userRole }
        });

        // Dispatch OTP email
        try {
            await sendRegistrationOtpEmail(
                sanitizedEmail,
                userRecord.name,
                challenge.otp,
                config.OTP_EXPIRY_MINUTES
            );
            console.log(`[Register] ✅ Registration OTP dispatched to: ${sanitizedEmail}`);
        } catch (emailErr) {
            console.error(`[Register] ⚠️ SMTP delivery issue for ${sanitizedEmail}:`, emailErr.message);

            let userFriendlyMsg = 'Failed to deliver verification email.';
            if (emailErr.code === 'SMTP_NOT_CONFIGURED') {
                userFriendlyMsg = 'Email delivery failed: SMTP is not configured. Please set SMTP credentials in Backend/.env.';
            } else if (emailErr.message && (emailErr.message.includes('BadCredentials') || emailErr.message.includes('535') || emailErr.code === 'EAUTH')) {
                userFriendlyMsg = 'Email delivery failed: Gmail authentication error (535 BadCredentials). Please ensure a 16-character Google App Password (not your Gmail account password) is generated at https://myaccount.google.com/apppasswords and set as SMTP_PASS in Backend/.env.';
            } else if (emailErr.code === 'ETIMEDOUT' || emailErr.code === 'ESOCKETTIMEDOUT') {
                userFriendlyMsg = 'Email delivery failed: Connection to smtp.gmail.com timed out. Please check network connectivity.';
            } else {
                userFriendlyMsg = `Email delivery failed: ${emailErr.message}`;
            }

            return res.status(503).json({
                success: false,
                emailDeliverySuccess: false,
                message: userFriendlyMsg
            });
        }

        // Success: Only challenge metadata returned (NO session token before verification!)
        const regResponse = {
            success: true,
            message: 'Registration initiated. Verification code sent to your campus email.',
            requireOtp: true,
            challengeId: challenge.challengeId,
            expiresAt: challenge.expiresAt,
            cooldownSeconds: challenge.cooldownSeconds,
            email: sanitizedEmail,
            emailDeliverySuccess: true
        };

        if (process.env.NODE_ENV !== 'production') {
            regResponse.devOtp = challenge.otp;
            console.log(`\n🔑 [TESTING / DEV OTP] Code for ${sanitizedEmail}: ${challenge.otp} (Challenge: ${challenge.challengeId})\n`);
        }

        return res.status(201).json(regResponse);

    } catch (error) {
        console.error('[Register Error]', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during registration.'
        });
    }
};

// ============================================================
// 2. POST /api/auth/verify-registration-otp
// Verify registration OTP, activate user account, and issue session
// ============================================================
const verifyRegistrationOtp = async (req, res) => {
    try {
        const { email, challengeId, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required.'
            });
        }

        const sanitizedEmail = sanitizeAndValidateEmail(email);
        if (!sanitizedEmail) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address.'
            });
        }

        // Verify challenge
        const result = await otpService.verifyOtp({
            challengeId,
            email: sanitizedEmail,
            otp,
            purpose: 'registration'
        });

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                code: result.code,
                remainingAttempts: result.remainingAttempts,
                message: result.error
            });
        }

        // Activate user in database
        const updatedUser = await UserModel.findByEmailAndUpdate(sanitizedEmail, {
            isVerified: true,
            verifiedAt: new Date()
        });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Associated user account could not be found.'
            });
        }

        // Dispatch Welcome Email (idempotent, only if not previously sent)
        if (!updatedUser.welcomeEmailSent) {
            try {
                await sendWelcomeEmail(updatedUser.email, updatedUser.name, updatedUser.role);
                await UserModel.findByEmailAndUpdate(sanitizedEmail, {
                    welcomeEmailSent: true,
                    welcomeEmailSentAt: new Date()
                });
                console.log(`[Welcome Email] ✅ Dispatched to ${sanitizedEmail}`);
            } catch (wErr) {
                console.warn(`[Welcome Email Warning] Could not dispatch welcome email to ${sanitizedEmail}:`, wErr.message);
                // Non-blocking: Do not fail registration verification if welcome email is deferred
            }
        }

        console.log(`[Register Verification] ✅ Account activated for ${sanitizedEmail}`);

        // Issue authenticated session token ONLY AFTER successful verification
        const token = generateToken(updatedUser, updatedUser.role);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully! Your Campus Mart account is active.',
            token,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                college: updatedUser.college,
                phone: updatedUser.phone,
                rating: updatedUser.rating,
                trustScore: updatedUser.trustScore,
                isVerified: true
            }
        });

    } catch (error) {
        console.error('[Verify Registration OTP Error]', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during verification.'
        });
    }
};

// ============================================================
// 3. POST /api/auth/resend-registration-otp
// Resend registration OTP with cooldown enforcement
// ============================================================
const resendRegistrationOtp = async (req, res) => {
    try {
        const { email, challengeId } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required to resend OTP.'
            });
        }

        const sanitizedEmail = sanitizeAndValidateEmail(email);
        const user = await UserModel.findByEmail(sanitizedEmail);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No pending registration found for this email.'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account is already verified. Please proceed to sign in.'
            });
        }

        const resendResult = await otpService.resendOtp({
            challengeId,
            email: sanitizedEmail,
            purpose: 'registration'
        });

        if (!resendResult.success) {
            return res.status(429).json({
                success: false,
                code: resendResult.code,
                waitSeconds: resendResult.waitSeconds,
                message: resendResult.error
            });
        }

        const newChallenge = resendResult.newChallenge;

        try {
            await sendRegistrationOtpEmail(
                sanitizedEmail,
                user.name,
                newChallenge.otp,
                config.OTP_EXPIRY_MINUTES
            );
            console.log(`[Resend OTP] ✅ New OTP dispatched to: ${sanitizedEmail}`);
        } catch (emailErr) {
            console.error(`[Resend OTP Error] SMTP failed for ${sanitizedEmail}:`, emailErr.message);

            let userFriendlyMsg = 'Failed to deliver verification email.';
            if (emailErr.code === 'SMTP_NOT_CONFIGURED') {
                userFriendlyMsg = 'Email delivery failed: SMTP is not configured. Please set SMTP credentials in Backend/.env.';
            } else if (emailErr.message && (emailErr.message.includes('BadCredentials') || emailErr.message.includes('535') || emailErr.code === 'EAUTH')) {
                userFriendlyMsg = 'Email delivery failed: Gmail authentication error (535 BadCredentials). Please check SMTP_PASS in Backend/.env.';
            } else if (emailErr.code === 'ETIMEDOUT' || emailErr.code === 'ESOCKETTIMEDOUT') {
                userFriendlyMsg = 'Email delivery failed: Connection to smtp.gmail.com timed out.';
            } else {
                userFriendlyMsg = `Email delivery failed: ${emailErr.message}`;
            }

            return res.status(503).json({
                success: false,
                emailDeliverySuccess: false,
                message: userFriendlyMsg
            });
        }

        return res.status(200).json({
            success: true,
            challengeId: newChallenge.challengeId,
            expiresAt: newChallenge.expiresAt,
            cooldownSeconds: newChallenge.cooldownSeconds,
            email: sanitizedEmail,
            emailDeliverySuccess: true,
            message: 'A fresh verification code has been dispatched to your campus email.'
        });

    } catch (error) {
        console.error('[Resend Registration OTP Error]', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error.'
        });
    }
};

// ============================================================
// 4. POST /api/auth/login
// Validate password credentials and trigger Login OTP
// Security: Never issue a session token before 2FA verification!
// ============================================================
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const sanitizedEmail = sanitizeAndValidateEmail(email);
        if (!sanitizedEmail) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        const user = await UserModel.findByEmail(sanitizedEmail);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check if account email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                unverified: true,
                email: sanitizedEmail,
                message: 'Your account email has not been verified yet. Please complete verification using the code sent to your inbox.'
            });
        }

        // Credentials valid & verified: Issue Login 2FA Challenge
        const challenge = await otpService.createChallenge({
            email: sanitizedEmail,
            userId: user.id,
            purpose: 'login',
            metadata: { requestedRole: role || user.role }
        });

        // Dispatch 2FA OTP Email
        try {
            await sendLoginOtpEmail(sanitizedEmail, user.name, challenge.otp, config.OTP_EXPIRY_MINUTES);
            console.log(`[Login] ✅ 2FA OTP dispatched to ${sanitizedEmail}`);
        } catch (emailErr) {
            console.error(`[Login] ⚠️ 2FA email dispatch issue for ${sanitizedEmail}:`, emailErr.message);

            let userFriendlyMsg = 'Failed to deliver login verification code.';
            if (emailErr.code === 'SMTP_NOT_CONFIGURED') {
                userFriendlyMsg = 'Email delivery failed: SMTP is not configured. Please set SMTP credentials in Backend/.env.';
            } else if (emailErr.message && (emailErr.message.includes('BadCredentials') || emailErr.message.includes('535') || emailErr.code === 'EAUTH')) {
                userFriendlyMsg = 'Email delivery failed: Gmail authentication error (535 BadCredentials). Please ensure a 16-character Google App Password (not your Gmail account password) is generated at https://myaccount.google.com/apppasswords and set as SMTP_PASS in Backend/.env.';
            } else if (emailErr.code === 'ETIMEDOUT' || emailErr.code === 'ESOCKETTIMEDOUT') {
                userFriendlyMsg = 'Email delivery failed: Connection to smtp.gmail.com timed out.';
            } else {
                userFriendlyMsg = `Email delivery failed: ${emailErr.message}`;
            }

            return res.status(503).json({
                success: false,
                emailDeliverySuccess: false,
                message: userFriendlyMsg
            });
        }

        // Success: Only challenge metadata returned (NO session token before 2FA verification!)
        const loginResponse = {
            success: true,
            message: 'Credentials accepted. Verification code sent to your campus email.',
            requireOtp: true,
            challengeId: challenge.challengeId,
            expiresAt: challenge.expiresAt,
            cooldownSeconds: challenge.cooldownSeconds,
            email: sanitizedEmail,
            emailDeliverySuccess: true
        };

        if (process.env.NODE_ENV !== 'production') {
            loginResponse.devOtp = challenge.otp;
            console.log(`\n🔑 [TESTING / DEV 2FA OTP] Code for ${sanitizedEmail}: ${challenge.otp} (Challenge: ${challenge.challengeId})\n`);
        }

        return res.status(200).json(loginResponse);

    } catch (error) {
        console.error('[Login Error]', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during login.'
        });
    }
};

// ============================================================
// 5. POST /api/auth/verify-login-otp
// Verify Login OTP and issue full authenticated user session
// ============================================================
const verifyLoginOtp = async (req, res) => {
    try {
        const { email, challengeId, otp, role } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required.'
            });
        }

        const sanitizedEmail = sanitizeAndValidateEmail(email);
        if (!sanitizedEmail) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address.'
            });
        }

        // Verify challenge
        const result = await otpService.verifyOtp({
            challengeId,
            email: sanitizedEmail,
            otp,
            purpose: 'login'
        });

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                code: result.code,
                remainingAttempts: result.remainingAttempts,
                message: result.error
            });
        }

        const user = await UserModel.findByEmail(sanitizedEmail);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        // Determine authoritative role
        const finalRole = ['buyer', 'seller'].includes(role) ? role : user.role;

        console.log(`[Login] ✅ 2FA Verified. User session created for: ${sanitizedEmail} (${finalRole})`);

        // Issue authenticated session token ONLY AFTER successful 2FA
        const token = generateToken(user, finalRole);

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: finalRole,
                college: user.college,
                phone: user.phone,
                rating: user.rating,
                trustScore: user.trustScore,
                isVerified: true
            }
        });

    } catch (error) {
        console.error('[Verify Login OTP Error]', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during login verification.'
        });
    }
};

// ============================================================
// 6. POST /api/auth/resend-login-otp
// ============================================================
const resendLoginOtp = async (req, res) => {
    try {
        const { email, challengeId } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required.'
            });
        }

        const sanitizedEmail = sanitizeAndValidateEmail(email);
        const user = await UserModel.findByEmail(sanitizedEmail);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const resendResult = await otpService.resendOtp({
            challengeId,
            email: sanitizedEmail,
            purpose: 'login'
        });

        if (!resendResult.success) {
            return res.status(429).json({
                success: false,
                code: resendResult.code,
                waitSeconds: resendResult.waitSeconds,
                message: resendResult.error
            });
        }

        const newChallenge = resendResult.newChallenge;

        try {
            await sendLoginOtpEmail(
                sanitizedEmail,
                user.name,
                newChallenge.otp,
                config.OTP_EXPIRY_MINUTES
            );
            console.log(`[Resend Login OTP] ✅ New 2FA OTP dispatched to: ${sanitizedEmail}`);
        } catch (emailErr) {
            console.error(`[Resend Login OTP Error] SMTP failed for ${sanitizedEmail}:`, emailErr.message);

            let userFriendlyMsg = 'Failed to deliver login verification code.';
            if (emailErr.code === 'SMTP_NOT_CONFIGURED') {
                userFriendlyMsg = 'Email delivery failed: SMTP is not configured. Please set SMTP credentials in Backend/.env.';
            } else if (emailErr.message && (emailErr.message.includes('BadCredentials') || emailErr.message.includes('535') || emailErr.code === 'EAUTH')) {
                userFriendlyMsg = 'Email delivery failed: Gmail authentication error (535 BadCredentials). Please check SMTP_PASS in Backend/.env.';
            } else if (emailErr.code === 'ETIMEDOUT' || emailErr.code === 'ESOCKETTIMEDOUT') {
                userFriendlyMsg = 'Email delivery failed: Connection to smtp.gmail.com timed out.';
            } else {
                userFriendlyMsg = `Email delivery failed: ${emailErr.message}`;
            }

            return res.status(503).json({
                success: false,
                emailDeliverySuccess: false,
                message: userFriendlyMsg
            });
        }

        return res.status(200).json({
            success: true,
            challengeId: newChallenge.challengeId,
            expiresAt: newChallenge.expiresAt,
            cooldownSeconds: newChallenge.cooldownSeconds,
            email: sanitizedEmail,
            emailDeliverySuccess: true,
            message: 'A fresh login verification code has been dispatched to your campus email.'
        });

    } catch (error) {
        console.error('[Resend Login OTP Error]', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error.'
        });
    }
};

// ============================================================
// 7. GET /api/auth/smtp-status
// Safe operational diagnostic check
// ============================================================
const getSmtpStatus = async (req, res) => {
    try {
        const status = await getSmtpDiagnosticStatus();
        return res.status(200).json({
            success: true,
            smtp: status
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    login,
    verifyLoginOtp,
    resendLoginOtp,
    getSmtpStatus
};
