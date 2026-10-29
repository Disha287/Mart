const config = require('../config/config');
const OtpChallengeModel = require('../models/otpChallengeModel');
const {
    generateSecureOtp,
    hashOtp,
    verifyOtpHash,
    generateChallengeId
} = require('../utils/securityUtils');

class OtpService {
    async createChallenge({ email, userId = null, purpose, metadata = {} }) {
        const cleanEmail = email.toLowerCase().trim();
        const now = new Date();

        await OtpChallengeModel.invalidatePending(cleanEmail, purpose);

        const otp = generateSecureOtp();
        const { hash, salt } = hashOtp(otp);

        const challengeId = generateChallengeId();
        const expiryMs = (config.OTP_EXPIRY_MINUTES || 5) * 60 * 1000;
        const cooldownMs = (config.OTP_COOLDOWN_SECONDS || 60) * 1000;

        const expiresAt = new Date(now.getTime() + expiryMs);
        const resendCooldownUntil = new Date(now.getTime() + cooldownMs);

        await OtpChallengeModel.create({
            id: challengeId,
            email: cleanEmail,
            userId,
            purpose,
            otpHash: hash,
            salt,
            attempts: 0,
            maxAttempts: config.OTP_MAX_ATTEMPTS || 5,
            expiresAt,
            resendCooldownUntil,
            metadata
        });

        return {
            challengeId,
            otp,
            expiresAt,
            cooldownSeconds: config.OTP_COOLDOWN_SECONDS || 60
        };
    }

    async verifyOtp({ challengeId, email, otp, purpose }) {
        if (!email || !otp || !purpose) {
            return { valid: false, error: 'Email, OTP, and purpose are required.', code: 'MISSING_FIELDS' };
        }

        const cleanEmail = email.toLowerCase().trim();
        let effectiveChallengeId = challengeId;
        let challenge = null;

        if (challengeId && !challengeId.startsWith('<') && challengeId !== 'auto' && challengeId !== 'latest') {
            challenge = await OtpChallengeModel.findById(challengeId);
        }

        if (!challenge && cleanEmail && (!challengeId || challengeId.startsWith('<') || challengeId === 'auto' || challengeId === 'latest')) {
            challenge = await OtpChallengeModel.findLatestPending(cleanEmail, purpose);
            if (challenge) effectiveChallengeId = challenge.id;
        }

        if (!challenge) {
            return { valid: false, error: 'Verification challenge not found or has expired. Please request a new code.', code: 'CHALLENGE_NOT_FOUND' };
        }

        if (challenge.email !== cleanEmail) {
            return { valid: false, error: 'Email mismatch for this verification challenge.', code: 'EMAIL_MISMATCH' };
        }

        if (challenge.purpose !== purpose) {
            return { valid: false, error: 'Invalid challenge purpose.', code: 'INVALID_PURPOSE' };
        }

        if (challenge.isUsed) {
            return { valid: false, error: 'This verification code has already been used. Please request a new one.', code: 'ALREADY_USED' };
        }

        const now = new Date();
        if (now > new Date(challenge.expiresAt)) {
            return { valid: false, error: 'Verification code has expired. Please request a fresh code.', code: 'EXPIRED' };
        }

        if (challenge.attempts >= challenge.maxAttempts) {
            return { valid: false, error: 'Maximum verification attempts exceeded. Please request a new code.', code: 'MAX_ATTEMPTS_EXCEEDED' };
        }

        const updatedChallenge = await OtpChallengeModel.incrementAttempts(effectiveChallengeId);
        const currentAttempts = updatedChallenge ? updatedChallenge.attempts : challenge.attempts + 1;

        const isMatch = verifyOtpHash(otp, challenge.otpHash, challenge.salt);

        if (!isMatch) {
            const remaining = Math.max(0, challenge.maxAttempts - currentAttempts);
            if (remaining === 0) {
                return {
                    valid: false,
                    error: 'Incorrect verification code. Maximum attempts reached. Please request a new code.',
                    code: 'MAX_ATTEMPTS_EXCEEDED',
                    remainingAttempts: 0
                };
            }
            return {
                valid: false,
                error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
                code: 'INVALID_CODE',
                remainingAttempts: remaining
            };
        }

        const consumed = await OtpChallengeModel.markAsUsed(effectiveChallengeId);
        if (!consumed) {
            return {
                valid: false,
                error: 'This verification code has already been used. Please request a new one.',
                code: 'ALREADY_USED'
            };
        }

        return {
            valid: true,
            challenge: { ...challenge, isUsed: true }
        };
    }

    async resendOtp({ challengeId, email, purpose }) {
        if (!email || !purpose) {
            return { success: false, error: 'Email and purpose are required.', code: 'MISSING_FIELDS' };
        }

        const cleanEmail = email.toLowerCase().trim();
        let existing = null;

        if (challengeId) {
            existing = await OtpChallengeModel.findById(challengeId);
        }

        if (!existing) {
            existing = await OtpChallengeModel.findLatestPending(cleanEmail, purpose);
        }

        if (existing && existing.resendCooldownUntil) {
            const now = new Date();
            const cooldownUntil = new Date(existing.resendCooldownUntil);
            if (now < cooldownUntil) {
                const waitSeconds = Math.max(1, Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000));
                return {
                    success: false,
                    error: `Please wait ${waitSeconds} second${waitSeconds === 1 ? '' : 's'} before requesting another code.`,
                    code: 'COOLDOWN_ACTIVE',
                    waitSeconds
                };
            }
        }

        const newChallenge = await this.createChallenge({
            email: cleanEmail,
            userId: existing ? existing.userId : null,
            purpose,
            metadata: existing ? existing.metadata : {}
        });

        return {
            success: true,
            newChallenge
        };
    }
}

module.exports = new OtpService();
