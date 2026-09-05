const fs = require('fs');
const lines = fs.readFileSync('src/pages/DealHealthPage.jsx', 'utf8').split('\n');

// Count div open/close between lines 353-435
let depth = 0;
let issues = [];
for (let i = 352; i < 435; i++) {
    const line = lines[i];
    const opens = (line.match(/<div[^/]/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    if (opens > 0 || closes > 0) {
        issues.push(`Line ${i+1} [+${opens}/-${closes}] depth=${depth}: ${line.trim().slice(0,80)}`);
    }
}
console.log('Final depth:', depth, '(should be 0 if balanced)');
console.log('\nDiv activity:');
issues.forEach(i => console.log(i));
