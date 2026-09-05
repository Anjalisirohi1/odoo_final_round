const fs = require('fs');

let content = fs.readFileSync('src/pages/DealHealthPage.jsx', 'utf8');

// 1. Add apiFetch import after the existing imports
content = content.replace(
  "import { useState, useEffect } from 'react';",
  "import { useState, useEffect } from 'react';\nimport apiFetch from '../utils/api';"
);

// 2. Replace fetchDashboard fetch call
content = content.replace(
  `const res = await fetch('http://localhost:5000/api/deal-health/dashboard', {
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('dealflow_token') || ''}\` }
      });`,
  `const res = await apiFetch('/api/deal-health/dashboard');`
);

// 3. Replace handleAnalyze fetch call
content = content.replace(
  `const res = await fetch(\`http://localhost:5000/api/deal-health/analyze/\${quotationId}\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('dealflow_token') || ''}\` }
      });`,
  `const res = await apiFetch(\`/api/deal-health/analyze/\${quotationId}\`, { method: 'POST' });`
);

fs.writeFileSync('src/pages/DealHealthPage.jsx', content);
console.log('Done. Occurrences of apiFetch:', (content.match(/apiFetch/g) || []).length);
