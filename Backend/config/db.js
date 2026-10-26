const dns = require('dns');
const config = require("./config");
const mongoose = require("mongoose");

// Fix for Windows / ISP DNS servers that reject SRV querySrv lookups for MongoDB Atlas
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
}

const connectDB = async () => {
    if (!config.MONGO_URI) {
        console.log("📦 Running in in-memory mode (MONGO_URI not configured).");
        return;
    }

    try {
        await mongoose.connect(config.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (err) {
        console.warn(`⚠️ [MongoDB Atlas Connection Notice] Could not connect to remote Atlas cluster (${err.message}).`);
        console.log(`📦 Fallback: CampusMart API server is operating in resilient in-memory mode.`);
    }
};

module.exports = { connectDB };
