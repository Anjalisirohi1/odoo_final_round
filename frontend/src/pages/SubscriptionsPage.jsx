
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="subscriptions" />
      
      
<main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
{/* BEGIN: BreadcrumbAndHeader */}
<section aria-labelledby="page-heading">
{/* Breadcrumbs */}
<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
<span>DealFlow360</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>Revenue Management</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="text-slate-900 font-medium">Subscriptions</span>
</nav>
{/* Page Heading & Controls */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
<div>
<div className="flex items-center gap-3">
<h1 className="text-2xl font-bold text-slate-900 tracking-tight" id="page-heading">Subscriptions</h1>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-brand-700 border border-blue-200">
              Contract Billing v4.8
            </span>
</div>
<p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage recurring customer subscriptions, billing cycles, renewals, and subscription lifecycle.</p>
</div>
{/* Action Buttons & Quick Filters */}
<div className="flex flex-wrap items-center gap-2.5">
{/* Filter: Status */}
<div className="relative inline-block text-left">
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" type="button">
<span>Status:</span>
<span className="font-semibold text-slate-900">All</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
{/* Filter: Plan */}
<div className="relative inline-block text-left">
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" type="button">
<span>Plan:</span>
<span className="font-semibold text-slate-900">All</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
{/* Filter: Billing Cycle */}
<div className="relative inline-block text-left">
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" type="button">
<span>Billing:</span>
<span className="font-semibold text-slate-900">All Cycles</span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
{/* Refresh Data */}
<button className="p-1.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm" title="Refresh dataset">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
{/* Primary CTA */}
<button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium shadow-sm transition active:scale-[0.98]" type="button">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span>+ New Subscription</span>
</button>
</div>
</div>
</section>
{/* END: BreadcrumbAndHeader */}
{/* BEGIN: OperationalMetricsStrip */}
<section aria-label="Key Subscription Metrics" className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
{/* Metric 1: Active Subscriptions */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Active Subscriptions</span>
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
</div>
<div className="mt-3 flex items-baseline gap-2">
<span className="text-3xl font-bold tracking-tight text-slate-900">248</span>
<span className="inline-flex items-center text-xs font-medium text-emerald-600">
<svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
              +12 this month
            </span>
</div>
<p className="text-xs text-slate-500 mt-1">Total active recurring accounts</p>
</div>
{/* Metric 2: Monthly Recurring Revenue */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Monthly Recurring Revenue</span>
<span className="w-2 h-2 rounded-full bg-blue-500"></span>
</div>
<div className="mt-3 flex items-baseline gap-2">
<span className="text-3xl font-bold tracking-tight text-slate-900">₹18.6L</span>
<span className="inline-flex items-center text-xs font-medium text-emerald-600">
<svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path></svg>
              +8.4% vs last mo
            </span>
</div>
<p className="text-xs text-slate-500 mt-1">Contracted annualized run-rate (ARR: ₹2.23Cr)</p>
</div>
{/* Metric 3: Upcoming Renewals */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Upcoming Renewals</span>
<span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Next 30 days</span>
</div>
<div className="mt-3 flex items-baseline gap-2">
<span className="text-3xl font-bold tracking-tight text-slate-900">23</span>
<span className="text-xs font-medium text-slate-500">contracts scheduled</span>
</div>
<p className="text-xs text-slate-500 mt-1">Scheduled contract renewals</p>
</div>
{/* Metric 4: Past Due / At Risk */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Past Due / At Risk</span>
<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
<span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Requires attention
            </span>
</div>
<div className="mt-3 flex items-baseline gap-2">
<span className="text-3xl font-bold tracking-tight text-rose-600">7</span>
<span className="text-xs font-medium text-slate-600">₹1.4L exposure</span>
</div>
<p className="text-xs text-slate-500 mt-1">Dunning &amp; billing recovery pipeline</p>
</div>
</div>
</section>
{/* END: OperationalMetricsStrip */}
{/* BEGIN: SubscriptionsTableSection */}
<section aria-label="Subscriptions List Container" className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
{/* Table Filter Header & Controls */}
<div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
{/* Left: Title & Segmented Lifecycle Tabs */}
<div className="flex flex-col sm:flex-row sm:items-center gap-4">
<div>
<h2 className="text-base font-semibold text-slate-900">All Subscriptions</h2>
<p className="text-xs text-slate-500">248 total customer contracts</p>
</div>
{/* Lifecycle Filter Tabs */}
<div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition">All (248)</button>
<button className="px-2.5 py-1 rounded-md bg-white text-brand-700 font-semibold shadow-xs">Active (216)</button>
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition">Trial (12)</button>
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition flex items-center gap-1">
<span>Past Due (7)</span>
<span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
</button>
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition">Cancelled (13)</button>
</div>
</div>
{/* Right: Search Input & Utility Buttons */}
<div className="flex items-center gap-2 self-end sm:self-auto">
{/* Compact Search */}
<div className="relative">
<input className="w-44 sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600" placeholder="Filter table rows..." type="text"/>
<div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
{/* Export CSV Button */}
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs">
<svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span>Export CSV</span>
</button>
{/* Column Visibility Icon */}
<button className="p-1.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs" title="Table Display Columns">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</button>
</div>
</div>
{/* Responsive Data Table */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse" id="subscriptions-data-table">
<thead>
<tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
<th className="py-3 pl-4 pr-2 w-10 text-center" scope="col">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</th>
<th className="py-3 px-3" scope="col">Subscription</th>
<th className="py-3 px-3" scope="col">Customer</th>
<th className="py-3 px-3" scope="col">Plan</th>
<th className="py-3 px-3" scope="col">Billing Cycle</th>
<th className="py-3 px-3" scope="col">Amount</th>
<th className="py-3 px-3" scope="col">Status</th>
<th className="py-3 px-3" scope="col">Next Billing</th>
<th className="py-3 px-3" scope="col">Renewal</th>
<th className="py-3 pr-4 pl-3 text-right" scope="col">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100 text-xs text-slate-700">
{/* Row 1: SUB-1042 (Active) */}
<tr className="hover:bg-slate-50/70 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input defaultChecked="" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-brand-700 group-hover:underline cursor-pointer">
                SUB-1042
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900">Acme Corporation</div>
<div className="text-[11px] text-slate-400">Tech / US Enterprise • John Miller</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Enterprise Pro
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Monthly</td>
<td className="py-3 px-3 font-semibold text-slate-900">₹48,000 <span className="font-normal text-slate-400 text-[11px]">/ mo</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
</td>
<td className="py-3 px-3 text-slate-700 font-medium">28 Sep 2026</td>
<td className="py-3 px-3 text-slate-500">28 Sep 2027</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-medium text-brand-700 hover:text-brand-800 hover:bg-blue-50 rounded transition">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 2: SUB-1041 (Active) */}
<tr className="hover:bg-slate-50/70 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-brand-700 group-hover:underline cursor-pointer">
                SUB-1041
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900">Nova Technologies</div>
<div className="text-[11px] text-slate-400">SaaS • Clara Chen</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Business Plus
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Annual</td>
<td className="py-3 px-3 font-semibold text-slate-900">₹2,40,000 <span className="font-normal text-slate-400 text-[11px]">/ yr</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
</td>
<td className="py-3 px-3 text-slate-700 font-medium">15 Oct 2026</td>
<td className="py-3 px-3 text-slate-500">15 Oct 2027</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-medium text-brand-700 hover:text-brand-800 hover:bg-blue-50 rounded transition">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 3: SUB-1040 (Past Due - Alert Highlight) */}
<tr className="bg-rose-50/20 hover:bg-rose-50/40 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-rose-700 group-hover:underline cursor-pointer">
                SUB-1040
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  Urban Spaces Pvt Ltd
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
</div>
<div className="text-[11px] text-slate-400">Commercial Real Estate • Rohit Sharma</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  Growth
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Monthly</td>
<td className="py-3 px-3 font-semibold text-rose-900">₹18,500 <span className="font-normal text-rose-400 text-[11px]">/ mo</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200" title="Dunning step 2: 8 days overdue">
<span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  Past Due (Dunning Step 2)
                </span>
</td>
<td className="py-3 px-3 text-rose-700 font-semibold">12 Sep 2026</td>
<td className="py-3 px-3 text-slate-400">—</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-100/60 rounded transition">Review</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 4: SUB-1039 (Active) */}
<tr className="hover:bg-slate-50/70 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-brand-700 group-hover:underline cursor-pointer">
                SUB-1039
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900">Core Banking Systems</div>
<div className="text-[11px] text-slate-400">FinTech • Ananya Patel</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Enterprise Pro
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Quarterly</td>
<td className="py-3 px-3 font-semibold text-slate-900">₹1,20,000 <span className="font-normal text-slate-400 text-[11px]">/ qtr</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
</td>
<td className="py-3 px-3 text-slate-700 font-medium">01 Oct 2026</td>
<td className="py-3 px-3 text-slate-500">01 Jan 2027</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-medium text-brand-700 hover:text-brand-800 hover:bg-blue-50 rounded transition">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 5: SUB-1038 (Trial) */}
<tr className="hover:bg-slate-50/70 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-brand-700 group-hover:underline cursor-pointer">
                SUB-1038
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900">Vertex Solutions</div>
<div className="text-[11px] text-slate-400">Consulting • Marcus Vance</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Starter
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Monthly</td>
<td className="py-3 px-3 font-semibold text-slate-900">₹9,500 <span className="font-normal text-slate-400 text-[11px]">/ mo</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
<span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Trial (6 days left)
                </span>
</td>
<td className="py-3 px-3 text-slate-700 font-medium">20 Sep 2026</td>
<td className="py-3 px-3 text-slate-500">20 Oct 2026</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-medium text-brand-700 hover:text-brand-800 hover:bg-blue-50 rounded transition">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 6: SUB-1037 (Active - Scale) */}
<tr className="hover:bg-slate-50/70 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-brand-700 group-hover:underline cursor-pointer">
                SUB-1037
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900">Zenith FinTech Corp</div>
<div className="text-[11px] text-slate-400">Enterprise Banking • David Wilson</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  Enterprise Scale
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Annual</td>
<td className="py-3 px-3 font-semibold text-slate-900">₹5,80,000 <span className="font-normal text-slate-400 text-[11px]">/ yr</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
</td>
<td className="py-3 px-3 text-slate-700 font-medium">05 Nov 2026</td>
<td className="py-3 px-3 text-slate-500">05 Nov 2027</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-medium text-brand-700 hover:text-brand-800 hover:bg-blue-50 rounded transition">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 7: SUB-1036 (Active) */}
<tr className="hover:bg-slate-50/70 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-brand-700 group-hover:underline cursor-pointer">
                SUB-1036
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900">BlueSky Logistics</div>
<div className="text-[11px] text-slate-400">Supply Chain • Sarah Jenkins</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Business Plus
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Monthly</td>
<td className="py-3 px-3 font-semibold text-slate-900">₹32,000 <span className="font-normal text-slate-400 text-[11px]">/ mo</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
</td>
<td className="py-3 px-3 text-slate-700 font-medium">02 Oct 2026</td>
<td className="py-3 px-3 text-slate-500">02 Oct 2027</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-medium text-brand-700 hover:text-brand-800 hover:bg-blue-50 rounded transition">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 8: SUB-1035 (Past Due) */}
<tr className="bg-rose-50/20 hover:bg-rose-50/40 transition-colors group">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-rose-700 group-hover:underline cursor-pointer">
                SUB-1035
              </td>
<td className="py-3 px-3">
<div className="font-semibold text-slate-900">OmniRetail Commerce</div>
<div className="text-[11px] text-slate-400">Retail Tech • Vikram Rao</div>
</td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
<span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  Growth
                </span>
</td>
<td className="py-3 px-3 text-slate-600">Monthly</td>
<td className="py-3 px-3 font-semibold text-rose-900">₹18,500 <span className="font-normal text-rose-400 text-[11px]">/ mo</span></td>
<td className="py-3 px-3">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
<span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  Past Due
                </span>
</td>
<td className="py-3 px-3 text-rose-700 font-semibold">18 Sep 2026</td>
<td className="py-3 px-3 text-slate-400">—</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="inline-flex items-center gap-2">
<button className="px-2 py-1 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-100/60 rounded transition">Review</button>
<button className="p-1 text-slate-400 hover:text-slate-600 rounded">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination and Information Footer */}
<div className="px-4 py-3 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
{/* Left: Row Count & Page size selector */}
<div className="flex items-center gap-3">
<span>Showing <strong className="text-slate-800">1–8</strong> of <strong className="text-slate-800">248</strong> subscriptions</span>
<div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
<span>Rows per page:</span>
<select className="text-xs bg-white border border-slate-300 rounded py-0.5 px-2 text-slate-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500">
<option>10</option>
<option>25</option>
<option>50</option>
<option>100</option>
</select>
</div>
</div>
{/* Right: Pagination Buttons */}
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs font-medium" disabled>
            Previous
          </button>
<button className="px-2.5 py-1 rounded border border-brand-600 bg-brand-600 text-white font-semibold shadow-2xs">
            1
          </button>
<button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs">
            2
          </button>
<button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs">
            3
          </button>
<span className="px-1 text-slate-400">...</span>
<button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs">
            25
          </button>
<button className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs font-medium">
            Next
          </button>
</div>
</div>
</section>
{/* END: SubscriptionsTableSection */}
{/* BEGIN: OperationalInsightsArea */}
<section aria-label="Subscription Overview &amp; Cohort Health" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
{/* Card 1: Lifecycle Breakdown */}
<div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Lifecycle Distribution</h3>
<span className="text-[11px] font-medium text-slate-400">35 Total Active Cohorts</span>
</div>
{/* Multi-segment progress bar */}
<div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
<div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '87%' }} title="87% Active"></div>
<div className="h-full bg-blue-500" style={{ width: '5%' }} title="5% Trial"></div>
<div className="h-full bg-rose-500" style={{ width: '3%' }} title="3% Past Due"></div>
<div className="h-full bg-slate-400 rounded-r-full" style={{ width: '5%' }} title="5% Cancelled"></div>
</div>
{/* Legend metrics list */}
<div className="mt-4 space-y-2 text-xs">
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-600">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Contracts
              </span>
<span className="font-semibold text-slate-900">216 <span className="font-normal text-slate-400">(87%)</span></span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-600">
<span className="w-2 h-2 rounded-full bg-blue-500"></span> In Trial
              </span>
<span className="font-semibold text-slate-900">12 <span className="font-normal text-slate-400">(5%)</span></span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-600">
<span className="w-2 h-2 rounded-full bg-rose-500"></span> Past Due / Dunning
              </span>
<span className="font-semibold text-rose-600">7 <span className="font-normal text-slate-400">(3%)</span></span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-600">
<span className="w-2 h-2 rounded-full bg-slate-400"></span> Churned / Cancelled
              </span>
<span className="font-semibold text-slate-900">13 <span className="font-normal text-slate-400">(5%)</span></span>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
<span>Net Retention Rate: <strong className="text-emerald-700 font-semibold">108.4%</strong></span>
<a className="text-brand-700 font-medium hover:underline" href="#">View Cohort Trends →</a>
</div>
</div>
{/* Card 2: Upcoming Renewals Timeline */}
<div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Upcoming Renewals Timeline</h3>
<span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">Next 30 Days</span>
</div>
<div className="space-y-3">
{/* Timeline Item 1 */}
<div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  4d
                </div>
<div>
<div className="text-xs font-semibold text-slate-900">Acme Corporation</div>
<div className="text-[11px] text-slate-500">Enterprise Pro • ₹5.76L ARR</div>
</div>
</div>
<button className="text-xs font-medium text-brand-700 hover:text-brand-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
                Auto-Renew
              </button>
</div>
{/* Timeline Item 2 */}
<div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  7d
                </div>
<div>
<div className="text-xs font-semibold text-slate-900">Core Banking Systems</div>
<div className="text-[11px] text-slate-500">Enterprise Pro • ₹4.80L ARR</div>
</div>
</div>
<button className="text-xs font-medium text-brand-700 hover:text-brand-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
                Review
              </button>
</div>
{/* Timeline Item 3 */}
<div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  21d
                </div>
<div>
<div className="text-xs font-semibold text-slate-900">Nova Technologies</div>
<div className="text-[11px] text-slate-500">Business Plus • ₹2.40L ARR</div>
</div>
</div>
<button className="text-xs font-medium text-brand-700 hover:text-brand-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
                Initiate
              </button>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-slate-100 text-right">
<a className="text-xs text-brand-700 font-medium hover:underline" href="#">See full renewal queue (23 total) →</a>
</div>
</div>
{/* Card 3: Billing Collection Rate & Recovery Pipeline */}
<div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-2">
<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Billing Collection Rate</h3>
<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ● Healthy (97.2%)
            </span>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="text-3xl font-extrabold text-slate-900">97.2%</span>
<span className="text-xs text-slate-500">Target: 96.0%</span>
</div>
<div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ width: '97.2%' }}></div>
</div>
{/* Pending Recovery Alert Callout */}
<div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs">
<div className="flex items-start gap-2">
<svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<div>
<span className="font-semibold text-rose-800">₹1.4L Pending Billing Recovery</span>
<p className="text-rose-700 mt-0.5 text-[11px] leading-relaxed">
                  Automated smart dunning is active for 7 customer invoices. Smart payment retry sequence runs at 02:00 UTC.
                </p>
</div>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
<button className="text-xs font-medium text-slate-700 hover:text-slate-900">Export Aging Schedule</button>
<button className="text-xs font-semibold text-brand-700 hover:text-brand-800">Launch Recovery Wizard →</button>
</div>
</div>
</section>
</main>


      <DashboardFooter />
    </div>
  );
}
