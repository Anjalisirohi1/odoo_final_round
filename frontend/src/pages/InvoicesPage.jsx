import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import apiFetch from '../utils/api';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOutstanding: 0,
    totalCollected: 0,
    paidCount: 0,
    unpaidCount: 0,
    overdueCount: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter !== 'All') query.append('status', statusFilter);
      if (search) query.append('search', search);

      const res = await apiFetch(`/api/invoices?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setInvoices(json.data.invoices || []);
          if (json.data.metrics) setMetrics(json.data.metrics);
        }
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await apiFetch(`/api/invoices/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod: 'BANK_TRANSFER' })
      });
      if (res.ok) {
        fetchInvoices();
      }
    } catch (err) {
      console.error('Mark invoice paid error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="invoices" />
      
      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5" data-purpose="invoices-main-dashboard">
        {/* BEGIN: BreadcrumbAndHeader */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-purpose="page-title-and-actions">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <span>DealFlow360</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span>Finance</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span className="text-slate-700 font-semibold">Invoices</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live Invoicing Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track customer invoices, payment status, outstanding balances, and billing activity.
            </p>
          </div>
        </section>
        {/* END: BreadcrumbAndHeader */}

        {/* BEGIN: OperationalFilterControls */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3" data-purpose="filter-bar">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Search invoices or customers..." 
                type="text"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>

          <button onClick={fetchInvoices} className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer" title="Refresh Table">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </button>
        </div>
        {/* END: OperationalFilterControls */}

        {/* BEGIN: CompactFinancialMetricsRow */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" data-purpose="financial-summary-cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Total Outstanding</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">₹{metrics.totalOutstanding.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Unpaid and overdue balances</p>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Total Collected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">₹{metrics.totalCollected.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Successfully settled payments</p>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Overdue Invoices</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{metrics.overdueCount}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Past due payment terms</p>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Paid Invoices</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{metrics.paidCount} / {metrics.totalCount}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Completed payment ratio</p>
            </div>
          </div>
        </section>
        {/* END: CompactFinancialMetricsRow */}

        {/* BEGIN: InvoicesTableSection */}
        <section aria-label="Invoices List Container" className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">All Commercial Invoices</h2>
              <p className="text-xs text-slate-500">{invoices.length} total customer billing records</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="invoices-data-table">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4" scope="col">Invoice Number</th>
                  <th className="py-3 px-4" scope="col">Customer</th>
                  <th className="py-3 px-4" scope="col">Plan / Service</th>
                  <th className="py-3 px-4" scope="col">Total Amount</th>
                  <th className="py-3 px-4" scope="col">Payment Status</th>
                  <th className="py-3 px-4" scope="col">Due Date</th>
                  <th className="py-3 px-4 text-right" scope="col">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">Loading invoices...</td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">No invoices found.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const isPaid = inv.status === 'PAID';
                    const statusBg = 
                      isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      inv.status === 'UNPAID' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-blue-700">
                          <a href={`/invoices/${inv.invoice_number || inv.id}`} className="hover:underline cursor-pointer">
                            {inv.invoice_number}
                          </a>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{inv.customer_name || 'Acme Customer'}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{inv.plan_name || 'Enterprise Billing'}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">₹{(Number(inv.total_amount) || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBg}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <a
                            href={`/invoices/${inv.invoice_number || inv.id}`}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-xs transition inline-block"
                          >
                            View
                          </a>
                          {!isPaid ? (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600">✓ Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* END: InvoicesTableSection */}
      </main>

      <DashboardFooter />
    </div>
  );
}
