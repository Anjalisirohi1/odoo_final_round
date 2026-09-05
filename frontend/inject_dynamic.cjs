const fs = require('fs');
let content = fs.readFileSync('src/pages/DealHealthPage.jsx.bak', 'utf8');

// 1. Add imports
content = content.replace(
  "import DashboardHeader",
  "import { useState, useEffect } from 'react';\nimport DashboardHeader"
);

// 2. Add hooks
const hooksStr = `
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzingDealId, setAnalyzingDealId] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/deal-health/dashboard', {
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token') || ''}\` }
      });
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (quotationId) => {
    try {
      setAnalyzingDealId(quotationId);
      const res = await fetch(\`http://localhost:5000/api/deal-health/analyze/\${quotationId}\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token') || ''}\` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboard();
      } else {
        alert(data.message || 'Analysis failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAnalyzingDealId(null);
    }
  };

  const handleSelectDeal = (dealId) => { setSelectedDealId(dealId); };

  const getStatusColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (score >= 65) return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    if (score >= 45) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' };
  };

  if (loading) return <div className="min-h-screen flex flex-col bg-[#F8FAFC]"><DashboardHeader activeTab="deal-health" /><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div></div>;
  if (error) return <div className="min-h-screen flex flex-col bg-[#F8FAFC]"><DashboardHeader activeTab="deal-health" /><div className="flex-1 flex items-center justify-center text-red-500">{error}</div></div>;
  if (!dashboardData) return null;

  const { summary, distribution, signals, attentionRequired, activeDeals, metadata } = dashboardData;
  const selectedDeal = selectedDealId ? activeDeals.find(d => d.quotationId === selectedDealId) : attentionRequired[0] || activeDeals[0] || null;

  return (
`;

content = content.replace("export default function DealHealthPage() {\n  return (", "export default function DealHealthPage() {\n" + hooksStr);

// 3. Replace summary values
content = content.replace(">72<", ">{summary.overallHealth}<");
content = content.replace(">76%<", ">{summary.pipelineWinPotential}%<");
content = content.replace(">8<", ">{summary.highRiskDeals}<");
content = content.replace(">₹42.5L<", ">₹{summary.revenueAtRisk.toLocaleString()}<");

// 4. Update "Refresh Analysis" button action
content = content.replace(
  /<button className="inline-flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50" type="button">/g,
  `<button onClick={fetchDashboard} className="inline-flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50" type="button">`
);

// 5. Active Deals table body replacement
const tbodyRegex = /<tbody className="divide-y divide-slate-100 text-xs">[\s\S]*?<\/tbody>/;
const dynamicTbody = `<tbody className="divide-y divide-slate-100 text-xs">
  {activeDeals.map((deal) => {
    if (deal.analysisStatus === 'PENDING') {
      return (
        <tr key={deal.quotationId} className="hover:bg-slate-50/70 transition">
          <td className="py-3.5 px-4 font-medium text-slate-900">
            <div className="font-semibold">{deal.customer}</div>
            <div className="text-[11px] text-slate-500">{deal.quotationNumber}</div>
          </td>
          <td className="py-3.5 px-3 text-right font-medium">₹{deal.value.toLocaleString()}</td>
          <td className="py-3.5 px-3 text-center text-slate-400" colSpan="3">
            Pending Analysis
          </td>
          <td className="py-3.5 px-4 text-right">
            <button 
              onClick={(e) => { e.stopPropagation(); handleAnalyze(deal.quotationId); }}
              disabled={analyzingDealId === deal.quotationId}
              className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium px-2.5 py-1 rounded disabled:opacity-50"
            >
              {analyzingDealId === deal.quotationId ? '...' : 'Run Analysis'}
            </button>
          </td>
        </tr>
      );
    }

    const colors = getStatusColor(deal.health);
    const isSelected = selectedDealId === deal.quotationId;

    return (
      <tr 
        key={deal.quotationId} 
        onClick={() => handleSelectDeal(deal.quotationId)}
        className={\`hover:bg-slate-50/70 transition cursor-pointer \${isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : ''}\`}
      >
        <td className="py-3.5 px-4 font-medium text-slate-900">
          <div className={\`font-semibold \${isSelected ? 'text-blue-900' : 'text-slate-900'}\`}>{deal.customer}</div>
          <div className="text-[11px] text-slate-500">{deal.quotationNumber}</div>
        </td>
        <td className="py-3.5 px-3 text-right font-medium text-slate-800">₹{deal.value.toLocaleString()}</td>
        <td className="py-3.5 px-3 text-center">
          <span className={\`inline-flex items-center justify-center w-7 h-7 rounded-full \${colors.bg} \${colors.text} font-bold \${colors.border} text-xs\`}>
            {deal.health}
          </span>
        </td>
        <td className="py-3.5 px-3 text-center font-medium">{deal.winProbability}%</td>
        <td className="py-3.5 px-3 text-center">
          <span className={\`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full \${deal.anomalyRisk === 'HIGH' || deal.anomalyRisk === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}\`}>
            {deal.anomalyRisk || 'NONE'}
          </span>
        </td>
        <td className="py-3.5 px-4 text-right">
          <button 
            onClick={(e) => { e.stopPropagation(); handleAnalyze(deal.quotationId); }}
            disabled={analyzingDealId === deal.quotationId}
            className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium px-2 py-1 rounded disabled:opacity-50"
          >
            {analyzingDealId === deal.quotationId ? '...' : 'Refresh'}
          </button>
        </td>
      </tr>
    );
  })}
</tbody>`;
content = content.replace(tbodyRegex, dynamicTbody);


// Replace the Right Panel (Selected Deal AI Decision Profile) completely with a dynamic one, but keeping the HTML structure exactly.
const asideRegex = /<aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-200" data-purpose="ai-decision-profile-panel">[\s\S]*?<\/aside>/;
const dynamicAside = `
{selectedDeal && (
<aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-200" data-purpose="ai-decision-profile-panel">
{/* Profile Header: Selected Deal Context */}
<div className="p-5 bg-slate-50/50 rounded-t-xl">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
  Selected Profile
</span>
<span className="text-xs text-slate-400 font-mono">{selectedDeal.quotationNumber}</span>
</div>
<div className="mt-3 flex items-start justify-between">
<div>
<h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedDeal.customer}</h3>
<p className="text-xs text-slate-500 mt-0.5">
  Value: <span className="font-semibold text-slate-800">₹{selectedDeal.value.toLocaleString()}</span>
</p>
</div>
{/* Score Pill */}
<div className="text-right">
<div className="inline-flex flex-col items-center justify-center w-14 h-14 bg-rose-50 border border-rose-200 rounded-xl">
<span className="text-xl font-black text-rose-700">{selectedDeal.health}</span>
<span className="text-[9px] font-semibold text-rose-600 uppercase">Health</span>
</div>
</div>
</div>
</div>
{/* Section 5: Five AI Intelligence Signals Breakdown */}
<div className="p-5 space-y-3">
<div className="flex items-center justify-between">
<h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">AI Intelligence Signals</h4>
<span className="text-[11px] text-slate-400">Risk Model v4.8</span>
</div>
<div className="space-y-2.5 text-xs">
{selectedDeal.intelligence && selectedDeal.intelligence.deal_health ? (
  <>
  <div>
  <div className="flex justify-between text-slate-600 mb-1">
  <span>Conversion Potential</span>
  <span className="font-bold text-slate-800">{selectedDeal.intelligence.deal_health.dimension_scores.conversion_potential}%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: \`\${selectedDeal.intelligence.deal_health.dimension_scores.conversion_potential}%\` }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-slate-600 mb-1">
  <span>Engagement</span>
  <span className="font-bold text-slate-800">{selectedDeal.intelligence.deal_health.dimension_scores.engagement}%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: \`\${selectedDeal.intelligence.deal_health.dimension_scores.engagement}%\` }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-slate-600 mb-1">
  <span>Financial Health</span>
  <span className="font-bold text-slate-800">{selectedDeal.intelligence.deal_health.dimension_scores.financial_health}%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: \`\${selectedDeal.intelligence.deal_health.dimension_scores.financial_health}%\` }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-slate-600 mb-1">
  <span>Momentum</span>
  <span className="font-bold text-slate-800">{selectedDeal.intelligence.deal_health.dimension_scores.momentum}%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: \`\${selectedDeal.intelligence.deal_health.dimension_scores.momentum}%\` }}></div>
  </div>
  </div>
  </>
) : null}
{/* Signal 5: Anomaly Risk */}
<div className="pt-1 flex items-center justify-between bg-rose-50/50 p-2 rounded border border-rose-100 mt-2">
<span className="font-medium text-slate-700 text-xs">Anomaly Risk Level</span>
<span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-600 text-white tracking-wider">{selectedDeal.anomalyRisk || 'NONE'}</span>
</div>
</div>
</div>
{/* Section 6: AI Diagnostic Insights */}
<div className="p-5 space-y-3">
<div>
<h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">AI Diagnostic Insights</h4>
<p className="text-[11px] text-slate-500">Generated from Explainable AI analysis</p>
</div>
<div className="space-y-2 text-xs">
{selectedDeal.concerns && selectedDeal.concerns.length > 0 ? selectedDeal.concerns.map((c, i) => (
<div key={i} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded border border-slate-100">
<svg className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<p className="text-slate-700 leading-relaxed">
{c.description || JSON.stringify(c)}
</p>
</div>
)) : (
  <div className="text-slate-500 italic p-2">No concerns detected.</div>
)}
{selectedDeal.anomalyReasons && selectedDeal.anomalyReasons.length > 0 && selectedDeal.anomalyReasons.map((c, i) => (
<div key={i} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded border border-slate-100">
<svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<p className="text-slate-700 leading-relaxed">
{c}
</p>
</div>
))}
</div>
</div>
{/* Section 7: AI Recommended Next Action */}
<div className="p-5 space-y-3.5 bg-slate-50/40 rounded-b-xl">
<div className="flex items-center justify-between">
<h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">AI Recommended Next Action</h4>
<span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">High Confidence</span>
</div>
{selectedDeal.recommendedActions && selectedDeal.recommendedActions.length > 0 ? (
<div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
<div className="text-xs font-bold text-amber-900 tracking-wide uppercase">ACTION: {selectedDeal.recommendedActions[0].action_type}</div>
<p className="text-[11px] text-amber-800 mt-1 leading-normal">
{selectedDeal.recommendedActions[0].reasoning}
</p>
</div>
) : (
<div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
<div className="text-xs font-bold text-slate-700 tracking-wide">ACTION: CONTINUE MONITORING</div>
</div>
)}
{/* Action Buttons */}
<div className="space-y-2 pt-1">
<button className="w-full inline-flex items-center justify-center py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition" type="button">
  Take Action
</button>
</div>
</div>
</aside>
)}
`;

content = content.replace(asideRegex, dynamicAside);

fs.writeFileSync('src/pages/DealHealthPage.jsx', content);
console.log('Successfully injected dynamic details while keeping static layout intact.');
