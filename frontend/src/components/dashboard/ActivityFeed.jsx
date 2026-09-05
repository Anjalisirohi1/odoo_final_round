export default function ActivityFeed({ quotations = [] }) {
  // Build activity items from real quotations, sorted by newest first
  const recentQuotes = quotations.slice(0, 6);

  const getTimeDiff = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActivityStyle = (status) => {
    switch (status) {
      case 'DRAFT':
        return {
          iconBg: 'bg-blue-100 text-brand-700',
          icon: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
          badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', badgeBorder: 'border-blue-200',
          label: 'Draft Created',
          desc: (q) => `New quotation ${q.quotation_number} for ${q.customer_name}`
        };
      case 'PENDING_APPROVAL':
        return {
          iconBg: 'bg-amber-100 text-amber-800',
          icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
          badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', badgeBorder: 'border-amber-200',
          label: 'Awaiting Approval',
          desc: (q) => `${q.quotation_number} (₹${Number(q.total_amount).toLocaleString()}) needs review`,
          border: 'border-amber-100', bg: 'bg-amber-50/20', hover: 'hover:bg-amber-50/40'
        };
      case 'APPROVED':
        return {
          iconBg: 'bg-emerald-100 text-emerald-700',
          icon: <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
          badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200',
          label: 'Approved',
          desc: (q) => `${q.quotation_number} (₹${Number(q.total_amount).toLocaleString()}) approved`
        };
      case 'CONFIRMED':
        return {
          iconBg: 'bg-indigo-100 text-indigo-700',
          icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
          badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700', badgeBorder: 'border-indigo-200',
          label: 'Confirmed',
          desc: (q) => `${q.quotation_number} (₹${Number(q.total_amount).toLocaleString()}) confirmed & locked`
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700',
          icon: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
          badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', badgeBorder: 'border-slate-200',
          label: status.replace('_', ' '),
          desc: (q) => `${q.quotation_number} • ${q.customer_name}`
        };
    }
  };

  return (
    <section className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between" data-purpose="recent-activity-feed">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <p className="text-xs text-slate-500">Live transaction stream & audit logs</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        </div>
        
        <div className="mt-4 space-y-4">
          {recentQuotes.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No activity yet. Create a quotation to see activity here.
            </div>
          ) : (
            recentQuotes.map(q => {
              const style = getActivityStyle(q.status);
              return (
                <div 
                  key={q.id} 
                  className={`relative flex items-start gap-3 rounded-xl border ${style.border || 'border-slate-100'} ${style.bg || ''} p-3.5 ${style.hover || 'hover:bg-slate-50/80'} transition group`}
                >
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${style.iconBg} group-hover:scale-105 transition-transform`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {style.icon}
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{q.customer_name} — {style.label}</p>
                      <span className="text-[11px] text-slate-400">{getTimeDiff(q.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {style.desc(q)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded ${style.badgeBg} px-2 py-0.5 text-[10px] font-semibold ${style.badgeText} border ${style.badgeBorder}`}>
                        {style.label}
                      </span>
                      <span className="text-[11px] text-slate-400">by {q.sales_rep_name || 'Sales Rep'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="mt-5 pt-3 border-t border-slate-100 text-center">
        <a className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition" href="/quotations">
          View All Quotations →
        </a>
      </div>
    </section>
  );
}
