/* CAMPUSMART - Authentication & Session Controller */

document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    updateUserNavUI();
});

function initAuthForms() {
    // Signup Form Handler
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

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const role = document.getElementById('login-role').value;

            if (!email || !password) {
                showToast('Please enter your email and password', 'warning');
                return;
            }

            const users = dbGet('users');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (!user) {
                showToast('Invalid email or password', 'error');
                return;
            }

            // Update user role if selected differently
            user.role = role;
            setCurrentUser(user);

            showToast(`Welcome back, ${user.name}!`, 'success');

            setTimeout(() => {
                const redirectPath = role === 'seller' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
                window.location.href = redirectPath;
            }, 1000);
        });
    }
}

// Update Navbar User Status
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
