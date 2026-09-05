export default function KeyMetrics() {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-3" data-purpose="primary-kpis">
      {/* Card 1: Pending Approvals */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)] transition-all duration-200 hover:shadow-[0_12px_32px_-4px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.03)] hover:border-slate-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Action Required</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Pending Approvals</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">4</span>
          <span className="text-sm font-medium text-slate-500">quotations waiting</span>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">$374,000</span> total value locked in margin & discount sign-offs.
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-amber-700 font-medium">2 quotes exceed 15% threshold</span>
          <a className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1" href="#">
            Review queue <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Card 2: Open Quotations */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)] transition-all duration-200 hover:shadow-[0_12px_32px_-4px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.03)] hover:border-slate-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Active Pipeline</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Open Quotations</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">12</span>
          <span className="text-sm font-medium text-slate-500">active deals</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
            <span>$1.42M Volume</span>
            <span className="text-emerald-600 font-bold">+18.4% vs last Mo</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">5 awaiting customer signature</span>
          <a className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1" href="#">
            View all quotes <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Card 3: At-Risk Deals */}
      <div className="group relative overflow-hidden rounded-2xl border border-rose-200/90 bg-white p-5 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)] transition-all duration-200 hover:shadow-[0_12px_32px_-4px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.03)] hover:border-rose-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Health Governance</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">At-Risk Deals</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-600">3</span>
          <span className="text-sm font-medium text-slate-500">flagged by Deal Health</span>
        </div>
        <div className="mt-3 rounded-lg bg-rose-50/60 p-2.5 border border-rose-100 text-xs text-rose-800 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0"></span>
          <span>Margin erosion warning on Enterprise SKU packages</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">Auto-calculated risk index</span>
          <a className="font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1" href="#">
            Inspect risks <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
