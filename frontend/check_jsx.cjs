const fs = require('fs');

try {
    const src = fs.readFileSync('src/pages/DealHealthPage.jsx', 'utf8');
    require('@babel/parser').parse(src, { sourceType: 'module', plugins: ['jsx'] });
    console.log('JSX is valid');
} catch (e) {
    const lines = require('fs').readFileSync('src/pages/DealHealthPage.jsx','utf8').split('\n');
    const errLine = e.loc?.line;
    if (errLine) {
        console.log('Error at line', errLine, ':', e.message.slice(0, 200));
        console.log('\nContext:');
        for (let i = Math.max(0, errLine - 4); i < Math.min(lines.length, errLine + 4); i++) {
            console.log(`${i+1}: ${lines[i]}`);
        }
    } else {
        console.log('Error:', e.message.slice(0, 300));
    }
}
