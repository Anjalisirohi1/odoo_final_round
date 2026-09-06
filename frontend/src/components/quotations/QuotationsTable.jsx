import { useNavigate } from 'react-router-dom';

export default function QuotationsTable({ quotations = [] }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      case 'PENDING_APPROVAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Pending Approval</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case 'CONFIRMED':
      case 'ACCEPTED':
      case 'ORDER_CREATED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" data-purpose="quotations-table">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Quotation #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Sales Rep</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {quotations.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400 text-xs font-medium">
                  No quotations found matching selected filters.
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr 
                  key={q.id} 
                  onClick={() => navigate(`/quotations/${q.id}`)}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-brand-600 hover:underline">
                    {q.quotation_number}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {q.customer_name || 'Unknown Customer'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                        {q.sales_rep_name ? q.sales_rep_name.substring(0, 2).toUpperCase() : 'SR'}
                      </span>
                      <span>{q.sales_rep_name || 'Sales Rep'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">
                    {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ₹{Number(q.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(q.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/quotations/${q.id}`);
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 rounded-lg border border-slate-200 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
