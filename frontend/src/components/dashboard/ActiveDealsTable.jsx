export default function ActiveDealsTable({ quotations = [] }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'DRAFT': return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Draft' };
      case 'PENDING_APPROVAL': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Approval' };
      case 'APPROVED': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' };
      case 'NEGOTIATION': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Negotiation' };
      case 'CONFIRMED': return { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200', label: 'Confirmed' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: status };
    }
  };

  const displayQuotes = quotations.slice(0, 5);

  return (
    <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)]" data-purpose="active-deals-snapshot">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Active Deals Snapshot</h3>
          <p className="text-xs text-slate-500">Quotes pending conversion, review or e-signature</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">All ({quotations.length})</button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {displayQuotes.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No quotations yet. Create your first quotation to see data here.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-2.5 pl-1">Client / Quote</th>
                <th className="py-2.5 px-3">Sales Rep</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 pr-1 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayQuotes.map(q => {
                const style = getStatusStyle(q.status);
                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 pl-1">
                      <div className="font-bold text-slate-900">{q.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{q.quotation_number}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {q.sales_rep_name ? q.sales_rep_name.substring(0, 2).toUpperCase() : 'SR'}
                        </span>
                        <span>{q.sales_rep_name || 'Sales Rep'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">₹{Number(q.total_amount).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center rounded-full ${style.bg} px-2 py-0.5 text-[10px] font-bold ${style.text} border ${style.border}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="py-3 pr-1 text-right text-slate-500">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-2">
        <span>Showing {displayQuotes.length} of {quotations.length} quotations</span>
        <div className="flex items-center gap-2">
          <a className="font-semibold text-brand-600 hover:text-brand-800" href="/quotations">
            Go to Quotations Pipeline →
          </a>
        </div>
      </div>
    </section>
  );
}
