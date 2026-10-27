// ============================================================
// CAMPUSMART BACKEND — Email Delivery & Validation Engine
// SMTP Transporter, Security Diagnostics & Editorial Email Templates
// ============================================================

const nodemailer = require('nodemailer');
const config = require('../config/config');

// In-memory test mailbox for automated verification
const mockMailbox = [];

/**
 * Disallowed personal/commercial email providers.
 */
const BLOCKED_PERSONAL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.com.au', 'ymail.com', 'rocketmail.com',
    'outlook.com', 'outlook.in', 'hotmail.com', 'hotmail.co.uk', 'hotmail.in', 'live.com', 'msn.com',
    'icloud.com', 'me.com', 'mac.com',
    'protonmail.com', 'proton.me',
    'zoho.com',
    'aol.com',
    'rediffmail.com',
    'tutanota.com', 'tutamail.com',
    'mail.com', 'email.com',
    'inbox.com',
    'gmx.com', 'gmx.net',
    'fastmail.com', 'fastmail.fm'
]);

/**
 * Recognized educational TLD patterns.
 */
const EDUCATIONAL_TLD_PATTERNS = [
    /\.edu$/,
    /\.edu\.\w{2}$/,
    /\.ac\.\w{2}$/,
    /\.ac\.in$/,
    /\.edu\.in$/,
    /\.ac\.uk$/,
    /\.ac\.nz$/,
    /\.ac\.za$/,
    /\.ac\.jp$/,
    /\.uni-\w+\.\w{2,3}$/,
    /\.sch\.\w{2}$/,
    /\.k12\.\w{2,3}$/
];

/**
 * Validate and sanitize email string.
 */
function sanitizeAndValidateEmail(email) {
    if (!email || typeof email !== 'string') return null;
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
        return null;
    }
    return trimmed;
}

/**
 * Validates that an email belongs to an educational/institutional domain.
 */
function isEducationalEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, reason: 'Invalid email input.' };
    }

    const atIndex = email.lastIndexOf('@');
    if (atIndex === -1) {
        return { valid: false, reason: 'Email address is missing the @ symbol.' };
    }

    const domain = email.slice(atIndex + 1).toLowerCase();

    // Check custom configured domain allowlist first if provided
    if (config.EDUCATIONAL_EMAIL_DOMAINS) {
        const allowedDomains = config.EDUCATIONAL_EMAIL_DOMAINS.split(',')
            .map(d => d.trim().toLowerCase())
            .filter(Boolean);

        if (allowedDomains.length > 0) {
            const matchesConfigured = allowedDomains.some(allowed => 
                domain === allowed || domain.endsWith('.' + allowed)
            );
            if (!matchesConfigured) {
                return {
                    valid: false,
                    reason: `Registration is restricted to authorized campus email domains (${allowedDomains.join(', ')}). Your domain "@${domain}" is not in the approved allowlist.`
                };
            }
            return { valid: true, reason: 'Configured educational domain verified.' };
        }
    }

    // Step 1: Reject known personal/commercial providers
    if (BLOCKED_PERSONAL_DOMAINS.has(domain)) {
        return {
            valid: false,
            reason: `Personal email addresses (@${domain}) are not allowed. Please use your institutional/university email.`
        };
    }

    // Step 2: Accept recognised educational TLD patterns
    const matchesEducational = EDUCATIONAL_TLD_PATTERNS.some(pattern => pattern.test(domain));
    if (!matchesEducational) {
        return {
            valid: false,
            reason: `The email domain "@${domain}" does not appear to be a recognised educational institution. Please use an email ending in .edu, .ac.in, .ac.uk, .edu.in, or an approved university domain.`
        };
    }

    return { valid: true, reason: 'Educational email verified.' };
}

/**
 * Create SMTP Transporter with connection diagnostics
 */
let transporter = null;

function resetTransporter() {
    transporter = null;
}

function getTransporter() {
    if (transporter) return transporter;

    if (config.SMTP_MOCK) {
        transporter = {
            sendMail: async (mailOptions) => {
                const messageId = 'mock_' + Date.now();
                mockMailbox.push({ ...mailOptions, messageId, sentAt: new Date() });
                
                const otpMatch = (mailOptions.text || '').match(/(\d{6})/);
                const otpStr = otpMatch ? otpMatch[1] : 'N/A';

                console.log('\n╔══════════════════════════════════════════════════════════════════╗');
                console.log('║  📬 [DEV EMAIL CAPTURE] (Mock Delivery / Test Mode)              ║');
                console.log(`║  To:      ${(mailOptions.to || '').padEnd(52)}║`);
                console.log(`║  Subject: ${(mailOptions.subject || '').padEnd(52)}║`);
                console.log(`║  🔑 OTP:   ${otpStr.padEnd(52)}║`);
                console.log('║  → To receive real emails in your inbox, add SMTP_HOST,        ║');
                console.log('║    SMTP_USER, and SMTP_PASS to Backend/.env                     ║');
                console.log('╚══════════════════════════════════════════════════════════════════╝\n');

                return { accepted: [mailOptions.to], rejected: [], messageId, response: '250 Mock OK' };
            },
            verify: async () => true
        };
        return transporter;
    }

    const cleanPass = config.SMTP_PASS ? String(config.SMTP_PASS).trim().replace(/\s+/g, '') : '';
    const isConfigured = Boolean(config.SMTP_HOST && config.SMTP_USER && cleanPass);

    if (!isConfigured) {
        const missing = [];
        if (!config.SMTP_HOST) missing.push('SMTP_HOST');
        if (!config.SMTP_USER) missing.push('SMTP_USER');
        if (!cleanPass) missing.push('SMTP_PASS');

        // Return a transporter that yields a structured diagnostic error
        return {
            sendMail: async () => {
                const err = new Error(`SMTP credentials are not configured in environment variables. Missing: ${missing.join(', ')}`);
                err.code = 'SMTP_NOT_CONFIGURED';
                throw err;
            },
            verify: async () => {
                const err = new Error(`SMTP credentials are not configured in environment variables. Missing: ${missing.join(', ')}`);
                err.code = 'SMTP_NOT_CONFIGURED';
                throw err;
            }
        };
    }

    const transportConfig = {
        host: config.SMTP_HOST || 'smtp.gmail.com',
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_SECURE, // false for 587 (STARTTLS)
        auth: {
            user: config.SMTP_USER,
            pass: cleanPass
        },
        // Secure TLS defaults: Do NOT disable certificate validation
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000
    };

    transporter = nodemailer.createTransport(transportConfig);

    return transporter;
}

/**
 * Diagnostic status checker for SMTP service
 */
async function getSmtpDiagnosticStatus() {
    const cleanPass = config.SMTP_PASS ? String(config.SMTP_PASS).trim().replace(/\s+/g, '') : '';
    const isConfigured = Boolean(config.SMTP_HOST && config.SMTP_USER && cleanPass);
    const maskedUser = config.SMTP_USER ? config.SMTP_USER.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'Not Set';

    const status = {
        isMock: Boolean(config.SMTP_MOCK),
        isConfigured,
        host: config.SMTP_HOST || 'Not Set',
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        senderEmail: config.SMTP_FROM_EMAIL,
        userMasked: maskedUser,
        verified: false,
        error: null,
        hint: null
    };

    if (config.SMTP_MOCK) {
        status.verified = true;
        status.message = 'Mock SMTP mode active (simulated email dispatch). Real emails are not sent.';
        return status;
    }

    if (!isConfigured) {
        const missing = [];
        if (!config.SMTP_HOST) missing.push('SMTP_HOST');
        if (!config.SMTP_USER) missing.push('SMTP_USER');
        if (!cleanPass) missing.push('SMTP_PASS');
        status.error = `SMTP_NOT_CONFIGURED: Missing ${missing.join(', ')} in Backend/.env`;
        status.hint = 'Configure your Gmail address and 16-character Google App Password in Backend/.env to enable real email delivery.';
        return status;
    }

    try {
        const client = getTransporter();
        if (typeof client.verify === 'function') {
            await client.verify();
            status.verified = true;
            status.message = 'SMTP connection and credentials verified successfully with Gmail.';
        }
    } catch (e) {
        status.verified = false;
        status.error = e.message;
        if (e.message && (e.message.includes('BadCredentials') || e.message.includes('535') || e.code === 'EAUTH')) {
            status.hint = 'Gmail requires a 16-character Google App Password rather than your standard account password. To fix: Enable 2-Step Verification on your Google Account -> go to Security -> 2-Step Verification -> App passwords -> generate password for CampusMart -> paste the 16-character code into Backend/.env SMTP_PASS.';
        } else if (e.code === 'ETIMEDOUT' || e.code === 'ESOCKETTIMEDOUT') {
            status.hint = 'Connection to smtp.gmail.com timed out. Please check network connectivity and firewall settings.';
        } else if (e.code === 'ENOTFOUND') {
            status.hint = 'DNS lookup failed for SMTP host. Please verify SMTP_HOST in Backend/.env.';
        }
    }

    return status;
}

// ============================================================
// EDITORIAL EMAIL TEMPLATES (Campus Mart Brand Identity)
// ============================================================

function getEmailWrapper(title, contentHtml) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #E7E2D8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #171717;
      line-height: 1.5;
    }
    .wrapper {
      width: 100%;
      background-color: #E7E2D8;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #FFFDF8;
      border: 1.5px solid #171717;
    }
    .header {
      background-color: #241A12;
      padding: 24px 28px;
      border-bottom: 2px solid #EF493C;
      text-align: left;
    }
    .brand {
      color: #FFFDF8;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0;
    }
    .brand span {
      color: #EF493C;
    }
    .tagline {
      color: #D3CDC1;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 4px 0 0 0;
      font-family: "Courier New", Courier, monospace;
    }
    .content {
      padding: 32px 28px;
    }
    .badge {
      display: inline-block;
      background-color: #171717;
      color: #FFFDF8;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 4px 8px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .headline {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.15;
      text-transform: uppercase;
      margin: 0 0 16px 0;
      color: #171717;
    }
    .body-text {
      font-size: 14px;
      color: #333333;
      margin: 0 0 20px 0;
    }
    .otp-plate {
      background-color: #E7E2D8;
      border: 1.5px solid #171717;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      letter-spacing: 0.14em;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: "Courier New", Courier, monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 0.25em;
      color: #EF493C;
      margin: 0;
    }
    .otp-warning {
      font-size: 12px;
      color: #666666;
      margin-top: 10px;
      font-family: "Courier New", Courier, monospace;
    }
    .footer {
      background-color: #241A12;
      padding: 20px 28px;
      color: #D3CDC1;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.5;
    }
    .footer a {
      color: #EF493C;
      text-decoration: none;
    }
    .button-link {
      display: inline-block;
      background-color: #EF493C;
      color: #FFFDF8 !important;
      text-decoration: none;
      font-family: "Courier New", Courier, monospace;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 12px 24px;
      margin: 16px 0;
      border: 1.5px solid #EF493C;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand">CAMPUS<span>MART</span></h1>
        <p class="tagline">The Student Marketplace // Verified Campus Network</p>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        CAMPUS MART — STUDENT MARKETPLACE<br>
        This is an automated system transmission. Please do not reply directly.<br>
        Web: <a href="${config.APP_URL}">${config.APP_URL}</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send Registration Verification OTP Email
 */
async function sendRegistrationOtpEmail(toEmail, recipientName, otp, expiryMinutes = 5) {
    const title = 'Verify your Campus Mart account';
    const client = getTransporter();

    const contentHtml = `
      <div class="badge">SECURITY // ACCOUNT REGISTRATION</div>
      <h2 class="headline">VERIFY YOUR CAMPUS IDENTITY</h2>
      <p class="body-text">Hello <strong>${recipientName || 'Student'}</strong>,</p>
      <p class="body-text">Thank you for joining Campus Mart. Please enter the following 6-digit one-time verification code to confirm your educational email address and activate your account:</p>
      
      <div class="otp-plate">
        <div class="otp-label">ONE-TIME VERIFICATION CODE</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-warning">Expires in ${expiryMinutes} minutes • Single-use only</div>
      </div>

      <p class="body-text" style="font-size: 12px; color: #666;">
        <strong>Security Notice:</strong> Never share this code with anyone. Campus Mart staff will never ask for your verification code. If you did not initiate this registration, please disregard this email.
      </p>
    `;

    const textContent = `CAMPUS MART — VERIFY YOUR ACCOUNT\n\n` +
      `Hello ${recipientName || 'Student'},\n\n` +
      `Your Campus Mart registration verification code is: ${otp}\n` +
      `This code will expire in ${expiryMinutes} minutes.\n\n` +
      `Never share this code with anyone.\n` +
      `Web: ${config.APP_URL}\n`;

    const result = await client.sendMail({
        from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: title,
        text: textContent,
        html: getEmailWrapper(title, contentHtml)
    });

    if (result && result.rejected && result.rejected.length > 0) {
        const err = new Error(`Email delivery was rejected for recipient: ${result.rejected.join(', ')}`);
        err.code = 'RECIPIENT_REJECTED';
        throw err;
    }

    return result;
}

/**
 * Send Login Verification OTP Email
 */
async function sendLoginOtpEmail(toEmail, recipientName, otp, expiryMinutes = 5) {
    const title = 'Your Campus Mart login verification code';
    const client = getTransporter();

    const contentHtml = `
      <div class="badge">SECURITY // LOGIN VERIFICATION</div>
      <h2 class="headline">TWO-FACTOR LOGIN AUTHENTICATION</h2>
      <p class="body-text">Hello <strong>${recipientName || 'Student'}</strong>,</p>
      <p class="body-text">A sign-in request was made for your Campus Mart account. Enter the 6-digit verification code below to complete your login:</p>
      
      <div class="otp-plate">
        <div class="otp-label">LOGIN VERIFICATION CODE</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-warning">Valid for ${expiryMinutes} minutes • Single-use only</div>
      </div>

      <p class="body-text" style="font-size: 12px; color: #666;">
        <strong>Security Alert:</strong> If you did not attempt to sign in to Campus Mart, someone may know your password. Please sign in and update your credentials immediately.
      </p>
    `;

    const textContent = `CAMPUS MART — LOGIN VERIFICATION CODE\n\n` +
      `Hello ${recipientName || 'Student'},\n\n` +
      `Your Campus Mart login verification code is: ${otp}\n` +
      `This code will expire in ${expiryMinutes} minutes.\n\n` +
      `If you did not attempt to sign in, please secure your account.\n` +
      `Web: ${config.APP_URL}\n`;

    const result = await client.sendMail({
        from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: title,
        text: textContent,
        html: getEmailWrapper(title, contentHtml)
    });

    if (result && result.rejected && result.rejected.length > 0) {
        const err = new Error(`Email delivery was rejected for recipient: ${result.rejected.join(', ')}`);
        err.code = 'RECIPIENT_REJECTED';
        throw err;
    }

    return result;
}

/**
 * Send Welcome Email after successful registration verification
 */
async function sendWelcomeEmail(toEmail, recipientName, role = 'buyer') {
    const title = 'Welcome to Campus Mart — Your Campus Marketplace';
    const client = getTransporter();
    const isSeller = role === 'seller';

    const contentHtml = `
      <div class="badge">WELCOME // ACCOUNT ACTIVATED</div>
      <h2 class="headline">WELCOME TO CAMPUS MART</h2>
      <p class="body-text">Hello <strong>${recipientName || 'Student'}</strong>,</p>
      <p class="body-text">Your campus email has been successfully verified! Your <strong>${role.toUpperCase()}</strong> account is now active and ready to use.</p>
      
      <div style="background-color: #E7E2D8; border: 1.5px solid #171717; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-family: 'Courier New', Courier, monospace;">What you can do on Campus Mart:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #222;">
          <li><strong>Discover Campus Finds:</strong> Textbooks, hostel essentials, electronics & notes from verified students.</li>
          ${isSeller ? `<li><strong>List Items & Run Auctions:</strong> Turn unused gear into cash with zero listing fees.</li>` : ''}
          <li><strong>Make Offers & Negotiate:</strong> Bargain with campus peers safely.</li>
          <li><strong>Circular Economy:</strong> Save money and keep useful products in circulation across semesters.</li>
        </ul>
      </div>

      <a href="${config.APP_URL}" class="button-link">ENTER THE MARKETPLACE →</a>

      <p class="body-text" style="font-size: 12px; color: #666; margin-top: 20px;">
        Remember to meet in well-lit, public campus areas for item handovers.
      </p>
    `;

    const textContent = `WELCOME TO CAMPUS MART\n\n` +
      `Hello ${recipientName || 'Student'},\n\n` +
      `Your Campus Mart ${role.toUpperCase()} account has been verified and activated!\n\n` +
      `Start discovering textbooks, essentials, electronics, and verified student listings.\n` +
      `Access the platform at: ${config.APP_URL}\n`;

    const result = await client.sendMail({
        from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: title,
        text: textContent,
        html: getEmailWrapper(title, contentHtml)
    });

    if (result && result.rejected && result.rejected.length > 0) {
        const err = new Error(`Email delivery was rejected for recipient: ${result.rejected.join(', ')}`);
        err.code = 'RECIPIENT_REJECTED';
        throw err;
    }

    return result;
}

module.exports = {
    sanitizeAndValidateEmail,
    isEducationalEmail,
    getTransporter,
    resetTransporter,
    getSmtpDiagnosticStatus,
    sendRegistrationOtpEmail,
    sendLoginOtpEmail,
    sendWelcomeEmail,
    mockMailbox
};
