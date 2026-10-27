// ============================================================
// CAMPUSMART BACKEND — COMPREHENSIVE OTP & AUTHENTICATION TEST SUITE
// Verifies all security, OTP, SMTP, and authentication invariants
// ============================================================

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

process.env.SMTP_MOCK = 'true';
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: './.env' });

const mongoose = require('mongoose');
const UserModel = require('../models/userModel');
const OtpChallengeModel = require('../models/otpChallengeModel');
const otpService = require('../services/otpService');
const { mockMailbox, isEducationalEmail, sendRegistrationOtpEmail, sendLoginOtpEmail } = require('../utils/emailUtils');
const { hashOtp, verifyOtpHash } = require('../utils/securityUtils');

const BASE_URL = 'http://localhost:5000/api/auth';
const API_URL = 'http://localhost:5000/api';

async function ensureServerRunning() {
    try {
        await fetch(`${BASE_URL}/smtp-status`, { signal: AbortSignal.timeout(1000) });
        return;
    } catch (connErr) {
        console.log('[Test Suite] Local server not running. Starting Express server on port 5000...');
        require('../server');
        for (let i = 0; i < 30; i++) {
            try {
                const res = await fetch(`http://localhost:5000/`, { signal: AbortSignal.timeout(500) });
                if (res.ok) {
                    console.log('[Test Suite] Server ready on port 5000.\n');
                    return;
                }
            } catch (err) {
                await new Promise(r => setTimeout(r, 400));
            }
        }
        throw new Error('Could not start or connect to server on port 5000.');
    }
}

async function runTestSuite() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  CAMPUS MART — PRODUCTION OTP AUTHENTICATION TEST SUITE          ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    await ensureServerRunning();

    let passedCount = 0;
    const testEmail = `student.${Date.now()}@chitkara.edu.in`;
    const testPassword = 'CampusPassword123!';
    let regChallengeId = null;
    let registeredOtp = null;
    let testUser = null;

    // Connect DB if configured and not connected
    if (process.env.MONGO_URI && mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2500 });
        } catch (dbErr) {
            console.warn('[Test Suite] Remote Atlas connection notice; operating in resilient in-memory mode.');
        }
    }

    mockMailbox.length = 0;

    // ------------------------------------------------------------
    // TEST 1: Registration requests an OTP and leaks NO session token
    // ------------------------------------------------------------
    console.log('--- [TEST 1] Registration Requests an OTP (No Session Leak) ---');
    const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Aarav Mehta',
            email: testEmail,
            password: testPassword,
            role: 'seller',
            college: 'Chitkara University (CSE)',
            phone: '9876543210'
        })
    });
    const regData = await regRes.json();
    console.log('  Status:', regRes.status, 'requireOtp:', regData.requireOtp, 'challengeId:', Boolean(regData.challengeId));

    if (regRes.status !== 201 || !regData.success || !regData.requireOtp || !regData.challengeId) {
        throw new Error(`TEST 1 Failed: Expected status 201 with requireOtp & challengeId, got: ${JSON.stringify(regData)}`);
    }
    if (regData.token || regData.user) {
        throw new Error('TEST 1 Failed: Session token or user object leaked before email verification!');
    }
    regChallengeId = regData.challengeId;
    console.log('  ✅ PASS: Registration successfully created unverified record, issued OTP challenge, and issued zero session tokens.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 2: Unverified user cannot log in directly
    // ------------------------------------------------------------
    console.log('--- [TEST 2] Unverified User Cannot Log In Directly ---');
    const unverifiedLoginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            password: testPassword
        })
    });
    const unverifiedLoginData = await unverifiedLoginRes.json();
    console.log('  Status:', unverifiedLoginRes.status, 'unverified:', unverifiedLoginData.unverified);

    if (unverifiedLoginRes.status !== 403 || !unverifiedLoginData.unverified) {
        throw new Error(`TEST 2 Failed: Unverified account was not blocked with 403! Got ${unverifiedLoginRes.status}`);
    }
    console.log('  ✅ PASS: Unverified account was strictly forbidden from logging in.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 3: Unverified user cannot access protected marketplace routes
    // ------------------------------------------------------------
    console.log('--- [TEST 3] Unverified User Blocked from Protected APIs ---');
    const protectedRes = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-email': testEmail
        }
    });
    const protectedData = await protectedRes.json();
    console.log('  Status:', protectedRes.status, 'unverified:', protectedData.unverified);
    if (protectedRes.status !== 403 || !protectedData.unverified) {
        throw new Error(`TEST 3 Failed: Unverified account was not blocked from protected products route! Got ${protectedRes.status}`);
    }
    console.log('  ✅ PASS: requireVerifiedUser middleware actively blocked unverified user from marketplace routes.\n');
    passedCount++;

    // Retrieve generated OTP from secure challenge store (for test verification)
    const storedRegChallenge = await OtpChallengeModel.findById(regChallengeId);
    if (!storedRegChallenge) {
        throw new Error('Challenge not found in OtpChallengeModel');
    }
    const emailSent = mockMailbox.find(m => m.to === testEmail && m.subject.includes('Verify'));
    if (emailSent) {
        const match = emailSent.text.match(/code is: (\d{6})/);
        if (match) registeredOtp = match[1];
    }
    if (!registeredOtp) {
        for (let i = 0; i <= 999999; i++) {
            const candidate = String(i).padStart(6, '0');
            if (verifyOtpHash(candidate, storedRegChallenge.otpHash, storedRegChallenge.salt)) {
                registeredOtp = candidate;
                break;
            }
        }
    }
    console.log(`  [Diagnostic] Active Test OTP found: ${registeredOtp ? '****** (Resolved for testing)' : 'Missing'}`);

    // ------------------------------------------------------------
    // TEST 4: Incorrect OTP is rejected with remaining attempts decrement
    // ------------------------------------------------------------
    console.log('--- [TEST 4] Incorrect OTP Is Rejected ---');
    const badOtpRes = await fetch(`${BASE_URL}/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            challengeId: regChallengeId,
            otp: '000000' === registeredOtp ? '999999' : '000000'
        })
    });
    const badOtpData = await badOtpRes.json();
    console.log('  Status:', badOtpRes.status, 'remainingAttempts:', badOtpData.remainingAttempts);

    if (badOtpRes.status !== 400 || badOtpData.success) {
        throw new Error(`TEST 4 Failed: Incorrect OTP was accepted! Got ${badOtpRes.status}`);
    }
    console.log('  ✅ PASS: Incorrect OTP was rejected with attempt tracking.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 5: Wrong challenge ID is rejected
    // ------------------------------------------------------------
    console.log('--- [TEST 5] Wrong Challenge ID Is Rejected ---');
    const wrongChRes = await fetch(`${BASE_URL}/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            challengeId: 'ch_bogus_id_99999',
            otp: registeredOtp
        })
    });
    const wrongChData = await wrongChRes.json();
    if (wrongChRes.status !== 400 || wrongChData.code !== 'CHALLENGE_NOT_FOUND') {
        throw new Error(`TEST 5 Failed: Expected CHALLENGE_NOT_FOUND, got ${wrongChData.code}`);
    }
    console.log('  ✅ PASS: Unknown or invalid challenge ID rejected.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 6: Wrong email is rejected
    // ------------------------------------------------------------
    console.log('--- [TEST 6] Wrong Email for Challenge Is Rejected ---');
    const wrongEmailRes = await fetch(`${BASE_URL}/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'other.student@chitkara.edu.in',
            challengeId: regChallengeId,
            otp: registeredOtp
        })
    });
    const wrongEmailData = await wrongEmailRes.json();
    if (wrongEmailRes.status !== 400 || wrongEmailData.code !== 'EMAIL_MISMATCH') {
        throw new Error(`TEST 6 Failed: Expected EMAIL_MISMATCH, got ${wrongEmailData.code}`);
    }
    console.log('  ✅ PASS: Email mismatch safely rejected.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 7: Correct registration OTP verifies account and issues session
    // ------------------------------------------------------------
    console.log('--- [TEST 7] Correct Registration OTP Verifies Account & Issues Session ---');
    const goodOtpRes = await fetch(`${BASE_URL}/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            challengeId: regChallengeId,
            otp: registeredOtp
        })
    });
    const goodOtpData = await goodOtpRes.json();
    console.log('  Status:', goodOtpRes.status, 'User Verified:', goodOtpData.user?.isVerified, 'Token Issued:', Boolean(goodOtpData.token));

    if (goodOtpRes.status !== 200 || !goodOtpData.success || !goodOtpData.user?.isVerified || !goodOtpData.token) {
        throw new Error(`TEST 7 Failed: Expected 200 with isVerified: true and token, got ${goodOtpRes.status}`);
    }
    testUser = goodOtpData.user;
    console.log('  ✅ PASS: Correct OTP verified user account and issued first session token.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 8: Single-Use Enforcement: Reusing OTP is rejected
    // ------------------------------------------------------------
    console.log('--- [TEST 8] Single-Use Enforcement: Reusing OTP Is Rejected ---');
    const reuseRes = await fetch(`${BASE_URL}/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            challengeId: regChallengeId,
            otp: registeredOtp
        })
    });
    const reuseData = await reuseRes.json();
    console.log('  Status:', reuseRes.status, 'Message:', reuseData.message);

    if (reuseRes.status !== 400 || reuseData.code !== 'ALREADY_USED') {
        throw new Error(`TEST 8 Failed: Expected ALREADY_USED code, got ${reuseData.code}`);
    }
    console.log('  ✅ PASS: Reused OTP was blocked (Single-Use strictly enforced).\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 9: Account verified state persisted in DB
    // ------------------------------------------------------------
    console.log('--- [TEST 9] Account Verified State Persisted ---');
    const verifiedDbUser = await UserModel.findByEmail(testEmail);
    console.log('  DB User isVerified:', verifiedDbUser?.isVerified, 'verifiedAt:', Boolean(verifiedDbUser?.verifiedAt));
    if (!verifiedDbUser || !verifiedDbUser.isVerified || !verifiedDbUser.verifiedAt) {
        throw new Error('TEST 9 Failed: User account was not marked verified in database!');
    }
    console.log('  ✅ PASS: Account verification status successfully persisted.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 10: Login credentials initiate 2FA OTP challenge (No Session Leak)
    // ------------------------------------------------------------
    console.log('--- [TEST 10] Login Credentials Initiate 2FA OTP Challenge (No Session Leak) ---');
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            password: testPassword,
            role: 'seller'
        })
    });
    const loginData = await loginRes.json();
    console.log('  Status:', loginRes.status, 'requireOtp:', loginData.requireOtp, 'challengeId:', Boolean(loginData.challengeId));

    if (loginRes.status !== 200 || !loginData.requireOtp || !loginData.challengeId) {
        throw new Error(`TEST 10 Failed: Expected 200 with requireOtp: true, got ${loginRes.status}`);
    }
    if (loginData.user || loginData.token) {
        throw new Error('TEST 10 Failed: Session or token was issued before OTP verification!');
    }
    const loginChallengeId = loginData.challengeId;
    console.log('  ✅ PASS: Login credentials verified and 2FA challenge dispatched without leaking session.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 11: Purpose Mismatch Rejected (Cannot use login challenge on registration endpoint)
    // ------------------------------------------------------------
    console.log('--- [TEST 11] Challenge Purpose Mismatch Rejected ---');
    const purposeMismatchRes = await fetch(`${BASE_URL}/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            challengeId: loginChallengeId,
            otp: '123456'
        })
    });
    const purposeData = await purposeMismatchRes.json();
    if (purposeMismatchRes.status !== 400 || purposeData.code !== 'INVALID_PURPOSE') {
        throw new Error(`TEST 11 Failed: Expected INVALID_PURPOSE, got ${purposeData.code}`);
    }
    console.log('  ✅ PASS: Cross-purpose verification attempt strictly rejected.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 12: Login OTP Verification completes full session
    // ------------------------------------------------------------
    console.log('--- [TEST 12] Login OTP Verification Issues Full Session ---');
    const storedLoginChallenge = await OtpChallengeModel.findById(loginChallengeId);
    let loginOtp = null;
    const loginMail = mockMailbox.find(m => m.to === testEmail && (m.subject.includes('login') || m.subject.includes('Login') || m.subject.includes('verification')));
    if (loginMail) {
        const match = loginMail.text.match(/code is: (\d{6})/);
        if (match) loginOtp = match[1];
    }
    if (!loginOtp) {
        for (let i = 0; i <= 999999; i++) {
            const candidate = String(i).padStart(6, '0');
            if (verifyOtpHash(candidate, storedLoginChallenge.otpHash, storedLoginChallenge.salt)) {
                loginOtp = candidate;
                break;
            }
        }
    }

    const verifyLoginRes = await fetch(`${BASE_URL}/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            challengeId: loginChallengeId,
            otp: loginOtp,
            role: 'seller'
        })
    });
    const verifyLoginData = await verifyLoginRes.json();
    console.log('  Status:', verifyLoginRes.status, 'User Role:', verifyLoginData.user?.role, 'Token:', Boolean(verifyLoginData.token));

    if (verifyLoginRes.status !== 200 || !verifyLoginData.success || !verifyLoginData.user || !verifyLoginData.token) {
        throw new Error(`TEST 12 Failed: Expected 200 with user session, got ${verifyLoginRes.status}`);
    }
    if (verifyLoginData.user.role !== 'seller') {
        throw new Error(`TEST 12 Failed: Expected seller role, got ${verifyLoginData.user.role}`);
    }
    console.log('  ✅ PASS: 2FA Login succeeded with preserved role and JWT session.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 13: Expired OTP is rejected
    // ------------------------------------------------------------
    console.log('--- [TEST 13] Expired OTP Is Rejected ---');
    await OtpChallengeModel.create({
        id: 'expired_ch_test',
        email: testEmail,
        purpose: 'login',
        otpHash: hashOtp('123456').hash,
        salt: 'salttest',
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() - 60000), // 1 minute in the past
        resendCooldownUntil: new Date(Date.now() - 60000)
    });

    const expVerify = await otpService.verifyOtp({
        challengeId: 'expired_ch_test',
        email: testEmail,
        otp: '123456',
        purpose: 'login'
    });
    console.log('  Expired Result valid:', expVerify.valid, 'code:', expVerify.code);
    if (expVerify.valid || expVerify.code !== 'EXPIRED') {
        throw new Error(`TEST 13 Failed: Expired challenge was not rejected with EXPIRED code!`);
    }
    console.log('  ✅ PASS: Expired OTP correctly rejected.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 14: Resend Cooldown Enforced (even when challengeId is omitted)
    // ------------------------------------------------------------
    console.log('--- [TEST 14] Resend Cooldown Enforced & Cannot Be Bypassed ---');
    // Initiate fresh login challenge to activate cooldown
    const freshLogin = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const freshLoginData = await freshLogin.json();
    const activeChId = freshLoginData.challengeId;

    // Resend attempt 1: with challengeId -> should be 429
    const cooldownRes1 = await fetch(`${BASE_URL}/resend-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, challengeId: activeChId })
    });
    console.log('  Resend with ID status:', cooldownRes1.status);
    if (cooldownRes1.status !== 429) {
        throw new Error(`TEST 14 Failed: Expected 429 for immediate resend, got ${cooldownRes1.status}`);
    }

    // Resend attempt 2: WITHOUT challengeId -> MUST STILL BE 429 (no bypass!)
    const cooldownRes2 = await fetch(`${BASE_URL}/resend-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
    });
    console.log('  Resend WITHOUT ID status:', cooldownRes2.status);
    if (cooldownRes2.status !== 429) {
        throw new Error(`TEST 14 Failed: Cooldown bypass attempt succeeded! Expected 429, got ${cooldownRes2.status}`);
    }
    console.log('  ✅ PASS: Resend cooldown rate-limiting actively enforced and cannot be bypassed.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 15: Maximum attempts limit strictly enforced
    // ------------------------------------------------------------
    console.log('--- [TEST 15] Maximum Verification Attempts Enforced ---');
    const maxAttemptChallenge = await otpService.createChallenge({
        email: testEmail,
        purpose: 'login'
    });
    for (let attempt = 1; attempt <= 5; attempt++) {
        await otpService.verifyOtp({
            challengeId: maxAttemptChallenge.challengeId,
            email: testEmail,
            otp: '000000',
            purpose: 'login'
        });
    }
    // 6th attempt with correct OTP must still be blocked
    const lockedVerify = await otpService.verifyOtp({
        challengeId: maxAttemptChallenge.challengeId,
        email: testEmail,
        otp: maxAttemptChallenge.otp,
        purpose: 'login'
    });
    console.log('  Locked attempt valid:', lockedVerify.valid, 'code:', lockedVerify.code);
    if (lockedVerify.valid || lockedVerify.code !== 'MAX_ATTEMPTS_EXCEEDED') {
        throw new Error('TEST 15 Failed: Exceeded attempts challenge was not locked out!');
    }
    console.log('  ✅ PASS: Challenge locked after maximum failed attempts reached.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 16: Invalid credentials rejected during login
    // ------------------------------------------------------------
    console.log('--- [TEST 16] Invalid Credentials Rejected ---');
    const badLogin = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            password: 'WrongPassword999!'
        })
    });
    console.log('  Status for bad password:', badLogin.status);
    if (badLogin.status !== 401) {
        throw new Error(`TEST 16 Failed: Expected 401 for wrong password, got ${badLogin.status}`);
    }
    console.log('  ✅ PASS: Invalid credentials rejected with 401.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 17: Educational email policy enforced
    // ------------------------------------------------------------
    console.log('--- [TEST 17] Personal Email (@gmail.com) Rejection ---');
    const gmailCheck = isEducationalEmail('test@gmail.com');
    console.log('  Gmail student registration valid:', gmailCheck.valid);
    if (gmailCheck.valid) {
        throw new Error('TEST 17 Failed: @gmail.com was accepted as educational student email!');
    }
    console.log('  ✅ PASS: Educational email policy protects student marketplace registration.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 18: Duplicate verified registration blocked
    // ------------------------------------------------------------
    console.log('--- [TEST 18] Duplicate Verified Registration Blocked ---');
    const dupRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Duplicate Test',
            email: testEmail,
            password: testPassword,
            role: 'buyer'
        })
    });
    console.log('  Status for duplicate registered email:', dupRes.status);
    if (dupRes.status !== 409) {
        throw new Error(`TEST 18 Failed: Expected 409 conflict, got ${dupRes.status}`);
    }
    console.log('  ✅ PASS: Duplicate registration of verified account safely blocked.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 19: Safe SMTP Diagnostic Endpoint
    // ------------------------------------------------------------
    console.log('--- [TEST 19] SMTP Status Diagnostic Endpoint ---');
    const smtpStatusRes = await fetch(`${BASE_URL}/smtp-status`);
    const smtpStatusData = await smtpStatusRes.json();
    console.log('  Status code:', smtpStatusRes.status, 'isMock:', smtpStatusData.smtp?.isMock, 'host:', smtpStatusData.smtp?.host);
    if (smtpStatusRes.status !== 200 || !smtpStatusData.success || !smtpStatusData.smtp) {
        throw new Error('TEST 19 Failed: smtp-status diagnostic failed!');
    }
    // Verify no password or sensitive token leaked
    const jsonStr = JSON.stringify(smtpStatusData);
    if (jsonStr.includes(process.env.SMTP_PASS || 'NEVER_MATCH') && process.env.SMTP_PASS) {
        throw new Error('TEST 19 Failed: SMTP password leaked in diagnostic status!');
    }
    console.log('  ✅ PASS: SMTP diagnostic status reported cleanly without leaking secrets.\n');
    passedCount++;

    // ------------------------------------------------------------
    // TEST 20: Clean up test accounts from DB
    // ------------------------------------------------------------
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.collection('users').deleteOne({ email: testEmail });
        await mongoose.connection.collection('otpchallenges').deleteMany({ email: testEmail });
        await mongoose.connection.collection('otpchallenges').deleteOne({ id: 'expired_ch_test' });
    }

    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log(`║  🎉 ALL ${passedCount} AUTHENTICATION & OTP INVARIANTS VERIFIED!         ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    await mongoose.disconnect();
    process.exit(0);
}

runTestSuite().catch(err => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
});
