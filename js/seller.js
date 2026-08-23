/* CAMPUSMART - Seller Management & Dashboard Controller */

document.addEventListener('DOMContentLoaded', function() {
    initSellerDashboard();
    initCreateListingForm();
    initMyListings();
    initAuctionsPage();
    initOffersPage();
});

function initSellerDashboard() {
    const statsContainer = document.getElementById('seller-stats-grid');
    if (!statsContainer) return;

    const user = getCurrentUser();
    const products = dbGet('products');
    const orders = dbGet('orders');

    const sellerProducts = products.filter(p => p.sellerId === user?.id || p.sellerName === user?.name);
    const sellerOrders = orders.filter(o => o.sellerName === user?.name);

    let totalBids = 0;
    let pendingOffers = 0;

    sellerProducts.forEach(p => {
        if (p.bids) totalBids += p.bids.length;
        if (p.offers) pendingOffers += p.offers.filter(of => of.status === 'Pending').length;
    });

    const completedSales = sellerOrders.filter(o => o.status === 'Completed').length;
    const rating = user?.rating || 4.8;
    const trustScore = calculateTrustScore(rating, completedSales);

    document.getElementById('stat-total-listings').textContent = sellerProducts.length;
    document.getElementById('stat-active-bids').textContent = totalBids;
    document.getElementById('stat-pending-offers').textContent = pendingOffers;
    document.getElementById('stat-completed-sales').textContent = completedSales;
    document.getElementById('stat-trust-score').textContent = trustScore + '/100';
}

function initCreateListingForm() {
    const form = document.getElementById('create-listing-form');
    if (!form) return;

    // FileReader image preview logic
    const imgInput = document.getElementById('list-image-file');
    const imgPreview = document.getElementById('image-preview');

    if (imgInput && imgPreview) {
        imgInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    imgPreview.src = evt.target.result;
                    imgPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('list-name').value.trim();
        const price = Number(document.getElementById('list-price').value);
        const category = document.getElementById('list-category').value;
        const condition = document.getElementById('list-condition').value;
        const type = document.getElementById('list-type').value;
        const location = document.getElementById('list-location').value.trim();
        const desc = document.getElementById('list-desc').value.trim();
        const imgInput = document.getElementById('list-image-file');

        if (!name || !price || !category || !location || !desc) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        const user = getCurrentUser() || { id: 'usr_seller_1', name: 'Aman Verma', phone: '9123456789' };

        let imageUrl = 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80';
        if (imgPreview && imgPreview.src && imgPreview.style.display !== 'none') {
            imageUrl = imgPreview.src;
        }

        let products = dbGet('products');
        const newProduct = {
            id: 'prod_' + Date.now(),
            name: name,
            category: category,
            price: price,
            originalPrice: Math.round(price * 1.3),
            condition: condition,
            listingType: type,
            currentBid: type === 'bidding' ? price : null,
            sellerId: user.id,
            sellerName: user.name,
            sellerPhone: user.phone || '9123456789',
            sellerRating: user.rating || 4.8,
            trustScore: user.trustScore || 92,
            location: location,
            description: desc,
            image: imageUrl,
            rating: 5.0,
            bids: [],
            offers: [],
            dateAdded: new Date().toISOString().split('T')[0],
            views: 1
        };

        products.unshift(newProduct);
        dbSet('products', products);

        showToast('Product listing published successfully!', 'success');

        setTimeout(() => {
            window.location.href = 'my-listings.html';
        }, 1200);
    });
}

function initMyListings() {
    const container = document.getElementById('my-listings-grid');
    if (!container) return;

    const user = getCurrentUser();
    let products = dbGet('products');

    if (user) {
        products = products.filter(p => p.sellerId === user.id || p.sellerName === user.name);
    }

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem;" class="card">
                <h3>No active listings found</h3>
                <p style="color: var(--neutral-text-muted); margin-bottom: 1.5rem;">Create a listing to start selling to campus peers.</p>
                <a href="create-listing.html" class="btn btn-accent">Create New Listing</a>
            </div>
        `;
        return;
    }

    let html = '';
    products.forEach(p => {
        html += `
            <div class="card product-card">
                <div class="product-img-wrap">
                    <span class="badge-tag ${p.listingType === 'bidding' ? 'badge-bidding' : 'badge-fixed'}">
                        ${p.listingType === 'bidding' ? '🔨 Auction' : '🏷️ Fixed'}
                    </span>
                    <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='../assets/images/campus-fallback.jpg'">
                </div>
                <div class="product-content">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-price-wrap">
                        <div class="product-price">${formatCurrency(p.price)}</div>
                        <span style="font-size: 0.8rem; color: var(--neutral-text-muted);">Condition: ${p.condition}</span>
                    </div>
                    <div class="product-actions" style="margin-top: 1rem;">
                        <button onclick="editListing('${p.id}')" class="btn btn-outline btn-sm btn-block">✏️ Edit</button>
                        <button onclick="deleteListing('${p.id}')" class="btn btn-outline btn-sm" style="color: var(--danger-red); border-color: var(--danger-red); font-weight: 600;">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function deleteListing(prodId) {
    if (confirm('Are you sure you want to delete this product listing?')) {
        let products = dbGet('products');
        products = products.filter(p => p.id !== prodId);
        dbSet('products', products);
        showToast('Listing deleted from marketplace', 'info');
        initMyListings();
    }
}

function editListing(prodId) {
    const products = dbGet('products');
    const p = products.find(prod => prod.id === prodId);
    if (!p) return;

    const newPrice = prompt('Enter new price (₹):', p.price);
    if (newPrice && !isNaN(newPrice)) {
        p.price = Number(newPrice);
        dbSet('products', products);
        showToast('Listing price updated!', 'success');
        initMyListings();
    }
}

function initAuctionsPage() {
    const container = document.getElementById('auctions-list-container');
    if (!container) return;

    const user = getCurrentUser();
    let products = dbGet('products').filter(p => p.listingType === 'bidding');

    if (user) {
        products = products.filter(p => p.sellerId === user.id || p.sellerName === user.name);
    }

    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1.5rem;" class="card">
                <h3>No active auction listings</h3>
                <p style="color: var(--neutral-text-muted);">Create a bidding listing to start campus auctions.</p>
            </div>
        `;
        return;
    }

    let html = '';
    products.forEach(p => {
        const bids = p.bids || [];
        let bidsListHtml = '';

        if (bids.length > 0) {
            bids.forEach(b => {
                bidsListHtml += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--neutral-border);">
                        <div>
                            <strong>👤 ${b.bidderName}</strong>
                            <span style="font-size: 0.75rem; color: var(--neutral-text-muted); display: block;">${b.date}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span style="font-weight: 800; font-size: 1.1rem; color: var(--accent-orange);">${formatCurrency(b.amount)}</span>
                            <button onclick="selectWinningBidder('${p.id}', '${b.bidderId}', '${b.bidderName}', ${b.amount})" class="btn btn-accent btn-sm">🏆 Pick Winner</button>
                        </div>
                    </div>
                `;
            });
        } else {
            bidsListHtml = `<p style="color: var(--neutral-text-muted); font-size: 0.9rem;">No bids placed yet.</p>`;
        }

        html += `
            <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--neutral-border);">
                    <h3 style="font-size: 1.2rem;">${p.name}</h3>
                    <span style="font-weight: 800; font-size: 1.25rem; color: var(--secondary-blue);">Base Price: ${formatCurrency(p.price)}</span>
                </div>
                <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Current Bids (${bids.length}):</h4>
                ${bidsListHtml}
            </div>
        `;
    });
    container.innerHTML = html;
}

function selectWinningBidder(prodId, bidderId, bidderName, amount) {
    let orders = dbGet('orders');
    const products = dbGet('products');
    const targetProd = products.find(p => p.id === prodId);

    if (targetProd) {
        const newOrder = {
            id: 'ord_' + Date.now().toString().slice(-6),
            productId: targetProd.id,
            productName: targetProd.name + ' (Auction Winner)',
            price: amount,
            quantity: 1,
            sellerName: targetProd.sellerName,
            sellerPhone: targetProd.sellerPhone || '9123456789',
            buyerId: bidderId,
            buyerName: bidderName,
            date: new Date().toISOString().split('T')[0],
            status: 'Confirmed',
            rated: false
        };

        orders.push(newOrder);
        dbSet('orders', orders);
        showToast(`Selected ${bidderName} as auction winner! Order created.`, 'success');
        initAuctionsPage();
    }
}

function initOffersPage() {
    const container = document.getElementById('offers-list-container');
    if (!container) return;

    const user = getCurrentUser();
    let products = dbGet('products');

    if (user) {
        products = products.filter(p => p.sellerId === user.id || p.sellerName === user.name);
    }

    let allOffers = [];
    products.forEach(p => {
        if (p.offers) {
            p.offers.forEach(of => {
                allOffers.push({ ...of, productName: p.name, productId: p.id, originalPrice: p.price });
            });
        }
    });

    if (allOffers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1.5rem;" class="card">
                <h3>No buyer price offers</h3>
                <p style="color: var(--neutral-text-muted);">Buyers haven't submitted any price negotiation offers yet.</p>
            </div>
        `;
        return;
    }

    let html = '';
    allOffers.forEach(of => {
        html += `
            <div class="card" style="padding: 1.5rem; margin-bottom: 1.25rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <h3 style="font-size: 1.1rem;">${of.productName}</h3>
                    <span class="badge-tag badge-fixed">${of.status}</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span>Buyer: <strong>👤 ${of.buyerName}</strong></span><br>
                        <span style="font-size: 0.85rem; color: var(--neutral-text-muted);">Offered Price: <strong style="color: var(--accent-orange); font-size: 1.1rem;">${formatCurrency(of.amount)}</strong> (Original: ${formatCurrency(of.originalPrice)})</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        ${of.status === 'Pending' ? `
                            <button onclick="updateOfferStatus('${of.productId}', '${of.offerId}', 'Accepted')" class="btn btn-accent btn-sm">Accept Offer</button>
                            <button onclick="updateOfferStatus('${of.productId}', '${of.offerId}', 'Rejected')" class="btn btn-outline btn-sm" style="color: var(--danger-red);">Reject</button>
                        ` : `<span>Status: <strong>${of.status}</strong></span>`}
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function updateOfferStatus(prodId, offerId, status) {
    let products = dbGet('products');
    const p = products.find(prod => prod.id === prodId);
    if (p && p.offers) {
        const offer = p.offers.find(of => of.offerId === offerId);
        if (offer) {
            offer.status = status;
            dbSet('products', products);
            showToast(`Offer marked as ${status}!`, 'info');
            initOffersPage();
        }
    }
}
