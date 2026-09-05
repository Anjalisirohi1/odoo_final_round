const fs = require('fs');
let content = fs.readFileSync('src/pages/DealHealthPage.jsx', 'utf8');
content = content.replace(/localStorage\.getItem\('token'\)/g, "localStorage.getItem('dealflow_token')");
fs.writeFileSync('src/pages/DealHealthPage.jsx', content);
console.log('Fixed token key. Occurrences replaced:', (content.match(/dealflow_token/g) || []).length);
