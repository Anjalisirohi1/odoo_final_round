export default function DashboardHeader({ activeTab = 'dashboard' }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top utility row */}
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg py-1" href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-blue-500 text-white shadow-md shadow-brand-500/25">
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              DealFlow<span className="text-brand-600">360</span>
            </span>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600 border border-slate-200">
              ENTERPRISE
            </span>
          </a>

          {/* Global Search Bar */}
          <div className="hidden lg:block w-72">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <input 
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-600" 
                placeholder="Search quotes, clients, SKUs... (Cmd+K)" 
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-3.5">
          {/* Live System Status Badge */}
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SSO & Quotation Services Online</span>
          </div>

          {/* Notification Bell */}
          <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition">
            <span className="sr-only">View Notifications</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
            </svg>
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>
          
          <div className="h-5 w-px bg-slate-200"></div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200">
              AV
            </div>
            <div className="hidden text-left md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">Alex Vance</div>
              <div className="text-[11px] text-slate-500">VP Sales • North America</div>
            </div>
            <svg className="h-4 w-4 text-slate-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav aria-label="Global Module Navigation" className="border-t border-slate-100 bg-slate-50/90 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="mx-auto flex max-w-[1600px] items-center space-x-1 py-1.5 min-w-max">
          <a href="/dashboard" className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition ${activeTab === 'dashboard' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
            <svg className={`h-3.5 w-3.5 ${activeTab === 'dashboard' ? 'text-brand-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span>Dashboard</span>
          </a>
          
          <a href="/quotations" className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition ${activeTab === 'quotations' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
            <svg className={`h-3.5 w-3.5 ${activeTab === 'quotations' ? 'text-brand-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Quotations</span>
          </a>

          <a className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition" href="#">
            <span>Approvals</span>
            <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">4</span>
          </a>
          <a className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition" href="#">Fulfillment</a>
          <a href="/subscriptions" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'subscriptions' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>Subscriptions</a>
          <a href="/invoices" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'invoices' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>Invoices</a>
          <a href="/deal-health" className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition ${activeTab === 'deal-health' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
            <span>Deal Health</span>
            <span className="inline-flex items-center justify-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">3</span>
          </a>
          <a className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition" href="#">Reports</a>
          <a className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition" href="#">Product Catalog</a>
        </div>
      </nav>
    </header>
  );
}
