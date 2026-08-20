/* CAMPUSMART - Product Details & Action Engine */

let currentProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    initProductDetails();
});

function initProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('id');

    if (!prodId) {
        showToast('Product ID missing', 'error');
        setTimeout(() => window.location.href = 'marketplace.html', 1500);
        return;
    }

    const products = dbGet('products');
    currentProduct = products.find(p => p.id === prodId);

    if (!currentProduct) {
        document.getElementById('product-detail-container').innerHTML = `
            <div style="text-align: center; padding: 4rem 1.5rem;" class="card">
                <h2>Product Not Found</h2>
                <p style="color: var(--neutral-text-muted); margin: 1rem 0;">The requested product listing may have been removed.</p>
                <a href="marketplace.html" class="btn btn-primary">Back to Marketplace</a>
            </div>
        `;
        return;
    }

    renderProductUI();
}

function renderProductUI() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const wishlist = dbGet('wishlist');
    const isWishlist = wishlist.includes(currentProduct.id);
    const user = getCurrentUser();

    // Prepare WhatsApp Message
    const defaultMsg = `Hi, I found your listing "${currentProduct.name}" on CampusMart and I'm interested in buying it for ${formatCurrency(currentProduct.price)}. Is it still available?`;
    const whatsappUrl = buildWhatsAppLink(currentProduct.sellerPhone || '9123456789', defaultMsg);

    const trustScore = currentProduct.trustScore || calculateTrustScore(currentProduct.sellerRating || 4.8, 10);

    let biddingSectionHtml = '';
    if (currentProduct.listingType === 'bidding') {
        const bids = currentProduct.bids || [];
        const highestBid = currentProduct.currentBid || currentProduct.price;
        
        let bidListHtml = '';
        if (bids.length > 0) {
            bids.forEach(b => {
                bidListHtml += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed var(--neutral-border); font-size: 0.85rem;">
                        <span>👤 <strong>${b.bidderName}</strong></span>
                        <span style="font-weight: 700; color: var(--accent-orange);">${formatCurrency(b.amount)}</span>
                    </div>
                `;
            });
        } else {
            bidListHtml = `<p style="font-size: 0.85rem; color: var(--neutral-text-muted);">No bids placed yet. Be the first to bid!</p>`;
        }

        biddingSectionHtml = `
            <div style="background: var(--accent-orange-light); border: 1px solid var(--accent-orange); padding: 1.25rem; border-radius: var(--radius-md); margin: 1.5rem 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <div>
                        <span style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--accent-orange);">Auction Mode</span>
                        <h4 style="font-size: 1.2rem;">Highest Bid: ${formatCurrency(highestBid)}</h4>
                    </div>
                    <button onclick="openModal('bid-modal')" class="btn btn-accent btn-sm">🔨 Place Bid</button>
                </div>
                <div style="max-height: 120px; overflow-y: auto; background: var(--neutral-white); padding: 0.75rem; border-radius: var(--radius-sm);">
                    <h5 style="font-size: 0.85rem; margin-bottom: 0.35rem;">Recent Bids (${bids.length}):</h5>
                    ${bidListHtml}
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="grid grid-cols-2 responsive-layout" style="gap: 3rem;">
            <!-- Product Image Showcase -->
            <div>
                <div class="card" style="overflow: hidden; margin-bottom: 1rem;">
                    <img src="${currentProduct.image}" alt="${currentProduct.name}" style="width: 100%; height: 420px; object-fit: cover;" onerror="this.src='../assets/images/campus-fallback.jpg'">
                </div>
            </div>

            <!-- Product Information -->
            <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="badge-tag ${currentProduct.listingType === 'bidding' ? 'badge-bidding' : 'badge-fixed'}" style="position: static;">
                        ${currentProduct.listingType === 'bidding' ? '🔨 Auction Listing' : '🏷️ Fixed Price'}
                    </span>
                    <span class="badge-tag badge-condition" style="position: static;">${currentProduct.condition}</span>
                    <span style="font-size: 0.85rem; color: var(--secondary-blue); font-weight: 600;">${currentProduct.category}</span>
                </div>

                <h1 style="font-size: 2rem; margin-bottom: 1rem;">${currentProduct.name}</h1>

                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="font-size: 2.25rem; font-weight: 800; color: var(--primary-charcoal); font-family: var(--font-heading);">
                        ${formatCurrency(currentProduct.price)}
                    </div>
                    ${currentProduct.originalPrice ? `<span style="text-decoration: line-through; color: var(--neutral-text-muted); font-size: 1.1rem;">${formatCurrency(currentProduct.originalPrice)}</span>` : ''}
                </div>

                <!-- Seller Profile Card -->
                <div class="card" style="padding: 1rem 1.25rem; background: var(--neutral-bg); margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-size: 0.8rem; color: var(--neutral-text-muted);">Listed By</div>
                        <div style="font-weight: 700; font-size: 1rem; color: var(--neutral-text-heading);">👤 ${currentProduct.sellerName}</div>
                        <div style="font-size: 0.8rem; color: var(--neutral-text-muted);">📍 ${currentProduct.location}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="trust-badge">🛡️ Trust Score: ${trustScore}/100</div>
                        <div style="margin-top: 4px;">${renderStars(currentProduct.sellerRating || 4.8)}</div>
                    </div>
                </div>

                <!-- Product Description -->
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem;">Description</h4>
                    <p style="color: var(--neutral-text-muted); line-height: 1.6; font-size: 0.95rem;">${currentProduct.description}</p>
                </div>

                ${biddingSectionHtml}

                <!-- Action Buttons Grid -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; gap: 1rem;">
                        <button onclick="handleBuyNow()" class="btn btn-accent btn-lg" style="flex: 2;">
                            ⚡ Buy Now
                        </button>
                        <button onclick="addToCartDetail('${currentProduct.id}')" class="btn btn-primary btn-lg" style="flex: 2;">
                            🛒 Add to Cart
                        </button>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <a href="${whatsappUrl}" target="_blank" class="btn btn-dark" style="flex: 2; background-color: #25D366; color: white;">
                            💬 Contact Seller on WhatsApp
                        </a>
                        <button onclick="openModal('offer-modal')" class="btn btn-outline" style="flex: 1.5;">
                            🏷️ Make Offer
                        </button>
                        <button onclick="toggleWishlistDetail('${currentProduct.id}', this)" class="btn btn-outline" style="flex: 0.5;" title="Wishlist">
                            ${isWishlist ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function addToCartDetail(prodId) {
    let cart = dbGet('cart');
    const existing = cart.find(item => item.productId === prodId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId: prodId, quantity: 1 });
    }
    dbSet('cart', cart);
    updateNavBadges();
    showToast('Item added to Cart!', 'success');
}

function toggleWishlistDetail(prodId, btn) {
    let wishlist = dbGet('wishlist');
    if (wishlist.includes(prodId)) {
        wishlist = wishlist.filter(id => id !== prodId);
        btn.innerHTML = '🤍';
        showToast('Removed from Wishlist', 'info');
    } else {
        wishlist.push(prodId);
        btn.innerHTML = '❤️';
        showToast('Added to Wishlist', 'success');
    }
    dbSet('wishlist', wishlist);
    updateNavBadges();
}

function handleBuyNow() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to place an order', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }

    const order = {
        id: 'ord_' + Date.now().toString().slice(-6),
        productId: currentProduct.id,
        productName: currentProduct.name,
        price: currentProduct.price,
        quantity: 1,
        sellerName: currentProduct.sellerName,
        sellerPhone: currentProduct.sellerPhone || '9123456789',
        buyerId: user.id,
        buyerName: user.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Order Placed',
        rated: false
    };

    let orders = dbGet('orders');
    orders.push(order);
    dbSet('orders', orders);

    const waMsg = `Hi ${currentProduct.sellerName}, I placed an order for "${currentProduct.name}" on CampusMart (Order ID: #${order.id}, Price: ${formatCurrency(currentProduct.price)}). I'd like to coordinate payment and pickup!`;
    const waUrl = buildWhatsAppLink(currentProduct.sellerPhone || '9123456789', waMsg);

    showToast('Order placed successfully! Opening WhatsApp chat...', 'success');

    // Open WhatsApp Chat directly
    window.open(waUrl, '_blank');

    // Populate Order Modal Content
    document.getElementById('order-modal-details').innerHTML = `
        <div style="text-align: center; padding: 1rem 0;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
            <h3 style="color: var(--success-green); margin-bottom: 0.5rem;">Order Confirmed & Contacted!</h3>
            <p style="font-size: 0.95rem; color: var(--neutral-text-muted); margin-bottom: 1.5rem;">
                Order ID: <strong>#${order.id}</strong><br>
                WhatsApp contact initiated with seller <strong>${currentProduct.sellerName}</strong>.
            </p>

            <a href="${waUrl}" target="_blank" class="btn btn-accent btn-block btn-lg" style="background-color: #25D366; color: white;">
                💬 Open WhatsApp Chat Again
            </a>
            <a href="orders.html" class="btn btn-outline btn-block" style="margin-top: 0.75rem;">
                View My Orders
            </a>
        </div>
    `;

    openModal('order-success-modal');
}

function submitBid() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to place a bid', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }

    const bidInput = document.getElementById('modal-bid-amount');
    const amount = Number(bidInput.value);
    const currentHighest = currentProduct.currentBid || currentProduct.price;

    if (!amount || amount <= currentHighest) {
        showToast(`Bid must be higher than current price of ${formatCurrency(currentHighest)}`, 'error');
        return;
    }

    let products = dbGet('products');
    const targetProd = products.find(p => p.id === currentProduct.id);
    if (!targetProd) return;

    if (!targetProd.bids) targetProd.bids = [];
    
    const newBid = {
        bidderId: user.id,
        bidderName: user.name,
        amount: amount,
        date: new Date().toISOString().split('T')[0]
    };

    targetProd.bids.unshift(newBid);
    targetProd.currentBid = amount;
    dbSet('products', products);

    currentProduct = targetProd;
    closeModal('bid-modal');
    showToast(`Bid of ${formatCurrency(amount)} placed successfully!`, 'success');
    renderProductUI();
}

function submitOffer() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to make an offer', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }

    const offerInput = document.getElementById('modal-offer-amount');
    const amount = Number(offerInput.value);

    if (!amount || amount <= 0) {
        showToast('Please enter a valid offer amount', 'warning');
        return;
    }

    let products = dbGet('products');
    const targetProd = products.find(p => p.id === currentProduct.id);
    if (!targetProd) return;

    if (!targetProd.offers) targetProd.offers = [];

    const newOffer = {
        offerId: 'off_' + Date.now(),
        buyerId: user.id,
        buyerName: user.name,
        buyerPhone: user.phone || '9876543210',
        amount: amount,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
    };

    targetProd.offers.unshift(newOffer);
    dbSet('products', products);

    closeModal('offer-modal');
    showToast(`Offer of ${formatCurrency(amount)} submitted to seller!`, 'success');
}
