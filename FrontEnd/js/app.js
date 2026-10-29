document.addEventListener('DOMContentLoaded', function() {
    initHeaderScroll();
    initMobileMenu();
    highlightActiveNavLink();
    updateNavBadges();
    if (typeof updateUserNavUI === 'function') {
        updateUserNavUI();
    }
    initHeroVideo();
});

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initHeroVideo() {
    const video = document.getElementById('hero-video');
    if (!video) return;

    video.addEventListener('timeupdate', function() {
        if (this.duration && this.currentTime >= this.duration - 5) {
            this.currentTime = 0;
            this.play().catch(e => console.error("Video loop autoplay prevented:", e));
        }
    });
}
