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

filesToProcess.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // For root files
    if (path.dirname(file) === basePath) {
        if (!content.includes('href="pages/donations.html"')) {
            const target = '<a href="pages/orders.html"';
            if (content.includes(target)) {
                content = content.replace(
                    target,
                    '<a href="pages/donations.html" class="nav-link">Donations</a>\n                ' + target
                );
                fs.writeFileSync(file, content);
                console.log('Updated: ' + file);
            }
        }
    } 
    // For pages files
    else {
        if (!content.includes('href="donations.html"')) {
            // First try finding orders.html
            const target = '<a href="orders.html"';
            if (content.includes(target)) {
                content = content.replace(
                    target,
                    '<a href="donations.html" class="nav-link">Donations</a>\n                ' + target
                );
                fs.writeFileSync(file, content);
                console.log('Updated: ' + file);
            }
        }
    }
});
