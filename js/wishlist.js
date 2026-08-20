/* CAMPUSMART - Wishlist Management Engine */

document.addEventListener('DOMContentLoaded', function() {
    renderWishlist();
});

function renderWishlist() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    const wishlistIds = dbGet('wishlist');
    const products = dbGet('products');
    const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

    if (wishlistProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem;" class="card">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">❤️</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No saved items yet</h3>
                <p style="color: var(--neutral-text-muted); margin-bottom: 1.5rem;">Save your favorite campus listings to view or buy later.</p>
                <a href="marketplace.html" class="btn btn-primary">Browse Marketplace</a>
            </div>
        `;
        return;
    }

    let html = '';
    wishlistProducts.forEach(p => {
        html += `
            <div class="card product-card">
                <div class="product-img-wrap">
                    <span class="badge-tag ${p.listingType === 'bidding' ? 'badge-bidding' : 'badge-fixed'}">
                        ${p.listingType === 'bidding' ? '🔨 Auction' : '🏷️ Fixed'}
                    </span>
                    <button class="wishlist-btn-toggle active" onclick="removeFromWishlistPage('${p.id}')">
                        ❤️
                    </button>
                    <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='../assets/images/campus-fallback.jpg'">
                </div>
                <div class="product-content">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-price-wrap">
                        <div class="product-price">${formatCurrency(p.price)}</div>
                        <span style="font-size: 0.8rem; color: var(--neutral-text-muted)">By ${p.sellerName}</span>
                    </div>
                    <div class="product-actions" style="margin-top: 1rem;">
                        <button onclick="moveWishlistToCart('${p.id}')" class="btn btn-accent btn-sm btn-block">
                            🛒 Move to Cart
                        </button>
                        <button onclick="removeFromWishlistPage('${p.id}')" class="btn btn-outline btn-sm">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function removeFromWishlistPage(prodId) {
    let wishlist = dbGet('wishlist');
    wishlist = wishlist.filter(id => id !== prodId);
    dbSet('wishlist', wishlist);
    updateNavBadges();
    showToast('Item removed from Wishlist', 'info');
    renderWishlist();
}

function moveWishlistToCart(prodId) {
    let cart = dbGet('cart');
    const existing = cart.find(item => item.productId === prodId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId: prodId, quantity: 1 });
    }
    dbSet('cart', cart);

    removeFromWishlistPage(prodId);
    showToast('Moved item to Shopping Cart!', 'success');
}
