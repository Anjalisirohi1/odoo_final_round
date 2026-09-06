import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import apiFetch from '../utils/api';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState({
    activeCount: 0,
    pendingRenewals: 0,
    pastDueCount: 0,
    totalMrr: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSub, setNewSub] = useState({
    plan_name: 'Enterprise Cloud SLA',
    billing_cycle: 'MONTHLY',
    amount: '45000'
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, search]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter !== 'All') query.append('status', statusFilter);
      if (search) query.append('search', search);

      const res = await apiFetch(`/api/subscriptions?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSubscriptions(json.data.subscriptions || []);
          if (json.data.metrics) setMetrics(json.data.metrics);
        }
      }
    } catch (err) {
      console.error('Fetch subscriptions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(newSub)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchSubscriptions();
      }
    } catch (err) {
      console.error('Create subscription error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="subscriptions" />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* BEGIN: BreadcrumbAndHeader */}
        <section aria-labelledby="page-heading">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span>DealFlow360</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span>Revenue Management</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span className="text-slate-900 font-medium">Subscriptions</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight" id="page-heading">Subscriptions</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-brand-700 border border-blue-200">
                  Live Contract Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage recurring customer subscriptions, billing cycles, renewals, and subscription lifecycle.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 shadow-sm"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_RENEWAL">Pending Renewal</option>
                <option value="PAST_DUE">Past Due</option>
              </select>

              <button 
                onClick={fetchSubscriptions}
                className="p-1.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm cursor-pointer" 
                title="Refresh dataset"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium shadow-sm transition active:scale-[0.98] cursor-pointer" 
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>New Subscription</span>
              </button>
            </div>
          </div>
        </section>
        {/* END: BreadcrumbAndHeader */}

        {/* BEGIN: OperationalMetricsStrip */}
        <section aria-label="Key Subscription Metrics" className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Active Subscriptions</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{metrics.activeCount}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Total active recurring accounts</p>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Monthly Recurring Revenue</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">₹{metrics.totalMrr.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Normalized monthly subscription ARR/MRR</p>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Pending Renewals</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{metrics.pendingRenewals}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Contracts due within 30 days</p>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Past Due / Alerts</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{metrics.pastDueCount}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Failed payments or grace period</p>
            </div>
          </div>
        </section>
        {/* END: OperationalMetricsStrip */}

        {/* BEGIN: SubscriptionsTableSection */}
        <section aria-label="Subscriptions List Container" className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">All Subscriptions</h2>
              <p className="text-xs text-slate-500">{subscriptions.length} active customer contracts</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-44 sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-600" 
                  placeholder="Filter table rows..." 
                  type="text"
                />
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="subscriptions-data-table">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4" scope="col">Subscription Ref</th>
                  <th className="py-3 px-4" scope="col">Customer</th>
                  <th className="py-3 px-4" scope="col">Plan</th>
                  <th className="py-3 px-4" scope="col">Billing Cycle</th>
                  <th className="py-3 px-4" scope="col">Amount</th>
                  <th className="py-3 px-4" scope="col">Status</th>
                  <th className="py-3 px-4" scope="col">Next Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">Loading subscriptions...</td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">No subscriptions found.</td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => {
                    const statusBg = 
                      sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      sub.status === 'PENDING_RENEWAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-brand-700">{sub.subscription_number}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{sub.customer_name || 'Enterprise Customer'}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{sub.plan_name}</td>
                        <td className="py-3 px-4 text-slate-600 uppercase text-[11px] font-bold">{sub.billing_cycle}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">₹{(Number(sub.amount) || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBg}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* END: SubscriptionsTableSection */}
      </main>

      {/* Modal for creating a new subscription */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Subscription</h3>
            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name</label>
                <input 
                  type="text" 
                  value={newSub.plan_name}
                  onChange={(e) => setNewSub({ ...newSub, plan_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-medium" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Cycle</label>
                <select 
                  value={newSub.billing_cycle}
                  onChange={(e) => setNewSub({ ...newSub, billing_cycle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={newSub.amount}
                  onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-medium" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}
