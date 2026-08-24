/* CAMPUSMART - Services Marketplace & Provider Engine */

let activeServiceCategory = 'all';

document.addEventListener('DOMContentLoaded', function() {
    initServicesPage();
});

function initServicesPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');

    if (catParam) {
        activeServiceCategory = catParam;
    }

    setupProviderForm();
    renderServiceProviders();
}

function filterServiceCategory(catName, btn) {
    activeServiceCategory = catName;
    document.querySelectorAll('.cat-pill').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
    });
    if (btn) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
    }
    renderServiceProviders();
}

function renderServiceProviders() {
    const container = document.getElementById('services-providers-grid');
    if (!container) return;

    let providers = dbGet('service_providers');
    const search = (document.getElementById('service-search-input')?.value || '').toLowerCase().trim();

    if (activeServiceCategory !== 'all') {
        providers = providers.filter(p => p.category.toLowerCase() === activeServiceCategory.toLowerCase());
    }

    if (search) {
        providers = providers.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.category.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            (p.skills && p.skills.some(s => s.toLowerCase().includes(search)))
        );
    }

    if (providers.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem;" class="card">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛠️</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No providers found for this category</h3>
                <p style="color: var(--neutral-text-muted); margin-bottom: 1.5rem;">Be the first to offer your services in this category!</p>
                <button onclick="openModal('register-provider-modal')" class="btn btn-accent">Offer Your Services Now</button>
            </div>
        `;
        return;
    }

    let html = '';
    providers.forEach(p => {
        const skillsHtml = (p.skills || []).map(s => `<span style="background: var(--secondary-blue-light); color: var(--secondary-blue); font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-sm);">${s}</span>`).join(' ');
        
        const waMsg = `Hi ${p.name}, I found your service listing for "${p.category}" on CampusMart. I'd like to hire/inquire about your starting price of ${formatCurrency(p.startingPrice)}.`;
        const waUrl = buildWhatsAppLink(p.phone || '9876543210', waMsg);

        html += `
            <div class="card product-card">
                <div style="position: relative; padding-top: 60%; background: var(--primary-charcoal); overflow: hidden;">
                    <img src="${p.image}" alt="${p.name}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover;" onerror="this.src='../assets/images/campus-fallback.jpg'">
                    <span class="badge-tag badge-fixed" style="top: 10px; left: 10px;">${p.category}</span>
                </div>

                <div class="product-content">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h3 style="font-size: 1.15rem;">${p.name}</h3>
                        <span class="trust-badge">🛡️ ${p.trustScore || 95}</span>
                    </div>

                    <p style="font-size: 0.85rem; color: var(--neutral-text-muted); margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${p.description}
                    </p>

                    <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 1rem;">
                        ${skillsHtml}
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; color: var(--neutral-text-muted); margin-bottom: 0.75rem;">
                        <span>💼 ${p.experience || 'Student Expert'}</span>
                        <span>✅ ${p.completedCount || 10}+ Jobs Completed</span>
                    </div>

                    <div class="product-price-wrap">
                        <div>
                            <span style="font-size: 0.75rem; color: var(--neutral-text-muted); display: block;">Starting from</span>
                            <div class="product-price">${formatCurrency(p.startingPrice)}</div>
                        </div>
                        <div>${renderStars(p.rating || 4.9)}</div>
                    </div>

                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <a href="${waUrl}" target="_blank" class="btn btn-accent btn-block btn-sm" style="background-color: #25D366; color: white;">
                            💬 WhatsApp Contact
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function setupProviderForm() {
    const form = document.getElementById('register-provider-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('prov-name').value.trim();
        const phone = document.getElementById('prov-phone').value.trim();
        const category = document.getElementById('prov-category').value;
        const skillsRaw = document.getElementById('prov-skills').value.trim();
        const price = Number(document.getElementById('prov-price').value);
        const desc = document.getElementById('prov-desc').value.trim();
        const exp = document.getElementById('prov-exp').value.trim();

        if (!name || !phone || !category || !price || !desc) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        const skills = skillsRaw ? skillsRaw.split(',').map(s => s.trim()) : ['Campus Service'];

        let providers = dbGet('service_providers');
        const newProvider = {
            id: 'srv_prov_' + Date.now(),
            name: name,
            category: category,
            skills: skills,
            description: desc,
            startingPrice: price,
            experience: exp || 'Campus Student Specialist',
            rating: 5.0,
            trustScore: 92,
            completedCount: 1,
            phone: phone,
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        };

        providers.unshift(newProvider);
        dbSet('service_providers', providers);

        closeModal('register-provider-modal');
        showToast('Registered as Service Provider successfully!', 'success');
        renderServiceProviders();
    });
}
