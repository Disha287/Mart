/* CAMPUSMART - Orders & Rating Engine */

let currentOrderTab = 'active';

document.addEventListener('DOMContentLoaded', function() {
    renderOrders();
});

function switchOrderTab(tab, btn) {
    currentOrderTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
    });
    btn.classList.remove('btn-outline');
    btn.classList.add('btn-primary');
    renderOrders();
}

function renderOrders() {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    const user = getCurrentUser();
    let orders = dbGet('orders');

    if (user) {
        orders = orders.filter(o => o.buyerId === user.id || o.buyerName === user.name);
    }

    if (currentOrderTab === 'active') {
        orders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
    } else {
        orders = orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');
    }

    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1.5rem;" class="card">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">📦</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No ${currentOrderTab} orders found</h3>
                <p style="color: var(--neutral-text-muted); margin-bottom: 1.5rem;">You don't have any ${currentOrderTab} orders right now.</p>
                <a href="marketplace.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    let html = '';
    orders.forEach(o => {
        const itemTotal = o.price * o.quantity;
        const waMsg = `Hi, I placed an order for "${o.productName}" on CampusMart. Order ID: ${o.id}. Total: ${formatCurrency(itemTotal)}. I'd like to coordinate purchase.`;
        const waUrl = buildWhatsAppLink(o.sellerPhone || '9123456789', waMsg);

        let statusBadgeClass = 'badge-fixed';
        if (o.status === 'Completed') statusBadgeClass = 'badge-tag';
        if (o.status === 'Cancelled') statusBadgeClass = 'badge-bidding';

        html += `
            <div class="card" style="padding: 1.5rem; margin-bottom: 1.25rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--neutral-border); flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <span style="font-weight: 700; font-size: 1.05rem;">Order #${o.id}</span>
                        <span style="font-size: 0.85rem; color: var(--neutral-text-muted); margin-left: 0.75rem;">📅 Date: ${o.date}</span>
                    </div>
                    <span class="badge-tag" style="position: static; background-color: var(--secondary-blue);">${o.status}</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">${o.productName}</h4>
                        <div style="font-size: 0.9rem; color: var(--neutral-text-muted);">Seller: <strong>${o.sellerName}</strong></div>
                        <div style="font-size: 0.9rem; color: var(--neutral-text-muted);">Quantity: ${o.quantity} x ${formatCurrency(o.price)}</div>
                    </div>

                    <div style="text-align: right;">
                        <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary-charcoal);">${formatCurrency(itemTotal)}</div>
                        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
                            <a href="${waUrl}" target="_blank" class="btn btn-accent btn-sm" style="background-color: #25D366; color: white;">
                                💬 WhatsApp Seller
                            </a>
                            ${o.status === 'Completed' && !o.rated ? `<button onclick="openRatingModal('${o.id}', '${o.sellerName}')" class="btn btn-outline btn-sm">⭐ Rate Seller</button>` : ''}
                            ${o.status !== 'Completed' ? `<button onclick="markOrderCompleted('${o.id}')" class="btn btn-primary btn-sm">✅ Mark Complete</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function markOrderCompleted(orderId) {
    let orders = dbGet('orders');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Completed';
        dbSet('orders', orders);
        showToast(`Order #${orderId} marked as Completed!`, 'success');
        renderOrders();
    }
}

function openRatingModal(orderId, sellerName) {
    document.getElementById('rating-order-id').value = orderId;
    document.getElementById('rating-seller-name').textContent = sellerName;
    openModal('rating-modal');
}

function submitRating() {
    const orderId = document.getElementById('rating-order-id').value;
    const stars = Number(document.getElementById('rating-stars').value);

    let orders = dbGet('orders');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.rated = true;
        order.ratingGiven = stars;
        dbSet('orders', orders);

        closeModal('rating-modal');
        showToast(`Thank you! Submitted ${stars}-star rating for seller.`, 'success');
        renderOrders();
    }
}
