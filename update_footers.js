const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\harsh\\OneDrive\\Desktop\\Mart';
const filesToProcess = [];

// Get root html
fs.readdirSync(basePath).forEach(file => {
    if (file.endsWith('.html')) {
        filesToProcess.push(path.join(basePath, file));
    }
});

// Get pages html
const pagesDir = path.join(basePath, 'pages');
if (fs.existsSync(pagesDir)) {
    fs.readdirSync(pagesDir).forEach(file => {
        if (file.endsWith('.html')) {
            filesToProcess.push(path.join(pagesDir, file));
        }
    });
}

const getFooterTemplate = (isRoot) => {
    const rootPrefix = isRoot ? '' : '../';
    const pagesPrefix = isRoot ? 'pages/' : '';

    return `    <!-- WHY CAMPUSMART FEATURE BLOCKS -->
    <section class="section" style="background-color: #171B26; color: var(--neutral-white);">
        <div class="container">
            <div class="section-title-wrap" style="text-align: center; margin-bottom: 2.5rem;">
                <span class="section-subtitle" style="color: var(--accent-orange); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Built For Students</span>
                <h2 class="section-title" style="color: var(--neutral-white); margin-top: 0.5rem; font-size: 2rem;">Why Choose CampusMart?</h2>
            </div>

            <div class="grid grid-cols-4" style="gap: 1.5rem;">
                <div style="padding: 1.5rem; background: #1E2332; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">🎓</div>
                    <h3 style="font-size: 1.1rem; color: var(--neutral-white); margin-bottom: 0.5rem;">Campus Focused</h3>
                    <p style="font-size: 0.85rem; color: #94A3B8; line-height: 1.6;">Built specifically for university students with verified college credentials and hostel delivery.</p>
                </div>

                <div style="padding: 1.5rem; background: #1E2332; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">⚡</div>
                    <h3 style="font-size: 1.1rem; color: var(--neutral-white); margin-bottom: 0.5rem;">Easy Buying & Selling</h3>
                    <p style="font-size: 0.85rem; color: #94A3B8; line-height: 1.6;">List your items in 60 seconds with fixed pricing or real-time campus bidding system.</p>
                </div>

                <div style="padding: 1.5rem; background: #1E2332; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">💬</div>
                    <h3 style="font-size: 1.1rem; color: var(--neutral-white); margin-bottom: 0.5rem;">Direct Communication</h3>
                    <p style="font-size: 0.85rem; color: #94A3B8; line-height: 1.6;">Instantly connect with student sellers on WhatsApp with pre-filled product order messages.</p>
                </div>

                <div style="padding: 1.5rem; background: #1E2332; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">🌟</div>
                    <h3 style="font-size: 1.1rem; color: var(--neutral-white); margin-bottom: 0.5rem;">Student Services</h3>
                    <p style="font-size: 0.85rem; color: #94A3B8; line-height: 1.6;">Hire peer experts for project assistance, design, technical troubleshooting, and tutoring.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer" style="background-color: #171B26; border-top: none; padding-top: 4rem; padding-bottom: 2rem;">
        <div class="container">
            <div class="footer-grid" style="grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 3rem; text-align: left;">
                <div class="footer-brand">
                    <h3 style="color: #FFFFFF; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">CampusMart</h3>
                    <p class="footer-desc" style="color: #94A3B8; font-size: 0.9rem; line-height: 1.6; max-width: 250px;">
                        Your ultimate student-to-student marketplace. Buy, sell, and connect with your campus community instantly.
                    </p>
                </div>

                <div>
                    <h4 class="footer-title" style="color: #FFFFFF; font-size: 1rem; margin-bottom: 1.25rem;">Quick Links</h4>
                    <ul class="footer-links" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="${rootPrefix}index.html" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem;">Home</a></li>
                        <li><a href="${rootPrefix}${pagesPrefix}marketplace.html" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem;">Marketplace</a></li>
                        <li><a href="${rootPrefix}${pagesPrefix}services.html" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem;">Services</a></li>
                        <li><a href="${rootPrefix}${pagesPrefix}offers.html" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem;">Offers</a></li>
                        <li><a href="#" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem;">Contact</a></li>
                        <li><a href="#" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem;">Design</a></li>
                        <li><a href="#" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem; text-transform: uppercase;">CLIENT SHOW CASE</a></li>
                        <li><a href="#" style="color: #94A3B8; text-decoration: none; font-size: 0.9rem; text-transform: uppercase;">REVIEWS</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="footer-title" style="color: #FFFFFF; font-size: 1rem; margin-bottom: 1.25rem;">Contact Us</h4>
                    <ul class="footer-links" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem;">
                        <li style="display: flex; gap: 0.5rem; color: #94A3B8; font-size: 0.9rem; align-items: flex-start;">
                            <span style="color: #EF4444;">📍</span> CampusMart, Sec-82, SAS Nagar, Punjab
                        </li>
                        <li style="display: flex; gap: 0.5rem; color: #94A3B8; font-size: 0.9rem; align-items: center;">
                            <span>📞</span> (+91) 98765-XXXXX
                        </li>
                        <li style="display: flex; gap: 0.5rem; color: #94A3B8; font-size: 0.9rem; align-items: center;">
                            <span>✉️</span> contact@campusmart.com
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 class="footer-title" style="color: #FFFFFF; font-size: 1rem; margin-bottom: 1.25rem;">Follow Us</h4>
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="#" style="width: 32px; height: 32px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; font-size: 0.85rem;">f</a>
                        <a href="#" style="width: 32px; height: 32px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; font-size: 0.85rem;">ig</a>
                        <a href="#" style="width: 32px; height: 32px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; font-size: 0.85rem;">p</a>
                        <a href="#" style="width: 32px; height: 32px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; font-size: 0.85rem;">h</a>
                    </div>
                </div>
            </div>

            <div class="footer-bottom" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; text-align: left;">
                <p style="color: #64748B; font-size: 0.85rem; margin: 0;">© 2025 CampusMart. All rights reserved.</p>
            </div>
        </div>
    </footer>`;
}

filesToProcess.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    let startIndex = content.indexOf('<!-- WHY CAMPUSMART FEATURE BLOCKS -->');
    if (startIndex === -1) {
        startIndex = content.indexOf('<!-- FOOTER -->');
    }
    if (startIndex === -1) {
        startIndex = content.indexOf('<!-- Footer -->');
    }
    
    let endIndex = content.lastIndexOf('</footer>');
    if (startIndex !== -1 && endIndex !== -1) {
        endIndex += '</footer>'.length;
        
        const isRoot = path.dirname(file) === basePath;
        const newFooter = getFooterTemplate(isRoot);
        
        content = content.substring(0, startIndex) + newFooter + content.substring(endIndex);
        fs.writeFileSync(file, content);
        console.log('Updated: ' + file);
    } else {
        console.log('Could not find footer in: ' + file);
    }
});
