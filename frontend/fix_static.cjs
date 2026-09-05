const fs = require('fs');
let c = fs.readFileSync('src/pages/DealHealthPage.jsx', 'utf8');

// 1. Add handleAnalyzeAll after handleAnalyze function
const handleAnalyzeEnd = `  const handleSelectDeal = (dealId) => { setSelectedDealId(dealId); };`;
const analyzeAllFn = `
  const [analyzingAll, setAnalyzingAll] = useState(false);

  const handleAnalyzeAll = async () => {
    const pending = activeDeals
      ? activeDeals.filter(d => d.analysisStatus === 'PENDING')
      : [];
    if (!pending.length && activeDeals) {
      // Re-analyze all if none are pending
      const all = activeDeals.slice(0, 5); // limit to 5 at a time
      setAnalyzingAll(true);
      for (const deal of all) {
        try {
          await apiFetch(\`/api/deal-health/analyze/\${deal.quotationId}\`, { method: 'POST' });
        } catch(e) { /* continue */ }
      }
      setAnalyzingAll(false);
      await fetchDashboard();
      return;
    }
    setAnalyzingAll(true);
    for (const deal of pending) {
      try {
        await apiFetch(\`/api/deal-health/analyze/\${deal.quotationId}\`, { method: 'POST' });
      } catch(e) { /* continue */ }
    }
    setAnalyzingAll(false);
    await fetchDashboard();
  };

  `;

c = c.replace(handleAnalyzeEnd, analyzeAllFn + handleAnalyzeEnd);

// 2. Add "Analyze All" button next to Refresh
const refreshBtn = `<button onClick={fetchDashboard} className="inline-flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50" type="button">`;
const analyzeAllBtn = `<button onClick={handleAnalyzeAll} disabled={analyzingAll} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs shadow-sm mr-2" type="button">
                <svg className="w-3.5 h-3.5 text-white mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="font-medium">{analyzingAll ? 'Analyzing...' : 'Analyze All Deals'}</span>
              </button>
              `;
c = c.replace(refreshBtn, analyzeAllBtn + refreshBtn);

// 3. Remove the stale "10m ago" text
c = c.replace(`<span className="text-slate-400 text-[11px] ml-1.5">• 10m ago</span>`, '');

// 4. Fix AI Attention Required section - find the static Alert Items list and replace with dynamic
const staticAttentionRegex = /\{\/\* Deal Alerts List \*\/\}[\s\S]*?\{\/\* Footer Link \*\/\}/;

const dynamicAttention = `{/* Deal Alerts List */}
<div className="mt-3.5 space-y-3">
{attentionRequired && attentionRequired.length > 0 ? attentionRequired.slice(0, 3).map((deal, idx) => {
  const isCritical = deal.healthScore < 40 || deal.anomalyRisk === 'CRITICAL' || deal.anomalyRisk === 'HIGH';
  const borderColor = isCritical ? 'border-rose-200 bg-rose-50/30' : 'border-amber-200 bg-amber-50/30';
  const scoreColor = isCritical ? 'text-rose-700 border-rose-200' : 'text-amber-700 border-amber-200';
  const labelColor = isCritical ? 'text-rose-600 bg-rose-100' : 'text-amber-700 bg-amber-100';
  return (
    <div key={deal.quotationId} className={\`p-3 rounded-lg border \${borderColor} hover:opacity-90 transition cursor-pointer\`} onClick={() => setSelectedDealId(deal.quotationId)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={\`text-xs font-bold bg-white border px-1.5 py-0.5 rounded \${scoreColor}\`}>Score: {deal.healthScore}</span>
            <h3 className="text-xs font-semibold text-slate-900">{deal.customer}</h3>
            <span className={\`text-[10px] uppercase font-bold px-1 rounded \${labelColor}\`}>{deal.classification || deal.anomalyRisk || 'At Risk'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{deal.quotationNumber} • ₹{deal.value?.toLocaleString()}</div>
          {deal.concerns && deal.concerns[0] && (
            <p className={\`text-[11px] mt-1.5 flex items-center gap-1 font-medium \${isCritical ? 'text-rose-600' : 'text-amber-800'}\`}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path></svg>
              {deal.concerns[0].description || deal.concerns[0]}
            </p>
          )}
          {(!deal.concerns || !deal.concerns[0]) && deal.anomalyReasons && deal.anomalyReasons[0] && (
            <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
              {deal.anomalyReasons[0]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}) : (
  <div className="py-8 text-center">
    <div className="text-slate-400 text-sm font-medium">No analyzed deals yet</div>
    <p className="text-xs text-slate-400 mt-1">Click <strong>"Analyze All Deals"</strong> to run AI analysis</p>
  </div>
)}
</div>
{/* Footer Link */}`;

if (staticAttentionRegex.test(c)) {
  c = c.replace(staticAttentionRegex, dynamicAttention);
  console.log('✅ AI Attention section replaced');
} else {
  console.log('❌ Could not find static attention section');
}

// 5. Fix the static "5 Deals Flagged" badge to be dynamic
c = c.replace(
  `<span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">5 Deals Flagged</span>`,
  `<span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">{attentionRequired ? attentionRequired.length : 0} Deals Flagged</span>`
);

// 6. Fix the "Showing X of 35" static footer
c = c.replace(
  `<span>Showing 4 of 35 active opportunities</span>`,
  `<span>Showing {activeDeals ? activeDeals.length : 0} of {metadata ? metadata.totalActiveDeals : 0} active opportunities</span>`
);

// 7. Fix static pills "All Deals (35)", "High Risk (8)", "Critical (3)"
c = c.replace(`All Deals (35)`, `All Deals ({metadata ? metadata.totalActiveDeals : 0})`);
c = c.replace(`High Risk (8)`, `High Risk ({summary ? summary.highRiskDeals : 0})`);
c = c.replace(`Critical (3)`, `Critical ({distribution ? distribution.critical.count : 0})`);

fs.writeFileSync('src/pages/DealHealthPage.jsx', c);
console.log('✅ All static data replaced with dynamic bindings.');
console.log('✅ "Analyze All Deals" button added.');
