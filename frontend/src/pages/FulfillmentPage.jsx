import React, { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function FulfillmentPage() {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { name: 'All', count: 48, id: 'All' },
    { name: 'Processing', count: 12, id: 'Processing' },
    { name: 'Ready to Ship', count: 8, id: 'Ready to Ship' },
    { name: 'In Transit', count: 19, id: 'In Transit' },
    { name: 'Delivered', count: 9, id: 'Delivered' },
    { name: 'Delayed', count: 3, id: 'Delayed', color: 'text-rose-600 bg-rose-50' },
  ];

  const fulfillments = [
    { id: 'FUL-1048', order: 'ORD-2094', quote: 'QT-10482', customer: 'ABC Interiors', items: 6, status: 'Processing', progress: 25, delivery: '18 Oct 2026', method: 'BlueDart Express', statusColor: 'bg-blue-50 text-blue-700', progressColor: 'bg-blue-600' },
    { id: 'FUL-1047', order: 'ORD-2088', quote: 'QT-10461', customer: 'Urban Spaces', items: 12, status: 'Ready to Ship', progress: 60, delivery: '17 Oct 2026', method: 'Delhivery Surface', statusColor: 'bg-purple-50 text-purple-700', progressColor: 'bg-purple-500' },
    { id: 'FUL-1045', order: 'ORD-2079', quote: 'QT-10440', customer: 'Nova Ltd.', items: 4, status: 'In Transit', progress: 80, delivery: '16 Oct 2026', method: 'SafeX Logistics', statusColor: 'bg-amber-50 text-amber-700', progressColor: 'bg-amber-500' },
    { id: 'FUL-1044', order: 'ORD-2075', quote: 'QT-10432', customer: 'Zenith Co.', items: 9, status: 'In Transit', progress: 75, delivery: '16 Oct 2026', method: 'BlueDart Air', statusColor: 'bg-amber-50 text-amber-700', progressColor: 'bg-amber-500' },
    { id: 'FUL-1042', order: 'ORD-2071', quote: 'QT-10419', customer: 'Corporate Workspace', items: 8, status: 'Delivered', progress: 100, delivery: '14 Oct 2026', method: 'Delivered On-Time', statusColor: 'bg-emerald-50 text-emerald-700', progressColor: 'bg-emerald-500' },
    { id: 'FUL-1039', order: 'ORD-2065', quote: 'QT-10408', customer: 'ABC Industries', items: 15, status: 'Delayed', progress: 45, delivery: '12 Oct 2026', method: 'Carrier Exception', statusColor: 'bg-rose-50 text-rose-700', progressColor: 'bg-rose-500', methodColor: 'text-rose-500' },
    { id: 'FUL-1038', order: 'ORD-2061', quote: 'QT-10399', customer: 'Horizon Tech', items: 7, status: 'Delivered', progress: 100, delivery: '13 Oct 2026', method: 'Delivered On-Time', statusColor: 'bg-emerald-50 text-emerald-700', progressColor: 'bg-emerald-500' },
    { id: 'FUL-1035', order: 'ORD-2054', quote: 'QT-10385', customer: 'Delta LLC', items: 10, status: 'Processing', progress: 15, delivery: '19 Oct 2026', method: 'Delhivery Ground', statusColor: 'bg-blue-50 text-blue-700', progressColor: 'bg-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader activeTab="fulfillment" />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
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
              <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors">
                <svg className="mr-2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export
              </button>
              <button className="inline-flex items-center justify-center rounded-lg border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors">
                + Create Fulfillment
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="border-r border-slate-200 pr-4 last:border-0 last:pr-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Active</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-900">48</div>
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
              <div className="text-3xl font-bold text-slate-900">12</div>
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
              <div className="text-3xl font-bold text-slate-900">8</div>
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
              <div className="text-3xl font-bold text-slate-900">19</div>
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
              <div className="text-3xl font-bold text-slate-900">9</div>
              <div className="text-xs font-medium text-emerald-700 px-2 py-0.5 rounded mb-1 border border-emerald-200 bg-emerald-50">100% SLA</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">Last 7 days</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column - Table (spans 2 columns) */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            
            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
              
              {/* Tabs */}
              <div className="border-b border-slate-200 bg-white">
                <nav className="flex space-x-1 px-4 py-2 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
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

              {/* Filters */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:max-w-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border border-slate-300 pl-10 pr-3 py-1.5 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Search by fulfillment ID, order..."
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select className="block w-full sm:w-auto rounded-md border border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white">
                    <option>All Status</option>
                  </select>
                  <select className="block w-full sm:w-auto rounded-md border border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white">
                    <option>All Warehouses</option>
                  </select>
                  <select className="block w-full sm:w-auto rounded-md border border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white">
                    <option>Last 30 Days</option>
                  </select>
                  <button className="p-1.5 rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50 bg-white">
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
                        Expected Delivery
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {fulfillments.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-slate-900 text-sm">
                            {item.id}
                            <svg className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${item.statusColor.replace('bg-', 'border-').replace('text-', 'border-').replace(/-\d+$/, '-200')} ${item.statusColor}`}>
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
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{item.delivery}</div>
                          <div className={`text-xs mt-0.5 ${item.methodColor || 'text-slate-500'}`}>{item.method}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
                <div className="hidden sm:block">
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of <span className="font-medium">48</span> fulfillments
                  </p>
                </div>
                <div className="flex-1 flex justify-between sm:justify-end gap-2">
                  <button className="relative inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-400 bg-slate-50" disabled>
                    Previous
                  </button>
                  <div className="hidden sm:flex items-center gap-1">
                    <button className="px-3 py-1.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-md shadow-sm">1</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm">2</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm">3</button>
                    <span className="px-2 text-slate-500">...</span>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm">6</button>
                  </div>
                  <button className="relative inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
                    Next
                  </button>
                </div>
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
                {/* Item 1 */}
                <div className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-slate-900 text-sm">FUL-1039 · ABC Industries</div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Delayed</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Delivery delayed by 2 days due to carrier hub backlog in Bengaluru.</p>
                  <div className="flex justify-end">
                    <button className="text-xs font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 shadow-sm transition-colors">Review Route</button>
                  </div>
                </div>
                {/* Item 2 */}
                <div className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-slate-900 text-sm">FUL-1035 · Nova Ltd.</div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Stock Hold</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Warehouse stock allocation pending for 2 SKUs in Central Depot.</p>
                  <div className="flex justify-end">
                    <button className="text-xs font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 shadow-sm transition-colors">Assign Stock</button>
                  </div>
                </div>
                {/* Item 3 */}
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-slate-900 text-sm">FUL-1031 · Urban Spaces</div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Verification</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Shipping address verification required by freight partner before dispatch.</p>
                  <div className="flex justify-end">
                    <button className="text-xs font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 shadow-sm transition-colors">Verify Details</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Fulfillment Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Fulfillment Activity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live operational event stream</p>
                </div>
                <button className="text-xs font-medium text-brand-600 hover:text-brand-700">Audit Log</button>
              </div>

              <div className="relative border-l border-slate-200 ml-2 space-y-6 pb-2">
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5px] top-1 ring-4 ring-white"></div>
                  <div className="font-semibold text-sm text-slate-900 leading-tight">FUL-1048 moved to Processing</div>
                  <div className="text-xs text-slate-500 mt-0.5">Picker assigned: Bay C-14 · Bengaluru Central</div>
                  <div className="text-[10px] text-slate-400 mt-1">Today · 10:42 AM</div>
                </div>
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full -left-[5px] top-1 ring-4 ring-white"></div>
                  <div className="font-semibold text-sm text-slate-900 leading-tight">FUL-1047 marked Ready to Ship</div>
                  <div className="text-xs text-slate-500 mt-0.5">AWB generated & manifest assigned</div>
                  <div className="text-[10px] text-slate-400 mt-1">Today · 09:30 AM</div>
                </div>
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[5px] top-1 ring-4 ring-white"></div>
                  <div className="font-semibold text-sm text-slate-900 leading-tight">FUL-1042 successfully delivered</div>
                  <div className="text-xs text-slate-500 mt-0.5">Signed by R. Menon · ePOD uploaded</div>
                  <div className="text-[10px] text-slate-400 mt-1">Yesterday · 04:15 PM</div>
                </div>
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-rose-500 rounded-full -left-[5px] top-1 ring-4 ring-white"></div>
                  <div className="font-semibold text-sm text-slate-900 leading-tight">FUL-1039 delivery delay reported</div>
                  <div className="text-xs text-slate-500 mt-0.5">Carrier exception: Hub congestion</div>
                  <div className="text-[10px] text-slate-400 mt-1">Yesterday · 11:20 AM</div>
                </div>
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-slate-400 rounded-full -left-[5px] top-1 ring-4 ring-white"></div>
                  <div className="font-semibold text-sm text-slate-900 leading-tight">FUL-1038 dispatched via Express Air</div>
                  <div className="text-xs text-slate-500 mt-0.5">Dispatched from Mumbai Logistics Hub</div>
                  <div className="text-[10px] text-slate-400 mt-1">14 Oct · 03:00 PM</div>
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
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-medium text-slate-800">Delhi Regional Depot</span>
                    <span className="text-xs text-slate-500">49% · 9 active dispatches</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '49%' }}></div>
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
