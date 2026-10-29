const mongoose = require('mongoose');
const { users: initialSeedUsers } = require('../config/seedData');

const preparedSeedUsers = initialSeedUsers.map(u => ({
    ...u,
    password: u.password || 'password123',
    isVerified: true,
    verifiedAt: new Date(),
    welcomeEmailSent: true,
    welcomeEmailSentAt: new Date()
}));

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    college: { type: String, default: null },
    hostel: { type: String, default: null },
    rating: { type: Number, default: 5.0 },
    trustScore: { type: Number, default: 75 },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    welcomeEmailSent: { type: Boolean, default: false },
    welcomeEmailSentAt: { type: Date, default: null },
    joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    avatar: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

class UserModel {
    constructor() {
        this.collection = [...preparedSeedUsers];
        this.isSeeded = false;
    }

    async ensureSeeded() {
        if (this.isSeeded || mongoose.connection.readyState !== 1) return;
        try {
            const count = await User.countDocuments();
            if (count === 0) {
                await User.insertMany(preparedSeedUsers);
                console.log(`[UserModel] Seeded ${preparedSeedUsers.length} verified demo users into MongoDB.`);
            }
            this.isSeeded = true;
        } catch (error) {
            console.error('[UserModel Seed Error]:', error.message);
        }
    }

    async find(filters = {}) {
        await this.ensureSeeded();

        if (mongoose.connection.readyState === 1) {
            const query = {};
            if (filters.role) query.role = filters.role;
            if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
            return await User.find(query).lean();
        }

        let results = [...this.collection];
        if (filters.role) results = results.filter(u => u.role === filters.role);
        if (filters.isVerified !== undefined) results = results.filter(u => u.isVerified === filters.isVerified);
        return results;
    }

    async findById(id) {
        await this.ensureSeeded();

        if (mongoose.connection.readyState === 1) {
            return await User.findOne({ id }).lean();
        }
        return this.collection.find(u => u.id === id) || null;
    }

    async findByEmail(email) {
        if (!email) return null;
        await this.ensureSeeded();
        const cleanEmail = email.toLowerCase().trim();

        if (mongoose.connection.readyState === 1) {
            return await User.findOne({ email: cleanEmail }).lean();
        }
        return this.collection.find(u => u.email.toLowerCase() === cleanEmail) || null;
    }

    async create(userData) {
        const {
            name,
            email,
            password,
            phone,
            role,
            college,
            hostel,
            isVerified = false,
            welcomeEmailSent = false
        } = userData;

        const cleanEmail = email.toLowerCase().trim();
        const id = 'usr_' + Date.now();

        const newUserObj = {
            id,
            name: name.trim(),
            email: cleanEmail,
            password: password || 'password123',
            phone: phone ? phone.trim() : null,
            role: role || 'buyer',
            college: college ? college.trim() : null,
            hostel: hostel ? hostel.trim() : null,
            rating: 5.0,
            trustScore: 75,
            isVerified: Boolean(isVerified),
            verifiedAt: isVerified ? new Date() : null,
            welcomeEmailSent: Boolean(welcomeEmailSent),
            welcomeEmailSentAt: welcomeEmailSent ? new Date() : null,
            joinDate: new Date().toISOString().split('T')[0],
            avatar: null
        };

        if (mongoose.connection.readyState === 1) {
            const created = await User.create(newUserObj);
            return created.toObject();
        }

        this.collection.push(newUserObj);
        return { ...newUserObj };
    }

    async findByIdAndUpdate(id, updates = {}) {
        if (mongoose.connection.readyState === 1) {
            return await User.findOneAndUpdate(
                { id },
                { $set: updates },
                { returnDocument: 'after', runValidators: true }
            ).lean();
        }

        const index = this.collection.findIndex(u => u.id === id);
        if (index === -1) return null;
        this.collection[index] = { ...this.collection[index], ...updates };
        return this.collection[index];
    }

    async findByEmailAndUpdate(email, updates = {}) {
        if (!email) return null;
        const cleanEmail = email.toLowerCase().trim();

        if (mongoose.connection.readyState === 1) {
            return await User.findOneAndUpdate(
                { email: cleanEmail },
                { $set: updates },
                { returnDocument: 'after', runValidators: true }
            ).lean();
        }

        const index = this.collection.findIndex(u => u.email.toLowerCase() === cleanEmail);
        if (index === -1) return null;
        this.collection[index] = { ...this.collection[index], ...updates };
        return this.collection[index];
    }

    async findByIdAndDelete(id) {
        if (mongoose.connection.readyState === 1) {
            return await User.findOneAndDelete({ id }).lean();
        }

        const index = this.collection.findIndex(u => u.id === id);
        if (index === -1) return null;
        const deleted = this.collection.splice(index, 1)[0];
        return deleted;
    }
}

module.exports = new UserModel();
