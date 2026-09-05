const fs = require('fs');

const jsxContent = `import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function DealHealthPage() {
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
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token') || ''}\`
        }
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
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token') || ''}\`
        }
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

  const handleSelectDeal = (dealId) => {
    setSelectedDealId(dealId);
  };

  const getStatusColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (score >= 65) return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    if (score >= 45) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <DashboardHeader activeTab="deal-health" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <DashboardHeader activeTab="deal-health" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 font-medium">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { summary, distribution, signals, attentionRequired, activeDeals, metadata } = dashboardData;

  const selectedDeal = selectedDealId 
    ? activeDeals.find(d => d.quotationId === selectedDealId)
    : attentionRequired[0] || activeDeals[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="deal-health" />
      
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 space-y-6">
        <section data-purpose="page-title-and-actions">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5">
            <span className="hover:text-slate-700 cursor-pointer">DealFlow360</span>
            <span>/</span>
            <span className="hover:text-slate-700 cursor-pointer">Analytics</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">Deal Health Intelligence</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deal Health Intelligence</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  Realtime CPQ Risk Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                AI-powered pipeline intelligence, predictive risk analysis, and recommended actions.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={fetchDashboard} className="inline-flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50" type="button">
                <svg className="w-3.5 h-3.5 text-slate-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="font-medium">Refresh Analysis</span>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" data-purpose="ai-pipeline-summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Overall Deal Health</span>
              </div>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{summary.overallHealth}</span>
                <span className="text-sm font-medium text-slate-500 ml-1.5">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                Composite AI health index
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Pipeline Win Potential</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{summary.pipelineWinPotential}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Predicted probability-weighted conversion</p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>High Risk Deals</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-amber-600">{summary.highRiskDeals}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">AI-detected anomaly exposure</p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Revenue At Risk</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-3xl font-bold tracking-tight text-slate-900">₹{summary.revenueAtRisk.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Probability-weighted revenue exposure</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6" data-purpose="distribution-and-composition">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Deal Health Distribution</h2>
                  <p className="text-xs text-slate-500 mt-0.5">AI classification across active opportunities ({metadata.analyzedDeals} Total Analyzed)</p>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { label: 'Excellent (80-100)', color: 'bg-emerald-500', data: distribution.excellent },
                  { label: 'Healthy (65-79)', color: 'bg-teal-500', data: distribution.healthy },
                  { label: 'At Risk (45-64)', color: 'bg-amber-500', data: distribution.atRisk },
                  { label: 'Critical (<45)', color: 'bg-rose-500', data: distribution.critical }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    <div className="w-36 flex items-center gap-1.5 font-medium text-slate-700">
                      <span className={\`w-2 h-2 rounded-full \${item.color}\`}></span>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex-1 mx-3 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className={\`\${item.color} h-2.5 rounded-full\`} style={{ width: \`\${item.data.percentage}%\` }}></div>
                    </div>
                    <div className="w-24 text-right text-slate-600 font-semibold text-xs">
                      {item.data.count} deals <span className="text-slate-400 font-normal">({item.data.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-100"></div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">AI Signal Composition</h3>
                  <p className="text-[11px] text-slate-500">Composite intelligence signals contributing to pipeline health</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                {[
                  { label: 'Conversion Potential', val: signals.conversionPotential },
                  { label: 'Engagement Health', val: signals.engagementHealth },
                  { label: 'Financial Health', val: signals.financialHealth },
                  { label: 'Deal Momentum', val: signals.dealMomentum },
                  { label: 'Risk Safety Index', val: signals.riskSafetyIndex }
                ].map((sig, idx) => (
                  <div key={idx} className={\`space-y-1 \${idx === 4 ? 'sm:col-span-2' : ''}\`}>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{sig.label}</span>
                      <span className="text-slate-800 font-semibold">{sig.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: \`\${sig.val}%\` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" data-purpose="ai-attention-required">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">AI Attention Required</h2>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">{attentionRequired.length} Deals Flagged</span>
                </div>
              </div>
              <div className="mt-3.5 space-y-3">
                {attentionRequired.slice(0, 3).map((deal, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-rose-200 bg-rose-50/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-700 bg-white border border-rose-200 px-1.5 py-0.5 rounded">Score: {deal.healthScore}</span>
                          <h3 className="text-xs font-semibold text-slate-900">{deal.customer}</h3>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{deal.quotationNumber} • ₹{deal.value.toLocaleString()}</div>
                        {deal.concerns && deal.concerns.length > 0 && (
                          <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                            {deal.concerns[0].description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {attentionRequired.length === 0 && (
                  <div className="text-sm text-slate-500 text-center py-4">No deals require immediate attention.</div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" data-purpose="active-deals-table">
            <div className="p-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Active Deals — AI Intelligence</h2>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-3 text-right">Value</th>
                    <th className="py-3 px-3 text-center">Health</th>
                    <th className="py-3 px-3 text-center">Win Prob.</th>
                    <th className="py-3 px-3 text-center">Anomaly Risk</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
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
                              onClick={() => handleAnalyze(deal.quotationId)}
                              disabled={analyzingDealId === deal.quotationId}
                              className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium px-2.5 py-1 rounded disabled:opacity-50"
                            >
                              {analyzingDealId === deal.quotationId ? 'Analyzing...' : 'Run Analysis'}
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
                            className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium px-2 py-1 rounded"
                          >
                            {analyzingDealId === deal.quotationId ? '...' : 'Refresh'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {selectedDeal && (
            <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-200">
              <div className="p-5 bg-slate-50/50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    Selected Profile
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedDeal.quotationNumber}</span>
                </div>
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedDeal.customer}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Value: <span className="font-semibold text-slate-800">₹{selectedDeal.value.toLocaleString()}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex flex-col items-center justify-center w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xl font-black text-slate-700">{selectedDeal.health}</span>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase">Health</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Anomaly Risk</h4>
                <div className="pt-1 flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-medium text-slate-700 text-xs">Risk Level</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-200 text-slate-700 tracking-wider">{selectedDeal.anomalyRisk || 'NONE'}</span>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
\`;

fs.writeFileSync('src/pages/DealHealthPage.jsx', jsxContent);
console.log('DealHealthPage.jsx updated successfully.');
