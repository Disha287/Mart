// ============================================================
// USERS CONTROLLER — MVC Controller Layer
// Handles HTTP Requests and delegates to UserModel
// ============================================================

const UserModel = require('../models/userModel');

// GET /api/users — Get all users (supports ?role=buyer|seller)
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const users = await UserModel.find(role ? { role } : {});
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/users/:id — Get single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User with id '${req.params.id}' not found` });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/users — Create new user
const createUser = async (req, res) => {
    try {
        const { name, email, phone, role, college, hostel } = req.body;

        // Basic validation
        if (!name || !email || !role) {
            return res.status(400).json({ success: false, message: 'name, email and role are required fields' });
        }
        if (!['buyer', 'seller'].includes(role)) {
            return res.status(400).json({ success: false, message: "role must be either 'buyer' or 'seller'" });
        }

        // Check duplicate email
        const exists = await UserModel.findByEmail(email);
        if (exists) {
            return res.status(409).json({ success: false, message: 'A user with this email already exists' });
        }

        const newUser = await UserModel.create({ name, email, phone, role, college, hostel });
        res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/users/:id — Update user
const updateUser = async (req, res) => {
    try {
        const updated = await UserModel.findByIdAndUpdate(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: `User with id '${req.params.id}' not found` });
        }
        res.status(200).json({ success: true, message: 'User updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/users/:id — Delete user
const deleteUser = async (req, res) => {
    try {
        const deleted = await UserModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: `User with id '${req.params.id}' not found` });
        }
        res.status(200).json({ success: true, message: `User '${deleted.name}' deleted successfully`, data: deleted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
