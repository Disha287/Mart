// ============================================================
// OTP CHALLENGE MODEL — Secure Storage for Verification Challenges
// Mongoose Schema with In-Memory fallback and TTL index
// ============================================================

const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    userId: { type: String, default: null },
    purpose: { type: String, enum: ['registration', 'login'], required: true },
    otpHash: { type: String, required: true },
    salt: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // MongoDB TTL cleanup
    resendCooldownUntil: { type: Date, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const OtpChallenge = mongoose.models.OtpChallenge || mongoose.model('OtpChallenge', otpChallengeSchema);

class OtpChallengeModel {
    constructor() {
        this.collection = [];
    }

    /**
     * Create and store an OTP challenge
     */
    async create(challengeData) {
        const data = {
            ...challengeData,
            email: challengeData.email.toLowerCase().trim(),
            attempts: challengeData.attempts || 0,
            maxAttempts: challengeData.maxAttempts || 5,
            isUsed: false,
            usedAt: null
        };

        if (mongoose.connection.readyState === 1) {
            const created = await OtpChallenge.create(data);
            return created.toObject();
        }

        this.collection.push({ ...data });
        return { ...data };
    }

    /**
     * Find challenge by its unique ID
     */
    async findById(id) {
        if (!id) return null;
        if (mongoose.connection.readyState === 1) {
            return await OtpChallenge.findOne({ id }).lean();
        }
        return this.collection.find(c => c.id === id) || null;
    }

    /**
     * Invalidate any previous pending challenges for an email and purpose
     */
    async invalidatePending(email, purpose) {
        const cleanEmail = email.toLowerCase().trim();
        const now = new Date();

        if (mongoose.connection.readyState === 1) {
            await OtpChallenge.updateMany(
                { email: cleanEmail, purpose, isUsed: false },
                { $set: { isUsed: true, usedAt: now } }
            );
            return;
        }

        this.collection.forEach(c => {
            if (c.email === cleanEmail && c.purpose === purpose && !c.isUsed) {
                c.isUsed = true;
                c.usedAt = now;
            }
        });
    }

    /**
     * Increment attempt counter atomically
     */
    async incrementAttempts(id) {
        if (mongoose.connection.readyState === 1) {
            return await OtpChallenge.findOneAndUpdate(
                { id },
                { $inc: { attempts: 1 } },
                { returnDocument: 'after' }
            ).lean();
        }

        const challenge = this.collection.find(c => c.id === id);
        if (challenge) {
            challenge.attempts = (challenge.attempts || 0) + 1;
            return { ...challenge };
        }
        return null;
    }

    /**
     * Mark challenge as successfully used
     */
    async markAsUsed(id) {
        const now = new Date();
        if (mongoose.connection.readyState === 1) {
            return await OtpChallenge.findOneAndUpdate(
                { id },
                { $set: { isUsed: true, usedAt: now } },
                { returnDocument: 'after' }
            ).lean();
        }

        const challenge = this.collection.find(c => c.id === id);
        if (challenge) {
            challenge.isUsed = true;
            challenge.usedAt = now;
            return { ...challenge };
        }
        return null;
    }
}

module.exports = new OtpChallengeModel();
