document.addEventListener('DOMContentLoaded', function() {
    // If not initialized in localStorage, initDatabase from data.js does it
    renderDonations();

    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmit);
    }
});

function renderDonations() {
    const donations = dbGet('donations') || [];
    const container = document.getElementById('donations-grid');
    if (!container) return;

    if (donations.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--neutral-text-muted);">No donations available at the moment. Be the first to donate!</div>';
        return;
    }

    let html = '';
    
    // Sort so available is first, then newest
    donations.sort((a, b) => {
        if (a.status === 'Available' && b.status !== 'Available') return -1;
        if (a.status !== 'Available' && b.status === 'Available') return 1;
        return new Date(b.datePosted) - new Date(a.datePosted);
    });

    donations.forEach(d => {
        const isAvailable = d.status === 'Available';
        const badgeClass = isAvailable ? 'badge-fixed' : 'badge-bidding'; // Reuse existing classes: green for available, gray/orange for claimed

        html += `
            <div class="card product-card">
                <div class="product-img-wrap" style="height: 200px; position: relative;">
                    <span class="badge-tag ${badgeClass}" style="position: absolute; top: 10px; left: 10px;">
                        ${isAvailable ? '🎁 Available' : '✅ Claimed'}
                    </span>
                    <img src="${d.image}" alt="${d.itemName}" loading="lazy" onerror="this.src='../assets/images/campus-fallback.jpg'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="product-content" style="padding: 1.25rem;">
                    <span class="product-category">${d.category}</span>
                    <h3 class="product-title" style="margin-bottom: 0.5rem;">${d.itemName}</h3>
                    <p style="font-size: 0.85rem; color: var(--neutral-text-muted); margin-bottom: 1rem; min-height: 40px;">${d.description}</p>
                    
                    <div style="font-size: 0.85rem; margin-bottom: 1rem; padding: 0.5rem; background: var(--neutral-white); border: 1px solid var(--neutral-border); border-radius: var(--radius-sm);">
                        <strong>Donor:</strong> ${d.donorName} <br>
                        ${isAvailable ? '' : `<strong>Claimed by:</strong> ${d.receiverName}`}
                    </div>

                    <div class="product-actions">
                        ${isAvailable ? 
                            `<button onclick="claimDonation('${d.id}')" class="btn btn-accent btn-block" style="width: 100%;">🎁 Claim Item</button>` 
                            : 
                            `<button class="btn btn-outline btn-block" style="width: 100%; opacity: 0.6; cursor: not-allowed;" disabled>Item Claimed</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function handleDonationSubmit(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('don-itemName').value;
    const category = document.getElementById('don-category').value;
    const description = document.getElementById('don-description').value;
    const donorName = document.getElementById('don-name').value;
    const donorPhone = document.getElementById('don-phone').value;

    const donations = dbGet('donations') || [];
    
    const newDonation = {
        id: 'don_' + Date.now(),
        itemName,
        category,
        description,
        donorName,
        donorPhone,
        receiverName: null,
        receiverPhone: null,
        status: 'Available',
        datePosted: new Date().toISOString().split('T')[0],
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' // default fallback
    };

    donations.unshift(newDonation);
    dbSet('donations', donations);
    
    showToast('Item donated successfully! Thank you for your generosity.', 'success');
    
    document.getElementById('donation-form').reset();
    renderDonations();
}

function claimDonation(donationId) {
    const receiverName = prompt("Enter your full name to claim this item:");
    if (!receiverName) return;
    
    const receiverPhone = prompt("Enter your contact number so the donor can coordinate with you:");
    if (!receiverPhone) return;

    let donations = dbGet('donations');
    const index = donations.findIndex(d => d.id === donationId);
    
    if (index !== -1) {
        donations[index].status = 'Claimed';
        donations[index].receiverName = receiverName;
        donations[index].receiverPhone = receiverPhone;
        dbSet('donations', donations);
        
        showToast('Item successfully claimed! Coordinate with the donor.', 'success');
        renderDonations();
    }
}
