import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function FulfillmentDetailsPage() {
  const { id } = useParams();
  const fulfillmentId = id || 'FUL-1048';
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Items to Fulfill', 'Shipping & Logistics', 'Fulfillment Audit Log'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader activeTab="fulfillment" />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-slate-500 mb-4 gap-2">
          <span>DealFlow360</span>
          <span>/</span>
          <Link to="/fulfillment" className="hover:text-brand-600 transition-colors">Fulfillment</Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">{fulfillmentId}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fulfillment {fulfillmentId}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Processing
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Order: <span className="font-medium text-slate-700">ORD-2094</span></span>
              <span>•</span>
              <span>Customer: <span className="font-medium text-slate-700">ABC Interiors</span></span>
              <span>•</span>
              <span>Quotation Ref: <a href="#" className="text-brand-600 hover:underline">QT-10482</a></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <svg className="mr-1.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export Packing Slip
            </button>
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              More Actions
              <svg className="ml-1.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Status
            </button>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</h3>
            <div className="font-semibold text-slate-900 text-sm">ABC Interiors</div>
            <div className="text-xs text-slate-500 mt-0.5">MG Road, Bengaluru</div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Items</h3>
            <div className="font-semibold text-slate-900 text-sm">6 Items</div>
            <div className="text-xs text-slate-500 mt-0.5">3 Unique SKUs (30 Units)</div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Status</h3>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="font-semibold text-blue-600 text-sm">Processing</div>
            <div className="text-xs text-slate-500 mt-0.5">In warehouse prep</div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Delivery</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div className="font-semibold text-slate-900 text-sm">18 Oct 2026</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">On schedule • 2 days left</div>
          </div>
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse Location</h3>
            <div className="font-semibold text-slate-900 text-sm">Bengaluru Central</div>
            <div className="text-xs text-slate-500 mt-0.5">Bay C-14 • WH-BLR-01</div>
          </div>
        </div>

        {/* Progress Lifecycle Stepper */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 overflow-hidden">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">Fulfillment Progress Lifecycle</h3>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-4 left-[10%] right-[10%] h-[3px] bg-slate-100 rounded-full z-0"></div>
            {/* Active Track */}
            <div className="absolute top-4 left-[10%] w-[25%] h-[3px] bg-blue-500 rounded-full z-0"></div>
            
            <div className="relative z-10 flex justify-between">
              
              {/* Step 1: Done */}
              <div className="flex flex-col items-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm mb-2 ring-4 ring-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-slate-900">Order Confirmed</div>
                <div className="text-[10px] text-slate-400 mt-0.5">15 Oct · 09:30 AM</div>
              </div>
              
              {/* Step 2: Active */}
              <div className="flex flex-col items-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md mb-2 ring-4 ring-blue-50">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="text-xs font-bold text-blue-700">Processing</div>
                <div className="text-[10px] text-slate-500 mt-0.5">16 Oct · In Warehouse Pick</div>
              </div>

              {/* Step 3: Pending */}
              <div className="flex flex-col items-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center mb-2 ring-4 ring-white">
                  <span className="text-xs font-semibold">3</span>
                </div>
                <div className="text-xs font-medium text-slate-500">Ready to Ship</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Est. 17 Oct · 02:00 PM</div>
              </div>

              {/* Step 4: Pending */}
              <div className="flex flex-col items-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center mb-2 ring-4 ring-white">
                  <span className="text-xs font-semibold">4</span>
                </div>
                <div className="text-xs font-medium text-slate-500">In Transit</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Est. 17 Oct · 06:00 PM</div>
              </div>

              {/* Step 5: Pending */}
              <div className="flex flex-col items-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center mb-2 ring-4 ring-white">
                  <span className="text-xs font-semibold">5</span>
                </div>
                <div className="text-xs font-medium text-slate-500">Delivered</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target: 18 Oct · End of Day</div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab} {tab === 'Items to Fulfill' && <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">6</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column - Details */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* Items to Fulfill */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Items to Fulfill</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Products included in this fulfillment request and warehouse pick status.</p>
                </div>
                <span className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded">3 SKUs allocated</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ordered</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Allocated</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fulfilled</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">Ergonomic Executive Chair</div>
                            <div className="text-[10px] text-slate-500">Black Edition · BIFMA Level 2</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-mono">EEC-2026-PRO</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-900 text-right">12</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-emerald-600 text-right">12</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-400 text-right">0</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Processing</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">Bay C-14</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">Premium Monitor Arm</div>
                            <div className="text-[10px] text-slate-500">Dual Screen Heavy Duty Gas Spring</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-mono">PMA-102</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-900 text-right">12</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-emerald-600 text-right">12</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-400 text-right">0</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Processing</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">Bay B-68</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">Workspace Storage Unit</div>
                            <div className="text-[10px] text-slate-500">3-Drawer Mobile Metal Pedestal</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-mono">WSU-88</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-900 text-right">6</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-emerald-600 text-right">6</td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-400 text-right">0</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Ready</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">Bay D-02</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50/50 border-t border-slate-200">
                    <tr>
                      <td colSpan="7" className="px-5 py-3 flex items-center justify-between">
                        <div className="text-xs text-slate-600">Total items: <span className="font-bold text-slate-900">30 units</span> across 3 product lines</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          All items 100% allocated from inventory
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Order Information</h2>
                <a href="#" className="text-xs font-medium text-slate-500 hover:text-brand-600">Quotation Contract Linked</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                  <span className="text-xs text-slate-500">Order ID:</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    ORD-2094 
                    <svg className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                  <span className="text-xs text-slate-500">Source Quotation:</span>
                  <a href="#" className="text-xs font-medium text-brand-600 hover:underline">QT-10482</a>
                </div>
                
                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                  <span className="text-xs text-slate-500">Order Date:</span>
                  <span className="text-xs font-medium text-slate-900">15 Oct 2026</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                  <span className="text-xs text-slate-500">Customer Account:</span>
                  <span className="text-xs font-bold text-slate-900">ABC Interiors</span>
                </div>
                
                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                  <span className="text-xs text-slate-500">Sales Representative:</span>
                  <span className="text-xs font-medium text-slate-900">Alex Vance (VP Sales & Ops)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                  <span className="text-xs text-slate-500">Total Order Value:</span>
                  <span className="text-xs font-bold text-slate-900">₹4,18,000 <span className="text-[10px] font-normal text-slate-500">(incl. 18% GST)</span></span>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-slate-500">Payment Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed (100% Settled via NEFT)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-slate-500">Invoicing Status:</span>
                  <span className="text-xs font-medium text-slate-900">Generated <span className="text-[10px] text-slate-500">(INV-2026-1048)</span></span>
                </div>
              </div>
            </div>

            {/* Delivery Destination & Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-900">Delivery Destination & Contact</h2>
                <button className="text-xs font-medium text-brand-600 hover:text-brand-700">Verify Address</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-6">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Shipping Address</h3>
                  <div className="font-bold text-slate-900 text-sm mb-1.5">ABC Interiors Headquarters</div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    4th Floor, Prestige Tower, MG Road,<br/>
                    Bengaluru, Karnataka - 560001,<br/>
                    India
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">GSTIN: 29ABCDE1234F1Z5</div>
                </div>
                <div className="p-6">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Site Contact & Instructions</h3>
                  <div className="text-xs mb-1.5"><span className="font-bold text-slate-900">Rahul Sharma</span> <span className="text-slate-500">(Head of Facilities)</span></div>
                  <div className="text-xs text-slate-600 mb-1">Phone: <span className="font-medium text-slate-900">+91 98765 43210</span></div>
                  <div className="text-xs text-slate-600 mb-4">Email: <a href="mailto:rahul.sharma@abcinteriors.com" className="text-brand-600 hover:underline">rahul.sharma@abcinteriors.com</a></div>
                  
                  <div className="bg-amber-50/80 border border-amber-100 p-3 rounded-lg text-[11px] text-amber-800 leading-relaxed">
                    <span className="font-bold">Logistics Note:</span> Standard Enterprise Ground + Dedicated Dock Delivery required. Service elevator available on East Wing.
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Fulfillment Activity Timeline</h2>
                <button className="text-xs font-medium text-brand-600 hover:text-brand-700">Full Operational Audit</button>
              </div>

              <div className="relative border-l-2 border-slate-100 ml-2.5 space-y-7 pb-2 mt-2">
                
                {/* Event 1 */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white shadow-sm"></div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="font-bold text-xs text-slate-900">Fulfillment moved to Processing</h4>
                    <span className="text-[10px] text-slate-400">Today · 10:15 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Picker assigned: Bay C-14, Bengaluru Central. Picking manifest batch #8843 printed.</p>
                </div>

                {/* Event 2 */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white shadow-sm"></div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="font-bold text-xs text-slate-900">Inventory 100% Allocated</h4>
                    <span className="text-[10px] text-slate-400">Today · 09:40 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-600">30 units reserved from Bengaluru Central warehouse (WH-BLR-01).</p>
                </div>

                {/* Event 3 */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-slate-800 rounded-full -left-[7px] top-1.5 ring-4 ring-white shadow-sm"></div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="font-bold text-xs text-slate-900">Order Confirmed for Fulfillment</h4>
                    <span className="text-[10px] text-slate-400">Yesterday · 04:20 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Approved by Operations Desk. Payment clearance confirmed by Finance.</p>
                </div>

                {/* Event 4 */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[7px] top-1.5 ring-4 ring-white shadow-sm"></div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="font-bold text-xs text-slate-600">Fulfillment FUL-1048 Created</h4>
                    <span className="text-[10px] text-slate-400">Yesterday · 03:50 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Generated automatically from approved quotation QT-10482.</p>
                </div>

              </div>
            </div>

            {/* Internal Operational Notes */}
            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Internal Operational Notes</h2>
                <button className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Add Note
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2.5">
                  <div className="font-semibold text-xs text-slate-900">Dispatch Coordinator (Alex Vance)</div>
                  <div className="text-[10px] text-slate-400">16 Oct · 09:10 AM</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Customer requested weekday delivery strictly between 10 AM and 5 PM. Ensure all workspace components and chairs are delivered together in one batch to facilitate their third-party assembly team."
                </p>
              </div>
            </div>

          </div>

          {/* Right Column - Sidebars */}
          <div className="flex flex-col gap-6">
            
            {/* Current Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">Current Status</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Processing (40%)</span>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Overall Completion</span>
                  <span className="text-blue-600">40%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Items Picked:</span>
                  <span className="font-bold text-slate-900">0 / 6 Packages (Allocated)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Target Dispatch:</span>
                  <span className="font-medium text-slate-900">17 Oct 2026, 04:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Expected Delivery:</span>
                  <span className="font-medium text-slate-900">18 Oct 2026</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Last System Sync:</span>
                  <span className="font-medium text-slate-400">10 minutes ago</span>
                </div>
              </div>
            </div>

            {/* Fulfillment Location */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">Fulfillment Location</h3>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">WH-BLR-01</span>
              </div>
              
              <div className="mb-5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse Depot</div>
                <div className="font-bold text-slate-900 text-sm">Bengaluru Central Hub</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Electronic City Phase 1, Bengaluru</div>
              </div>

              <div className="space-y-3.5 mb-5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Hub Allocation:</span>
                  <span className="font-bold text-emerald-600">100% Stock Reserved</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Assigned Team:</span>
                  <span className="font-medium text-slate-900">Operations Dispatch Alpha</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Pick Status:</span>
                  <span className="font-medium text-blue-600">In Progress (Picker: R. Menon)</span>
                </div>
              </div>
              
              <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View Warehouse Inventory 
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
            </div>

            {/* Shipping & Freight */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-5">Shipping & Freight</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Shipping Method:</span>
                  <span className="font-medium text-slate-900">Surface Logistics (Heavy)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Assigned Carrier:</span>
                  <span className="font-medium text-slate-500 italic">Pending Carrier Selection</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Preferred Partners:</span>
                  <span className="font-medium text-slate-900">BlueDart / Delhivery</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">AWB / Waybill:</span>
                  <span className="font-medium text-slate-400">Generated upon Dispatch</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                  <span className="font-medium text-slate-900">Est. Dispatch:</span>
                  <span className="font-bold text-slate-900">17 Oct 2026</span>
                </div>
              </div>

              <button className="w-full py-2 px-4 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                Manage Shipment / Assign Carrier
              </button>
            </div>

            {/* Requires Attention */}
            <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Requires Attention</h3>
              </div>
              <p className="text-[11px] text-amber-800 mb-4 leading-relaxed">
                One product SKU is below preferred central warehouse safety buffer.
              </p>
              
              <div className="bg-white/70 rounded border border-amber-200/70 p-3 mb-4 shadow-sm">
                <p className="text-[10px] text-amber-900 leading-relaxed">
                  <span className="font-bold text-amber-900">Premium Monitor Arm (PMA-102)</span> — Allocated for this order, but remaining depot balance is 8 units (Safety Threshold: 15 units).
                </p>
              </div>

              <a href="#" className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2 decoration-amber-300">Review Warehouse Stock →</a>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Fulfillment Quick Actions</h3>
              <div className="space-y-2.5">
                <button className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors text-center">
                  Update Fulfillment Status
                </button>
                <button className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-sm transition-colors text-center">
                  Print Packing Slip & Manifest
                </button>
                <button className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-sm transition-colors text-center">
                  Contact Site Contact (Rahul Sharma)
                </button>
                <button className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-sm transition-colors text-center">
                  View Related Order (ORD-2094)
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  );
}
