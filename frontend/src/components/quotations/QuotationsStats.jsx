export default function QuotationsStats({ quotations = [] }) {
  const totalPipeline = quotations.reduce((sum, q) => sum + Number(q.total_amount), 0);
  const totalCount = quotations.length;
  const pendingCount = quotations.filter(q => q.status === 'PENDING_APPROVAL').length;
  const approvedCount = quotations.filter(q => q.status === 'APPROVED' || q.status === 'CONFIRMED').length;
  const approvalRate = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : '0.0';

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4" data-purpose="pipeline-metrics">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Pipeline</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">₹{totalPipeline.toLocaleString()}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Deal Count</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{totalCount} Quotes</span>
          <span className="mb-1 text-xs text-slate-400">across 5 stages</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Approvals</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{pendingCount}</span>
          <span className={`mb-1 text-xs font-bold px-1.5 rounded border ${pendingCount > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
            {pendingCount > 0 ? 'In Review' : 'All Clear'}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approval Rate</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{approvalRate}%</span>
          <span className={`mb-1 text-xs font-bold px-1.5 rounded border ${Number(approvalRate) >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
            {Number(approvalRate) >= 80 ? 'Healthy' : 'Needs Attention'}
          </span>
        </div>
      </div>
    </section>
  );
}

