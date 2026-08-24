/* CAMPUSMART - Shopping Cart Engine */

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
});

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!container) return;

    const cart = dbGet('cart');
    const products = dbGet('products');

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem;" class="card">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛒</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Your cart is waiting for something awesome</h3>
                <p style="color: var(--neutral-text-muted); margin-bottom: 1.5rem;">Explore marketplace or tuck shop to add items.</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <a href="marketplace.html" class="btn btn-primary">Browse Marketplace</a>
                    <a href="tuck-shop.html" class="btn btn-accent">Explore Tuck Shop</a>
                </div>
            </div>
        `;
        if (summaryContainer) summaryContainer.style.display = 'none';
        return;
    }

    if (summaryContainer) summaryContainer.style.display = 'block';

    let cartDetailedItems = [];
    cart.forEach(item => {
        if (item.isTuck) {
            cartDetailedItems.push({
                id: item.productId,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity,
                sellerName: 'Campus Tuck Shop',
                sellerPhone: '9123456789',
                isTuck: true
            });
        } else {
            const p = products.find(prod => prod.id === item.productId);
            if (p) {
                cartDetailedItems.push({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.image,
                    quantity: item.quantity,
                    sellerName: p.sellerName,
                    sellerPhone: p.sellerPhone || '9123456789',
                    isTuck: false
                });
            }
        }
    });

    let itemsHtml = '';
    cartDetailedItems.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        itemsHtml += `
            <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem; flex: 2;">
                    <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: var(--radius-md);" onerror="this.src='../assets/images/campus-fallback.jpg'">
                    <div>
                        <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${item.name}</h4>
                        <span style="font-size: 0.8rem; color: var(--neutral-text-muted);">Seller: <strong>${item.sellerName}</strong></span>
                        <div style="font-weight: 700; color: var(--primary-charcoal); margin-top: 4px;">${formatCurrency(item.price)} each</div>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="updateCartQuantity('${item.id}', -1)" class="btn btn-outline btn-sm" style="width: 32px; height: 32px; padding: 0;">-</button>
                    <span style="font-weight: 700; font-size: 1rem; width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.id}', 1)" class="btn btn-outline btn-sm" style="width: 32px; height: 32px; padding: 0;">+</button>
                </div>

                <div style="text-align: right; min-width: 110px;">
                    <div style="font-weight: 800; font-size: 1.1rem; color: var(--primary-charcoal);">${formatCurrency(itemSubtotal)}</div>
                    <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: var(--danger-red); font-size: 0.8rem; cursor: pointer; margin-top: 4px;">Remove 🗑️</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = itemsHtml;

    // Use reduce() for array calculation requirement
    const grandTotal = cartDetailedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    const grandTotalEl = document.getElementById('cart-grand-total');
    if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);
}

function updateCartQuantity(prodId, delta) {
    let cart = dbGet('cart');
    const target = cart.find(item => item.productId === prodId);

    if (target) {
        target.quantity += delta;
        if (target.quantity <= 0) {
            cart = cart.filter(item => item.productId !== prodId);
        }
    }

    dbSet('cart', cart);
    updateNavBadges();
    renderCart();
}

function removeFromCart(prodId) {
    let cart = dbGet('cart');
    cart = cart.filter(item => item.productId !== prodId);
    dbSet('cart', cart);
    updateNavBadges();
    showToast('Item removed from cart', 'info');
    renderCart();
}

function checkoutCart() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to place your order', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }

    const cart = dbGet('cart');
    if (cart.length === 0) return;

    const products = dbGet('products');
    let orders = dbGet('orders');

    cart.forEach(item => {
        let name = 'Campus Item';
        let price = 0;
        let sellerName = 'Student Seller';
        let sellerPhone = '9123456789';

        if (item.isTuck) {
            name = item.name;
            price = item.price;
            sellerName = 'Campus Tuck Shop';
        } else {
            const p = products.find(prod => prod.id === item.productId);
            if (p) {
                name = p.name;
                price = p.price;
                sellerName = p.sellerName;
                sellerPhone = p.sellerPhone || '9123456789';
            }
        }

        const newOrder = {
            id: 'ord_' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100),
            productId: item.productId,
            productName: name,
            price: price,
            quantity: item.quantity,
            sellerName: sellerName,
            sellerPhone: sellerPhone,
            buyerId: user.id,
            buyerName: user.name,
            date: new Date().toISOString().split('T')[0],
            status: 'Order Placed',
            rated: false
        };

        orders.push(newOrder);
    });

    dbSet('orders', orders);
    dbSet('cart', []); // Clear Cart
    updateNavBadges();

    showToast('Order placed successfully! Contact sellers on WhatsApp.', 'success');

    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1200);
}
