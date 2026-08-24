/* ==========================================================================
   CAMPUSMART - Pure Client-Side JavaScript Authentication & OTP Engine
   (No Node.js or backend server required - runs 100% in the browser)
   ========================================================================== */

let currentLoginMethod = 'pwd'; // 'pwd' (Password + OTP) or 'otp' (Quick OTP)
let pendingOtpState = {
    identifier: null,
    code: null,
    user: null,
    role: null,
    expiresAt: 0
};
let otpTimerInterval = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    initOTPInputs();
    updateUserNavUI();
});

// ---------------------------------------------------------------------------
// 1. Core Form Handlers (Signup & Login)
// ---------------------------------------------------------------------------
function initAuthForms() {
    // Signup Form Handler (Pure LocalStorage)
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('signup-fullname').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirmpassword').value;
            const role = document.getElementById('signup-role').value;
            const college = document.getElementById('signup-college').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();

            if (!fullName || !email || !password || !confirmPassword || !college || !phone) {
                showToast('Please fill in all required fields', 'warning');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters long', 'warning');
                return;
            }

            const users = dbGet('users');
            const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (existingUser) {
                showToast('An account with this email already exists', 'error');
                return;
            }

            const newUser = {
                id: 'usr_' + Date.now(),
                name: fullName,
                email: email,
                password: password,
                role: role,
                college: college,
                phone: phone,
                rating: 5.0,
                completedTx: 0,
                trustScore: 85,
                joined: new Date().toISOString().split('T')[0]
            };

            users.push(newUser);
            dbSet('users', users);
            setCurrentUser(newUser);

            showToast('Account created successfully! Welcome to CampusMart.', 'success');
            
            setTimeout(() => {
                const redirectPath = role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
                window.location.href = redirectPath;
            }, 1200);
        });
    }

    // Login Form Handler (Pure Client-Side OTP Trigger)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const identifier = document.getElementById('login-email').value.trim();
            const passwordInput = document.getElementById('login-password');
            const password = passwordInput ? passwordInput.value : '';
            const role = document.getElementById('login-role').value;

            if (!identifier) {
                showToast('Please enter your campus email or phone number', 'warning');
                return;
            }

            const users = dbGet('users');
            let matchedUser = null;

            if (currentLoginMethod === 'pwd') {
                if (!password) {
                    showToast('Please enter your password', 'warning');
                    return;
                }

                matchedUser = users.find(u => 
                    (u.email.toLowerCase() === identifier.toLowerCase() || (u.phone && u.phone === identifier)) && 
                    u.password === password
                );

                if (!matchedUser) {
                    showToast('Invalid credentials! Check your email/password or use demo accounts.', 'error');
                    return;
                }
            } else {
                // Quick OTP Login mode
                matchedUser = users.find(u => 
                    u.email.toLowerCase() === identifier.toLowerCase() || (u.phone && u.phone === identifier)
                );

                // Auto-create guest user if new
                if (!matchedUser) {
                    matchedUser = {
                        id: 'usr_' + Date.now(),
                        name: identifier.split('@')[0] || 'Campus Student',
                        email: identifier.includes('@') ? identifier : `${identifier}@college.edu`,
                        password: 'password123',
                        role: role,
                        college: 'Campus Institute of Technology',
                        phone: identifier.replace(/\D/g, '') || '9876543210',
                        rating: 5.0,
                        completedTx: 0,
                        trustScore: 85,
                        joined: new Date().toISOString().split('T')[0]
                    };
                    users.push(matchedUser);
                    dbSet('users', users);
                }
            }

            // Trigger Pure JS OTP flow
            triggerClientOTP(matchedUser, role);
        });
    }
}

// ---------------------------------------------------------------------------
// 2. Pure JavaScript OTP Generator & Dispatcher
// ---------------------------------------------------------------------------
function generatePureJsOTP() {
    // Generate secure 6-digit random number
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function triggerClientOTP(user, role) {
    const code = generatePureJsOTP();
    const expiryTime = Date.now() + (2 * 60 * 1000); // 2 minutes

    pendingOtpState = {
        identifier: user.email,
        code: code,
        user: user,
        role: role,
        expiresAt: expiryTime
    };

    // Update Modal Information
    const targetEmailEl = document.getElementById('otp-target-email');
    const displayCodeEl = document.getElementById('modal-otp-display');

    if (targetEmailEl) {
        targetEmailEl.textContent = `${user.email} (${user.phone || 'SMS'})`;
    }
    if (displayCodeEl) {
        displayCodeEl.textContent = code;
    }

    // Clear inputs and start timer
    clearOtpInputs();
    startOtpCountdown(120);

    // Open Modal
    openModal('otp-modal');

    // Optional: If EmailJS is loaded, send real email directly from browser!
    if (window.emailjs && window.EMAILJS_SERVICE_ID) {
        try {
            emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_ID, {
                to_email: user.email,
                to_name: user.name,
                otp_code: code
            });
            console.log(`[EmailJS] Sent real OTP to ${user.email}`);
        } catch (e) {
            console.warn('[EmailJS] Browser dispatch error:', e);
        }
    }

    // Display high-visibility notification toast with the OTP
    showToast(`🔐 Verification OTP Code: ${code}`, 'success');

    // Auto-focus first input box
    setTimeout(() => {
        const firstDigit = document.querySelector('.otp-digit[data-index="0"]');
        if (firstDigit) firstDigit.focus();
    }, 150);
}

// ---------------------------------------------------------------------------
// 3. Segmented 6-Digit Inputs (Auto-focus, Backspace, Paste)
// ---------------------------------------------------------------------------
function initOTPInputs() {
    const inputs = document.querySelectorAll('.otp-digit');
    if (!inputs.length) return;

    inputs.forEach((input, index) => {
        // Auto-advance to next box on number typing
        input.addEventListener('input', function() {
            const val = this.value.replace(/\D/g, '');
            this.value = val ? val.slice(-1) : '';

            if (this.value) {
                this.classList.add('filled');
                this.classList.remove('error');
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else {
                    // All 6 digits filled -> Auto trigger verification
                    setTimeout(() => verifyLoginOTP(), 200);
                }
            } else {
                this.classList.remove('filled');
            }
        });

        // Backspace to jump back and clear previous box
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                inputs[index - 1].focus();
                inputs[index - 1].value = '';
                inputs[index - 1].classList.remove('filled');
            } else if (e.key === 'Enter') {
                verifyLoginOTP();
            }
        });

        // Paste support: paste complete 6-digit code at once
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
            const digits = pasteData.replace(/\D/g, '').slice(0, 6);

            if (digits.length > 0) {
                inputs.forEach((inp, idx) => {
                    if (digits[idx]) {
                        inp.value = digits[idx];
                        inp.classList.add('filled');
                        inp.classList.remove('error');
                    } else {
                        inp.value = '';
                        inp.classList.remove('filled');
                    }
                });

                const targetIdx = Math.min(digits.length, inputs.length - 1);
                inputs[targetIdx].focus();

                if (digits.length === 6) {
                    setTimeout(() => verifyLoginOTP(), 200);
                }
            }
        });
    });
}

function clearOtpInputs() {
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
}

// Auto-fill active OTP into inputs
function autoFillCurrentOTP() {
    if (!pendingOtpState || !pendingOtpState.code) return;
    const digits = pendingOtpState.code.split('');
    const inputs = document.querySelectorAll('.otp-digit');

    inputs.forEach((input, index) => {
        if (digits[index]) {
            input.value = digits[index];
            input.classList.add('filled');
            input.classList.remove('error');
        }
    });

    showToast('OTP auto-filled!', 'info');
    setTimeout(() => verifyLoginOTP(), 250);
}

// ---------------------------------------------------------------------------
// 4. Countdown Timer & Resend OTP
// ---------------------------------------------------------------------------
function startOtpCountdown(seconds) {
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    const timerCountEl = document.getElementById('otp-timer-count');
    const timerStatusEl = document.getElementById('otp-timer-status');
    const resendBtn = document.getElementById('btn-resend-otp');

    if (resendBtn) resendBtn.disabled = true;

    let remaining = seconds;
    updateTimerText();

    otpTimerInterval = setInterval(() => {
        remaining--;
        updateTimerText();

        if (remaining <= 0) {
            clearInterval(otpTimerInterval);
            if (timerStatusEl) timerStatusEl.innerHTML = '<span style="color: var(--danger);">Code has expired!</span>';
            if (resendBtn) resendBtn.disabled = false;
            pendingOtpState.code = null;
        }
    }, 1000);

    function updateTimerText() {
        if (!timerCountEl) return;
        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        timerCountEl.textContent = `${mins}:${secs}`;
    }
}

function resendLoginOTP() {
    if (!pendingOtpState.user) {
        showToast('Session expired. Please try signing in again.', 'warning');
        closeOtpModal();
        return;
    }

    const newCode = generatePureJsOTP();
    pendingOtpState.code = newCode;
    pendingOtpState.expiresAt = Date.now() + (2 * 60 * 1000);

    const displayCodeEl = document.getElementById('modal-otp-display');
    const timerStatusEl = document.getElementById('otp-timer-status');
    if (displayCodeEl) displayCodeEl.textContent = newCode;
    if (timerStatusEl) timerStatusEl.innerHTML = 'Code expires in <strong id="otp-timer-count">02:00</strong>';

    clearOtpInputs();
    startOtpCountdown(120);

    showToast(`🔄 New OTP Generated: ${newCode}`, 'success');

    const firstDigit = document.querySelector('.otp-digit[data-index="0"]');
    if (firstDigit) firstDigit.focus();
}

// ---------------------------------------------------------------------------
// 5. Verification & Session Persistence
// ---------------------------------------------------------------------------
function verifyLoginOTP() {
    const inputs = document.querySelectorAll('.otp-digit');
    let enteredCode = '';
    inputs.forEach(i => enteredCode += i.value.trim());

    if (enteredCode.length < 6) {
        showToast('Please enter all 6 digits of the OTP', 'warning');
        return;
    }

    if (!pendingOtpState.code || Date.now() > pendingOtpState.expiresAt) {
        showToast('OTP code has expired! Please click Resend OTP.', 'error');
        inputs.forEach(i => i.classList.add('error'));
        return;
    }

    if (enteredCode !== pendingOtpState.code) {
        showToast('Incorrect OTP code! Please try again.', 'error');
        inputs.forEach(i => i.classList.add('error'));
        return;
    }

    // OTP Verified Successfully!
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    const user = pendingOtpState.user;
    if (pendingOtpState.role) {
        user.role = pendingOtpState.role;
    }

    // Save session in sessionStorage and update LocalStorage user
    setCurrentUser(user);
    closeOtpModal();

    showToast(`🎉 OTP Verified! Welcome back, ${user.name}!`, 'success');

    setTimeout(() => {
        const redirectPath = user.role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
        window.location.href = redirectPath;
    }, 900);
}

function closeOtpModal() {
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    closeModal('otp-modal');
}

// ---------------------------------------------------------------------------
// 6. UI Helpers (Tab switcher, demo autofill, navbar)
// ---------------------------------------------------------------------------
function switchLoginMethod(method) {
    currentLoginMethod = method;
    const tabPwd = document.getElementById('tab-pwd-login');
    const tabOtp = document.getElementById('tab-direct-otp');
    const pwdGroup = document.getElementById('group-login-password');
    const pwdInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('btn-login-submit');

    if (method === 'pwd') {
        if (tabPwd) tabPwd.classList.add('active');
        if (tabOtp) tabOtp.classList.remove('active');
        if (pwdGroup) pwdGroup.style.display = 'block';
        if (pwdInput) pwdInput.required = true;
        if (submitBtn) submitBtn.innerHTML = '<span>Continue to OTP Verification →</span>';
    } else {
        if (tabOtp) tabOtp.classList.add('active');
        if (tabPwd) tabPwd.classList.remove('active');
        if (pwdGroup) pwdGroup.style.display = 'none';
        if (pwdInput) pwdInput.required = false;
        if (submitBtn) submitBtn.innerHTML = '<span>Get Instant OTP Code ⚡</span>';
    }
}

function fillDemoCredentials(email, password, role) {
    const emailEl = document.getElementById('login-email');
    const pwdEl = document.getElementById('login-password');
    const roleEl = document.getElementById('login-role');

    if (emailEl) emailEl.value = email;
    if (pwdEl) pwdEl.value = password;
    if (roleEl) roleEl.value = role;

    showToast(`Loaded demo account (${role}): ${email}`, 'info');
}

function updateUserNavUI() {
    const user = getCurrentUser();
    const userNavBtn = document.getElementById('nav-user-btn');
    if (!userNavBtn) return;

    if (user) {
        const dashboardUrl = user.role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
        const isSubPage = window.location.pathname.includes('/pages/');
        const prefix = isSubPage ? '' : 'pages/';

        userNavBtn.innerHTML = `
            <a href="${prefix}${dashboardUrl}" class="btn btn-outline btn-sm">
                <span>👤 ${user.name.split(' ')[0]}</span>
            </a>
            <button onclick="logoutUser()" class="btn btn-dark btn-sm" title="Logout">
                🚪
            </button>
        `;
    } else {
        const isSubPage = window.location.pathname.includes('/pages/');
        const prefix = isSubPage ? '' : 'pages/';
        userNavBtn.innerHTML = `
            <a href="${prefix}login.html" class="btn btn-primary btn-sm">
                Login / Signup
            </a>
        `;
    }
}
