/* CAMPUSMART - Marketplace Search, Filter & Sort Engine */

let currentFilters = {
    search: '',
    category: 'all',
    priceMin: 0,
    priceMax: 100000,
    condition: 'all',
    type: 'all',
    sort: 'newest'
};

document.addEventListener('DOMContentLoaded', function() {
    initMarketplace();
});

function initMarketplace() {
    // Parse URL params for pre-selected category or search
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const searchParam = urlParams.get('search');

    if (catParam) {
        currentFilters.category = catParam;
        const catSelect = document.getElementById('filter-category');
        if (catSelect) catSelect.value = catParam;
    }

    if (searchParam) {
        currentFilters.search = searchParam.toLowerCase();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = searchParam;
    }

    setupFilterListeners();
    renderMarketplaceProducts();
}

function setupFilterListeners() {
    const searchInput = document.getElementById('search-input');
    const catSelect = document.getElementById('filter-category');
    const conditionSelect = document.getElementById('filter-condition');
    const typeSelect = document.getElementById('filter-type');
    const sortSelect = document.getElementById('sort-select');
    const priceRange = document.getElementById('price-range');
    const priceVal = document.getElementById('price-val');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentFilters.search = e.target.value.toLowerCase().trim();
            renderMarketplaceProducts();
        });
    }

    if (catSelect) {
        catSelect.addEventListener('change', function(e) {
            currentFilters.category = e.target.value;
            renderMarketplaceProducts();
        });
    }

    if (conditionSelect) {
        conditionSelect.addEventListener('change', function(e) {
            currentFilters.condition = e.target.value;
            renderMarketplaceProducts();
        });
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', function(e) {
            currentFilters.type = e.target.value;
            renderMarketplaceProducts();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function(e) {
            currentFilters.sort = e.target.value;
            renderMarketplaceProducts();
        });
    }

    if (priceRange && priceVal) {
        priceRange.addEventListener('input', function(e) {
            currentFilters.priceMax = Number(e.target.value);
            priceVal.textContent = formatCurrency(e.target.value);
            renderMarketplaceProducts();
        });
    }
}

function renderMarketplaceProducts() {
    const container = document.getElementById('marketplace-grid');
    const countEl = document.getElementById('product-count');
    if (!container) return;

    let products = dbGet('products');

    // Apply Filter Pipeline
    products = products.filter(p => {
        // Search filter
        if (currentFilters.search) {
            const query = currentFilters.search;
            const matchName = p.name.toLowerCase().includes(query);
            const matchDesc = p.description ? p.description.toLowerCase().includes(query) : false;
            const matchSeller = p.sellerName ? p.sellerName.toLowerCase().includes(query) : false;
            const matchCat = p.category ? p.category.toLowerCase().includes(query) : false;
            if (!matchName && !matchDesc && !matchSeller && !matchCat) return false;
        }

        // Category filter
        if (currentFilters.category !== 'all') {
            const filterCat = currentFilters.category.toLowerCase().trim();
            const prodCat = (p.category || '').toLowerCase().trim();
            if (!prodCat.includes(filterCat) && !filterCat.includes(prodCat)) return false;
        }

        // Condition filter
        if (currentFilters.condition !== 'all') {
            if (p.condition.toLowerCase() !== currentFilters.condition.toLowerCase()) return false;
        }

        // Listing type filter
        if (currentFilters.type !== 'all') {
            if (p.listingType !== currentFilters.type) return false;
        }

        // Price filter
        if (p.price > currentFilters.priceMax) return false;

        return true;
    });

    // Apply Sorting Pipeline
    products.sort((a, b) => {
        if (currentFilters.sort === 'price-low') return a.price - b.price;
        if (currentFilters.sort === 'price-high') return b.price - a.price;
        if (currentFilters.sort === 'rating') return (b.rating || 0) - (a.rating || 0);
        // Default: Newest first
        return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
    });

    if (countEl) {
        countEl.textContent = `${products.length} Products Found`;
    }

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: var(--neutral-white); border-radius: var(--radius-lg); border: 1px solid var(--neutral-border);">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔍</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No products match your search</h3>
                <p style="color: var(--neutral-text-muted); margin-bottom: 1.5rem;">Try adjusting your filters or search keywords to find campus gear.</p>
                <button onclick="resetFilters()" class="btn btn-primary">Reset Filters</button>
            </div>
        `;
        return;
    }

    const wishlist = dbGet('wishlist');
    let html = '';
    products.forEach(p => {
        const isWishlist = wishlist.includes(p.id);
        html += `
            <div class="card product-card">
                <div class="product-img-wrap">
                    <span class="badge-tag ${p.listingType === 'bidding' ? 'badge-bidding' : 'badge-fixed'}">
                        ${p.listingType === 'bidding' ? '🔨 Auction' : '🏷️ Fixed'}
                    </span>
                    <button class="wishlist-btn-toggle ${isWishlist ? 'active' : ''}" onclick="toggleWishlist('${p.id}', this)">
                        ${isWishlist ? '❤️' : '🤍'}
                    </button>
                    <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='../assets/images/campus-fallback.jpg'">
                </div>
                <div class="product-content">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-meta">
                        <span>Condition: <strong>${p.condition}</strong></span>
                        <span>${renderStars(p.rating || 4.8)}</span>
                    </div>
                    <div class="product-price-wrap">
                        <div class="product-price">${formatCurrency(p.price)}</div>
                        <span style="font-size:0.8rem; color:var(--neutral-text-muted)">By ${p.sellerName}</span>
                    </div>
                    <div class="product-actions">
                        <a href="product.html?id=${p.id}" onclick="localStorage.setItem('current_product_id', '${p.id}')" class="btn btn-outline btn-sm btn-block">View Details</a>
                        <button onclick="quickAddToCart('${p.id}')" class="btn btn-accent btn-sm" style="font-weight: 600;">+ Add</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function resetFilters() {
    currentFilters = {
        search: '',
        category: 'all',
        priceMin: 0,
        priceMax: 100000,
        condition: 'all',
        type: 'all',
        sort: 'newest'
    };

    const searchInput = document.getElementById('search-input');
    const catSelect = document.getElementById('filter-category');
    const conditionSelect = document.getElementById('filter-condition');
    const typeSelect = document.getElementById('filter-type');
    const sortSelect = document.getElementById('sort-select');
    const priceRange = document.getElementById('price-range');

    if (searchInput) searchInput.value = '';
    if (catSelect) catSelect.value = 'all';
    if (conditionSelect) conditionSelect.value = 'all';
    if (typeSelect) typeSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';
    if (priceRange) priceRange.value = 50000;

    renderMarketplaceProducts();
}

function toggleWishlist(prodId, btn) {
    let wishlist = dbGet('wishlist');
    if (wishlist.includes(prodId)) {
        wishlist = wishlist.filter(id => id !== prodId);
        btn.classList.remove('active');
        btn.innerHTML = '🤍';
        showToast('Removed from Wishlist', 'info');
    } else {
        wishlist.push(prodId);
        btn.classList.add('active');
        btn.classList.add('heart-pulse');
        btn.innerHTML = '❤️';
        showToast('Added to Wishlist', 'success');
    }
    dbSet('wishlist', wishlist);
    updateNavBadges();
}

function quickAddToCart(prodId) {
    let cart = dbGet('cart');
    const existing = cart.find(item => item.productId === prodId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId: prodId, quantity: 1 });
    }
    dbSet('cart', cart);
    updateNavBadges();
    showToast('Item added to Shopping Cart!', 'success');
}
