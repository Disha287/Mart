// ============================================================
// USERS CONTROLLER — CRUD Operations
// ============================================================

const { users } = require('../data/seedData');

// GET /api/users — Get all users
const getAllUsers = (req, res) => {
    // Optional: filter by role (?role=buyer or ?role=seller)
    const { role } = req.query;
    let result = users;
    if (role) {
        result = users.filter(u => u.role === role);
    }
    res.status(200).json({
        success: true,
        count: result.length,
        data: result
    });
};

// GET /api/users/:id — Get single user by ID
const getUserById = (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ success: false, message: `User with id '${req.params.id}' not found` });
    }
    res.status(200).json({ success: true, data: user });
};

// POST /api/users — Create new user
const createUser = (req, res) => {
    const { name, email, phone, role, college, hostel } = req.body;

    // Basic validation
    if (!name || !email || !role) {
        return res.status(400).json({ success: false, message: 'name, email and role are required fields' });
    }
    if (!['buyer', 'seller'].includes(role)) {
        return res.status(400).json({ success: false, message: "role must be either 'buyer' or 'seller'" });
    }

    // Check duplicate email
    const exists = users.find(u => u.email === email);
    if (exists) {
        return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

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

    users.push(newUser);
    res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
};

// PUT /api/users/:id — Update user
const updateUser = (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: `User with id '${req.params.id}' not found` });
    }

    const allowedFields = ['name', 'phone', 'college', 'hostel', 'avatar', 'rating', 'trustScore'];
    const updates = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    users[index] = { ...users[index], ...updates };
    res.status(200).json({ success: true, message: 'User updated successfully', data: users[index] });
};

// DELETE /api/users/:id — Delete user
const deleteUser = (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: `User with id '${req.params.id}' not found` });
    }

    const deleted = users.splice(index, 1)[0];
    res.status(200).json({ success: true, message: `User '${deleted.name}' deleted successfully`, data: deleted });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
