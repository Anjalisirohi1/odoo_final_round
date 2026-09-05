export default function QuotationsStats() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4" data-purpose="pipeline-metrics">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Pipeline</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">$107,550</span>
          <span className="mb-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">+18.4%</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Deal Count</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">6 Quotes</span>
          <span className="mb-1 text-xs text-slate-400">across 5 stages</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Average Cycle Time</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">4.2 Days</span>
          <span className="mb-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded border border-emerald-100">Fast</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approval Velocity</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">94.2%</span>
          <span className="mb-1 text-xs font-medium text-amber-600">1 in review</span>
        </div>
      </div>
    </section>
  );
}
