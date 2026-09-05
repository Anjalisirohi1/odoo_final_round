export default function Header() {
  return (
    <header className="relative z-10 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5" data-purpose="global-header">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Wordmark Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-blue-700/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900">DealFlow<span className="text-blue-600 font-extrabold">360</span></span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Enterprise</span>
          </div>
        </div>
        {/* Environment & Support Status Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 text-slate-700 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">SSO &amp; Quotation Services Online</span>
          </div>
          <a className="text-slate-600 hover:text-slate-900 transition-colors font-medium" href="#help">Enterprise Support</a>
        </div>
      </div>
    </header>
  );
}
