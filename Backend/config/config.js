// ============================================================
// CAMPUSMART BACKEND — App & Environment Configuration
// ============================================================

require("dotenv").config();

module.exports = {
    PORT: parseInt(process.env.PORT, 10) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "campusmart_jwt_secret_key_2026",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
    API_PREFIX: "/api",

    // SMTP Configuration
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    SMTP_SECURE: process.env.SMTP_SECURE === "true",
    SMTP_USER: process.env.SMTP_USER || "campusmart044@gmail.com",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "campusmart044@gmail.com",
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "CampusMart",
    SMTP_MOCK: process.env.SMTP_MOCK === "true" || (process.env.NODE_ENV === "test" && process.env.SMTP_MOCK !== "false"),

    // OTP Security Controls
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
    OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
    OTP_COOLDOWN_SECONDS: parseInt(process.env.OTP_COOLDOWN_SECONDS, 10) || 60,

    // Application & Educational Domain Policies
    APP_URL: process.env.APP_URL || "http://localhost:5173",
    EDUCATIONAL_EMAIL_DOMAINS: process.env.EDUCATIONAL_EMAIL_DOMAINS || ""
};
