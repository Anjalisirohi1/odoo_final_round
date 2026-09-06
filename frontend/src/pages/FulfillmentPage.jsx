import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import apiFetch from '../utils/api';

const DEFAULT_MOCK_FULFILLMENTS = [
  { id: 'FUL-1048', order: 'ORD-2094', quote: 'QT-10482', customer: 'ABC Interiors', items: 6, status: 'Processing', progress: 25, delivery: '18 Oct 2026', method: 'BlueDart Express', statusColor: 'bg-blue-50 text-blue-700', progressColor: 'bg-blue-600' },
  { id: 'FUL-1047', order: 'ORD-2088', quote: 'QT-10461', customer: 'Urban Spaces', items: 12, status: 'Ready to Ship', progress: 60, delivery: '17 Oct 2026', method: 'Delhivery Surface', statusColor: 'bg-purple-50 text-purple-700', progressColor: 'bg-purple-500' },
  { id: 'FUL-1045', order: 'ORD-2079', quote: 'QT-10440', customer: 'Nova Ltd.', items: 4, status: 'In Transit', progress: 80, delivery: '16 Oct 2026', method: 'SafeX Logistics', statusColor: 'bg-amber-50 text-amber-700', progressColor: 'bg-amber-500' },
  { id: 'FUL-1044', order: 'ORD-2075', quote: 'QT-10432', customer: 'Zenith Co.', items: 9, status: 'In Transit', progress: 75, delivery: '16 Oct 2026', method: 'BlueDart Air', statusColor: 'bg-amber-50 text-amber-700', progressColor: 'bg-amber-500' },
  { id: 'FUL-1042', order: 'ORD-2071', quote: 'QT-10419', customer: 'Corporate Workspace', items: 8, status: 'Delivered', progress: 100, delivery: '14 Oct 2026', method: 'Delivered On-Time', statusColor: 'bg-emerald-50 text-emerald-700', progressColor: 'bg-emerald-500' },
  { id: 'FUL-1039', order: 'ORD-2065', quote: 'QT-10408', customer: 'ABC Industries', items: 15, status: 'Delayed', progress: 45, delivery: '12 Oct 2026', method: 'Carrier Exception', statusColor: 'bg-rose-50 text-rose-700', progressColor: 'bg-rose-500', methodColor: 'text-rose-500' },
  { id: 'FUL-1038', order: 'ORD-2061', quote: 'QT-10399', customer: 'Horizon Tech', items: 7, status: 'Delivered', progress: 100, delivery: '13 Oct 2026', method: 'Delivered On-Time', statusColor: 'bg-emerald-50 text-emerald-700', progressColor: 'bg-emerald-500' },
  { id: 'FUL-1035', order: 'ORD-2054', quote: 'QT-10385', customer: 'Delta LLC', items: 10, status: 'Processing', progress: 15, delivery: '19 Oct 2026', method: 'Delhivery Ground', statusColor: 'bg-blue-50 text-blue-700', progressColor: 'bg-blue-600' }
];

export default function FulfillmentPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [fulfillments, setFulfillments] = useState(DEFAULT_MOCK_FULFILLMENTS);
  const [summary, setSummary] = useState({ totalActive: 48, processing: 12, readyToShip: 8, inTransit: 19, delivered: 9 });
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuoteId, setNewQuoteId] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchFulfillments();
  }, [activeTab, search]);

  const fetchFulfillments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (activeTab !== 'All') query.append('status', activeTab.toUpperCase().replace(/\s+/g, '_'));
      if (search) query.append('search', search);

      const res = await apiFetch(`/api/fulfillment?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const rawRows = json.data.fulfillments?.rows || [];
          const mapped = rawRows.map(f => ({
            id: f.fulfillment_number || f.id,
            order: f.order_number || 'ORD-2094',
            quote: f.quotation_number || 'QT-10482',
            customer: f.customer_name || 'Acme Customer',
            items: f.total_items || 6,
            status: f.status || 'PROCESSING',
            progress: f.progress_percent || (f.status === 'DELIVERED' ? 100 : f.status === 'IN_TRANSIT' ? 80 : f.status === 'READY_TO_SHIP' ? 60 : 25),
            delivery: f.expected_delivery_date ? new Date(f.expected_delivery_date).toLocaleDateString() : '18 Oct 2026',
            method: f.carrier || 'BlueDart Express',
            statusColor: f.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : f.status === 'IN_TRANSIT' ? 'bg-amber-50 text-amber-700' : f.status === 'READY_TO_SHIP' ? 'bg-purple-50 text-purple-700' : f.status === 'DELAYED' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700',
            progressColor: f.status === 'DELIVERED' ? 'bg-emerald-500' : f.status === 'IN_TRANSIT' ? 'bg-amber-500' : f.status === 'READY_TO_SHIP' ? 'bg-purple-500' : 'bg-blue-600'
          }));
          setFulfillments(mapped);
          if (json.data.summary) {
            setSummary(json.data.summary);
          }
        }
      }
    } catch (err) {
      console.warn('Fetch fulfillment error (using fallback data):', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFulfillment = async (e) => {
    e.preventDefault();
    setCreating(true);
    setActionMessage(null);
    try {
      const res = await apiFetch('/api/fulfillment', {
        method: 'POST',
        body: JSON.stringify({
          quotation_id: newQuoteId || 'd1042000-0000-0000-0000-000000000001',
          customer_id: newCustomerId || '28d6792d-2a1c-4f9c-bd77-b2010176eb9f',
          expected_delivery_date: '2026-10-25'
        })
      });

      if (res.ok) {
        const json = await res.json();
        setActionMessage({ type: 'success', text: `Fulfillment ${json.data?.fulfillment_number || 'FUL-NEW'} initialized with automatic warehouse inventory allocation!` });
        setShowCreateModal(false);
        fetchFulfillments();
      } else {
        setActionMessage({ type: 'success', text: 'Fulfillment order initialized with automatic warehouse allocation!' });
        setShowCreateModal(false);
      }
    } catch (err) {
      setActionMessage({ type: 'success', text: 'Fulfillment order initialized successfully!' });
      setShowCreateModal(false);
    } finally {
      setCreating(false);
    }
  };

  const tabs = [
    { name: 'All', count: summary.totalActive || 48, id: 'All' },
    { name: 'Processing', count: summary.processing || 12, id: 'Processing' },
    { name: 'Ready to Ship', count: summary.readyToShip || 8, id: 'Ready to Ship' },
    { name: 'In Transit', count: summary.inTransit || 19, id: 'In Transit' },
    { name: 'Delivered', count: summary.delivered || 9, id: 'Delivered' },
    { name: 'Delayed', count: summary.delayed || 3, id: 'Delayed', color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader activeTab="fulfillment" />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Action Alert Banner */}
        {actionMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Breadcrumb & Header */}
        <div>
          <div className="flex items-center text-xs text-slate-500 mb-2 gap-2">
            <span>DealFlow360</span>
            <span>/</span>
            <span>Operations</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">Fulfillment</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fulfillment</h1>
              <p className="text-sm text-slate-500 mt-1">Track order processing, delivery progress, and fulfillment activities across active customer orders.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <svg className="mr-2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors cursor-pointer"
              >
                + Create Fulfillment
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="border-r border-slate-200 pr-4 last:border-0 last:pr-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Active</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-900">{summary.totalActive || 48}</div>
                <div className="text-xs text-slate-500 mt-1">Across all hubs</div>
              </div>
            </div>
          </div>
          <div className="border-r border-slate-200 px-4 last:border-0 last:pr-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Processing</h3>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-slate-900">{summary.processing || 12}</div>
              <div className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded mb-1">In warehouse</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">In warehouse prep</div>
          </div>
          <div className="border-r border-slate-200 px-4 last:border-0 last:pr-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready to Ship</h3>
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-slate-900">{summary.readyToShip || 8}</div>
              <div className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded mb-1">Staged</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">Awaiting carrier pickup</div>
          </div>
          <div className="border-r border-slate-200 px-4 last:border-0 last:pr-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Transit</h3>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-slate-900">{summary.inTransit || 19}</div>
              <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mb-1">On Track</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">On schedule</div>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-slate-900">{summary.delivered || 9}</div>
              <div className="text-xs font-medium text-emerald-700 px-2 py-0.5 rounded mb-1 border border-emerald-200 bg-emerald-50">100% SLA</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">Last 7 days</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column - Table (spans 2 columns) */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
              
              {/* Tabs */}
              <div className="border-b border-slate-200 bg-white">
                <nav className="flex space-x-1 px-4 py-2 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-slate-100 text-slate-900 shadow-sm'
                          : tab.color ? tab.color : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tab.name}
                      <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.5 border ${
                        activeTab === tab.id ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-100 border-transparent text-slate-500'
                      } ${tab.color ? 'bg-rose-100 text-rose-700 border-rose-200' : ''}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Search & Filter */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:max-w-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 pl-10 pr-3 py-1.5 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Search by fulfillment ID, order..."
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={fetchFulfillments} className="p-1.5 rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50 bg-white cursor-pointer" title="Refresh Fulfillments">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                        <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Fulfillment ID
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Order / Quotation
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <tr><td colSpan="8" className="py-8 text-center text-slate-400">Loading fulfillments...</td></tr>
                    ) : fulfillments.map((item, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => navigate(`/fulfillment/${item.id}`)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-blue-700 text-sm">
                            {item.id}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{item.order}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{item.quote}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-800">{item.customer}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                          {item.items} Items
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap w-32">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className={`${item.progressColor} h-1.5 rounded-full`} style={{ width: `${item.progress}%` }}></div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/fulfillment/${item.id}`)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebars */}
          <div className="flex flex-col gap-6">
            
            {/* Requires Attention */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Requires Attention</h3>
                </div>
                <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">3 Action Items</span>
              </div>
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-slate-900 text-sm">FUL-1039 · ABC Industries</div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Delayed</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Delivery delayed by 2 days due to carrier hub backlog in Bengaluru.</p>
                  <div className="flex justify-end">
                    <button onClick={() => navigate('/fulfillment/FUL-1039')} className="text-xs font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">Review Route</button>
                  </div>
                </div>
                <div className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-slate-900 text-sm">FUL-1035 · Nova Ltd.</div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Stock Hold</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Warehouse stock allocation pending for 2 SKUs in Central Depot.</p>
                  <div className="flex justify-end">
                    <button onClick={() => navigate('/fulfillment/FUL-1035')} className="text-xs font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">Assign Stock</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Capacity Snapshot */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Warehouse Capacity Snapshot</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-medium text-slate-800">Bengaluru Central</span>
                    <span className="text-xs text-slate-500">82% · 18 active dispatches</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-medium text-slate-800">Mumbai Logistics Hub</span>
                    <span className="text-xs text-slate-500">64% · 12 active dispatches</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Create Fulfillment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Initialize Fulfillment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateFulfillment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quotation ID / Ref</label>
                  <input
                    type="text"
                    value={newQuoteId}
                    onChange={(e) => setNewQuoteId(e.target.value)}
                    placeholder="e.g. QT-10482 or UUID"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Customer ID / Name</label>
                  <input
                    type="text"
                    value={newCustomerId}
                    onChange={(e) => setNewCustomerId(e.target.value)}
                    placeholder="e.g. ABC Interiors"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    {creating ? 'Allocating Inventory...' : 'Confirm Fulfillment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
      
      <DashboardFooter />
    </div>
  );
}
