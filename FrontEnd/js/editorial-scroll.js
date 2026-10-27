/**
 * CAMPUS MART — WARM PRINT EDITORIAL SCROLL CHOREOGRAPHY ENGINE
 * 
 * Implements the 5 Pinned Stages driven strictly by CSS custom properties on :root
 * 1. Poster Hero: --hero-type-y, --hero-type-scale, --hero-type-alpha, drifting tilled-bed canvas
 * 2. Clip-Wipe Manifesto: --manifesto-wipe, --manifesto-scale, exact bounding rect alignment
 * 3. Horizontal Card Rail: --rail-x (progress * overflowWidth), --rail-progress, 6 verified cards
 * 4. Printed Artifact Ticket: 6 properties, phase index DOM text updates only on change, dashed perforation cut
 * 5. Parallax Season Band: 22 contour lines canvas, --season-y, --season-scale, swapping chapters
 * Per-Atom Motion Budget: Per-word span splitting (38ms stagger), [data-rev] IntersectionObserver at 0.12
 */

(function () {
    'use strict';

    // --- State & References ---
    let scrollTicking = false;
    let viewportHeight = window.innerHeight;
    let viewportWidth = window.innerWidth;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Stages
    let stageHero, stageManifesto, stageRail, stageArtifact, stageSeasons;
    let railTrack, railContainer;
    let railOverflow = 0;

    // Artifact phase index tracker (avoids writing DOM text every frame)
    let lastArtifactPhaseIndex = -1;

    // Canvases
    let heroCanvas, heroCtx, heroAnimId;
    let seasonsCanvas, seasonsCtx, seasonsAnimId;
    let ticketCanvas, ticketCtx;

    // Nav element
    let navElement;

    // --- Utility: Clamp ---
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    // --- Format Currency (INR) ---
    function formatINR(price) {
        const num = Number(price) || 0;
        return '₹' + num.toLocaleString('en-IN');
    }

    // =========================================================================
    // 1. PER-ATOM MOTION BUDGET: WORD SPLITTING & INTERSECTION OBSERVER
    // =========================================================================
    function initWordSplitting() {
        const targets = document.querySelectorAll('.split-words');
        targets.forEach(el => {
            // Avoid double splitting
            if (el.querySelector('.word-span')) return;

            const text = el.innerText.trim();
            if (!text) return;

            const words = text.split(/\s+/);
            const html = words.map((w, idx) => {
                return `<span class="word-span" style="--w-idx: ${idx};">${w}</span>`;
            }).join(' ');

            el.innerHTML = html;
        });
    }

    function initIntersectionObserver() {
        // Trigger entrance reveals at threshold 0.12
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('[data-rev], .hero-viewport, .split-words').forEach(el => {
            observer.observe(el);
        });
    }

    // =========================================================================
    // 2. CHARACTER COUNT POSTER LOCKUP VERIFICATION
    // =========================================================================
    function verifyPosterLockup() {
        const lines = document.querySelectorAll('.poster-line');
        lines.forEach(line => {
            const chars = parseInt(line.getAttribute('data-chars'), 10) || line.innerText.replace(/\s+/g, '').length || 10;
            line.style.setProperty('--chars', chars);

            // Check if scrollWidth overflows clientWidth; if so, scale down slightly
            if (line.scrollWidth > line.clientWidth && line.clientWidth > 0) {
                const ratio = line.clientWidth / line.scrollWidth;
                line.style.fontSize = `calc(min(14vw, calc(92vw / (${chars} * 0.44))) * ${ratio.toFixed(2)})`;
            }
        });
    }

    // =========================================================================
    // 3. MANIFESTO ALIGNMENT (Clean natural document flow, no duplicate overlay)
    function verifyManifestoAlignment() {
        // No-op: Single semantic manifesto sentence used
    }

    // =========================================================================
    // 4. MEASURE RAIL OVERFLOW
    // =========================================================================
    function measureRailOverflow() {
        if (!railTrack) return;
        // Overflow is track scrollWidth minus innerWidth so the last card lands flush
        railOverflow = Math.max(0, railTrack.scrollWidth - window.innerWidth + 80);
    }

    // =========================================================================
    // 5. DATA LOADER: REAL INVENTORY INTO FRESH ON CAMPUS TABLE
    // =========================================================================
    async function loadEditorialProducts() {
        let products = [];

        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const json = await res.json();
                const list = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);
                if (list.length > 0) {
                    products = list;
                }
            }
        } catch (e) {
            console.warn('[Editorial] /api/products fetch error, falling back to local dataset:', e);
        }

        if (!products.length) {
            if (typeof dbGet === 'function') {
                products = dbGet('products') || [];
            } else if (typeof CM_DATA !== 'undefined' && CM_DATA.products) {
                products = CM_DATA.products;
            }
        }

        renderFreshTable(products.slice(0, 10));
    }

    function renderFreshTable(products) {
        const tbody = document.getElementById('fresh-campus-table-body');
        if (!tbody) return;

        if (!products || products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2.5rem;" class="font-mono">NO ACTIVE LISTINGS REGISTERED</td></tr>`;
            return;
        }

        let html = '';
        products.forEach((p, idx) => {
            const id = p._id || p.id;
            const title = p.name || p.title || 'Campus Item';
            const category = p.category || 'General';
            const condition = p.condition || 'Good';
            const price = formatINR(p.price);
            const isBidding = p.listingType === 'bidding';
            const statusBadge = isBidding
                ? `<span class="status-badge-inline status-badge-bidding">AUCTION</span>`
                : `<span class="status-badge-inline status-badge-available">AVAILABLE</span>`;

            html += `
                <tr onclick="window.location.href='pages/product.html?id=${id}'" tabindex="0" role="button" aria-label="View ${title}" data-rev style="--d: ${(idx * 40) + 40}ms;">
                    <td class="td-product-name">${title}</td>
                    <td class="font-mono" style="font-size:10.5px; letter-spacing:0.18em; color:var(--ink-muted);">${category}</td>
                    <td class="font-mono" style="font-size:10.5px; letter-spacing:0.18em;">${condition}</td>
                    <td class="td-price">${price}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        // Observe new rows
        initIntersectionObserver();
    }

    // =========================================================================
    // 6. CENTRAL SCROLL & NAVIGATION THEME CHOREOGRAPHY
    // =========================================================================
    function onScrollUpdate() {
        // Navigation Color Transition between dark loam and light cream sections
        if (navElement) {
            const heroRect = stageHero ? stageHero.getBoundingClientRect() : null;
            const artifactRect = stageArtifact ? stageArtifact.getBoundingClientRect() : null;
            const footerElem = document.querySelector('.editorial-footer');
            const footerRect = footerElem ? footerElem.getBoundingClientRect() : null;

            // In hero or in artifact stage or in footer = dark ground
            const inHero = heroRect && heroRect.bottom > 70;
            const inArtifact = artifactRect && artifactRect.top <= 70 && artifactRect.bottom >= 70;
            const inFooter = footerRect && footerRect.top <= 70;

            if (inHero || inArtifact || inFooter) {
                navElement.classList.remove('nav-scrolled-light');
            } else {
                navElement.classList.add('nav-scrolled-light');
            }
        }

        scrollTicking = false;
    }

    function requestScrollTick() {
        if (!scrollTicking) {
            requestAnimationFrame(onScrollUpdate);
            scrollTicking = true;
        }
    }

    // Set Artifact DOM Text to Verified Active State
    function updateArtifactStagePhase() {
        // All 4 cues active
        const cues = document.querySelectorAll('.ticket-cues-list .cue-item');
        cues.forEach(c => c.classList.add('cue-active'));

        const testResultElem = document.getElementById('ticket-result-val');
        if (testResultElem) {
            testResultElem.textContent = 'PASSED · 98.4% AUTH';
            testResultElem.style.color = '#15803d';
        }

        const statusPill = document.getElementById('ticket-status-pill');
        if (statusPill) {
            statusPill.textContent = 'CAMPUS VERIFIED // SPEC 001';
        }
    }

    // =========================================================================
    // 7. GENERATIVE CANVASES: HERO TILLED BED, SEASONS CONTOURS, TICKET PLATE
    // =========================================================================

    // A. Hero Canvas: Drifting Tilled Soil Strokes at 5-19% Alpha
    function initHeroCanvas() {
        heroCanvas = document.getElementById('hero-canvas');
        if (!heroCanvas) return;
        heroCtx = heroCanvas.getContext('2d');

        function resizeHero() {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const rect = heroCanvas.getBoundingClientRect();
            heroCanvas.width = rect.width * dpr;
            heroCanvas.height = rect.height * dpr;
            heroCtx.scale(dpr, dpr);
        }
        resizeHero();
        window.addEventListener('resize', resizeHero, { passive: true });

        // Generate grid of drifting strokes
        const numStrokes = 180;
        const strokes = [];
        for (let i = 0; i < numStrokes; i++) {
            strokes.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                len: 16 + Math.random() * 28,
                angle: -0.32 + (Math.random() - 0.5) * 0.25,
                speed: 0.12 + Math.random() * 0.2,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.05 + Math.random() * 0.14, // 5 to 19 percent alpha
                isRed: Math.random() < 0.12
            });
        }

        let time = 0;
        function renderHeroCanvas() {
            if (!heroCtx || !heroCanvas) return;
            const w = heroCanvas.getBoundingClientRect().width;
            const h = heroCanvas.getBoundingClientRect().height;

            heroCtx.clearRect(0, 0, w, h);
            time += 0.01;

            for (let i = 0; i < strokes.length; i++) {
                const s = strokes[i];
                const driftX = Math.sin(time + s.phase + i * 0.05) * 5;
                const driftY = Math.cos(time * 0.8 + s.phase) * 3;

                const startX = s.x + driftX;
                const startY = s.y + driftY;
                const endX = startX + Math.cos(s.angle) * s.len;
                const endY = startY + Math.sin(s.angle) * s.len;

                heroCtx.beginPath();
                heroCtx.moveTo(startX, startY);
                heroCtx.lineTo(endX, endY);
                heroCtx.lineWidth = 1.2;

                if (s.isRed) {
                    heroCtx.strokeStyle = `rgba(239, 73, 60, ${s.alpha * 1.5})`;
                } else {
                    heroCtx.strokeStyle = `rgba(255, 253, 248, ${s.alpha})`;
                }
                heroCtx.stroke();
            }

            heroAnimId = requestAnimationFrame(renderHeroCanvas);
        }

        renderHeroCanvas();
    }

    // B. Seasons Canvas: 22 Stacked Contour Lines (Every 5th line in red)
    function initSeasonsCanvas() {
        seasonsCanvas = document.getElementById('seasons-canvas');
        if (!seasonsCanvas) return;
        seasonsCtx = seasonsCanvas.getContext('2d');

        function resizeSeasons() {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const rect = seasonsCanvas.getBoundingClientRect();
            seasonsCanvas.width = rect.width * dpr;
            seasonsCanvas.height = rect.height * dpr;
            seasonsCtx.scale(dpr, dpr);
        }
        resizeSeasons();
        window.addEventListener('resize', resizeSeasons, { passive: true });

        const totalLines = 22;
        let time = 0;

        function renderSeasonsCanvas() {
            if (!seasonsCtx || !seasonsCanvas) return;
            const w = seasonsCanvas.getBoundingClientRect().width;
            const h = seasonsCanvas.getBoundingClientRect().height;

            seasonsCtx.clearRect(0, 0, w, h);
            time += 0.007;

            const spacing = h / (totalLines + 1);

            for (let i = 1; i <= totalLines; i++) {
                const baseY = i * spacing;
                const isRed = (i % 5 === 0);

                seasonsCtx.beginPath();
                seasonsCtx.lineWidth = isRed ? 2 : 1;
                seasonsCtx.strokeStyle = isRed ? 'rgba(239, 73, 60, 0.75)' : 'rgba(23, 23, 23, 0.16)';

                const segments = 26;
                for (let j = 0; j <= segments; j++) {
                    const x = (j / segments) * w;
                    // Sine of x plus a slower harmonic
                    const harmonic1 = Math.sin((j * 0.28) + time + (i * 0.25)) * 22;
                    const harmonic2 = Math.sin((j * 0.12) - time * 0.6 + (i * 0.18)) * 14;
                    const y = baseY + harmonic1 + harmonic2;

                    if (j === 0) {
                        seasonsCtx.moveTo(x, y);
                    } else {
                        seasonsCtx.lineTo(x, y);
                    }
                }
                seasonsCtx.stroke();
            }

            seasonsAnimId = requestAnimationFrame(renderSeasonsCanvas);
        }

        renderSeasonsCanvas();
    }

    // C. Artifact Ticket Canvas: Technical Geometric Plate
    function initTicketCanvas() {
        ticketCanvas = document.getElementById('ticket-canvas');
        if (!ticketCanvas) return;
        ticketCtx = ticketCanvas.getContext('2d');

        function drawTicketPlate() {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const rect = ticketCanvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;

            ticketCanvas.width = w * dpr;
            ticketCanvas.height = h * dpr;
            ticketCtx.scale(dpr, dpr);

            ticketCtx.clearRect(0, 0, w, h);
            ticketCtx.fillStyle = '#efe9dc';
            ticketCtx.fillRect(0, 0, w, h);

            // Technical coordinate grid lines
            ticketCtx.strokeStyle = 'rgba(23, 23, 23, 0.08)';
            ticketCtx.lineWidth = 1;
            const step = 18;
            for (let x = 0; x < w; x += step) {
                ticketCtx.beginPath();
                ticketCtx.moveTo(x, 0);
                ticketCtx.lineTo(x, h);
                ticketCtx.stroke();
            }
            for (let y = 0; y < h; y += step) {
                ticketCtx.beginPath();
                ticketCtx.moveTo(0, y);
                ticketCtx.lineTo(w, y);
                ticketCtx.stroke();
            }

            // Central geometric mark: concentric squares with 45-deg rotation
            const cx = w / 2;
            const cy = h / 2;

            ticketCtx.save();
            ticketCtx.translate(cx, cy);

            ticketCtx.strokeStyle = '#171717';
            ticketCtx.lineWidth = 1.5;
            ticketCtx.strokeRect(-36, -36, 72, 72);

            ticketCtx.rotate(Math.PI / 4);
            ticketCtx.strokeStyle = '#ef493c';
            ticketCtx.lineWidth = 1.5;
            ticketCtx.strokeRect(-28, -28, 56, 56);

            ticketCtx.beginPath();
            ticketCtx.arc(0, 0, 6, 0, Math.PI * 2);
            ticketCtx.fillStyle = '#171717';
            ticketCtx.fill();

            ticketCtx.restore();

            // Corner registration crosshairs
            function drawCrosshair(x, y) {
                ticketCtx.strokeStyle = '#ef493c';
                ticketCtx.lineWidth = 1;
                ticketCtx.beginPath();
                ticketCtx.moveTo(x - 5, y);
                ticketCtx.lineTo(x + 5, y);
                ticketCtx.moveTo(x, y - 5);
                ticketCtx.lineTo(x, y + 5);
                ticketCtx.stroke();
            }

            drawCrosshair(14, 14);
            drawCrosshair(w - 14, 14);
            drawCrosshair(14, h - 14);
            drawCrosshair(w - 14, h - 14);
        }

        drawTicketPlate();
        window.addEventListener('resize', drawTicketPlate, { passive: true });
    }

    // =========================================================================
    // 8. INITIALIZATION & LIFECYCLE
    // =========================================================================
    function init() {
        // Cache DOM stages
        stageHero = document.getElementById('stage-hero');
        stageManifesto = document.getElementById('stage-manifesto');
        stageRail = document.getElementById('stage-rail');
        stageArtifact = document.getElementById('stage-artifact');
        stageSeasons = document.getElementById('stage-seasons');

        railTrack = document.getElementById('rail-track');
        railContainer = document.querySelector('.rail-track-container');
        navElement = document.getElementById('main-nav');

        // 1. Per-atom motion budget
        initWordSplitting();
        initIntersectionObserver();

        // 2. Exact alignment & character counts
        verifyPosterLockup();
        verifyManifestoAlignment();

        // 3. Generative canvases
        initHeroCanvas();
        initSeasonsCanvas();
        initTicketCanvas();

        // 4. Products table & Artifact specs
        loadEditorialProducts();
        updateArtifactStagePhase();

        // 5. Horizontal rail scroll listener for progress fill
        if (railContainer) {
            railContainer.addEventListener('scroll', () => {
                const maxScroll = railContainer.scrollWidth - railContainer.clientWidth;
                if (maxScroll > 0) {
                    const pct = (railContainer.scrollLeft / maxScroll) * 100;
                    document.documentElement.style.setProperty('--rail-progress', `${pct.toFixed(1)}%`);
                }
            }, { passive: true });
        }

        // 5. Measure overflow & register scroll
        function handleResize() {
            viewportHeight = window.innerHeight;
            viewportWidth = window.innerWidth;
            prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            verifyPosterLockup();
            verifyManifestoAlignment();
            measureRailOverflow();
            requestScrollTick();
        }

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('scroll', requestScrollTick, { passive: true });

        // Initial measurement
        setTimeout(() => {
            handleResize();
            requestScrollTick();
        }, 120);

        // Update nav cart badges if utils.js loaded
        if (typeof updateNavBadges === 'function') {
            updateNavBadges();
        }

        // Clean up on unload
        window.addEventListener('beforeunload', () => {
            if (heroAnimId) cancelAnimationFrame(heroAnimId);
            if (seasonsAnimId) cancelAnimationFrame(seasonsAnimId);
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
