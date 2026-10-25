// ============================================================
// CAMPUSMART BACKEND — App & Environment Configuration
// ============================================================

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    API_PREFIX: '/api'
};
