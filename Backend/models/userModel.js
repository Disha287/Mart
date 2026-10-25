// ============================================================
// USER MODEL — MVC Model Layer
// Manages User schema and data operations
// ============================================================

const { users } = require('../config/seedData');

class UserModel {
    constructor() {
        this.collection = users;
    }

    // Find all users with optional filter
    async find(filters = {}) {
        let results = [...this.collection];
        if (filters.role) {
            results = results.filter(u => u.role === filters.role);
        }
        return results;
    }

    // Find user by unique ID
    async findById(id) {
        return this.collection.find(u => u.id === id) || null;
    }

    // Find user by email
    async findByEmail(email) {
        return this.collection.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    // Create a new user
    async create(userData) {
        const { name, email, phone, role, college, hostel } = userData;

        const newUser = {
            id: 'usr_' + Date.now(),
            name,
            email,
            phone: phone || null,
            role,
            college: college || null,
            hostel: hostel || null,
            rating: 5.0,
            trustScore: 75,
            joinDate: new Date().toISOString().split('T')[0],
            avatar: null
        };

        this.collection.push(newUser);
        return newUser;
    }

    // Update user by ID
    async findByIdAndUpdate(id, updates = {}) {
        const index = this.collection.findIndex(u => u.id === id);
        if (index === -1) return null;

        const allowedFields = ['name', 'phone', 'college', 'hostel', 'avatar', 'rating', 'trustScore'];
        const cleanUpdates = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) cleanUpdates[field] = updates[field];
        });

        this.collection[index] = { ...this.collection[index], ...cleanUpdates };
        return this.collection[index];
    }

    // Delete user by ID
    async findByIdAndDelete(id) {
        const index = this.collection.findIndex(u => u.id === id);
        if (index === -1) return null;

        const deleted = this.collection.splice(index, 1)[0];
        return deleted;
    }
}

module.exports = new UserModel();
