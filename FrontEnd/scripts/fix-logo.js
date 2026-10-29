const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'pages');
if (!fs.existsSync(dir)) {
    console.error('Directory does not exist:', dir);
    process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const fp = path.join(dir, f);
    let content = fs.readFileSync(fp, 'utf8');
    
    let updated = content.replace(
        /<a href="\.\.\/index\.html" class="logo">\s*<img src="\.\.\/assets\/images\/logo\.png"[^>]*>\s*<\/a>/gi,
        '<a href="../index.html" class="logo nav-brand">CAMPUS MART<span class="brand-red">.</span></a>'
    );

    updated = updated.replace(
        /<img src="\.\.\/assets\/images\/logo\.png"[^>]*>/gi,
        '<a href="../index.html" class="logo nav-brand">CAMPUS MART<span class="brand-red">.</span></a>'
    );

    if (updated !== content) {
        fs.writeFileSync(fp, updated, 'utf8');
        console.log('Fixed logo in:', f);
    }
});
console.log('Done fixing logos across all pages.');
