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
        const stock = Number(document.getElementById('list-quantity')?.value || 1);
        const desc = document.getElementById('list-desc').value.trim();
        const imgInput = document.getElementById('list-image-file');

        if (!name || !price || !category || !location || !desc) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        const user = getCurrentUser() || { id: 'usr_seller_1', name: 'Aman Verma', phone: '9123456789' };

        let imageUrl = 'assets/images/products/unsplash_cae5bbb5554ed3a2e0e6e4de8f93a84c.jpg';
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
            stock: stock,
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
        let stockText = (p.stock !== undefined && p.stock <= 0) ? '<span style="color: var(--danger-red); font-weight: bold;">Sold Out</span>' : `${p.stock !== undefined ? p.stock : 1} in stock`;
        html += `
            <div class="card product-card">
                <div class="product-img-wrap">
                    <span class="badge-tag ${p.listingType === 'bidding' ? 'badge-bidding' : 'badge-fixed'}">
                        ${p.listingType === 'bidding' ? '🔨 Auction' : '🏷️ Fixed'}
                    </span>
                    <img src="${resolveImagePath(p.image)}" alt="${p.name}" loading="lazy" onerror="this.src='../assets/images/campus-fallback.jpg'">
                </div>
                <div class="product-content">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-price-wrap">
                        <div class="product-price">${formatCurrency(p.price)}</div>
                        <span style="font-size: 0.8rem; color: var(--neutral-text-muted);">Condition: ${p.condition}</span>
                    </div>
                    <div style="font-size: 0.85rem; margin-top: 0.5rem; text-align: center;">${stockText}</div>
                    <div class="product-actions" style="margin-top: 1rem;">
                        <button onclick="editListing('${p.id}')" class="btn btn-outline btn-sm btn-block">✏️ Edit</button>
                        <button onclick="deleteListing('${p.id}')" class="btn btn-outline btn-sm" style="color: var(--danger-red); border-color: var(--danger-red);">🗑️</button>
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

let currentOffersTab = 'buyer';

function initOffersPage() {
    const container = document.getElementById('offers-list-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view') || urlParams.get('tab');
    const user = getCurrentUser();

    if (viewParam === 'seller') {
        currentOffersTab = 'seller';
    } else if (viewParam === 'buyer') {
        currentOffersTab = 'buyer';
    } else if (user && user.role === 'seller') {
        currentOffersTab = 'seller';
    } else {
        currentOffersTab = 'buyer';
    }

    const roleLabel = document.getElementById('current-user-role-label');
    if (roleLabel) {
        if (user) {
            roleLabel.innerHTML = `Signed in: <strong>${user.name}</strong> (${user.role.toUpperCase()})`;
        } else {
            roleLabel.innerHTML = `Signed in as Demo Buyer: <strong>Rahul Sharma</strong>`;
        }
    }

    renderOffersTabsUI();
    renderOffersList();
}

function switchOffersTab(tab) {
    currentOffersTab = tab;
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('view', tab);
    window.history.replaceState({}, '', newUrl);

    renderOffersTabsUI();
    renderOffersList();
}

function toggleDemoRole() {
    const user = getCurrentUser();
    const users = dbGet('users');
    let nextUser = null;
    if (user && user.role === 'buyer') {
        nextUser = users.find(u => u.role === 'seller') || { id: 'usr_seller_1', name: 'Aman Verma', role: 'seller', phone: '9123456789' };
        showToast('Switched to Seller View (Aman Verma)', 'info');
        currentOffersTab = 'seller';
    } else {
        nextUser = users.find(u => u.role === 'buyer') || { id: 'usr_buyer_1', name: 'Rahul Sharma', role: 'buyer', phone: '9876543210' };
        showToast('Switched to Buyer View (Rahul Sharma)', 'info');
        currentOffersTab = 'buyer';
    }
    setCurrentUser(nextUser);
    if (typeof updateUserNavUI === 'function') updateUserNavUI();
    
    const roleLabel = document.getElementById('current-user-role-label');
    if (roleLabel) {
        roleLabel.innerHTML = `Signed in: <strong>${nextUser.name}</strong> (${nextUser.role.toUpperCase()})`;
    }
    renderOffersTabsUI();
    renderOffersList();
}

function renderOffersTabsUI() {
    const tabSellerBtn = document.getElementById('tab-seller-btn');
    const tabBuyerBtn = document.getElementById('tab-buyer-btn');
    const activeHeaderTitle = document.getElementById('offers-page-header-title');
    const activeHeaderDesc = document.getElementById('offers-page-header-desc');

    const products = dbGet('products');
    const user = getCurrentUser();

    let sellerProds = products;
    if (user && user.role === 'seller') {
        sellerProds = products.filter(p => p.sellerId === user.id || p.sellerName === user.name);
    } else if (user && user.role === 'buyer') {
        sellerProds = products.filter(p => p.sellerName === 'Aman Verma' || p.sellerId === 'usr_seller_1' || (p.offers && p.offers.length > 0));
    }
    let sellerOffersCount = 0;
    sellerProds.forEach(p => {
        if (p.offers) sellerOffersCount += p.offers.length;
    });

    let buyerOffersCount = 0;
    products.forEach(p => {
        if (p.offers) {
            p.offers.forEach(of => {
                const matchesBuyer = !user || user.role === 'buyer' || of.buyerId === user?.id || of.buyerName === user?.name || of.buyerId === 'usr_buyer_1';
                if (matchesBuyer) buyerOffersCount++;
            });
        }
    });

    const sellerBadge = document.getElementById('seller-offers-count-badge');
    const buyerBadge = document.getElementById('buyer-offers-count-badge');
    if (sellerBadge) sellerBadge.textContent = sellerOffersCount;
    if (buyerBadge) buyerBadge.textContent = buyerOffersCount;

    if (tabSellerBtn && tabBuyerBtn) {
        if (currentOffersTab === 'seller') {
            tabSellerBtn.classList.remove('btn-outline');
            tabSellerBtn.classList.add('btn-primary');
            tabBuyerBtn.classList.remove('btn-primary');
            tabBuyerBtn.classList.add('btn-outline');

            if (activeHeaderTitle) activeHeaderTitle.innerHTML = '📥 Received Offers (Seller Control Center)';
            if (activeHeaderDesc) activeHeaderDesc.textContent = 'Review price negotiation proposals from campus buyers for your items. Accept to close deals or reject.';
        } else {
            tabBuyerBtn.classList.remove('btn-outline');
            tabBuyerBtn.classList.add('btn-primary');
            tabSellerBtn.classList.remove('btn-primary');
            tabSellerBtn.classList.add('btn-outline');

            if (activeHeaderTitle) activeHeaderTitle.innerHTML = '📤 My Offers (Buyer Dashboard)';
            if (activeHeaderDesc) activeHeaderDesc.textContent = 'Track items you made price proposals on, your offered amount, savings, and seller responses in real time.';
        }
    }
}

function renderOffersList() {
    const container = document.getElementById('offers-list-container');
    if (!container) return;

    const user = getCurrentUser();
    const products = dbGet('products');

    if (currentOffersTab === 'seller') {
        let sellerProds = products;
        if (user && user.role === 'seller') {
            sellerProds = products.filter(p => p.sellerId === user.id || p.sellerName === user.name);
        } else {
            sellerProds = products.filter(p => p.sellerName === 'Aman Verma' || p.sellerId === 'usr_seller_1' || (p.offers && p.offers.length > 0));
        }

        let allSellerOffers = [];
        sellerProds.forEach(p => {
            if (p.offers && p.offers.length > 0) {
                p.offers.forEach(of => {
                    allSellerOffers.push({
                        ...of,
                        productId: p.id,
                        productName: p.name,
                        productImage: p.image,
                        productCategory: p.category,
                        originalPrice: p.price,
                        sellerName: p.sellerName
                    });
                });
            }
        });

        if (allSellerOffers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem 1.5rem;" class="card">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">🏷️</div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">No Incoming Buyer Offers</h3>
                    <p style="color: var(--neutral-text-muted); max-width: 500px; margin: 0 auto 1.5rem auto;">
                        When university buyers submit price negotiation proposals on your listed products, they will appear here with instant Accept / Reject options.
                    </p>
                    <a href="create-listing.html" class="btn btn-accent">Create New Listing</a>
                </div>
            `;
            return;
        }

        let html = '';
        allSellerOffers.forEach(of => {
            const discountPct = Math.round(((of.originalPrice - of.amount) / of.originalPrice) * 100);
            const waMsg = `Hi ${of.buyerName}, regarding your offer of ${formatCurrency(of.amount)} for "${of.productName}" on CampusMart: `;
            const waUrl = buildWhatsAppLink(of.buyerPhone || '9876543210', waMsg);

            let statusBadge = '';
            if (of.status === 'Accepted') {
                statusBadge = '<span class="badge-tag" style="position: static; background: #DCFCE7; color: #166534; font-weight: 700;">✅ Accepted</span>';
            } else if (of.status === 'Rejected') {
                statusBadge = '<span class="badge-tag" style="position: static; background: #FEE2E2; color: #991B1B; font-weight: 700;">❌ Rejected</span>';
            } else {
                statusBadge = '<span class="badge-tag" style="position: static; background: #FEF3C7; color: #92400E; font-weight: 700;">⏳ Pending Review</span>';
            }

            html += `
                <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem; border-left: 4px solid ${of.status === 'Accepted' ? '#10B981' : (of.status === 'Rejected' ? '#EF4444' : '#8B5CF6')};">
                    <div style="display: flex; gap: 1.25rem; align-items: flex-start; flex-wrap: wrap;">
                        <img src="${resolveImagePath(of.productImage)}" alt="${of.productName}" style="width: 85px; height: 85px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--neutral-border);" onerror="this.src='../assets/images/campus-fallback.jpg'">
                        
                        <div style="flex: 1; min-width: 250px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
                                <div>
                                    <span style="font-size: 0.75rem; color: var(--neutral-text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${of.productCategory || 'Product Listing'}</span>
                                    <h3 style="font-size: 1.2rem; margin-top: 0.1rem; color: var(--primary-charcoal);">
                                        <a href="product.html?id=${of.productId}" style="text-decoration: none; color: inherit;">${of.productName}</a>
                                    </h3>
                                </div>
                                ${statusBadge}
                            </div>

                            <div style="display: flex; gap: 1.5rem; align-items: center; margin: 0.75rem 0; flex-wrap: wrap;">
                                <div>
                                    <span style="font-size: 0.8rem; color: var(--neutral-text-muted); display: block;">Buyer's Proposed Price:</span>
                                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--accent-dark);">${formatCurrency(of.amount)}</span>
                                    <span style="font-size: 0.8rem; color: #10B981; font-weight: 700; margin-left: 4px;">(${discountPct > 0 ? discountPct + '% below listed' : 'Matching price'})</span>
                                </div>
                                <div style="border-left: 1px solid var(--neutral-border); padding-left: 1.5rem;">
                                    <span style="font-size: 0.8rem; color: var(--neutral-text-muted); display: block;">Original Listing Price:</span>
                                    <span style="font-size: 1.1rem; font-weight: 600; color: var(--neutral-text-muted); text-decoration: line-through;">${formatCurrency(of.originalPrice)}</span>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--neutral-border); padding-top: 0.85rem; margin-top: 0.85rem; flex-wrap: wrap; gap: 0.75rem;">
                                <div>
                                    <span style="font-size: 0.85rem; color: var(--primary-charcoal);">👤 Buyer: <strong>${of.buyerName}</strong></span>
                                    <span style="font-size: 0.8rem; color: var(--neutral-text-muted); margin-left: 0.5rem;">• Date: ${of.date}</span>
                                </div>

                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    ${of.status === 'Pending' ? `
                                        <button onclick="updateOfferStatus('${of.productId}', '${of.offerId}', 'Accepted')" class="btn btn-accent btn-sm">
                                            ✅ Accept Offer
                                        </button>
                                        <button onclick="updateOfferStatus('${of.productId}', '${of.offerId}', 'Rejected')" class="btn btn-outline btn-sm" style="color: var(--danger-red); border-color: var(--danger-red);">
                                            ❌ Reject
                                        </button>
                                    ` : ''}
                                    <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25D366; color: white; display: inline-flex; align-items: center; gap: 4px;">
                                        💬 WhatsApp Buyer
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

    } else {
        let allBuyerOffers = [];
        products.forEach(p => {
            if (p.offers && p.offers.length > 0) {
                p.offers.forEach(of => {
                    const matchesUser = !user || user.role === 'buyer' || of.buyerId === user?.id || of.buyerName === user?.name || of.buyerId === 'usr_buyer_1';
                    if (matchesUser) {
                        allBuyerOffers.push({
                            ...of,
                            productId: p.id,
                            productName: p.name,
                            productImage: p.image,
                            productCategory: p.category,
                            originalPrice: p.price,
                            sellerName: p.sellerName,
                            sellerPhone: p.sellerPhone,
                            location: p.location
                        });
                    }
                });
            }
        });

        if (allBuyerOffers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem 1.5rem;" class="card">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛍️</div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">You haven't made any price offers yet</h3>
                    <p style="color: var(--neutral-text-muted); max-width: 520px; margin: 0 auto 1.5rem auto;">
                        Want to negotiate a deal? Visit any product listing in the marketplace and click the "Make an Offer" button to propose your price directly to the student seller!
                    </p>
                    <a href="marketplace.html" class="btn btn-accent">Explore Marketplace</a>
                </div>
            `;
            return;
        }

        let html = '';
        allBuyerOffers.forEach(of => {
            const savings = of.originalPrice - of.amount;
            const savingsPct = Math.round((savings / of.originalPrice) * 100);
            const waMsg = `Hi ${of.sellerName}, I made an offer of ${formatCurrency(of.amount)} on your CampusMart listing "${of.productName}". Is this price acceptable?`;
            const waUrl = buildWhatsAppLink(of.sellerPhone || '9876543210', waMsg);

            let statusBadge = '';
            let statusBanner = '';

            if (of.status === 'Accepted') {
                statusBadge = '<span class="badge-tag" style="position: static; background: #DCFCE7; color: #166534; font-weight: 700;">🎉 Offer Accepted!</span>';
                statusBanner = `
                    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                        <span style="font-size: 0.85rem; color: #166534; font-weight: 600;">
                            🎉 Great news! The seller accepted your offer of <strong>${formatCurrency(of.amount)}</strong>. You can now confirm your order or arrange handover.
                        </span>
                        <button onclick="buyerOrderAtOfferPrice('${of.productId}', ${of.amount})" class="btn btn-accent btn-sm" style="white-space: nowrap;">
                            🛒 Order at ${formatCurrency(of.amount)}
                        </button>
                    </div>
                `;
            } else if (of.status === 'Rejected') {
                statusBadge = '<span class="badge-tag" style="position: static; background: #FEE2E2; color: #991B1B; font-weight: 700;">❌ Offer Declined</span>';
                statusBanner = `
                    <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 0.85rem; color: #991B1B;">
                            The seller could not accept this offer. You can view the listing to propose a revised price.
                        </span>
                    </div>
                `;
            } else {
                statusBadge = '<span class="badge-tag" style="position: static; background: #FEF3C7; color: #92400E; font-weight: 700;">⏳ Awaiting Seller Response</span>';
            }

            html += `
                <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem; border-left: 4px solid ${of.status === 'Accepted' ? '#10B981' : (of.status === 'Rejected' ? '#EF4444' : '#3B5CCC')};">
                    ${statusBanner}

                    <div style="display: flex; gap: 1.25rem; align-items: flex-start; flex-wrap: wrap;">
                        <img src="${resolveImagePath(of.productImage)}" alt="${of.productName}" style="width: 85px; height: 85px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--neutral-border);" onerror="this.src='../assets/images/campus-fallback.jpg'">
                        
                        <div style="flex: 1; min-width: 250px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
                                <div>
                                    <span style="font-size: 0.75rem; color: var(--neutral-text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${of.productCategory || 'Item Bargained'}</span>
                                    <h3 style="font-size: 1.2rem; margin-top: 0.1rem; color: var(--primary-charcoal);">
                                        <a href="product.html?id=${of.productId}" style="text-decoration: none; color: inherit;">${of.productName}</a>
                                    </h3>
                                </div>
                                ${statusBadge}
                            </div>

                            <div style="display: flex; gap: 1.5rem; align-items: center; margin: 0.75rem 0; flex-wrap: wrap;">
                                <div>
                                    <span style="font-size: 0.8rem; color: var(--neutral-text-muted); display: block;">Your Offered Price:</span>
                                    <span style="font-size: 1.35rem; font-weight: 800; color: var(--accent-dark);">${formatCurrency(of.amount)}</span>
                                    ${savings > 0 ? `<span style="font-size: 0.8rem; color: #10B981; font-weight: 700; margin-left: 4px;">(Save ${formatCurrency(savings)} • ${savingsPct}% OFF)</span>` : ''}
                                </div>
                                <div style="border-left: 1px solid var(--neutral-border); padding-left: 1.5rem;">
                                    <span style="font-size: 0.8rem; color: var(--neutral-text-muted); display: block;">Original Listing Price:</span>
                                    <span style="font-size: 1.1rem; font-weight: 600; color: var(--neutral-text-muted); text-decoration: line-through;">${formatCurrency(of.originalPrice)}</span>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--neutral-border); padding-top: 0.85rem; margin-top: 0.85rem; flex-wrap: wrap; gap: 0.75rem;">
                                <div>
                                    <span style="font-size: 0.85rem; color: var(--primary-charcoal);">🏷️ Seller: <strong>${of.sellerName}</strong></span>
                                    <span style="font-size: 0.8rem; color: var(--neutral-text-muted); margin-left: 0.5rem;">📍 ${of.location || 'Campus Hostel'} • Offer Date: ${of.date}</span>
                                </div>

                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    ${of.status === 'Accepted' ? `
                                        <button onclick="buyerOrderAtOfferPrice('${of.productId}', ${of.amount})" class="btn btn-accent btn-sm">
                                            🛒 Order at ${formatCurrency(of.amount)}
                                        </button>
                                    ` : ''}
                                    ${of.status === 'Pending' ? `
                                        <button onclick="buyerCancelOffer('${of.productId}', '${of.offerId}')" class="btn btn-outline btn-sm" style="color: var(--danger-red); border-color: var(--danger-red);">
                                            🗑️ Cancel Offer
                                        </button>
                                    ` : ''}
                                    ${of.status === 'Rejected' ? `
                                        <a href="product.html?id=${of.productId}" class="btn btn-primary btn-sm">
                                            🛍️ Make New Offer
                                        </a>
                                    ` : ''}
                                    <a href="${waUrl}" target="_blank" class="btn btn-sm" style="background: #25D366; color: white; display: inline-flex; align-items: center; gap: 4px;">
                                        💬 WhatsApp Seller
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
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

function buyerOrderAtOfferPrice(prodId, offerAmount) {
    const products = dbGet('products');
    const p = products.find(item => item.id === prodId);
    if (!p) {
        showToast('Product not found', 'error');
        return;
    }
    const user = getCurrentUser() || { id: 'usr_buyer_1', name: 'Rahul Sharma', phone: '9876543210' };
    let orders = dbGet('orders');
    const newOrder = {
        id: 'ord_' + Date.now(),
        productId: p.id,
        productName: p.name,
        price: offerAmount,
        quantity: 1,
        totalAmount: offerAmount,
        sellerId: p.sellerId,
        sellerName: p.sellerName,
        buyerId: user.id,
        buyerName: user.name,
        buyerPhone: user.phone || '9876543210',
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Confirmed (Accepted Offer)',
        paymentMethod: 'Campus Cash on Handover'
    };
    orders.unshift(newOrder);
    dbSet('orders', orders);
    showToast(`Order placed for "${p.name}" at your negotiated price of ${formatCurrency(offerAmount)}!`, 'success');
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1200);
}

function buyerCancelOffer(prodId, offerId) {
    let products = dbGet('products');
    const p = products.find(item => item.id === prodId);
    if (p && p.offers) {
        p.offers = p.offers.filter(of => of.offerId !== offerId);
        dbSet('products', products);
        showToast('Your price negotiation offer has been cancelled.', 'info');
        initOffersPage();
    }
}
