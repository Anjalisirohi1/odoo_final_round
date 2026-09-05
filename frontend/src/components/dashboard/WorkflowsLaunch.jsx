export default function WorkflowsLaunch() {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 p-4 shadow-sm" data-purpose="module-routing">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm border border-slate-200">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Intelligent Landing Destinations & Module Routing</h3>
            <p className="text-xs text-slate-500">Switch context between sales rep generation, margin approvals, and external customer portal</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-600 transition shadow-sm" href="#">
            <span>Sales Dashboard</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 uppercase font-bold">INTERNAL</span>
          </a>
          <a className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-600 transition shadow-sm" href="#">
            <span>Customer Quotation Portal</span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 uppercase font-bold">CUSTOMER</span>
          </a>
          <a className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-600 transition shadow-sm" href="#">
            <span>Fulfillment & ERP Sync</span>
            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] text-brand-700 uppercase font-bold">SUPPLY CHAIN</span>
          </a>
        </div>
      </div>
    </section>
  );
}
