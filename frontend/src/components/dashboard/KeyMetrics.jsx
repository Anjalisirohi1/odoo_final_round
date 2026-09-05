export default function KeyMetrics({ quotations = [], customers = [], products = [] }) {
  const pendingQuotes = quotations.filter(q => q.status === 'PENDING_APPROVAL');
  const pendingValue = pendingQuotes.reduce((sum, q) => sum + Number(q.total_amount), 0);
  
  const totalValue = quotations.reduce((sum, q) => sum + Number(q.total_amount), 0);
  const draftCount = quotations.filter(q => q.status === 'DRAFT').length;
  const approvedCount = quotations.filter(q => q.status === 'APPROVED' || q.status === 'CONFIRMED').length;

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
          <span className="text-3xl font-extrabold text-slate-900">{pendingQuotes.length}</span>
          <span className="text-sm font-medium text-slate-500">quotations waiting</span>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">₹{pendingValue.toLocaleString()}</span> total value locked in margin & discount sign-offs.
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-amber-700 font-medium">{pendingQuotes.length > 0 ? `${pendingQuotes.length} quotes awaiting review` : 'No quotes pending'}</span>
          <a className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1" href="/quotations">
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
          <span className="text-3xl font-extrabold text-slate-900">{quotations.length}</span>
          <span className="text-sm font-medium text-slate-500">active deals</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
            <span>₹{totalValue.toLocaleString()} Volume</span>
            <span className="text-emerald-600 font-bold">{draftCount} drafts</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: quotations.length > 0 ? `${Math.min((approvedCount / quotations.length) * 100, 100)}%` : '0%' }}></div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">{approvedCount} approved / confirmed</span>
          <a className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1" href="/quotations">
            View all quotes <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Card 3: Data Summary */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)] transition-all duration-200 hover:shadow-[0_12px_32px_-4px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.03)] hover:border-slate-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">System Overview</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Data Summary</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Customers</span>
            <span className="text-sm font-extrabold text-slate-900">{customers.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Products</span>
            <span className="text-sm font-extrabold text-slate-900">{products.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Quotations</span>
            <span className="text-sm font-extrabold text-slate-900">{quotations.length}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500">All data from PostgreSQL</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Live
          </span>
        </div>
      </div>
    </section>
  );
}
