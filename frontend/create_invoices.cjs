const fs = require('fs');

const html = `
<main class="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5" data-purpose="invoices-main-dashboard">
<!-- BEGIN: BreadcrumbAndHeader -->
<section class="flex flex-col md:flex-row md:items-center justify-between gap-4" data-purpose="page-title-and-actions">
<div>
<nav class="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
<span>DealFlow360</span>
<svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
<span>Finance</span>
<svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
<span class="text-slate-700 font-semibold">Invoices</span>
</nav>
<div class="flex items-center gap-3">
<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
<span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Invoicing Engine v4.8
          </span>
</div>
<p class="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track customer invoices, payment status, outstanding balances, and billing activity.
        </p>
</div>
<!-- Right Action: Create Invoice Button -->
<div class="flex items-center gap-2 self-start md:self-auto">
<button class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span>+ Create Invoice</span>
</button>
</div>
</section>
<!-- END: BreadcrumbAndHeader -->
<!-- BEGIN: OperationalFilterControls -->
<!-- Clean inline filter control bar matching DealFlow360 standard -->
<div class="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3" data-purpose="filter-bar">
<div class="flex flex-wrap items-center gap-2.5 flex-1">
<!-- Quick search -->
<div class="relative min-w-[240px] flex-1 sm:flex-initial">
<div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<input class="w-full pl-8 pr-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Search invoices or customers..." type="text"/>
</div>
<!-- Status Filter Dropdown -->
<div class="relative">
<button class="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
<span>Status: <strong>All</strong></span>
<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
</div>
<!-- Date Range Filter Dropdown -->
<div class="relative">
<button class="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
<span>Date: <strong>Last 30 Days</strong></span>
<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
</div>
<!-- Payment Status Dropdown -->
<div class="relative">
<button class="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
<span>Payment: <strong>All Methods</strong></span>
<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
</div>
</div>
<div class="flex items-center gap-2">
<button class="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5" title="More Filters">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="hidden sm:inline">More Filters</span>
</button>
<button class="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium" title="Refresh Table">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</button>
</div>
</div>
<!-- END: OperationalFilterControls -->
<!-- BEGIN: CompactFinancialMetricsRow -->
<!-- 4 metrics separated by vertical divider lines matching reference layout -->
<section class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" data-purpose="financial-summary-cards">
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
<!-- Metric 1: Total Outstanding -->
<div class="p-5 flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Total Outstanding</span>
<span class="w-2 h-2 rounded-full bg-blue-500"></span>
</div>
<div class="mt-2">
<div class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">₹24.8L</div>
<div class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
<span>Across unpaid invoices (49 accounts)</span>
</div>
</div>
<div class="text-[11px] text-slate-400 mt-2">Active commercial receivables</div>
</div>
<!-- Metric 2: Paid This Month -->
<div class="p-5 flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Paid This Month</span>
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
</div>
<div class="mt-2">
<div class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">₹18.4L</div>
<div class="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
<span>+12.0% vs last month</span>
</div>
</div>
<div class="text-[11px] text-slate-400 mt-2">183 settled transactions</div>
</div>
<!-- Metric 3: Overdue -->
<div class="p-5 flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Overdue</span>
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Requires attention
            </span>
</div>
<div class="mt-2">
<div class="flex items-baseline gap-2">
<span class="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">₹4.2L</span>
<span class="text-xs font-semibold text-slate-600">15 invoices</span>
</div>
<div class="text-xs text-slate-500 mt-1">Dunning &amp; recovery automation active</div>
</div>
<div class="text-[11px] text-slate-400 mt-2">₹1.4L in high-risk cohort</div>
</div>
<!-- Metric 4: Draft Invoices -->
<div class="p-5 flex flex-col justify-between">
<div class="flex items-center justify-between">
<span class="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Draft Invoices</span>
<span class="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">Queued</span>
</div>
<div class="mt-2">
<div class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">12</div>
<div class="text-xs text-slate-500 mt-1">Pending commercial review or dispatch</div>
</div>
<div class="text-[11px] text-slate-400 mt-2">Next dispatch scheduled at 18:00 IST</div>
</div>
</div>
</section>
<!-- END: CompactFinancialMetricsRow -->
<!-- BEGIN: AttentionAlertBanner -->
<div class="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-amber-900" data-purpose="overdue-attention-banner">
<div class="flex items-center gap-2.5">
<div class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<div>
<span class="font-semibold text-slate-900">15 invoices are currently overdue</span> — <span class="text-slate-700">₹4.2L outstanding across customer accounts with active reminders dispatched.</span>
</div>
</div>
<a class="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline text-xs shrink-0" href="#overdue-cohort">
<span>Review Overdue Invoices</span>
<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</a>
</div>
<!-- END: AttentionAlertBanner -->
<!-- BEGIN: InvoicesTableSection -->
<section class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" data-purpose="invoices-list-table-container">
<!-- Section Header & Segmented Tabs Bar -->
<div class="p-4 sm:p-5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
<!-- Title & Segmented Status Filter Tabs -->
<div class="flex flex-col md:flex-row md:items-center gap-4">
<div>
<h2 class="text-base font-bold text-slate-900 tracking-tight">All Invoices</h2>
<p class="text-xs text-slate-500">248 total customer invoices</p>
</div>
<!-- Status Segmented Pills -->
<div class="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 overflow-x-auto">
<button class="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">All (248)</button>
<button class="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">Draft (12)</button>
<button class="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">Sent (34)</button>
<button class="px-2.5 py-1 bg-white text-blue-700 font-semibold shadow-xs rounded-md">Paid (183)</button>
<button class="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors flex items-center gap-1.5">
<span>Overdue (15)</span>
<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
</button>
<button class="px-2.5 py-1 rounded-md hover:text-slate-900 transition-colors">Cancelled (4)</button>
</div>
</div>
<!-- Quick actions: filter rows input, export CSV, display options -->
<div class="flex items-center gap-2 self-end xl:self-auto">
<div class="relative">
<input class="w-48 sm:w-56 pl-7 pr-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Filter table rows..." type="text"/>
<div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</div>
</div>
<button class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg shadow-xs transition-colors">
<svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span>Export CSV</span>
</button>
<button class="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-xs" title="Table View Settings">
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</button>
</div>
</div>
<!-- Data Table -->
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse text-xs">
<thead>
<tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
<th class="py-3 pl-4 pr-2 w-10 text-center" scope="col">
<input checked="" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</th>
<th class="py-3 px-3" scope="col">
<div class="flex items-center gap-1 cursor-pointer hover:text-slate-900">
<span>INVOICE</span>
<svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</div>
</th>
<th class="py-3 px-3" scope="col">CUSTOMER</th>
<th class="py-3 px-3" scope="col">ISSUE DATE</th>
<th class="py-3 px-3" scope="col">
<div class="flex items-center gap-1 cursor-pointer hover:text-slate-900">
<span>DUE DATE</span>
<svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</div>
</th>
<th class="py-3 px-3 text-right" scope="col">
<div class="flex items-center justify-end gap-1 cursor-pointer hover:text-slate-900">
<span>AMOUNT</span>
<svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</div>
</th>
<th class="py-3 px-3 text-right" scope="col">PAID</th>
<th class="py-3 px-3 text-center" scope="col">STATUS</th>
<th class="py-3 px-3" scope="col">PAYMENT METHOD</th>
<th class="py-3 pr-4 pl-3 text-right" scope="col">ACTIONS</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 text-slate-700">
<!-- Row 1: Overdue Invoice -->
<tr class="hover:bg-slate-50/70 transition-colors bg-blue-50/20">
<td class="py-3 pl-4 pr-2 text-center">
<input checked="" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1048
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">Acme Corporation</div>
<div class="text-[11px] text-slate-500">Tech / Enterprise • INV-ACME-Q3</div>
</td>
<td class="py-3 px-3 text-slate-600">12 Sep 2026</td>
<td class="py-3 px-3">
<span class="font-medium text-rose-600">12 Oct 2026</span>
<span class="block text-[10px] text-rose-500">4 days overdue</span>
</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹2,48,000</td>
<td class="py-3 px-3 text-right text-slate-500">₹0</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Overdue
                </span>
</td>
<td class="py-3 px-3 text-slate-600">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-slate-400"></span>
<span>Bank Transfer (ACH)</span>
</div>
</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded">
                    Send Reminder
                  </button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
<!-- Row 2: Paid Invoice -->
<tr class="hover:bg-slate-50/70 transition-colors">
<td class="py-3 pl-4 pr-2 text-center">
<input class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1047
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">Nova Technologies</div>
<div class="text-[11px] text-slate-500">SaaS • Annual Platform</div>
</td>
<td class="py-3 px-3 text-slate-600">10 Sep 2026</td>
<td class="py-3 px-3 text-slate-600">10 Oct 2026</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹1,20,000</td>
<td class="py-3 px-3 text-right font-semibold text-emerald-600">₹1,20,000</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Paid
                </span>
</td>
<td class="py-3 px-3 text-slate-600">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-emerald-400"></span>
<span>UPI / Auto-debit</span>
</div>
</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
<!-- Row 3: Partially Paid -->
<tr class="hover:bg-slate-50/70 transition-colors">
<td class="py-3 pl-4 pr-2 text-center">
<input class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1046
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">Urban Spaces Pvt Ltd</div>
<div class="text-[11px] text-slate-500">Commercial Real Estate • Installment 1</div>
</td>
<td class="py-3 px-3 text-slate-600">08 Sep 2026</td>
<td class="py-3 px-3 text-slate-600">08 Oct 2026</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹84,500</td>
<td class="py-3 px-3 text-right font-semibold text-slate-700">₹42,250</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Partially Paid
                </span>
</td>
<td class="py-3 px-3 text-slate-600">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-slate-400"></span>
<span>Bank Transfer</span>
</div>
</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="font-medium text-amber-700 hover:text-amber-800 hover:underline">Review</button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
<!-- Row 4: Sent Invoice -->
<tr class="hover:bg-slate-50/70 transition-colors">
<td class="py-3 pl-4 pr-2 text-center">
<input class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1045
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">Core Banking Systems</div>
<div class="text-[11px] text-slate-500">FinTech • Q3 Support</div>
</td>
<td class="py-3 px-3 text-slate-600">05 Sep 2026</td>
<td class="py-3 px-3 text-slate-600">05 Oct 2026</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹4,80,000</td>
<td class="py-3 px-3 text-right text-slate-400">₹0</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Sent
                </span>
</td>
<td class="py-3 px-3 text-slate-400">—</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
<!-- Row 5: Draft -->
<tr class="hover:bg-slate-50/70 transition-colors">
<td class="py-3 pl-4 pr-2 text-center">
<input class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-slate-700 hover:underline cursor-pointer">
                INV-2026-1044
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">Vertex Solutions</div>
<div class="text-[11px] text-slate-500">Consulting Services</div>
</td>
<td class="py-3 px-3 text-slate-600">02 Sep 2026</td>
<td class="py-3 px-3 text-slate-600">02 Oct 2026</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹36,000</td>
<td class="py-3 px-3 text-right text-slate-400">₹0</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Draft
                </span>
</td>
<td class="py-3 px-3 text-slate-400">—</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="font-medium text-slate-700 hover:text-slate-900 hover:underline">Edit</button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
<!-- Row 6: Paid High Value -->
<tr class="hover:bg-slate-50/70 transition-colors">
<td class="py-3 pl-4 pr-2 text-center">
<input class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1043
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">Zenith FinTech Corp</div>
<div class="text-[11px] text-slate-500">Enterprise Banking • Annual License</div>
</td>
<td class="py-3 px-3 text-slate-600">28 Aug 2026</td>
<td class="py-3 px-3 text-slate-600">28 Sep 2026</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹5,80,000</td>
<td class="py-3 px-3 text-right font-semibold text-emerald-600">₹5,80,000</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Paid
                </span>
</td>
<td class="py-3 px-3 text-slate-600">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-blue-500"></span>
<span>Wire Transfer</span>
</div>
</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
<!-- Row 7: Paid via Credit Card -->
<tr class="hover:bg-slate-50/70 transition-colors">
<td class="py-3 pl-4 pr-2 text-center">
<input class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1042
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">BlueSky Logistics</div>
<div class="text-[11px] text-slate-500">Supply Chain Solutions</div>
</td>
<td class="py-3 px-3 text-slate-600">25 Aug 2026</td>
<td class="py-3 px-3 text-slate-600">25 Sep 2026</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹64,000</td>
<td class="py-3 px-3 text-right font-semibold text-emerald-600">₹64,000</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Paid
                </span>
</td>
<td class="py-3 px-3 text-slate-600">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-purple-500"></span>
<span>Credit Card</span>
</div>
</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="font-medium text-blue-600 hover:text-blue-800 hover:underline">View</button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
<!-- Row 8: Overdue -->
<tr class="hover:bg-slate-50/70 transition-colors">
<td class="py-3 pl-4 pr-2 text-center">
<input class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" type="checkbox"/>
</td>
<td class="py-3 px-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                INV-2026-1041
              </td>
<td class="py-3 px-3">
<div class="font-medium text-slate-900">OmniRetail Commerce</div>
<div class="text-[11px] text-slate-500">Retail Tech • Monthly Tier</div>
</td>
<td class="py-3 px-3 text-slate-600">20 Aug 2026</td>
<td class="py-3 px-3">
<span class="font-medium text-rose-600">20 Sep 2026</span>
<span class="block text-[10px] text-rose-500">24 days overdue</span>
</td>
<td class="py-3 px-3 text-right font-semibold text-slate-900">₹92,000</td>
<td class="py-3 px-3 text-right text-slate-400">₹0</td>
<td class="py-3 px-3 text-center">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Overdue
                </span>
</td>
<td class="py-3 px-3 text-slate-600">
<div class="flex items-center gap-1.5">
<span class="w-2 h-2 rounded-full bg-slate-400"></span>
<span>Bank Transfer</span>
</div>
</td>
<td class="py-3 pr-4 pl-3 text-right">
<div class="flex items-center justify-end gap-2">
<button class="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded">
                    Send Reminder
                  </button>
<button class="p-1 text-slate-400 hover:text-slate-600">
<svg class="w-4 h-4" fill="currentColor" viewbox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Table Pagination Footer -->
<div class="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600" data-purpose="table-pagination">
<div class="flex items-center gap-4">
<div>
            Showing <span class="font-semibold text-slate-900">1–8</span> of <span class="font-semibold text-slate-900">248</span> invoices
          </div>
<div class="flex items-center gap-1.5">
<span>Rows per page:</span>
<select class="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 font-medium focus:outline-none">
<option>10</option>
<option>25</option>
<option>50</option>
</select>
</div>
</div>
<div class="flex items-center gap-1">
<button class="px-2.5 py-1 text-slate-500 hover:text-slate-800 border border-slate-200 rounded hover:bg-slate-50 font-medium disabled:opacity-50" disabled>
            Previous
          </button>
<button class="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white font-semibold shadow-xs">
            1
          </button>
<button class="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-medium">
            2
          </button>
<button class="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-medium">
            3
          </button>
<span class="px-1 text-slate-400">...</span>
<button class="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-medium">
            25
          </button>
<button class="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 font-medium">
            Next
          </button>
</div>
</div>
</section>
<!-- END: InvoicesTableSection -->
<!-- BEGIN: OperationalInsightsGrid -->
<!-- 3 side-by-side insight cards exactly modeled on the Subscriptions reference -->
<section class="grid grid-cols-1 lg:grid-cols-3 gap-5" data-purpose="operational-insights-triplet">
<!-- Card 1: Payment Overview & Aging Breakdown -->
<div class="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
<div>
<div class="flex items-center justify-between">
<h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">PAYMENT &amp; AGING OVERVIEW</h3>
<span class="text-xs font-medium text-slate-500">₹49.5L Gross Pipeline</span>
</div>
<!-- Multi-segmented Progress Bar -->
<div class="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden mt-4">
<div class="bg-emerald-500 h-full" style="width: 62%" title="Paid: 62%"></div>
<div class="bg-blue-500 h-full" style="width: 30%" title="Outstanding: 30%"></div>
<div class="bg-rose-500 h-full" style="width: 5%" title="Overdue: 5%"></div>
<div class="bg-amber-400 h-full" style="width: 3%" title="Partially Paid: 3%"></div>
</div>
<!-- Legend & Metrics -->
<div class="mt-4 space-y-2 text-xs">
<div class="flex items-center justify-between">
<span class="flex items-center gap-2 text-slate-600">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Paid Settled
              </span>
<span class="font-semibold text-slate-900">₹18.4L <span class="font-normal text-slate-400">(62%)</span></span>
</div>
<div class="flex items-center justify-between">
<span class="flex items-center gap-2 text-slate-600">
<span class="w-2 h-2 rounded-full bg-blue-500"></span>
                Active Outstanding
              </span>
<span class="font-semibold text-slate-900">₹24.8L <span class="font-normal text-slate-400">(30%)</span></span>
</div>
<div class="flex items-center justify-between">
<span class="flex items-center gap-2 text-slate-600">
<span class="w-2 h-2 rounded-full bg-rose-500"></span>
                Past Due / Overdue
              </span>
<span class="font-semibold text-rose-600">₹4.2L <span class="font-normal text-slate-400">(5%)</span></span>
</div>
<div class="flex items-center justify-between">
<span class="flex items-center gap-2 text-slate-600">
<span class="w-2 h-2 rounded-full bg-amber-400"></span>
                Partially Paid
              </span>
<span class="font-semibold text-slate-900">₹2.1L <span class="font-normal text-slate-400">(3%)</span></span>
</div>
</div>
</div>
<div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
<span class="text-slate-500">Collection Health: <strong class="text-emerald-600 font-bold">94.8%</strong></span>
<a class="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5" href="#">
<span>View Aging Report</span>
<svg class="w-3 h-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</a>
</div>
</div>
<!-- Card 2: Upcoming Due Dates (Next 14 Days) -->
<div class="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
<div>
<div class="flex items-center justify-between">
<h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">UPCOMING DUE DATES</h3>
<span class="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">Next 14 Days</span>
</div>
<!-- Mini Timeline Queue -->
<div class="mt-4 space-y-2.5">
<!-- Item 1 -->
<div class="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2 text-xs">
<div class="flex items-center gap-2.5">
<span class="w-7 h-7 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2d</span>
<div>
<div class="font-semibold text-slate-900">Acme Corporation</div>
<div class="text-[11px] text-slate-500">Enterprise • ₹1.10L due</div>
</div>
</div>
<button class="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 rounded shadow-2xs">
                Auto-Debit
              </button>
</div>
<!-- Item 2 -->
<div class="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2 text-xs">
<div class="flex items-center gap-2.5">
<span class="w-7 h-7 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">5d</span>
<div>
<div class="font-semibold text-slate-900">Core Banking Systems</div>
<div class="text-[11px] text-slate-500">Support Q3 • ₹2.40L due</div>
</div>
</div>
<button class="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded shadow-2xs">
                Send Notice
              </button>
</div>
<!-- Item 3 -->
<div class="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2 text-xs">
<div class="flex items-center gap-2.5">
<span class="w-7 h-7 rounded bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">9d</span>
<div>
<div class="font-semibold text-slate-900">Vertex Solutions</div>
<div class="text-[11px] text-slate-500">Consulting • ₹36,000 due</div>
</div>
</div>
<button class="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded shadow-2xs">
                Review
              </button>
</div>
</div>
</div>
<div class="pt-3 mt-3 border-t border-slate-100 text-right">
<a class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1" href="#">
<span>See full payment schedule (19 total)</span>
<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</a>
</div>
</div>
<!-- Card 3: Billing Recovery & Dunning Engine -->
<div class="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
<div>
<div class="flex items-center justify-between">
<h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">BILLING RECOVERY &amp; DUNNING</h3>
<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Healthy (97.4%)
            </span>
</div>
<div class="mt-3">
<div class="flex items-baseline gap-2">
<span class="text-3xl font-bold tracking-tight text-slate-900">97.4%</span>
<span class="text-xs text-slate-500 font-medium">On-time settlement target: 96.0%</span>
</div>
<!-- Progress indicator -->
<div class="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
<div class="bg-emerald-500 h-full rounded-full" style="width: 97.4%"></div>
</div>
</div>
<!-- Alert callout box -->
<div class="mt-4 p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
<div class="flex items-start gap-2">
<svg class="w-4 h-4 text-rose-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<div>
<span class="text-xs font-bold text-rose-900">₹4.2L Overdue Exposure</span>
<p class="text-[11px] text-rose-800 leading-snug mt-0.5">
                  Smart dunning workflow active with 3 auto-reminders dispatched. Next automated payment retry runs at 02:00 UTC.
                </p>
</div>
</div>
</div>
</div>
<div class="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
<button class="font-medium text-slate-600 hover:text-slate-900 underline">Export Aging Schedule</button>
<a class="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1" href="#">
<span>Launch Dunning Manager</span>
<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</a>
</div>
</div>
</section>
</main>
`;

let jsx = html.replace(/class=/g, 'className=');
jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

// Fix style="width: X%" -> style={{ width: 'X%' }}
jsx = jsx.replace(/style="width:\s*([^%]+%)[\s;]*"/g, "style={{ width: '$1' }}");
// Fix SVG attributes
jsx = jsx.replace(/viewbox=/g, 'viewBox=');
jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
jsx = jsx.replace(/clip-rule=/g, 'clipRule=');
jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
jsx = jsx.replace(/<input([^>]+)checked=""([^>]*)>/g, '<input$1defaultChecked$2>');


const component = `
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function InvoicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="invoices" />
      
      ${jsx}

      <DashboardFooter />
    </div>
  );
}
`;

fs.writeFileSync('d:/Odoo/frontend/src/pages/InvoicesPage.jsx', component);
console.log('InvoicesPage.jsx created successfully.');
