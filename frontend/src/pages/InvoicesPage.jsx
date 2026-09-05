
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function InvoicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="invoices" />
      
      
<main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5" data-purpose="invoices-main-dashboard">
{/* BEGIN: BreadcrumbAndHeader */}
<section className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-purpose="page-title-and-actions">
<div>
<nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
<span>DealFlow360</span>
<svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>Finance</span>
<svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="text-slate-700 font-semibold">Invoices</span>
</nav>
<div className="flex items-center gap-3">
<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
<span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Invoicing Engine v4.8
          </span>
</div>
<p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track customer invoices, payment status, outstanding balances, and billing activity.
        </p>
</div>
{/* Right Action: Create Invoice Button */}
<div className="flex items-center gap-2 self-start md:self-auto">
<button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span>+ Create Invoice</span>
</button>
</div>
</section>
{/* END: BreadcrumbAndHeader */}
{/* BEGIN: OperationalFilterControls */}
{/* Clean inline filter control bar matching DealFlow360 standard */}
<div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3" data-purpose="filter-bar">
<div className="flex flex-wrap items-center gap-2.5 flex-1">
{/* Quick search */}
<div className="relative min-w-[240px] flex-1 sm:flex-initial">
<div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<input className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Search invoices or customers..." type="text"/>
</div>
{/* Status Filter Dropdown */}
<div className="relative">
<button className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
<span>Status: <strong>All</strong></span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
{/* Date Range Filter Dropdown */}
<div className="relative">
<button className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
<span>Date: <strong>Last 30 Days</strong></span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
{/* Payment Status Dropdown */}
<div className="relative">
<button className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
<span>Payment: <strong>All Methods</strong></span>
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
</div>
</div>
<div className="flex items-center gap-2">
<button className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5" title="More Filters">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="hidden sm:inline">More Filters</span>
</button>
<button className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium" title="Refresh Table">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</button>
</div>
</div>
{/* END: OperationalFilterControls */}
{/* BEGIN: CompactFinancialMetricsRow */}
{/* 4 metrics separated by vertical divider lines matching reference layout */}
<section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" data-purpose="financial-summary-cards">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
{/* Metric 1: Total Outstanding */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Total Outstanding</span>
<span className="w-2 h-2 rounded-full bg-blue-500"></span>
</div>
<div className="mt-2">
<div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">₹24.8L</div>
<div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
<span>Across unpaid invoices (49 accounts)</span>
</div>
</div>
<div className="text-[11px] text-slate-400 mt-2">Active commercial receivables</div>
</div>
{/* Metric 2: Paid This Month */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Paid This Month</span>
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
</div>
<div className="mt-2">
<div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">₹18.4L</div>
<div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>+12.0% vs last month</span>
</div>
</div>
<div className="text-[11px] text-slate-400 mt-2">183 settled transactions</div>
</div>
{/* Metric 3: Overdue */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Overdue</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
<span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Requires attention
            </span>
</div>
<div className="mt-2">
<div className="flex items-baseline gap-2">
<span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">₹4.2L</span>
<span className="text-xs font-semibold text-slate-600">15 invoices</span>
</div>
<div className="text-xs text-slate-500 mt-1">Dunning &amp; recovery automation active</div>
</div>
<div className="text-[11px] text-slate-400 mt-2">₹1.4L in high-risk cohort</div>
</div>
{/* Metric 4: Draft Invoices */}
<div className="p-5 flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Draft Invoices</span>
<span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">Queued</span>
</div>
<div className="mt-2">
<div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">12</div>
<div className="text-xs text-slate-500 mt-1">Pending commercial review or dispatch</div>
</div>
<div className="text-[11px] text-slate-400 mt-2">Next dispatch scheduled at 18:00 IST</div>
</div>
</div>
</section>
{/* END: CompactFinancialMetricsRow */}
{/* BEGIN: AttentionAlertBanner */}
<div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-amber-900" data-purpose="overdue-attention-banner">
<div className="flex items-center gap-2.5">
<div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<div>
<span className="font-semibold text-slate-900">15 invoices are currently overdue</span> — <span className="text-slate-700">₹4.2L outstanding across customer accounts with active reminders dispatched.</span>
</div>
</div>
<a className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline text-xs shrink-0" href="#overdue-cohort">
<span>Review Overdue Invoices</span>
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</a>
</div>
{/* END: AttentionAlertBanner */}
{/* BEGIN: InvoicesTableSection */}
<section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" data-purpose="invoices-list-table-container">
{/* Section Header & Segmented Tabs Bar */}
<div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
{/* Title & Segmented Status Filter Tabs */}
<div className="flex flex-col md:flex-row md:items-center gap-4">
<div>
<h2 className="text-base font-bold text-slate-900 tracking-tight">All Invoices</h2>
<p className="text-xs text-slate-500">248 total customer invoices</p>
</div>
{/* Status Segmented Pills */}
<div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 overflow-x-auto">
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">All (248)</button>
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">Draft (12)</button>
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">Sent (34)</button>
<button className="px-2.5 py-1 bg-white text-blue-700 font-semibold shadow-xs rounded-md">Paid (183)</button>
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors flex items-center gap-1.5">
<span>Overdue (15)</span>
<span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
</button>
<button className="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">Cancelled (4)</button>
</div>
</div>
{/* Quick actions: filter rows input, export CSV, display options */}
<div className="flex items-center gap-2 self-end xl:self-auto">
<div className="relative">
<input className="w-48 sm:w-56 pl-7 pr-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Filter table rows..." type="text"/>
<div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</div>
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs transition-colors">
<svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span>Export CSV</span>
</button>
<button className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-xs" title="Table View Settings">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</button>
</div>
</div>
{/* Data Table */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse text-xs">
<thead>
<tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
<th className="py-3 pl-4 pr-2 w-10 text-center" scope="col">
<input defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</th>
<th className="py-3 px-3" scope="col">
<div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
<span>INVOICE</span>
<svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</th>
<th className="py-3 px-3" scope="col">CUSTOMER</th>
<th className="py-3 px-3" scope="col">ISSUE DATE</th>
<th className="py-3 px-3" scope="col">
<div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
<span>DUE DATE</span>
<svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</th>
<th className="py-3 px-3 text-right" scope="col">
<div className="flex items-center justify-end gap-1 cursor-pointer hover:text-slate-900">
<span>AMOUNT</span>
<svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</div>
</th>
<th className="py-3 px-3 text-right" scope="col">PAID</th>
<th className="py-3 px-3 text-center" scope="col">STATUS</th>
<th className="py-3 px-3" scope="col">PAYMENT METHOD</th>
<th className="py-3 pr-4 pl-3 text-right" scope="col">ACTIONS</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100 text-slate-700">
{/* Row 1: Overdue Invoice */}
<tr className="hover:bg-slate-50/70 transition-colors bg-blue-50/20">
<td className="py-3 pl-4 pr-2 text-center">
<input defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1048
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">Acme Corporation</div>
<div className="text-[11px] text-slate-500">Tech / Enterprise • INV-ACME-Q3</div>
</td>
<td className="py-3 px-3 text-slate-600">12 Sep 2026</td>
<td className="py-3 px-3">
<span className="font-medium text-rose-600">12 Oct 2026</span>
<span className="block text-[10px] text-rose-500">4 days overdue</span>
</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹2,48,000</td>
<td className="py-3 px-3 text-right text-slate-500">₹0</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
<span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Overdue
                </span>
</td>
<td className="py-3 px-3 text-slate-600">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-slate-400"></span>
<span>Bank Transfer (ACH)</span>
</div>
</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded">
                    Send Reminder
                  </button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 2: Paid Invoice */}
<tr className="hover:bg-slate-50/70 transition-colors">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1047
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">Nova Technologies</div>
<div className="text-[11px] text-slate-500">SaaS • Annual Platform</div>
</td>
<td className="py-3 px-3 text-slate-600">10 Sep 2026</td>
<td className="py-3 px-3 text-slate-600">10 Oct 2026</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹1,20,000</td>
<td className="py-3 px-3 text-right font-semibold text-emerald-600">₹1,20,000</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Paid
                </span>
</td>
<td className="py-3 px-3 text-slate-600">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
<span>UPI / Auto-debit</span>
</div>
</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 3: Partially Paid */}
<tr className="hover:bg-slate-50/70 transition-colors">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1046
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">Urban Spaces Pvt Ltd</div>
<div className="text-[11px] text-slate-500">Commercial Real Estate • Installment 1</div>
</td>
<td className="py-3 px-3 text-slate-600">08 Sep 2026</td>
<td className="py-3 px-3 text-slate-600">08 Oct 2026</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹84,500</td>
<td className="py-3 px-3 text-right font-semibold text-slate-700">₹42,250</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
<span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Partially Paid
                </span>
</td>
<td className="py-3 px-3 text-slate-600">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-slate-400"></span>
<span>Bank Transfer</span>
</div>
</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="font-medium text-amber-700 hover:text-amber-800 hover:underline">Review</button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 4: Sent Invoice */}
<tr className="hover:bg-slate-50/70 transition-colors">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1045
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">Core Banking Systems</div>
<div className="text-[11px] text-slate-500">FinTech • Q3 Support</div>
</td>
<td className="py-3 px-3 text-slate-600">05 Sep 2026</td>
<td className="py-3 px-3 text-slate-600">05 Oct 2026</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹4,80,000</td>
<td className="py-3 px-3 text-right text-slate-400">₹0</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
<span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Sent
                </span>
</td>
<td className="py-3 px-3 text-slate-400">—</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 5: Draft */}
<tr className="hover:bg-slate-50/70 transition-colors">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-slate-700 hover:underline cursor-pointer">
                INV-2026-1044
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">Vertex Solutions</div>
<div className="text-[11px] text-slate-500">Consulting Services</div>
</td>
<td className="py-3 px-3 text-slate-600">02 Sep 2026</td>
<td className="py-3 px-3 text-slate-600">02 Oct 2026</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹36,000</td>
<td className="py-3 px-3 text-right text-slate-400">₹0</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
<span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Draft
                </span>
</td>
<td className="py-3 px-3 text-slate-400">—</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="font-medium text-slate-700 hover:text-slate-900 hover:underline">Edit</button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 6: Paid High Value */}
<tr className="hover:bg-slate-50/70 transition-colors">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1043
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">Zenith FinTech Corp</div>
<div className="text-[11px] text-slate-500">Enterprise Banking • Annual License</div>
</td>
<td className="py-3 px-3 text-slate-600">28 Aug 2026</td>
<td className="py-3 px-3 text-slate-600">28 Sep 2026</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹5,80,000</td>
<td className="py-3 px-3 text-right font-semibold text-emerald-600">₹5,80,000</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Paid
                </span>
</td>
<td className="py-3 px-3 text-slate-600">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-blue-500"></span>
<span>Wire Transfer</span>
</div>
</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 7: Paid via Credit Card */}
<tr className="hover:bg-slate-50/70 transition-colors">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1042
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">BlueSky Logistics</div>
<div className="text-[11px] text-slate-500">Supply Chain Solutions</div>
</td>
<td className="py-3 px-3 text-slate-600">25 Aug 2026</td>
<td className="py-3 px-3 text-slate-600">25 Sep 2026</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹64,000</td>
<td className="py-3 px-3 text-right font-semibold text-emerald-600">₹64,000</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Paid
                </span>
</td>
<td className="py-3 px-3 text-slate-600">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-purple-500"></span>
<span>Credit Card</span>
</div>
</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
{/* Row 8: Overdue */}
<tr className="hover:bg-slate-50/70 transition-colors">
<td className="py-3 pl-4 pr-2 text-center">
<input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td className="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1041
              </td>
<td className="py-3 px-3">
<div className="font-medium text-slate-900">OmniRetail Commerce</div>
<div className="text-[11px] text-slate-500">Retail Tech • Monthly Tier</div>
</td>
<td className="py-3 px-3 text-slate-600">20 Aug 2026</td>
<td className="py-3 px-3">
<span className="font-medium text-rose-600">20 Sep 2026</span>
<span className="block text-[10px] text-rose-500">24 days overdue</span>
</td>
<td className="py-3 px-3 text-right font-semibold text-slate-900">₹92,000</td>
<td className="py-3 px-3 text-right text-slate-400">₹0</td>
<td className="py-3 px-3 text-center">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
<span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Overdue
                </span>
</td>
<td className="py-3 px-3 text-slate-600">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-slate-400"></span>
<span>Bank Transfer</span>
</div>
</td>
<td className="py-3 pr-4 pl-3 text-right">
<div className="flex items-center justify-end gap-2">
<button className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded">
                    Send Reminder
                  </button>
<button className="p-1 text-slate-400 hover:text-slate-600">
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination Footer */}
<div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600" data-purpose="table-pagination">
<div className="flex items-center gap-4">
<div>
            Showing <span className="font-semibold text-slate-900">1–8</span> of <span className="font-semibold text-slate-900">248</span> invoices
          </div>
<div className="flex items-center gap-1.5">
<span>Rows per page:</span>
<select className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium focus:outline-none">
<option>10</option>
<option>25</option>
<option>50</option>
</select>
</div>
</div>
<div className="flex items-center gap-1">
<button className="px-2.5 py-1 text-slate-500 hover:text-slate-800 border border-slate-200 rounded hover:bg-slate-50 font-medium disabled:opacity-50" disabled>
            Previous
          </button>
<button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white font-semibold shadow-xs">
            1
          </button>
<button className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-medium">
            2
          </button>
<button className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-medium">
            3
          </button>
<span className="px-1 text-slate-400">...</span>
<button className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-medium">
            25
          </button>
<button className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 font-medium">
            Next
          </button>
</div>
</div>
</section>
{/* END: InvoicesTableSection */}
{/* BEGIN: OperationalInsightsGrid */}
{/* 3 side-by-side insight cards exactly modeled on the Subscriptions reference */}
<section className="grid grid-cols-1 lg:grid-cols-3 gap-5" data-purpose="operational-insights-triplet">
{/* Card 1: Payment Overview & Aging Breakdown */}
<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
<div>
<div className="flex items-center justify-between">
<h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">PAYMENT &amp; AGING OVERVIEW</h3>
<span className="text-xs font-medium text-slate-500">₹49.5L Gross Pipeline</span>
</div>
{/* Multi-segmented Progress Bar */}
<div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden mt-4">
<div className="bg-emerald-500 h-full" style={{ width: '62%' }} title="Paid: 62%"></div>
<div className="bg-blue-500 h-full" style={{ width: '30%' }} title="Outstanding: 30%"></div>
<div className="bg-rose-500 h-full" style={{ width: '5%' }} title="Overdue: 5%"></div>
<div className="bg-amber-400 h-full" style={{ width: '3%' }} title="Partially Paid: 3%"></div>
</div>
{/* Legend & Metrics */}
<div className="mt-4 space-y-2 text-xs">
<div className="flex items-center justify-between">
<span className="flex items-center gap-2 text-slate-600">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Paid Settled
              </span>
<span className="font-semibold text-slate-900">₹18.4L <span className="font-normal text-slate-400">(62%)</span></span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-2 text-slate-600">
<span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Active Outstanding
              </span>
<span className="font-semibold text-slate-900">₹24.8L <span className="font-normal text-slate-400">(30%)</span></span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-2 text-slate-600">
<span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Past Due / Overdue
              </span>
<span className="font-semibold text-rose-600">₹4.2L <span className="font-normal text-slate-400">(5%)</span></span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-2 text-slate-600">
<span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Partially Paid
              </span>
<span className="font-semibold text-slate-900">₹2.1L <span className="font-normal text-slate-400">(3%)</span></span>
</div>
</div>
</div>
<div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
<span className="text-slate-500">Collection Health: <strong className="text-emerald-600 font-bold">94.8%</strong></span>
<a className="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5" href="#">
<span>View Aging Report</span>
<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</a>
</div>
</div>
{/* Card 2: Upcoming Due Dates (Next 14 Days) */}
<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
<div>
<div className="flex items-center justify-between">
<h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">UPCOMING DUE DATES</h3>
<span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">Next 14 Days</span>
</div>
{/* Mini Timeline Queue */}
<div className="mt-4 space-y-2.5">
{/* Item 1 */}
<div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2 text-xs">
<div className="flex items-center gap-2.5">
<span className="w-7 h-7 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2d</span>
<div>
<div className="font-semibold text-slate-900">Acme Corporation</div>
<div className="text-[11px] text-slate-500">Enterprise • ₹1.10L due</div>
</div>
</div>
<button className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 rounded shadow-2xs">
                Auto-Debit
              </button>
</div>
{/* Item 2 */}
<div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2 text-xs">
<div className="flex items-center gap-2.5">
<span className="w-7 h-7 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">5d</span>
<div>
<div className="font-semibold text-slate-900">Core Banking Systems</div>
<div className="text-[11px] text-slate-500">Support Q3 • ₹2.40L due</div>
</div>
</div>
<button className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded shadow-2xs">
                Send Notice
              </button>
</div>
{/* Item 3 */}
<div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2 text-xs">
<div className="flex items-center gap-2.5">
<span className="w-7 h-7 rounded bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">9d</span>
<div>
<div className="font-semibold text-slate-900">Vertex Solutions</div>
<div className="text-[11px] text-slate-500">Consulting • ₹36,000 due</div>
</div>
</div>
<button className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded shadow-2xs">
                Review
              </button>
</div>
</div>
</div>
<div className="pt-3 mt-3 border-t border-slate-100 text-right">
<a className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1" href="#">
<span>See full payment schedule (19 total)</span>
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</a>
</div>
</div>
{/* Card 3: Billing Recovery & Dunning Engine */}
<div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
<div>
<div className="flex items-center justify-between">
<h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">BILLING RECOVERY &amp; DUNNING</h3>
<span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Healthy (97.4%)
            </span>
</div>
<div className="mt-3">
<div className="flex items-baseline gap-2">
<span className="text-3xl font-bold tracking-tight text-slate-900">97.4%</span>
<span className="text-xs text-slate-500 font-medium">On-time settlement target: 96.0%</span>
</div>
{/* Progress indicator */}
<div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
<div className="bg-emerald-500 h-full rounded-full" style={{ width: '97.4%' }}></div>
</div>
</div>
{/* Alert callout box */}
<div className="mt-4 p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
<div className="flex items-start gap-2">
<svg className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<div>
<span className="text-xs font-bold text-rose-900">₹4.2L Overdue Exposure</span>
<p className="text-[11px] text-rose-800 leading-snug mt-0.5">
                  Smart dunning workflow active with 3 auto-reminders dispatched. Next automated payment retry runs at 02:00 UTC.
                </p>
</div>
</div>
</div>
</div>
<div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
<button className="font-medium text-slate-600 hover:text-slate-900 underline">Export Aging Schedule</button>
<a className="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1" href="#">
<span>Launch Dunning Manager</span>
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</a>
</div>
</div>
</section>
</main>


      <DashboardFooter />
    </div>
  );
}
