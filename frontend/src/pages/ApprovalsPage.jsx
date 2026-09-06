import React, { useState, useEffect, useMemo } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import { 
  Settings, Download, Plus, AlertTriangle, Clock, Target, 
  CheckCircle, XCircle, Search, Filter, RefreshCw, 
  ArrowRight, ShieldCheck, Activity, Users
} from 'lucide-react';
import apiFetch from '../utils/api';
import { getCurrentUser } from '../utils/auth';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Approvals');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = getCurrentUser();

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/approvals/pending?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setApprovals(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId, action) => {
    const actionLabel = action === 'APPROVED' ? 'Approve' : action === 'REJECTED' ? 'Reject' : 'Return';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this request?`)) return;

    try {
      const res = await apiFetch(`/api/approvals/${approvalId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, reason: `Actioned as ${action} from Approvals Manager Dashboard` })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Approval request ${action.toLowerCase()} successfully!`);
        fetchApprovals();
      } else {
        alert(`Action failed: ${data.message || 'Error processing request'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while taking approval action.');
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredApprovals = useMemo(() => {
    return approvals.filter(req => {
      if (assignedToMe && req.assigned_to && req.assigned_to !== currentUser?.id) {
        return false;
      }
      if (activeTab === 'Pending' || activeTab === 'In Review') {
        if (req.status !== 'PENDING') return false;
      } else if (activeTab === 'Approved') {
        if (req.status !== 'APPROVED') return false;
      } else if (activeTab === 'Rejected') {
        if (req.status !== 'REJECTED') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (req.quotation_number || '').toLowerCase();
        const cust = (req.customer_name || '').toLowerCase();
        const reqBy = (req.requested_by_name || '').toLowerCase();
        if (!num.includes(q) && !cust.includes(q) && !reqBy.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [approvals, assignedToMe, activeTab, searchQuery, currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="approvals" />
      
      <main className="flex-1 bg-slate-50/60 pb-16">
        <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-1">
                <span>DealFlow360</span>
                <span className="text-slate-300">/</span>
                <span>Governance & Risk</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800">Approvals</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Approvals</h1>
              <p className="text-slate-500 text-sm mt-1">Review and manage business requests requiring authorization across sales quotations and policy rules.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={fetchApprovals} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                Refresh Queue
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Approvals */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Approvals</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  {approvals.filter(a => a.status === 'PENDING').length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Awaiting your sign-off</p>
            </div>

            {/* Approved */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500"></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Approved</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600">
                  {approvals.filter(a => a.status === 'APPROVED').length}
                </span>
                <span className="text-sm font-medium text-slate-600">requests</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Authorized deals</p>
            </div>

            {/* Rejected */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500"></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rejected</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-rose-600">
                  {approvals.filter(a => a.status === 'REJECTED').length}
                </span>
                <span className="text-sm font-medium text-slate-600">requests</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Declined requests</p>
            </div>

            {/* High Priority */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500"></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">High Priority</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-600">
                  {approvals.filter(req => req.status === 'PENDING' && (req.approval_level === 'MANAGER_AND_FINANCE' || Number(req.total_amount) > 1000000)).length}
                </span>
                <span className="text-sm font-medium text-slate-600">requests</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Requires immediate attention</p>
            </div>
          </div>

          {/* Main Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              
              {/* Tabs */}
              <div className="border-b border-slate-200 px-4 sm:px-6 flex flex-wrap gap-x-6 gap-y-2 pt-4">
                {['All Approvals', 'Pending', 'Approved', 'Rejected'].map(tab => {
                  let count = approvals.length;
                  if (tab === 'Pending') count = approvals.filter(a => a.status === 'PENDING').length;
                  if (tab === 'Approved') count = approvals.filter(a => a.status === 'APPROVED').length;
                  if (tab === 'Rejected') count = approvals.filter(a => a.status === 'REJECTED').length;

                  return (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                      {tab} 
                      <span className={`ml-2 text-[10px] py-0.5 px-1.5 rounded-full ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
                
                <div className="ml-auto flex items-center pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={assignedToMe}
                      onChange={e => setAssignedToMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <span className="text-sm font-medium text-slate-700">Assigned to me only</span>
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by quote, customer, or requester..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <button onClick={fetchApprovals} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Request #</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Type / Gate</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Requested By</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Amount</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider text-center">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Decision Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApprovals.map(req => {
                      let priorityStyle = "bg-blue-50 text-blue-700 border-blue-200";
                      let dotStyle = "bg-blue-500";
                      let priorityText = "Medium";
                      
                      if (req.approval_level === 'MANAGER_AND_FINANCE' || Number(req.total_amount) > 1000000) {
                        priorityStyle = "bg-amber-50 text-amber-700 border-amber-200";
                        dotStyle = "bg-amber-500";
                        priorityText = "High";
                      }
                      if (Number(req.total_amount) > 2000000) {
                        priorityStyle = "bg-rose-50 text-rose-700 border-rose-200";
                        dotStyle = "bg-rose-500";
                        priorityText = "Critical";
                      }

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <a href={`/quotations/${req.quotation_id}`} className="font-bold text-brand-600 hover:underline">
                                {req.quotation_number}
                              </a>
                              <span className="text-xs text-slate-500 mt-0.5">{req.customer_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">Discount Override</span>
                              <span className="text-[11px] text-slate-500 mt-0.5">
                                {req.approval_level === 'MANAGER_AND_FINANCE' ? 'Manager & Finance' : 'Manager Sign-off'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                {req.requested_by_name?.substring(0, 2).toUpperCase() || 'SR'}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{req.requested_by_name || 'Sales Rep'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-900 text-right">
                            {formatCurrency(req.total_amount)}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${priorityStyle}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></div> {priorityText}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {req.status === 'APPROVED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                APPROVED
                              </span>
                            ) : req.status === 'REJECTED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                REJECTED
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleAction(req.id, 'APPROVED')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleAction(req.id, 'REJECTED')}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : req.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                <CheckCircle className="w-4 h-4" /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                                <XCircle className="w-4 h-4" /> Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    
                    {filteredApprovals.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center text-slate-500 text-sm">
                          {loading ? 'Loading approval queue...' : 'No approvals found matching filters.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer specs */}
              <div className="border-t border-slate-200 p-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-800">{filteredApprovals.length}</span> requests</span>
              </div>
            </div>

            {/* Right Column: Sidebars */}
            <div className="space-y-6">
              
              {/* Delegation & Authority Limit */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Delegation & Authority Limit
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">Active VP Level</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">
                  Authorization threshold assigned to <span className="font-bold text-slate-700">{currentUser?.fullName || 'Manager Operator'}</span> under Corporate Delegation Matrix 2026-Q1:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Direct Quote Authorization</span>
                      <span>Up to ₹50,00,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '49%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Max Discount Margin Override</span>
                      <span>Up to 20%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-amber-500" style={{ width: '80%' }}></div>
                      <div className="h-full bg-rose-500" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
