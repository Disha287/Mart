// ============================================================
// CAMPUSMART BACKEND — Centralized OTP Service
// Manages challenge generation, secure hashing, single-use verification,
// attempt limits, and resend cooldowns
// ============================================================

const config = require('../config/config');
const OtpChallengeModel = require('../models/otpChallengeModel');
const {
    generateSecureOtp,
    hashOtp,
    verifyOtpHash,
    generateChallengeId
} = require('../utils/securityUtils');

class OtpService {
    /**
     * Create a new OTP verification challenge
     * @param {Object} params
     * @param {string} params.email
     * @param {string} [params.userId]
     * @param {'registration'|'login'} params.purpose
     * @param {Object} [params.metadata]
     * @returns {Promise<{ challengeId: string, otp: string, expiresAt: Date, cooldownSeconds: number }>}
     */
    async createChallenge({ email, userId = null, purpose, metadata = {} }) {
        const cleanEmail = email.toLowerCase().trim();
        const now = new Date();

        // 1. Invalidate any existing active challenges for this email and purpose
        await OtpChallengeModel.invalidatePending(cleanEmail, purpose);

        // 2. Generate secure numeric 6-digit OTP and hash it
        const otp = generateSecureOtp();
        const { hash, salt } = hashOtp(otp);

        const challengeId = generateChallengeId();
        const expiryMs = (config.OTP_EXPIRY_MINUTES || 5) * 60 * 1000;
        const cooldownMs = (config.OTP_COOLDOWN_SECONDS || 60) * 1000;

        const expiresAt = new Date(now.getTime() + expiryMs);
        const resendCooldownUntil = new Date(now.getTime() + cooldownMs);

        // 3. Persist the challenge record
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
            otp, // Only returned to caller (controller) for email sending; never sent in API responses
            expiresAt,
            cooldownSeconds: config.OTP_COOLDOWN_SECONDS || 60
        };
    }

    /**
     * Verify an entered OTP against an active challenge
     * @param {Object} params
     * @param {string} params.challengeId
     * @param {string} params.email
     * @param {string} params.otp
     * @param {'registration'|'login'} params.purpose
     * @returns {Promise<{ valid: boolean, error?: string, code?: string, remainingAttempts?: number, challenge?: Object }>}
     */
    async verifyOtp({ challengeId, email, otp, purpose }) {
        if (!challengeId || !email || !otp || !purpose) {
            return { valid: false, error: 'Challenge ID, email, OTP, and purpose are required.', code: 'MISSING_FIELDS' };
        }

        const cleanEmail = email.toLowerCase().trim();
        const challenge = await OtpChallengeModel.findById(challengeId);

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

        // Increment attempts count
        const updatedChallenge = await OtpChallengeModel.incrementAttempts(challengeId);
        const currentAttempts = updatedChallenge ? updatedChallenge.attempts : challenge.attempts + 1;

        // Timing-safe hash check
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

        // Mark as used atomically
        const consumed = await OtpChallengeModel.markAsUsed(challengeId);
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

    /**
     * Resend an OTP challenge with cooldown check
     * @param {Object} params
     * @param {string} [params.challengeId]
     * @param {string} params.email
     * @param {'registration'|'login'} params.purpose
     * @returns {Promise<{ success: boolean, error?: string, code?: string, newChallenge?: Object, waitSeconds?: number }>}
     */
    async resendOtp({ challengeId, email, purpose }) {
        if (!email || !purpose) {
            return { success: false, error: 'Email and purpose are required.', code: 'MISSING_FIELDS' };
        }

        const cleanEmail = email.toLowerCase().trim();
        let existing = null;

        if (challengeId) {
            existing = await OtpChallengeModel.findById(challengeId);
        }

        // Prevent cooldown bypass: if challengeId is missing or invalid, check the latest active challenge for email & purpose
        if (!existing) {
            existing = await OtpChallengeModel.findLatestPending(cleanEmail, purpose);
        }

        // Check cooldown BEFORE invalidating any active challenge
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
