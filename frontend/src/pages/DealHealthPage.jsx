
import { useState, useEffect } from 'react';
import apiFetch from '../utils/api';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

function AttentionCard({ deal, onSelect }) {
  const isCritical = deal.healthScore < 40 || deal.anomalyRisk === 'CRITICAL' || deal.anomalyRisk === 'HIGH';
  const wrapCls = isCritical
    ? 'p-3 rounded-lg border border-rose-200 bg-rose-50/30 hover:opacity-90 transition cursor-pointer'
    : 'p-3 rounded-lg border border-amber-200 bg-amber-50/30 hover:opacity-90 transition cursor-pointer';
  const scoreCls = isCritical
    ? 'text-xs font-bold bg-white border border-rose-200 px-1.5 py-0.5 rounded text-rose-700'
    : 'text-xs font-bold bg-white border border-amber-200 px-1.5 py-0.5 rounded text-amber-700';
  const labelCls = isCritical
    ? 'text-[10px] uppercase font-bold px-1 rounded text-rose-600 bg-rose-100'
    : 'text-[10px] uppercase font-bold px-1 rounded text-amber-700 bg-amber-100';
  const msgCls = isCritical
    ? 'text-[11px] mt-1.5 flex items-center gap-1 font-medium text-rose-600'
    : 'text-[11px] mt-1.5 flex items-center gap-1 font-medium text-amber-800';
  const concern = deal.concerns && deal.concerns[0]
    ? (deal.concerns[0].description || String(deal.concerns[0]))
    : (deal.anomalyReasons && deal.anomalyReasons[0] ? String(deal.anomalyReasons[0]) : null);
  return (
    <div className={wrapCls} onClick={() => onSelect(deal.quotationId)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={scoreCls}>Score: {deal.healthScore}</span>
            <h3 className="text-xs font-semibold text-slate-900">{deal.customer}</h3>
            <span className={labelCls}>{deal.classification || deal.anomalyRisk || 'At Risk'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{deal.quotationNumber} • ₹{deal.value ? deal.value.toLocaleString() : 0}</div>
          {concern && (
            <p className={msgCls}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path>
              </svg>
              {concern}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


export default function DealHealthPage() {

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzingDealId, setAnalyzingDealId] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);


  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/deal-health/dashboard');
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

  const handleAnalyze = async (quotationId) => {
    try {
      setAnalyzingDealId(quotationId);
      const res = await apiFetch(`/api/deal-health/analyze/${quotationId}`, { method: 'POST' });
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


  const [analyzingAll, setAnalyzingAll] = useState(false);

  const handleAnalyzeAll = async () => {
    const deals = dashboardData?.activeDeals || [];
    if (!deals.length) {
      alert('No deals to analyze');
      return;
    }
    setAnalyzingAll(true);
    let count = 0;
    for (const deal of deals.slice(0, 10)) {
      try {
        console.log(`Analyzing deal ${deal.quotationId} (${deal.quotationNumber})...`);
        const res = await apiFetch(`/api/deal-health/analyze/${deal.quotationId}`, { method: 'POST' });
        const data = await res.json();
        console.log('Result:', data.success ? 'OK' : data.message);
        if (data.success) count++;
      } catch(e) {
        console.error('Analyze error:', e.message);
      }
    }
    setAnalyzingAll(false);
    if (count > 0) {
      await fetchDashboard();
    } else {
      alert('Analysis failed for all deals. Check browser console for details.');
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

    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="deal-health" />
      
      
<main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 space-y-6">
{/* BEGIN: PageHeader */}
<section data-purpose="page-title-and-actions">
{/* Breadcrumb Navigation */}
<div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5">
<span className="hover:text-slate-700 cursor-pointer">DealFlow360</span>
<span>/</span>
<span className="hover:text-slate-700 cursor-pointer">Analytics</span>
<span>/</span>
<span className="text-slate-800 font-medium">Deal Health Intelligence</span>
</div>
{/* Title & Context Controls */}
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
{/* Filter Controls */}
<div className="flex items-center gap-2.5">
<div className="inline-flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
<svg className="w-3.5 h-3.5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="font-medium">Last 30 Days</span>
<svg className="w-3 h-3 text-slate-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd"></path>
</svg>
</div>
<div className="inline-flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
<svg className="w-3.5 h-3.5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span>Filter (Active: <strong className="font-medium text-slate-800">All Owners</strong>)</span>
<svg className="w-3 h-3 text-slate-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd"></path>
</svg>
</div>
<button onClick={handleAnalyzeAll} disabled={analyzingAll} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs shadow-sm mr-2" type="button">
                <svg className="w-3.5 h-3.5 text-white mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="font-medium">{analyzingAll ? 'Analyzing...' : 'Analyze All Deals'}</span>
              </button>
              <button onClick={fetchDashboard} className="inline-flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50" type="button">
<svg className="w-3.5 h-3.5 text-slate-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="font-medium">Refresh Analysis</span>

</button>
</div>
</div>
</section>
{/* END: PageHeader */}
{/* BEGIN: Section1_AIPipelineSummary */}
{/* Integrated Horizontal Pipeline Metric Summary Bar with Dividers */}
<section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" data-purpose="ai-pipeline-summary">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
{/* Metric 1: Overall Deal Health */}
<div className="p-5">
<div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
<span>Overall Deal Health</span>
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              +3.4 pts
            </span>
</div>
<div className="mt-2.5 flex items-baseline">
<span className="text-3xl font-bold tracking-tight text-slate-900">{summary.overallHealth}</span>
<span className="text-sm font-medium text-slate-500 ml-1.5">/ 100</span>
</div>
<p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
<svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
            Composite AI health index (Benchmark: 70+)
          </p>
</div>
{/* Metric 2: Pipeline Win Potential */}
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
{/* Metric 3: High Risk Deals */}
<div className="p-5">
<div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
<span>High Risk Deals</span>
<span className="w-2 h-2 rounded-full bg-amber-500"></span>
</div>
<div className="mt-2.5 flex items-baseline gap-2">
<span className="text-3xl font-bold tracking-tight text-amber-600">{summary.highRiskDeals}</span>
<span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Needs Review</span>
</div>
<p className="text-xs text-slate-500 mt-1">AI-detected anomaly exposure across deals</p>
</div>
{/* Metric 4: Revenue At Risk */}
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
{/* END: Section1_AIPipelineSummary */}
{/* BEGIN: MiddleSection_DistributionAndAttention */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
{/* LEFT: Section 2 - Deal Health Distribution & AI Signal Composition (7 Columns) */}
<section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6" data-purpose="distribution-and-composition">
{/* Header & Distribution Summary */}
<div>
<div className="flex items-center justify-between">
<div>
<h2 className="text-base font-semibold text-slate-900">Deal Health Distribution</h2>
<p className="text-xs text-slate-500 mt-0.5">AI classification across active opportunities ({metadata.totalActiveDeals} Total Active Deals)</p>
</div>
</div>
{/* Distribution Stack Progress Bars */}
<div className="mt-4 space-y-2.5">
{/* 1. Excellent */}
<div className="flex items-center text-xs">
<div className="w-36 flex items-center gap-1.5 font-medium text-slate-700">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<span>Excellent (80–100)</span>
</div>
<div className="flex-1 mx-3 bg-slate-100 rounded-full h-2.5 overflow-hidden">
<div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${distribution.excellent.percentage}%` }}></div>
</div>
<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.excellent.count} deals <span className="text-slate-400 font-normal">({distribution.excellent.percentage}%)</span></div>
</div>
{/* 2. Healthy */}
<div className="flex items-center text-xs">
<div className="w-36 flex items-center gap-1.5 font-medium text-slate-700">
<span className="w-2 h-2 rounded-full bg-teal-500"></span>
<span>Healthy (65–79)</span>
</div>
<div className="flex-1 mx-3 bg-slate-100 rounded-full h-2.5 overflow-hidden">
<div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${distribution.healthy.percentage}%` }}></div>
</div>
<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.healthy.count} deals <span className="text-slate-400 font-normal">({distribution.healthy.percentage}%)</span></div>
</div>
{/* 3. At Risk */}
<div className="flex items-center text-xs">
<div className="w-36 flex items-center gap-1.5 font-medium text-slate-700">
<span className="w-2 h-2 rounded-full bg-amber-500"></span>
<span>At Risk (45–64)</span>
</div>
<div className="flex-1 mx-3 bg-slate-100 rounded-full h-2.5 overflow-hidden">
<div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${distribution.atRisk.percentage}%` }}></div>
</div>
<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.atRisk.count} deals <span className="text-slate-400 font-normal">({distribution.atRisk.percentage}%)</span></div>
</div>
{/* 4. Critical */}
<div className="flex items-center text-xs">
<div className="w-36 flex items-center gap-1.5 font-medium text-slate-700">
<span className="w-2 h-2 rounded-full bg-rose-500"></span>
<span>Critical (&lt;45)</span>
</div>
<div className="flex-1 mx-3 bg-slate-100 rounded-full h-2.5 overflow-hidden">
<div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${distribution.critical.percentage}%` }}></div>
</div>
<div className="w-24 text-right text-slate-600 font-semibold text-xs">{distribution.critical.count} deals <span className="text-slate-400 font-normal">({distribution.critical.percentage}%)</span></div>
</div>
</div>
</div>
<div className="border-t border-slate-100"></div>
{/* AI Signal Composition Sub-section */}
<div>
<div className="flex items-center justify-between mb-3">
<div>
<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">AI Signal Composition</h3>
<p className="text-[11px] text-slate-500">Composite intelligence signals contributing to pipeline health</p>
</div>
<span className="text-[11px] text-slate-400">Baseline Target: 65%+</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
{/* Signal 1 */}
<div className="space-y-1">
<div className="flex justify-between text-xs font-medium">
<span className="text-slate-600">Conversion Potential</span>
<span className="text-slate-800 font-semibold">{signals.conversionPotential}%</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-blue-600 h-2 rounded-full" style={{ width: `${signals.conversionPotential}%` }}></div>
</div>
</div>
{/* Signal 2 */}
<div className="space-y-1">
<div className="flex justify-between text-xs font-medium">
<span className="text-slate-600">Engagement Health</span>
<span className="text-slate-800 font-semibold">{signals.engagementHealth}%</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-blue-500 h-2 rounded-full" style={{ width: `${signals.engagementHealth}%` }}></div>
</div>
</div>
{/* Signal 3 */}
<div className="space-y-1">
<div className="flex justify-between text-xs font-medium">
<span className="text-slate-600">Financial Health</span>
<span className="text-slate-800 font-semibold">{signals.financialHealth}%</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-blue-600 h-2 rounded-full" style={{ width: `${signals.financialHealth}%` }}></div>
</div>
</div>
{/* Signal 4: Warning State */}
<div className="space-y-1">
<div className="flex justify-between text-xs font-medium">
<span className="text-slate-600">Deal Momentum</span>
<span className="text-amber-700 font-semibold">{signals.dealMomentum}%</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-amber-500 h-2 rounded-full" style={{ width: `${signals.dealMomentum}%` }}></div>
</div>
</div>
{/* Signal 5 (Spanning row) */}
<div className="space-y-1 sm:col-span-2">
<div className="flex justify-between text-xs font-medium">
<span className="text-slate-600">Risk Safety Index</span>
<span className="text-slate-800 font-semibold">{signals.riskSafetyIndex}%</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-blue-600 h-2 rounded-full" style={{ width: `${signals.riskSafetyIndex}%` }}></div>
</div>
</div>
</div>
</div>
</section>
{/* RIGHT: Section 3 - AI Attention Required (5 Columns) */}
<section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" data-purpose="ai-attention-required">
<div>
{/* Header */}
<div className="flex items-center justify-between pb-3 border-b border-slate-100">
<div className="flex items-center gap-2">
<h2 className="text-base font-semibold text-slate-900">AI Attention Required</h2>
<span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">{attentionRequired ? attentionRequired.length : 0} Deals Flagged</span>
</div>
<span className="text-[11px] text-slate-400">Auto-triaged by risk</span>
</div>
{/* Deal Alerts List */}
<div className="mt-3.5 space-y-3">
{attentionRequired && attentionRequired.length > 0
  ? attentionRequired.slice(0, 3).map((deal) => (
      <AttentionCard key={deal.quotationId} deal={deal} onSelect={setSelectedDealId} />
    ))
  : (
    <div className="py-8 text-center">
      <div className="text-slate-400 text-sm font-medium">No analyzed deals yet</div>
      <p className="text-xs text-slate-400 mt-1">Click <strong>&quot;Analyze All Deals&quot;</strong> to run AI analysis</p>
    </div>
  )
}
</div>
</div>
{/* Footer Link */}
<div className="pt-3 text-center border-t border-slate-100 mt-2">
<a className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1" href="#">
            View all prioritized deals
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</a>
</div>
</section>
</div>
{/* END: MiddleSection_DistributionAndAttention */}
{/* BEGIN: BottomSplitSection_TableAndProfile */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/* LEFT: Section 4 - Active Deals Pipeline Health Table (Approx 62% width: 7.5/12 cols) */}
<section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" data-purpose="active-deals-table">
{/* Table Control Header */}
<div className="p-5 border-b border-slate-100">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
<div>
<h2 className="text-base font-semibold text-slate-900">Active Deals — AI Intelligence</h2>
<p className="text-xs text-slate-500 mt-0.5">Unified scoring from predictive, anomaly, and decision intelligence models.</p>
</div>
{/* Filter Pills & CSV Export */}
<div className="flex items-center gap-2">
<div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
<button className="px-2.5 py-1 font-medium bg-white text-slate-900 rounded shadow-xs" type="button">All Deals ({metadata ? metadata.totalActiveDeals : 0})</button>
<button className="px-2.5 py-1 font-medium text-slate-600 hover:text-slate-900" type="button">High Risk ({summary ? summary.highRiskDeals : 0})</button>
<button className="px-2.5 py-1 font-medium text-slate-600 hover:text-slate-900" type="button">Critical ({distribution ? distribution.critical.count : 0})</button>
</div>
<button className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs" type="button">
<svg className="w-3.5 h-3.5 text-slate-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
                Export CSV
              </button>
</div>
</div>
</div>
{/* Data Table */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
<th className="py-3 px-4">Deal / Customer</th>
<th className="py-3 px-3 text-right">Value</th>
<th className="py-3 px-3 text-center">Health</th>
<th className="py-3 px-3 text-center">Win Prob.</th>
<th className="py-3 px-3 text-center">Anomaly Risk</th>
<th className="py-3 px-3 text-center">AI Priority</th>
<th className="py-3 px-4 text-right">AI Action</th>
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
        className={`hover:bg-slate-50/70 transition cursor-pointer ${isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : ''}`}
      >
        <td className="py-3.5 px-4 font-medium text-slate-900">
          <div className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{deal.customer}</div>
          <div className="text-[11px] text-slate-500">{deal.quotationNumber}</div>
        </td>
        <td className="py-3.5 px-3 text-right font-medium text-slate-800">₹{deal.value.toLocaleString()}</td>
        <td className="py-3.5 px-3 text-center">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${colors.bg} ${colors.text} font-bold ${colors.border} text-xs`}>
            {deal.health}
          </span>
        </td>
        <td className="py-3.5 px-3 text-center font-medium">{deal.winProbability}%</td>
        <td className="py-3.5 px-3 text-center">
          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full ${deal.anomalyRisk === 'HIGH' || deal.anomalyRisk === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
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
</tbody>
</table>
</div>
{/* Table Footer Info */}
<div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
<span>Showing {activeDeals ? activeDeals.length : 0} of {metadata ? metadata.totalActiveDeals : 0} active opportunities</span>
<span className="text-[11px]">Clicking any row loads comprehensive AI Decision profile</span>
</div>
</section>
{/* RIGHT: Section 5, 6, 7 - Selected Deal AI Decision Profile (Approx 38% width: 4.5/12 cols) */}

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
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${selectedDeal.intelligence.deal_health.dimension_scores.conversion_potential}%` }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-slate-600 mb-1">
  <span>Engagement</span>
  <span className="font-bold text-slate-800">{selectedDeal.intelligence.deal_health.dimension_scores.engagement}%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${selectedDeal.intelligence.deal_health.dimension_scores.engagement}%` }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-slate-600 mb-1">
  <span>Financial Health</span>
  <span className="font-bold text-slate-800">{selectedDeal.intelligence.deal_health.dimension_scores.financial_health}%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${selectedDeal.intelligence.deal_health.dimension_scores.financial_health}%` }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-slate-600 mb-1">
  <span>Momentum</span>
  <span className="font-bold text-slate-800">{selectedDeal.intelligence.deal_health.dimension_scores.momentum}%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${selectedDeal.intelligence.deal_health.dimension_scores.momentum}%` }}></div>
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

</div>
{/* END: BottomSplitSection_TableAndProfile */}
</main>


      <DashboardFooter />
    </div>
  );
}
