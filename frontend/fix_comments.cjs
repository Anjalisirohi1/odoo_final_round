const fs = require('fs');

const path = 'd:/Odoo/frontend/src/pages/DealHealthPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace HTML comments with JSX comments
content = content.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

fs.writeFileSync(path, content);
console.log('Fixed comments');
