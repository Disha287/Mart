// ============================================================
// DATABASE CONNECTION CONFIGURATION
// Supports MongoDB / Mongoose or in-memory fallback mode
// ============================================================

const config = require('./config');

const connectDB = async () => {
    try {
        if (config.MONGO_URI) {
            // Optional MongoDB connection if URI is configured in environment
            const mongoose = require('mongoose');
            const conn = await mongoose.connect(config.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            return true;
        } else {
            console.log('📦 Database: In-Memory Mode (No MONGO_URI configured)');
            return false;
        }
    } catch (error) {
        console.warn(`⚠️ Database connection warning: ${error.message}`);
        console.log('📦 Fallback: Running in in-memory mode.');
        return false;
    }
};

module.exports = { connectDB };
