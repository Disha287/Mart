const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;

async function hashPassword(password) {
    if (!password) throw new Error('Password is required for hashing');
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;

    if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2y$')) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    return plainPassword === hashedPassword;
}

function generateSecureOtp() {
    const otpInt = crypto.randomInt(0, 1000000);
    return otpInt.toString().padStart(6, '0');
}

function hashOtp(otp, salt = null) {
    const otpSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', otpSalt).update(String(otp).trim()).digest('hex');
    return { hash, salt: otpSalt };
}

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

function generateChallengeId() {
    return 'ch_' + crypto.randomBytes(16).toString('hex');
}

function validatePasswordStrength(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required.' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
    }
    return { valid: true, message: 'Password meets all security criteria.' };
}

module.exports = {
    hashPassword,
    comparePassword,
    validatePasswordStrength,
    generateSecureOtp,
    hashOtp,
    verifyOtpHash,
    generateChallengeId
};
