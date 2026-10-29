require('dotenv').config();
const nodemailer = require('nodemailer');

async function testConnection() {
    console.log('--- Testing SMTP Settings from .env ---');
    console.log('Host:   ', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.log('Port:   ', process.env.SMTP_PORT || 587);
    console.log('Secure: ', process.env.SMTP_SECURE || 'false');
    console.log('User:   ', process.env.SMTP_USER || 'Not set');
    console.log('From:   ', process.env.SMTP_FROM_EMAIL || 'Not set');
    console.log('Pass:   ', process.env.SMTP_PASS ? '******** (' + process.env.SMTP_PASS.length + ' chars)' : 'Not set');
    console.log('---------------------------------------');

    const cleanPass = process.env.SMTP_PASS ? String(process.env.SMTP_PASS).trim().replace(/\s+/g, '') : '';

    if (!process.env.SMTP_USER || !cleanPass) {
        console.error('\n❌ SMTP Test Aborted:');
        console.error('   SMTP_USER or SMTP_PASS is missing in Backend/.env.');
        console.error('   Please configure your Gmail sender and 16-character Google App Password.');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: cleanPass
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000
    });

    try {
        console.log('Connecting to SMTP server (smtp.gmail.com:587)...');
        await transporter.verify();
        console.log('✅ SMTP connection and credentials ACCEPTED by Gmail!');

        const targetEmail = process.argv[2] || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
        console.log(`Sending test email to ${targetEmail}...`);

        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'CampusMart'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: 'CampusMart — Gmail SMTP Test Verification',
            text: 'Your CampusMart Gmail SMTP email delivery is working successfully with STARTTLS on port 587!'
        });

        console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    } catch (err) {
        console.error('\n❌ SMTP Test Failed:');
        console.error(err.message);
        if (err.message.includes('BadCredentials') || err.message.includes('535') || err.code === 'EAUTH') {
            console.error('\n👉 REASON: Google rejected the login credentials.');
            console.error('   You cannot use your standard account password with Gmail SMTP.');
            console.error('   You must create a 16-character Google App Password:');
            console.error('   1. Go to https://myaccount.google.com/apppasswords');
            console.error('   2. Generate an App Password (name it "CampusMart")');
            console.error('   3. Put the 16 characters in SMTP_PASS in Backend/.env');
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
            console.error('\n👉 REASON: Connection timed out while trying to reach smtp.gmail.com on port 587.');
            console.error('   Check if outbound port 587 is blocked by your ISP, firewall, or VPN.');
        }
    }
}

testConnection();
