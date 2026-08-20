/* CAMPUSMART - Academic Assistance & Mentor Rating Engine */

document.addEventListener('DOMContentLoaded', function() {
    initAcademicPage();
});

function initAcademicPage() {
    renderAcademicRequests();
    renderAcademicHelpers();
    setupRequirementForm();
    setupAddMentorForm();
    setupRateMentorForm();
}

function renderAcademicRequests() {
    const container = document.getElementById('academic-requests-grid');
    if (!container) return;

    const requests = dbGet('academic_requests');

    if (requests.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;" class="card">
                <h3>No active student project help requests</h3>
                <p style="color: var(--neutral-text-muted);">Post your requirement to connect with student mentors.</p>
            </div>
        `;
        return;
    }

    let html = '';
    requests.forEach(r => {
        const skillsHtml = (r.skills || []).map(s => `<span style="background: #EEF2FF; color: #4F46E5; font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-sm);">${s}</span>`).join(' ');
        
        const waMsg = `Hi ${r.studentName}, I saw your Academic Help post "${r.title}" on CampusMart. I'd like to offer project guidance for your budget of ${formatCurrency(r.budget)}.`;
        const waUrl = buildWhatsAppLink(r.studentPhone || '9876543210', waMsg);

        html += `
            <div class="card" style="padding: 1.5rem; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div>
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${r.category}</span>
                        <h3 style="font-size: 1.15rem; margin-top: 0.2rem;">${r.title}</h3>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.2rem; font-weight: 800; color: var(--primary-charcoal);">${formatCurrency(r.budget)}</span>
                        <span style="display: block; font-size: 0.75rem; color: var(--neutral-text-muted);">Deadline: ${r.deadline}</span>
                    </div>
                </div>

                <p style="font-size: 0.9rem; color: var(--neutral-text-muted); margin-bottom: 1rem;">${r.description}</p>

                <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 1.25rem;">
                    ${skillsHtml}
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--neutral-border);">
                    <span style="font-size: 0.85rem; color: var(--neutral-text-muted);">Posted by: <strong>👤 ${r.studentName}</strong></span>
                    <a href="${waUrl}" target="_blank" class="btn btn-accent btn-sm" style="background-color: #25D366; color: white;">
                        💬 Offer Help via WhatsApp
                    </a>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderAcademicHelpers() {
    const container = document.getElementById('academic-helpers-grid');
    if (!container) return;

    const providers = dbGet('service_providers');
    const academicProviders = providers.filter(p => p.isMentor || p.category === 'Academic Help' || p.category === 'Electronics & Tech' || (p.skills && (p.skills.includes('Python') || p.skills.includes('DBMS'))));

    if (academicProviders.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;" class="card">
                <h3>No registered academic mentors yet</h3>
                <p style="color: var(--neutral-text-muted);">Click "Join as a Mentor" to offer guidance to junior peers.</p>
            </div>
        `;
        return;
    }

    let html = '';
    academicProviders.forEach(p => {
        const skillsHtml = (p.skills || []).map(s => `<span style="background: var(--secondary-blue-light); color: var(--secondary-blue); font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-sm);">${s}</span>`).join(' ');
        
        const waMsg = `Hi ${p.name}, I found your mentor profile on CampusMart under Academic Assistance. I need project guidance. Are you available for a session?`;
        const waUrl = buildWhatsAppLink(p.phone || '9876543210', waMsg);
        const ratingCount = p.completedCount || 12;

        html += `
            <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                        <img src="${p.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}" alt="${p.name}" style="width: 54px; height: 54px; border-radius: var(--radius-full); object-fit: cover;" onerror="this.src='../assets/images/campus-fallback.jpg'">
                        <div>
                            <h4 style="font-size: 1.05rem; margin-bottom: 2px;">${p.name}</h4>
                            <span style="font-size: 0.8rem; color: var(--secondary-blue); font-weight: 600;">🎓 ${p.experience || 'Campus Academic Mentor'}</span>
                        </div>
                    </div>

                    <p style="font-size: 0.85rem; color: var(--neutral-text-muted); margin-bottom: 0.75rem; line-height: 1.5;">${p.description}</p>

                    <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 1rem;">
                        ${skillsHtml}
                    </div>
                </div>

                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--neutral-border);">
                        <span style="font-size: 0.9rem;">Fee: <strong style="color: var(--primary-charcoal); font-size: 1.05rem;">${formatCurrency(p.startingPrice)}</strong></span>
                        <div style="text-align: right;">
                            <div>${renderStars(p.rating || 4.9)}</div>
                            <span style="font-size: 0.75rem; color: var(--neutral-text-muted);">(${ratingCount} reviews)</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <a href="${waUrl}" target="_blank" class="btn btn-outline btn-sm" style="flex: 2; color: #25D366; border-color: #25D366;">
                            💬 WhatsApp
                        </a>
                        <button onclick="openMentorRatingModal('${p.id}', '${p.name.replace(/'/g, "\\'")}')" class="btn btn-primary btn-sm" style="flex: 1.5; font-size: 0.8rem;">
                            ⭐ Rate
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function setupRequirementForm() {
    const form = document.getElementById('post-requirement-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('req-title').value.trim();
        const category = document.getElementById('req-category').value;
        const skillsRaw = document.getElementById('req-skills').value.trim();
        const budget = Number(document.getElementById('req-budget').value);
        const deadline = document.getElementById('req-deadline').value;
        const studentName = document.getElementById('req-name').value.trim();
        const studentPhone = document.getElementById('req-phone').value.trim();
        const desc = document.getElementById('req-desc').value.trim();

        if (!title || !budget || !deadline || !studentName || !studentPhone || !desc) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        const skills = skillsRaw ? skillsRaw.split(',').map(s => s.trim()) : ['General Help'];

        let requests = dbGet('academic_requests');
        const newReq = {
            id: 'req_' + Date.now(),
            title: title,
            category: category,
            skills: skills,
            budget: budget,
            deadline: deadline,
            studentName: studentName,
            studentPhone: studentPhone,
            description: desc,
            datePosted: new Date().toISOString().split('T')[0]
        };

        requests.unshift(newReq);
        dbSet('academic_requests', requests);

        closeModal('post-requirement-modal');
        showToast('Academic requirement posted successfully!', 'success');
        renderAcademicRequests();
    });
}

function setupAddMentorForm() {
    const form = document.getElementById('add-mentor-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('mentor-name').value.trim();
        const phone = document.getElementById('mentor-phone').value.trim();
        const role = document.getElementById('mentor-role').value.trim();
        const price = Number(document.getElementById('mentor-price').value);
        const skillsRaw = document.getElementById('mentor-skills').value.trim();
        const desc = document.getElementById('mentor-desc').value.trim();

        if (!name || !phone || !role || !price || !skillsRaw || !desc) {
            showToast('Please fill in all fields to register as mentor', 'warning');
            return;
        }

        const skills = skillsRaw.split(',').map(s => s.trim());
        let providers = dbGet('service_providers');

        const newMentor = {
            id: 'mentor_' + Date.now(),
            name: name,
            category: 'Academic Help',
            isMentor: true,
            skills: skills,
            description: desc,
            startingPrice: price,
            experience: role,
            rating: 5.0,
            trustScore: 98,
            completedCount: 1,
            phone: phone,
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
        };

        providers.unshift(newMentor);
        dbSet('service_providers', providers);

        closeModal('add-mentor-modal');
        showToast('🌟 Successfully registered as a Campus Academic Mentor!', 'success');
        renderAcademicHelpers();
    });
}

function openMentorRatingModal(mentorId, mentorName) {
    const hiddenIdInput = document.getElementById('rate-mentor-id');
    const nameDisplay = document.getElementById('rate-mentor-name-display');

    if (hiddenIdInput && nameDisplay) {
        hiddenIdInput.value = mentorId;
        nameDisplay.textContent = mentorName;
        openModal('rate-mentor-modal');
    }
}

function setupRateMentorForm() {
    const form = document.getElementById('rate-mentor-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const mentorId = document.getElementById('rate-mentor-id').value;
        const givenStars = Number(document.getElementById('rate-mentor-stars').value);

        let providers = dbGet('service_providers');
        const mentor = providers.find(p => p.id === mentorId);

        if (mentor) {
            const currentCount = mentor.completedCount || 1;
            const currentRating = mentor.rating || 5.0;

            // Recalculate Average Rating
            const updatedRating = Number((((currentRating * currentCount) + givenStars) / (currentCount + 1)).toFixed(1));
            mentor.rating = updatedRating;
            mentor.completedCount = currentCount + 1;

            dbSet('service_providers', providers);

            closeModal('rate-mentor-modal');
            showToast(`⭐ Submitted ${givenStars}-star rating for ${mentor.name}! Updated score: ${updatedRating}★`, 'success');
            renderAcademicHelpers();
        }
    });
}
