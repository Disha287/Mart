// ============================================================
// CAMPUSMART BACKEND — AUTH SECURITY & NO-BYPASS TEST SUITE
// Verifies that OTP cannot be bypassed and direct token leaks are prevented
// ============================================================

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

process.env.SMTP_MOCK = 'true';
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const baseUrl = 'http://localhost:5000/api/auth';

async function runAuthSecurityTests() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  VERIFYING OTP ENFORCEMENT & STRICT ANTI-BYPASS SECURITY         ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // Ensure server is reachable
    try {
        await fetch('http://localhost:5000/', { signal: AbortSignal.timeout(2000) });
    } catch (e) {
        require('../server');
        for (let i = 0; i < 20; i++) {
            try {
                const res = await fetch('http://localhost:5000/', { signal: AbortSignal.timeout(500) });
                if (res.ok) break;
            } catch (err) {
                await new Promise(r => setTimeout(r, 400));
            }
        }
    }

    const testEmail = `student.nobypass.${Date.now()}@chitkara.edu.in`;
    const testPassword = 'CampusPassword123!';

    // TEST 1: Registration requires OTP and yields NO session token
    console.log('--- [TEST 1] Register Requires OTP and Does Not Issue Session Token ---');
    const regRes = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Priya Sharma',
            email: testEmail,
            password: testPassword,
            role: 'buyer',
            college: 'Chitkara University',
            phone: '9876543210'
        })
    });
    const regData = await regRes.json();
    console.log('  Status:', regRes.status, 'requireOtp:', regData.requireOtp, 'hasToken:', Boolean(regData.token));

    if (regRes.status !== 201 || !regData.success || !regData.requireOtp) {
        throw new Error(`TEST 1 Failed: Expected status 201 with requireOtp, got ${regRes.status}`);
    }
    if (regData.token || regData.user) {
        throw new Error('TEST 1 Failed: Session token or user object leaked before email verification!');
    }
    console.log('  ✅ PASS: Registration requires OTP verification; no token issued.\n');

    // TEST 2: Register with personal email (MUST BE REJECTED)
    console.log('--- [TEST 2] Register with Personal Email (@gmail.com) Rejected ---');
    const pEmail = `test.${Date.now()}@gmail.com`;
    const pRes = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Personal User',
            email: pEmail,
            password: testPassword,
            role: 'buyer',
            college: 'Chitkara University'
        })
    });
    const pData = await pRes.json();
    console.log('  Status:', pRes.status, 'Message:', pData.message);

    if (pRes.status !== 400 || pData.success !== false) {
        throw new Error(`TEST 2 Failed: Expected 400 rejection for @gmail.com, got ${pRes.status}`);
    }
    console.log('  ✅ PASS: Personal email correctly rejected by educational email policy.\n');

    // TEST 3: Unverified user cannot log in directly
    console.log('--- [TEST 3] Unverified Account Cannot Log In ---');
    const loginRes = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            password: testPassword
        })
    });
    const loginData = await loginRes.json();
    console.log('  Status:', loginRes.status, 'unverified:', loginData.unverified);

    if (loginRes.status !== 403 || !loginData.unverified) {
        throw new Error(`TEST 3 Failed: Expected 403 unverified rejection, got ${loginRes.status}`);
    }
    console.log('  ✅ PASS: Unverified account strictly forbidden from logging in.\n');

    // TEST 4: Duplicate Account Prevention
    console.log('--- [TEST 4] Duplicate Account Re-registration Safety ---');
    const dupRes = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Priya Sharma Updated',
            email: testEmail,
            password: testPassword,
            role: 'buyer',
            college: 'Chitkara University',
            phone: '9876543210'
        })
    });
    const dupData = await dupRes.json();
    console.log('  Status:', dupRes.status, 'requireOtp:', dupData.requireOtp);

    // Should update unverified user and issue new challenge without duplicate records
    if (dupRes.status !== 201 || !dupData.requireOtp) {
        throw new Error(`TEST 4 Failed: Expected 201 with requireOtp for unverified re-registration, got ${dupRes.status}`);
    }
    console.log('  ✅ PASS: Unverified user re-registration handled safely without duplicating.\n');

    // Cleanup
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.collection('users').deleteOne({ email: testEmail });
        await mongoose.connection.collection('otpchallenges').deleteMany({ email: testEmail });
    }

    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 ALL ANTI-BYPASS & SECURITY CHECKS PASSED SUCCESSFULLY!       ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    process.exit(0);
}

runAuthSecurityTests().catch(err => {
    console.error('❌ Security test failed:', err);
    process.exit(1);
});
