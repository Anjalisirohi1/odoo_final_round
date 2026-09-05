const fs = require('fs');
const lines = fs.readFileSync('src/pages/DealHealthPage.jsx', 'utf8').split('\n');

let depth = 0;
let maxDepth = 0;
let minDepth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div[\s>]/g) || []).length + (line.match(/<div$/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    maxDepth = Math.max(maxDepth, depth);
    minDepth = Math.min(minDepth, depth);
    if (depth < 0) {
        console.log(`❌ Depth went negative at line ${i+1} (depth=${depth}): ${line.trim().slice(0,80)}`);
    }
}
console.log(`\nFinal depth: ${depth} (should be 0 for balanced divs)`);
console.log(`Max depth reached: ${maxDepth}, Min depth: ${minDepth}`);

// Now check section
let secDepth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<section[\s>]/g) || []).length;
    const closes = (line.match(/<\/section>/g) || []).length;
    secDepth += opens - closes;
}
console.log(`\nSection depth: ${secDepth} (should be 0)`);
