import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

// Icons
import { 
  Settings, Download, Plus, AlertTriangle, Clock, Target, 
  CheckCircle, XCircle, Search, Filter, RefreshCw, 
  ArrowRight, ShieldCheck, Activity, Users
} from 'lucide-react';

import apiFetch from '../utils/api';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Approvals');

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await apiFetch('/api/approvals/pending');
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
    
    fetchApprovals();
  }, []);

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

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
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Settings className="w-4 h-4 text-slate-500" />
                Approval Rules
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-4 h-4 text-slate-500" />
                Export Log
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                <Plus className="w-4 h-4" />
                Create Request
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Approvals */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500"></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Approvals</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">{approvals.length}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Awaiting your sign-off</p>
            </div>

            {/* High Priority */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500"></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">High Priority</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-rose-600">
                  {approvals.filter(req => req.approval_level === 'MANAGER_AND_FINANCE' || req.total_amount > 1000000).length}
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
                {['All Approvals', 'Pending', 'In Review', 'Approved', 'Rejected'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                  >
                    {tab} 
                    <span className={`ml-2 text-[10px] py-0.5 px-1.5 rounded-full ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {tab === 'Pending' ? approvals.length : '0'}
                    </span>
                  </button>
                ))}
                
                <div className="ml-auto flex items-center pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-sm font-medium text-slate-700">Assigned to me</span>
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by quote, customer, or approver..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <select className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                  <option>All Status</option>
                </select>
                <select className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                  <option>All Priorities</option>
                </select>
                <select className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                  <option>All Types</option>
                </select>
                <select className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                  <option>Last 30 Days</option>
                </select>
                <button className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-8"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" /></th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Request</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Requested By</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Submitted</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Render Real Pending Requests */}
                    {approvals.map(req => {
                      let priorityStyle = "bg-blue-50 text-blue-700 border-blue-200";
                      let dotStyle = "bg-blue-500";
                      let priorityText = "Medium";
                      
                      if (req.approval_level === 'MANAGER_AND_FINANCE' || req.total_amount > 1000000) {
                        priorityStyle = "bg-amber-50 text-amber-700 border-amber-200";
                        dotStyle = "bg-amber-500";
                        priorityText = "High";
                      }
                      if (req.total_amount > 2000000) {
                        priorityStyle = "bg-rose-50 text-rose-700 border-rose-200";
                        dotStyle = "bg-rose-500";
                        priorityText = "Critical";
                      }

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-4"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" /></td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-blue-600 hover:underline cursor-pointer">{req.quotation_number}</span>
                              <span className="text-xs text-slate-500 mt-0.5">{req.customer_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">Discount Override</span>
                              <span className="text-[11px] text-slate-500 mt-0.5">{req.approval_level === 'MANAGER_AND_FINANCE' ? 'Manager & Finance' : req.approval_level === 'MANAGER' ? 'Manager Approval' : 'Finance Approval'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                {req.requested_by_name?.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{req.requested_by_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(req.total_amount)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${priorityStyle}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></div> {priorityText}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {new Date(req.requested_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <button className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer">
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {approvals.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-slate-500 text-sm">
                          No pending approvals found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-200 p-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-800">1</span> to <span className="font-semibold text-slate-800">8</span> of <span className="font-semibold text-slate-800">42</span> approvals</span>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer">Previous</button>
                  <button className="px-3 py-1.5 border border-blue-600 bg-blue-600 rounded text-xs font-semibold text-white cursor-pointer">1</button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">2</button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">3</button>
                  <span className="px-2 text-slate-400 text-xs">...</span>
                  <button className="px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">6</button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer">Next</button>
                </div>
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
                  Authorization threshold assigned to <span className="font-bold text-slate-700">Alex Vance</span> under Corporate Delegation Matrix 2026-Q1:
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
                    <div className="text-[10px] text-slate-500 mt-1.5">Current highest in queue: ₹24,50,000 (49% limit)</div>
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
                    <div className="text-[10px] text-rose-600 font-semibold mt-1.5">1 escalation exceeds limit (QT-10421 @ 28%)</div>
                  </div>
                </div>
              </div>

              {/* Recent Approval Decisions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="text-sm font-bold text-slate-800">Recent Approval Decisions</div>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer font-semibold">Audit Log</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs text-slate-700 leading-snug">
                        <span className="font-bold text-blue-600">QT-10455</span> Special Discount (14%) approved by <span className="font-bold text-slate-900">Alex Vance</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Customer: Apex Systems • 45 mins ago</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs text-slate-700 leading-snug">
                        <span className="font-bold text-blue-600">QT-10448</span> Payment Terms (Net 60) approved by <span className="font-bold text-slate-900">Finance Ops</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Credit assessment verified • 2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs text-slate-700 leading-snug">
                        <span className="font-bold text-blue-600">QT-10432</span> Custom Pricing rejected by <span className="font-bold text-slate-900">Sarah Chen</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Reason: Margin below statutory 10% • Yesterday 05:10 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs text-slate-700 leading-snug">
                        <span className="font-bold text-blue-600">QT-10419</span> High Value Contract approved by <span className="font-bold text-slate-900">VP Sales</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Legal addendum attached • Yesterday 02:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Governance & SLA Snapshot */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="text-sm font-bold text-slate-800">Governance & SLA Snapshot</div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Real-time metrics</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Today's SLA Compliance</span>
                      <span className="text-emerald-600">96.4%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96.4%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                      <span>Pending Escalations</span>
                      <span className="text-rose-600">1 Critical</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600">Active Approval Policies</span>
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">14 Rules Active</span>
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
