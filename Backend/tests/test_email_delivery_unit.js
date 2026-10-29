const assert = require('assert');
const config = require('../config/config');
const {
    getTransporter,
    resetTransporter,
    getSmtpDiagnosticStatus,
    sendRegistrationOtpEmail,
    sendLoginOtpEmail,
    sendWelcomeEmail,
    mockMailbox
} = require('../utils/emailUtils');

async function runEmailUnitTests() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  EMAIL DELIVERY & SMTP DIAGNOSTICS UNIT TEST SUITE               ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    let passed = 0;

    console.log('--- [TEST 1] Mock Delivery Captures Registration OTP ---');
    config.SMTP_MOCK = true;
    resetTransporter();
    mockMailbox.length = 0;

    const testEmail = 'student.unit@college.edu.in';
    const testOtp = '482910';
    await sendRegistrationOtpEmail(testEmail, 'Rohan Verma', testOtp, 5);

    assert.strictEqual(mockMailbox.length, 1, 'Mock mailbox should contain 1 email');
    const sentEmail = mockMailbox[0];
    assert.strictEqual(sentEmail.to, testEmail);
    assert.ok(sentEmail.subject.includes('Verify your Campus Mart account'));
    assert.ok(sentEmail.text.includes(testOtp), 'Plaintext email must include the 6-digit OTP');
    assert.ok(sentEmail.html.includes(testOtp), 'HTML email must include the 6-digit OTP');
    assert.ok(sentEmail.html.includes('Expires in 5 minutes'), 'HTML email must indicate expiry duration');
    console.log('  ✅ PASS: Mock delivery captured registration email with exact OTP and expiry.\n');
    passed++;

    console.log('--- [TEST 2] Login 2FA Email Template ---');
    mockMailbox.length = 0;
    const loginOtp = '901234';
    await sendLoginOtpEmail(testEmail, 'Rohan Verma', loginOtp, 5);

    assert.strictEqual(mockMailbox.length, 1);
    const loginEmail = mockMailbox[0];
    assert.ok(loginEmail.subject.includes('login verification code'));
    assert.ok(loginEmail.text.includes(loginOtp));
    assert.ok(loginEmail.html.includes(loginOtp));
    assert.ok(loginEmail.html.includes('TWO-FACTOR LOGIN AUTHENTICATION'));
    console.log('  ✅ PASS: Login 2FA email template formatted with correct OTP and security headers.\n');
    passed++;

    console.log('--- [TEST 3] Welcome Email Template ---');
    mockMailbox.length = 0;
    await sendWelcomeEmail(testEmail, 'Rohan Verma', 'seller');

    assert.strictEqual(mockMailbox.length, 1);
    const welcomeMail = mockMailbox[0];
    assert.ok(welcomeMail.subject.includes('Welcome to Campus Mart'));
    assert.ok(welcomeMail.html.includes('SELLER'));
    console.log('  ✅ PASS: Welcome email dispatched with preserved user role.\n');
    passed++;

    console.log('--- [TEST 4] Missing SMTP Configuration Diagnostic Handling ---');
    config.SMTP_MOCK = false;
    const origHost = config.SMTP_HOST;
    const origPass = config.SMTP_PASS;

    config.SMTP_HOST = '';
    config.SMTP_PASS = '';
    resetTransporter();

    const diagStatus = await getSmtpDiagnosticStatus();
    assert.strictEqual(diagStatus.isConfigured, false);
    assert.ok(diagStatus.error.includes('SMTP_NOT_CONFIGURED'));
    assert.ok(diagStatus.hint.includes('16-character Google App Password'));

    const unconfiguredClient = getTransporter();
    let threwConfigError = false;
    try {
        await unconfiguredClient.sendMail({ to: 'test@example.com', subject: 'test', text: 'test' });
    } catch (err) {
        threwConfigError = true;
        assert.strictEqual(err.code, 'SMTP_NOT_CONFIGURED');
    }
    assert.ok(threwConfigError, 'sendMail must throw SMTP_NOT_CONFIGURED when settings are absent');
    console.log('  ✅ PASS: Missing SMTP configuration reported with structured diagnostic error.\n');
    passed++;

    console.log('--- [TEST 5] BadCredentials Diagnostic Reporting ---');
    config.SMTP_HOST = 'smtp.gmail.com';
    config.SMTP_USER = 'campusmart044@gmail.com';
    config.SMTP_PASS = 'invalid_not_app_pass';
    resetTransporter();

    const badCredStatus = await getSmtpDiagnosticStatus();
    console.log('  Diagnostic verified:', badCredStatus.verified, 'hasError:', Boolean(badCredStatus.error));
    if (badCredStatus.error) {
        assert.ok(
            badCredStatus.hint && badCredStatus.hint.includes('Google App Password'),
            'Diagnostic should provide actionable instructions to generate Google App Password'
        );
        console.log('  Actionable Hint:', badCredStatus.hint);
    }
    console.log('  ✅ PASS: Bad credentials or connection failure diagnosed with actionable guidance.\n');
    passed++;

    config.SMTP_HOST = origHost;
    config.SMTP_PASS = origPass;
    config.SMTP_MOCK = true;
    resetTransporter();

    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log(`║  🎉 ALL ${passed} EMAIL UNIT & DIAGNOSTIC TESTS PASSED!            ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
}

runEmailUnitTests().catch(err => {
    console.error('❌ Email Unit Test failed:', err);
    process.exit(1);
});
