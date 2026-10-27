/* ==========================================================================
   CAMPUSMART - Authentication Engine (Production Email OTP & 2FA)
   ========================================================================== */

const AUTH_API_BASE = (window.location.origin.includes('localhost'))
    ? (window.location.port === '5000' ? '/api/auth' : 'http://localhost:5000/api/auth')
    : '/api/auth';

// In-memory verification challenge state (NEVER stored in localStorage)
let activeRegChallenge = null;
let activeLoginChallenge = null;
let regCooldownTimer = null;
let loginCooldownTimer = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    updateUserNavUI();
});

// Password strength validator
function validatePasswordRequirements(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required.' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
    }
    return { valid: true };
}

// ---------------------------------------------------------------------------
// 1. Core Form Handlers (Signup & Login with OTP Verification)
// ---------------------------------------------------------------------------
function initAuthForms() {
    // -----------------------------------------------------------------------
    // A. Signup Form & Registration OTP Verification
    // -----------------------------------------------------------------------
    const signupForm = document.getElementById('signup-form');
    const signupFormSection = document.getElementById('signup-form-section');
    const signupOtpSection = document.getElementById('signup-otp-section');
    const signupOtpForm = document.getElementById('signup-otp-form');
    const signupResendBtn = document.getElementById('signup-resend-btn');
    const signupBackBtn = document.getElementById('signup-back-btn');
    const signupTargetEmail = document.getElementById('signup-otp-target-email');
    const signupOtpInput = document.getElementById('signup-otp-input');

    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const fullName = document.getElementById('signup-fullname').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirmpassword').value;
            const role = document.getElementById('signup-role').value;
            const college = document.getElementById('signup-college').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();
            const submitBtn = signupForm.querySelector('button[type="submit"]');

            if (!fullName || !email || !password || !confirmPassword || !college || !phone) {
                showToast('Please fill in all required fields.', 'warning');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match.', 'error');
                return;
            }

            const passwordValidation = validatePasswordRequirements(password);
            if (!passwordValidation.valid) {
                showToast(passwordValidation.message, 'warning');
                return;
            }

            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Verifying & Sending Code... ⏳</span>';
            }

            try {
                const response = await fetch(`${AUTH_API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: fullName,
                        email: email,
                        password: password,
                        role: role,
                        college: college,
                        phone: phone
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    activeRegChallenge = {
                        email: data.email || email,
                        challengeId: data.challengeId
                    };

                    // Switch view to OTP verification
                    if (signupFormSection && signupOtpSection) {
                        signupFormSection.style.display = 'none';
                        signupOtpSection.style.display = 'block';
                    }
                    if (signupTargetEmail) {
                        signupTargetEmail.textContent = data.email || email;
                    }
                    if (signupOtpInput) {
                        signupOtpInput.value = data.devOtp || '';
                        signupOtpInput.focus();
                    }

                    const devBanner = document.getElementById('signup-dev-otp-banner');
                    if (devBanner) {
                        if (data.devOtp) {
                            devBanner.style.display = 'block';
                            devBanner.innerHTML = `
                                <div style="background: #FFFDF8; border: 1.5px dashed var(--accent-red); padding: 0.85rem; margin-bottom: 1.25rem; text-align: center; font-family: var(--font-mono); font-size: 0.82rem; color: var(--ink-primary);">
                                    <span style="color: var(--accent-red); font-weight: 900; letter-spacing: 0.1em;">🔑 VERIFICATION CODE:</span>
                                    <div style="font-size: 1.8rem; font-weight: 900; letter-spacing: 0.25em; color: var(--accent-red); margin: 0.25rem 0;">${data.devOtp}</div>
                                    <span style="font-size: 0.72rem; color: var(--ink-muted);">(Pre-filled automatically below • Click Verify below to activate)</span>
                                </div>
                            `;
                        } else {
                            devBanner.style.display = 'none';
                        }
                    }

                    startResendCooldown('signup', data.cooldownSeconds || 60);
                    showToast(data.message || 'Verification code sent to your campus email.', 'success');
                } else {
                    showToast(data.message || 'Registration failed. Please check your details.', 'error');
                }
            } catch (err) {
                console.error('Registration API error:', err);
                showToast('Could not reach Campus Mart authentication server. Please check your connection.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // Submit Registration OTP
    if (signupOtpForm) {
        signupOtpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!activeRegChallenge || !activeRegChallenge.challengeId) {
                showToast('Verification challenge expired. Please submit the registration form again.', 'error');
                return;
            }

            const otpVal = signupOtpInput ? signupOtpInput.value.trim() : '';
            if (!otpVal || otpVal.length !== 6) {
                showToast('Please enter the full 6-digit verification code.', 'warning');
                return;
            }

            const submitBtn = document.getElementById('signup-otp-submit-btn');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Activating Account... ⏳</span>';
            }

            try {
                const response = await fetch(`${AUTH_API_BASE}/verify-registration-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: activeRegChallenge.email,
                        challengeId: activeRegChallenge.challengeId,
                        otp: otpVal
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showToast('🎉 ' + data.message, 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1200);
                } else {
                    showToast(data.message || 'Verification failed. Please check the code.', 'error');
                    if (signupOtpInput) {
                        signupOtpInput.select();
                    }
                }
            } catch (err) {
                console.error('OTP Verification error:', err);
                showToast('Failed to connect to verification server.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // Resend Registration OTP
    if (signupResendBtn) {
        signupResendBtn.addEventListener('click', async function() {
            if (!activeRegChallenge) return;
            signupResendBtn.disabled = true;
            signupResendBtn.textContent = 'Sending...';

            try {
                const response = await fetch(`${AUTH_API_BASE}/resend-registration-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: activeRegChallenge.email,
                        challengeId: activeRegChallenge.challengeId
                    })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    activeRegChallenge.challengeId = data.challengeId;
                    if (signupOtpInput && data.devOtp) {
                        signupOtpInput.value = data.devOtp;
                    }
                    const devBanner = document.getElementById('signup-dev-otp-banner');
                    if (devBanner && data.devOtp) {
                        devBanner.style.display = 'block';
                        devBanner.innerHTML = `
                            <div style="background: #FFFDF8; border: 1.5px dashed var(--accent-red); padding: 0.85rem; margin-bottom: 1.25rem; text-align: center; font-family: var(--font-mono); font-size: 0.82rem; color: var(--ink-primary);">
                                <span style="color: var(--accent-red); font-weight: 900; letter-spacing: 0.1em;">🔑 VERIFICATION CODE:</span>
                                <div style="font-size: 1.8rem; font-weight: 900; letter-spacing: 0.25em; color: var(--accent-red); margin: 0.25rem 0;">${data.devOtp}</div>
                                <span style="font-size: 0.72rem; color: var(--ink-muted);">(Pre-filled automatically below • Click Verify below to activate)</span>
                            </div>
                        `;
                    }
                    startResendCooldown('signup', data.cooldownSeconds || 60);
                    showToast('A fresh verification code has been dispatched.', 'success');
                } else {
                    showToast(data.message || 'Could not resend verification code.', 'error');
                    signupResendBtn.disabled = false;
                    signupResendBtn.textContent = 'Resend Code';
                }
            } catch (err) {
                console.error('Resend OTP error:', err);
                showToast('Network error while requesting code resend.', 'error');
                signupResendBtn.disabled = false;
                signupResendBtn.textContent = 'Resend Code';
            }
        });
    }

    // Back to Signup Form
    if (signupBackBtn) {
        signupBackBtn.addEventListener('click', function() {
            if (signupFormSection && signupOtpSection) {
                signupOtpSection.style.display = 'none';
                signupFormSection.style.display = 'block';
            }
            if (regCooldownTimer) clearInterval(regCooldownTimer);
        });
    }

    // -----------------------------------------------------------------------
    // B. Login Form & Two-Factor OTP Verification
    // -----------------------------------------------------------------------
    const loginForm = document.getElementById('login-form');
    const loginFormSection = document.getElementById('login-form-section');
    const loginOtpSection = document.getElementById('login-otp-section');
    const loginOtpForm = document.getElementById('login-otp-form');
    const loginResendBtn = document.getElementById('login-resend-btn');
    const loginBackBtn = document.getElementById('login-back-btn');
    const loginTargetEmail = document.getElementById('login-otp-target-email');
    const loginOtpInput = document.getElementById('login-otp-input');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const identifier = document.getElementById('login-email').value.trim();
            const passwordInput = document.getElementById('login-password');
            const password = passwordInput ? passwordInput.value : '';
            const role = document.getElementById('login-role').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            if (!identifier) {
                showToast('Please enter your campus email.', 'warning');
                return;
            }

            if (!password) {
                showToast('Please enter your password.', 'warning');
                return;
            }

            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Verifying Credentials... ⏳</span>';
            }

            try {
                const response = await fetch(`${AUTH_API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: identifier,
                        password: password,
                        role: role
                    })
                });

                const data = await response.json();

                if (response.ok && data.success && data.requireOtp) {
                    // Credentials validated! Transition to 2FA OTP verification
                    activeLoginChallenge = {
                        email: data.email || identifier,
                        challengeId: data.challengeId,
                        role: role
                    };

                    if (loginFormSection && loginOtpSection) {
                        loginFormSection.style.display = 'none';
                        loginOtpSection.style.display = 'block';
                    }
                    if (loginTargetEmail) {
                        loginTargetEmail.textContent = data.email || identifier;
                    }
                    if (loginOtpInput) {
                        loginOtpInput.value = data.devOtp || '';
                        loginOtpInput.focus();
                    }

                    const devBanner = document.getElementById('login-dev-otp-banner');
                    if (devBanner) {
                        if (data.devOtp) {
                            devBanner.style.display = 'block';
                            devBanner.innerHTML = `
                                <div style="background: #FFFDF8; border: 1.5px dashed var(--accent-red); padding: 0.85rem; margin-bottom: 1.25rem; text-align: center; font-family: var(--font-mono); font-size: 0.82rem; color: var(--ink-primary);">
                                    <span style="color: var(--accent-red); font-weight: 900; letter-spacing: 0.1em;">🔑 2FA VERIFICATION CODE:</span>
                                    <div style="font-size: 1.8rem; font-weight: 900; letter-spacing: 0.25em; color: var(--accent-red); margin: 0.25rem 0;">${data.devOtp}</div>
                                    <span style="font-size: 0.72rem; color: var(--ink-muted);">(Pre-filled automatically below • Click Verify below to enter)</span>
                                </div>
                            `;
                        } else {
                            devBanner.style.display = 'none';
                        }
                    }

                    startResendCooldown('login', data.cooldownSeconds || 60);
                    showToast(data.message || 'Login verification code sent to your email.', 'success');
                } else if (response.status === 403 && data.unverified) {
                    showToast('⚠️ ' + data.message, 'warning');
                } else {
                    showToast(data.message || 'Invalid email or password.', 'error');
                }
            } catch (err) {
                console.error('Login error:', err);
                // STRICT SECURITY: Do NOT fallback to local plaintext authentication
                showToast('Could not reach Campus Mart authentication server. Please check your connection.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // Submit Login 2FA OTP
    if (loginOtpForm) {
        loginOtpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!activeLoginChallenge || !activeLoginChallenge.challengeId) {
                showToast('Verification challenge expired. Please enter your credentials again.', 'error');
                return;
            }

            const otpVal = loginOtpInput ? loginOtpInput.value.trim() : '';
            if (!otpVal || otpVal.length !== 6) {
                showToast('Please enter the 6-digit verification code.', 'warning');
                return;
            }

            const submitBtn = document.getElementById('login-otp-submit-btn');
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Verifying Code... ⏳</span>';
            }

            try {
                const response = await fetch(`${AUTH_API_BASE}/verify-login-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: activeLoginChallenge.email,
                        challengeId: activeLoginChallenge.challengeId,
                        otp: otpVal,
                        role: activeLoginChallenge.role
                    })
                });

                const data = await response.json();

                if (response.ok && data.success && data.user) {
                    // Two-factor verified: Persist session and redirect
                    setCurrentUser(data.user);
                    showToast('🎉 Login successful! Welcome back.', 'success');

                    setTimeout(() => {
                        const redirectPath = data.user.role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
                        window.location.href = redirectPath;
                    }, 800);
                } else {
                    showToast(data.message || 'Invalid verification code.', 'error');
                    if (loginOtpInput) {
                        loginOtpInput.select();
                    }
                }
            } catch (err) {
                console.error('Login OTP verification error:', err);
                showToast('Failed to verify login code.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // Resend Login OTP
    if (loginResendBtn) {
        loginResendBtn.addEventListener('click', async function() {
            if (!activeLoginChallenge) return;
            loginResendBtn.disabled = true;
            loginResendBtn.textContent = 'Sending...';

            try {
                const response = await fetch(`${AUTH_API_BASE}/resend-login-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: activeLoginChallenge.email,
                        challengeId: activeLoginChallenge.challengeId
                    })
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    activeLoginChallenge.challengeId = data.challengeId;
                    if (loginOtpInput && data.devOtp) {
                        loginOtpInput.value = data.devOtp;
                    }
                    const devBanner = document.getElementById('login-dev-otp-banner');
                    if (devBanner && data.devOtp) {
                        devBanner.style.display = 'block';
                        devBanner.innerHTML = `
                            <div style="background: #FFFDF8; border: 1.5px dashed var(--accent-red); padding: 0.85rem; margin-bottom: 1.25rem; text-align: center; font-family: var(--font-mono); font-size: 0.82rem; color: var(--ink-primary);">
                                <span style="color: var(--accent-red); font-weight: 900; letter-spacing: 0.1em;">🔑 2FA VERIFICATION CODE:</span>
                                <div style="font-size: 1.8rem; font-weight: 900; letter-spacing: 0.25em; color: var(--accent-red); margin: 0.25rem 0;">${data.devOtp}</div>
                                <span style="font-size: 0.72rem; color: var(--ink-muted);">(Pre-filled automatically below • Click Verify below to enter)</span>
                            </div>
                        `;
                    }
                    startResendCooldown('login', data.cooldownSeconds || 60);
                    showToast('A fresh login code has been dispatched.', 'success');
                } else {
                    showToast(data.message || 'Could not resend code.', 'error');
                    loginResendBtn.disabled = false;
                    loginResendBtn.textContent = 'Resend Code';
                }
            } catch (err) {
                console.error('Resend Login OTP error:', err);
                showToast('Network error while requesting code resend.', 'error');
                loginResendBtn.disabled = false;
                loginResendBtn.textContent = 'Resend Code';
            }
        });
    }

    // Back to Login Credentials Form
    if (loginBackBtn) {
        loginBackBtn.addEventListener('click', function() {
            if (loginFormSection && loginOtpSection) {
                loginOtpSection.style.display = 'none';
                loginFormSection.style.display = 'block';
            }
            if (loginCooldownTimer) clearInterval(loginCooldownTimer);
        });
    }
}

// ---------------------------------------------------------------------------
// 2. Cooldown Timer Helper
// ---------------------------------------------------------------------------
function startResendCooldown(type, seconds) {
    let remaining = seconds;
    const btn = type === 'signup' 
        ? document.getElementById('signup-resend-btn') 
        : document.getElementById('login-resend-btn');

    if (!btn) return;

    if (type === 'signup' && regCooldownTimer) clearInterval(regCooldownTimer);
    if (type === 'login' && loginCooldownTimer) clearInterval(loginCooldownTimer);

    btn.disabled = true;
    btn.textContent = `Resend Code (${remaining}s)`;

    const timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.textContent = 'Resend Code';
        } else {
            btn.textContent = `Resend Code (${remaining}s)`;
        }
    }, 1000);

    if (type === 'signup') regCooldownTimer = timer;
    if (type === 'login') loginCooldownTimer = timer;
}

// ---------------------------------------------------------------------------
// 3. Navigation & User Helpers
// ---------------------------------------------------------------------------
function logoutUser() {
    clearCurrentUser();
    showToast('Logged out successfully.', 'info');
    const isSubPage = window.location.pathname.includes('/pages/');
    const prefix = isSubPage ? '' : 'pages/';
    setTimeout(() => {
        window.location.href = `${prefix}login.html`;
    }, 600);
}

function updateUserNavUI() {
    const user = getCurrentUser();
    const userNavBtn = document.getElementById('nav-user-btn');
    if (!userNavBtn) return;

    if (user) {
        const dashboardUrl = user.role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
        const isSubPage = window.location.pathname.includes('/pages/');
        const prefix = isSubPage ? '' : 'pages/';
        const rawName = user.name || (user.email ? user.email.split('@')[0] : 'Student');
        const firstName = rawName.split(' ')[0].toUpperCase();

        userNavBtn.innerHTML = `
            <div class="nav-account-lockup" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <a href="${prefix}${dashboardUrl}" class="nav-account-badge" title="Go to ${user.role === 'seller' ? 'Seller' : 'Buyer'} Dashboard" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 253, 248, 0.15);
                    border: 1.5px solid var(--accent-red, #ef493c);
                    color: #ffffff !important;
                    padding: 0.5rem 1rem;
                    font-family: var(--font-mono, 'Martian Mono', monospace);
                    font-size: 11px;
                    letter-spacing: 0.15em;
                    font-weight: 700;
                    text-transform: uppercase;
                    text-decoration: none;
                    white-space: nowrap;
                    transition: background 0.2s ease, border-color 0.2s ease;
                ">
                    <span style="color: var(--accent-red, #ef493c); font-size: 10px;">●</span>
                    <span class="nav-account-name" style="color: #ffffff !important; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">${firstName}</span>
                </a>
                <button onclick="logoutUser()" class="nav-account-logout" title="Logout" style="
                    background: var(--ink-primary, #171717);
                    border: 1.5px solid rgba(255, 253, 248, 0.35);
                    color: #ffffff !important;
                    padding: 0.5rem 0.8rem;
                    font-family: var(--font-mono, 'Martian Mono', monospace);
                    font-size: 10px;
                    letter-spacing: 0.15em;
                    font-weight: 700;
                    text-transform: uppercase;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
                ">
                    LOGOUT
                </button>
            </div>
        `;
    } else {
        const isSubPage = window.location.pathname.includes('/pages/');
        const prefix = isSubPage ? '' : 'pages/';
        userNavBtn.innerHTML = `
            <a href="${prefix}login.html" class="btn btn-editorial btn-editorial-primary btn-sm" style="font-family: var(--font-mono, monospace); font-size: 10.5px; letter-spacing: 0.18em; font-weight: 700; color: #ffffff !important;">
                LOGIN // +
            </a>
        `;
    }
}
