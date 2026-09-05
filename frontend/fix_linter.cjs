const fs = require('fs');

let content = fs.readFileSync('src/pages/DealHealthPage.jsx', 'utf8');

// Move fetchDashboard above useEffect
const useEffectRegex = /  useEffect\(\(\) => \{\n    fetchDashboard\(\);\n  \}, \[\]\);\n/;
content = content.replace(useEffectRegex, '');
const fetchDashboardRegex = /(  const fetchDashboard = async \(\) => \{[\s\S]*?  \};\n)/;
content = content.replace(fetchDashboardRegex, `$1\n  useEffect(() => {\n    fetchDashboard();\n  }, []);\n`);

// Replace Metadata Total Deals
content = content.replace(
  /\(35 Total Active Deals\)/,
  "({metadata.totalActiveDeals} Total Active Deals)"
);

// Replace Distribution
const distributionExcellentRegex = /<div className="w-24 text-right text-slate-600 font-semibold text-xs">\s*14 deals <span className="text-slate-400 font-normal">\(40%\)<\/span>\s*<\/div>/g;
content = content.replace(
  /<div className="w-24 text-right text-slate-600 font-semibold text-xs">\s*14 deals <span className="text-slate-400 font-normal">\(40%\)<\/span>\s*<\/div>/,
  '<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.excellent.count} deals <span className="text-slate-400 font-normal">({distribution.excellent.percentage}%)</span></div>'
);
content = content.replace(
  /<div className="bg-emerald-500 h-2\.5 rounded-full" style=\{\{ width: '40%' \}\}\><\/div>/,
  '<div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${distribution.excellent.percentage}%` }}></div>'
);

content = content.replace(
  /<div className="w-24 text-right text-slate-600 font-semibold text-xs">\s*10 deals <span className="text-slate-400 font-normal">\(28%\)<\/span>\s*<\/div>/,
  '<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.healthy.count} deals <span className="text-slate-400 font-normal">({distribution.healthy.percentage}%)</span></div>'
);
content = content.replace(
  /<div className="bg-teal-500 h-2\.5 rounded-full" style=\{\{ width: '28%' \}\}\><\/div>/,
  '<div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${distribution.healthy.percentage}%` }}></div>'
);

content = content.replace(
  /<div className="w-24 text-right text-slate-600 font-semibold text-xs">\s*8 deals <span className="text-slate-400 font-normal">\(23%\)<\/span>\s*<\/div>/,
  '<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.atRisk.count} deals <span className="text-slate-400 font-normal">({distribution.atRisk.percentage}%)</span></div>'
);
content = content.replace(
  /<div className="bg-amber-500 h-2\.5 rounded-full" style=\{\{ width: '23%' \}\}\><\/div>/,
  '<div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${distribution.atRisk.percentage}%` }}></div>'
);

content = content.replace(
  /<div className="w-24 text-right text-slate-600 font-semibold text-xs">\s*3 deals <span className="text-slate-400 font-normal">\(9%\)<\/span>\s*<\/div>/,
  '<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.critical.count} deals <span className="text-slate-400 font-normal">({distribution.critical.percentage}%)</span></div>'
);
content = content.replace(
  /<div className="bg-rose-500 h-2\.5 rounded-full" style=\{\{ width: '9%' \}\}\><\/div>/,
  '<div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${distribution.critical.percentage}%` }}></div>'
);


// Replace Signals
content = content.replace(
  /<span className="text-slate-800 font-semibold">78%<\/span>/,
  '<span className="text-slate-800 font-semibold">{signals.conversionPotential}%</span>'
);
content = content.replace(
  /<div className="bg-blue-600 h-2 rounded-full" style=\{\{ width: '78%' \}\}\><\/div>/,
  '<div className="bg-blue-600 h-2 rounded-full" style={{ width: `${signals.conversionPotential}%` }}></div>'
);

content = content.replace(
  /<span className="text-slate-800 font-semibold">52%<\/span>/,
  '<span className="text-slate-800 font-semibold">{signals.engagementHealth}%</span>'
);
content = content.replace(
  /<div className="bg-blue-500 h-2 rounded-full" style=\{\{ width: '52%' \}\}\><\/div>/,
  '<div className="bg-blue-500 h-2 rounded-full" style={{ width: `${signals.engagementHealth}%` }}></div>'
);

content = content.replace(
  /<span className="text-slate-800 font-semibold">67%<\/span>/,
  '<span className="text-slate-800 font-semibold">{signals.financialHealth}%</span>'
);
content = content.replace(
  /<div className="bg-blue-600 h-2 rounded-full" style=\{\{ width: '67%' \}\}\><\/div>/,
  '<div className="bg-blue-600 h-2 rounded-full" style={{ width: `${signals.financialHealth}%` }}></div>'
);

content = content.replace(
  /<span className="text-amber-700 font-semibold">41% \(Lagging\)<\/span>/,
  '<span className="text-amber-700 font-semibold">{signals.dealMomentum}%</span>'
);
content = content.replace(
  /<div className="bg-amber-500 h-2 rounded-full" style=\{\{ width: '41%' \}\}\><\/div>/,
  '<div className="bg-amber-500 h-2 rounded-full" style={{ width: `${signals.dealMomentum}%` }}></div>'
);

content = content.replace(
  /<span className="text-slate-800 font-semibold">63%<\/span>/,
  '<span className="text-slate-800 font-semibold">{signals.riskSafetyIndex}%</span>'
);
content = content.replace(
  /<div className="bg-blue-600 h-2 rounded-full" style=\{\{ width: '63%' \}\}\><\/div>/,
  '<div className="bg-blue-600 h-2 rounded-full" style={{ width: `${signals.riskSafetyIndex}%` }}></div>'
);

fs.writeFileSync('src/pages/DealHealthPage.jsx', content);
console.log('Fixed linter errors.');
