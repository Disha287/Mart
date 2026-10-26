// ============================================================
// VERIFICATION TEST SUITE — DIRECT AUTHENTICATION (NO OTP)
// ============================================================

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function runAuthTests() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  RUNNING DIRECT AUTH (NO OTP) TEST SUITE                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    const baseUrl = 'http://localhost:5000/api/auth';
    const testEmail = `student.${Date.now()}@chitkara.edu.in`;
    const testPassword = 'Password123!';

    // TEST 1: Register with valid educational email
    console.log('--- [TEST 1] Register with Valid Educational Email ---');
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
    console.log('  Status:', regRes.status, 'Response:', regData);

    if (regRes.status !== 201 || !regData.success) {
        throw new Error(`TEST 1 Failed: Expected status 201 with success: true, got ${regRes.status}`);
    }
    if (regData.unverified || regData.otpSent) {
        throw new Error('TEST 1 Failed: Response still contains OTP/unverified flags!');
    }
    console.log('  ✅ PASS: User registered directly with zero OTP requirements.\n');

    // TEST 2: Register with personal email (MUST BE REJECTED)
    console.log('--- [TEST 2] Register with Personal Email (@gmail.com) ---');
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
    console.log('  Status:', pRes.status, 'Response:', pData);

    if (pRes.status !== 400 || pData.success !== false) {
        throw new Error(`TEST 2 Failed: Expected 400 rejection for @gmail.com, got ${pRes.status}`);
    }
    console.log('  ✅ PASS: Personal email correctly rejected by backend validation.\n');

    // TEST 3: Login with newly registered educational user
    console.log('--- [TEST 3] Direct Login with Registered Educational Account ---');
    const loginRes = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            password: testPassword
        })
    });
    const loginData = await loginRes.json();
    console.log('  Status:', loginRes.status, 'Response:', loginData);

    if (loginRes.status !== 200 || !loginData.success || !loginData.user) {
        throw new Error(`TEST 3 Failed: Expected 200 login success, got ${loginRes.status}`);
    }
    console.log('  ✅ PASS: Login succeeded directly with full user profile.\n');

    // TEST 4: Duplicate Account Prevention
    console.log('--- [TEST 4] Duplicate Account Prevention ---');
    const dupRes = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Duplicate Student',
            email: testEmail,
            password: testPassword,
            role: 'buyer',
            college: 'Chitkara University'
        })
    });
    const dupData = await dupRes.json();
    console.log('  Status:', dupRes.status, 'Response:', dupData);

    if (dupRes.status !== 409) {
        throw new Error(`TEST 4 Failed: Expected 409 conflict for existing email, got ${dupRes.status}`);
    }
    console.log('  ✅ PASS: Duplicate registration properly blocked.\n');

    // Cleanup created test user from database
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.collection('users').deleteOne({ email: testEmail });
    await mongoose.disconnect();

    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 ALL DIRECT AUTH (NO OTP) TESTS PASSED SUCCESSFULLY!          ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
}

runAuthTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
