// ============================================================
// CAMPUSMART BACKEND — Security & Cryptographic Utilities
// Handles password hashing, secure OTP generation, and digests
// ============================================================

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcrypt
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
    if (!password) throw new Error('Password is required for hashing');
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare a plaintext password with a hashed (or legacy) password
 * @param {string} plainPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;

    // Check if hashedPassword is a bcrypt hash ($2a$, $2b$, or $2y$)
    if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2y$')) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Fallback for legacy seeded accounts (e.g. initial demo password123)
    return plainPassword === hashedPassword;
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP string
 * @returns {string} 6-digit string between "100000" and "999999"
 */
function generateSecureOtp() {
    // crypto.randomInt is cryptographically strong (uses CSPRNG)
    const otpInt = crypto.randomInt(100000, 1000000);
    return otpInt.toString();
}

/**
 * Hash an OTP with a salt for secure single-use storage
 * @param {string} otp 
 * @param {string} [salt] 
 * @returns {{ hash: string, salt: string }}
 */
function hashOtp(otp, salt = null) {
    const otpSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', otpSalt).update(String(otp).trim()).digest('hex');
    return { hash, salt: otpSalt };
}

/**
 * Verify an entered OTP against a stored hash using timing-safe comparison
 * @param {string} enteredOtp 
 * @param {string} storedHash 
 * @param {string} storedSalt 
 * @returns {boolean}
 */
function verifyOtpHash(enteredOtp, storedHash, storedSalt) {
    if (!enteredOtp || !storedHash || !storedSalt) return false;
    const computedHash = crypto.createHmac('sha256', storedSalt).update(String(enteredOtp).trim()).digest('hex');
    
    try {
        const storedBuf = Buffer.from(storedHash, 'hex');
        const computedBuf = Buffer.from(computedHash, 'hex');
        if (storedBuf.length !== computedBuf.length) return false;
        return crypto.timingSafeEqual(storedBuf, computedBuf);
    } catch (e) {
        return false;
    }
}

/**
 * Generate a random URL-safe challenge token ID
 * @returns {string}
 */
function generateChallengeId() {
    return 'ch_' + crypto.randomBytes(16).toString('hex');
}

module.exports = {
    hashPassword,
    comparePassword,
    generateSecureOtp,
    hashOtp,
    verifyOtpHash,
    generateChallengeId
};
