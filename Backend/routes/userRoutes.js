const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users (optional ?role=buyer|seller)
router.get('/', getAllUsers);

// @route   GET /api/users/:id
// @desc    Get a single user by ID
router.get('/:id', getUserById);

// @route   POST /api/users
// @desc    Create a new user
// @body    { name, email, role, phone?, college?, hostel? }
router.post('/', createUser);

// @route   PUT /api/users/:id
// @desc    Update user info (name, phone, college, hostel, etc.)
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete a user
router.delete('/:id', deleteUser);

module.exports = router;
