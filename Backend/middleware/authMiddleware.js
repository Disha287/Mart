// ============================================================
// AUTH MIDDLEWARE
// Validates requesting user context and verified status for protected APIs
// ============================================================

const UserModel = require('../models/userModel');

/**
 * Middleware to check whether the requesting user exists and is verified.
 * Inspects 'x-user-id' / 'x-user-email' headers, or body user identifiers.
 */
const requireVerifiedUser = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'] || req.body.sellerId || req.body.buyerId || req.body.userId;
        const userEmail = req.headers['x-user-email'] || req.body.email;

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
