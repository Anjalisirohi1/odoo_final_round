export default function PageTitle() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 backdrop-blur-sm shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]" data-purpose="dashboard-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
            <span>DealFlow360</span>
            <span className="text-slate-300">/</span>
            <span>Operations</span>
            <span className="text-slate-300">/</span>
            <span className="text-brand-600 font-semibold">Sales Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sales Dashboard / Home
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Central hub, links out to every module below • Real-time pipeline velocity, discount governance & contract sync
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 active:bg-brand-800 transition focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2">
            <svg className="h-4 w-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span>+ New Quotation</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition shadow-sm">
            <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span>View Approvals</span>
            <span className="ml-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">4</span>
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="sr-only sm:not-sr-only">Export Summary</span>
          </button>
        </div>
      </div>
    </section>
  );
}
