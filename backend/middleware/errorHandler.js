// ============================================================
// ERROR HANDLER MIDDLEWARE
// Catches any errors thrown with next(err) and returns a
// consistent JSON error response.
// ============================================================

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler — for routes that don't exist
const notFound = (req, res, next) => {
    const err = new Error(`Route Not Found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
};

module.exports = { errorHandler, notFound };
