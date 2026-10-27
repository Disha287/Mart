// ============================================================
// AUTH MIDDLEWARE
// Validates requesting user context and verified status for protected APIs
// ============================================================

const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const JWT_SECRET = process.env.JWT_SECRET || 'campusmart_jwt_secret_key_2026';

/**
 * Middleware to check whether the requesting user exists and is verified.
 * Inspects 'Authorization: Bearer <token>', 'x-user-id' / 'x-user-email' headers, or body user identifiers.
 */
const requireVerifiedUser = async (req, res, next) => {
    try {
        let userId = req.headers['x-user-id'] || req.body.sellerId || req.body.buyerId || req.body.userId;
        let userEmail = req.headers['x-user-email'] || req.body.email;

        // Check for Bearer JWT token in Authorization header
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded && decoded.id) userId = decoded.id;
                if (decoded && decoded.email) userEmail = decoded.email;
            } catch (jwtErr) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired authorization token.'
                });
            }
        }

        // Pass through if not specified on open endpoints
        if (!userId && !userEmail) {
            return next();
        }

        let user = null;
        if (userId) {
            user = await UserModel.findById(userId);
        } else if (userEmail) {
            user = await UserModel.findByEmail(userEmail);
        }

        if ((userId || userEmail) && !user) {
            return res.status(401).json({
                success: false,
                message: 'User account not found. Please log in.'
            });
        }

        if (user && !user.isVerified) {
            return res.status(403).json({
                success: false,
                unverified: true,
                message: 'Your campus email is not verified yet. Please complete verification.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    requireVerifiedUser
};
