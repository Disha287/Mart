/* CAMPUSMART - Core Helper Utilities & UI Engine */

// LocalStorage Engine Wrappers
function dbGet(key) {
    try {
        const item = localStorage.getItem('cm_' + key);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.error('LocalStorage dbGet Error:', e);
        return [];
    }
}

function dbSet(key, value) {
    try {
        localStorage.setItem('cm_' + key, JSON.stringify(value));
    } catch (e) {
        console.error('LocalStorage dbSet Error:', e);
    }
}

// Session Management
function getCurrentUser() {
    try {
        const session = sessionStorage.getItem('cm_session');
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        sessionStorage.setItem('cm_session', JSON.stringify(user));
    } else {
        sessionStorage.removeItem('cm_session');
    }
}

function logoutUser() {
    sessionStorage.removeItem('cm_session');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
    }, 1000);
}

// Currency Formatter
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// WhatsApp Link Generator Requirement
function buildWhatsAppLink(phone, customMessage) {
    const cleanedPhone = String(phone).replace(/\D/g, '');
    const validPhone = cleanedPhone.length === 10 ? '91' + cleanedPhone : cleanedPhone;
    const encodedMsg = encodeURIComponent(customMessage);
    return `https://wa.me/${validPhone}?text=${encodedMsg}`;
}

// Trust Score Calculation Algorithm
function calculateTrustScore(rating = 4.5, completedTx = 5) {
    const baseScore = rating * 18; // Up to 90
    const txBonus = Math.min(completedTx * 1.5, 10); // Up to 10 bonus
    return Math.min(Math.round(baseScore + txBonus), 100);
}

// Star Rating Renderer
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '★';
    }
    if (hasHalf) {
        starsHtml += '½';
    }
    const emptyCount = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyCount; i++) {
        starsHtml += '☆';
    }
    return `<span class="star-rating">${starsHtml} <small>(${rating})</small></span>`;
}

// Universal Toast Notification System
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3500);
}

// Universal Modal Controller
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Update Dynamic Badge Counts on Navbar
function updateNavBadges() {
    const cart = dbGet('cart');
    const wishlist = dbGet('wishlist');

    const cartBadge = document.getElementById('nav-cart-badge');
    const wishlistBadge = document.getElementById('nav-wishlist-badge');

    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (wishlistBadge) {
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// Document Escape Listener for Modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        activeModals.forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    }
});
