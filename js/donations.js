document.addEventListener('DOMContentLoaded', function() {
    // If not initialized in localStorage, initDatabase from data.js does it
    renderDonations();

    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmit);
    }
});

function renderDonations() {
    let donations = dbGet('donations') || [];
    
    // Only show available items
    donations = donations.filter(d => d.status === 'Available');

    const container = document.getElementById('donations-grid');
    if (!container) return;

    if (donations.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--neutral-text-muted);">No available donations at the moment. Be the first to donate!</div>';
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

async function handleDonationSubmit(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('don-itemName').value;
    const category = document.getElementById('don-category').value;
    const description = document.getElementById('don-description').value;
    const donorName = document.getElementById('don-name').value;
    const donorPhone = document.getElementById('don-phone').value;

    const donations = dbGet('donations') || [];
    
    const imageInput = document.getElementById('don-image');
    let image = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
    
    if (imageInput && imageInput.files && imageInput.files[0]) {
        try {
            image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(imageInput.files[0]);
            });
        } catch (error) {
            console.error("Error reading file:", error);
            showToast("Failed to process image. Using default.", "warning");
        }
    }

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
        image: image
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
        const claimedItem = donations[index];
        dbSet('donations', donations);
        
        showToast('Item successfully claimed! Redirecting to WhatsApp...', 'success');
        renderDonations();

        // Redirect to WhatsApp
        const message = `Hi ${claimedItem.donorName}, I am ${receiverName}. I would like to collect your donated item: "${claimedItem.itemName}". Please let me know when and where we can meet!`;
        // Remove spaces or non-digit chars from phone just in case, though keeping it simple is fine
        const phoneStr = claimedItem.donorPhone.replace(/\D/g, '');
        // Prefix with 91 if it's a 10 digit Indian number and doesn't have it
        const finalPhone = phoneStr.length === 10 ? '91' + phoneStr : phoneStr;
        const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
            window.open(waUrl, '_blank');
        }, 1000);
    }
}
