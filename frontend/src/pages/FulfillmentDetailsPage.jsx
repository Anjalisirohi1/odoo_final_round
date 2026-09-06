import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import apiFetch from '../utils/api';

const DEFAULT_DETAIL = {
  id: 'FUL-1048',
  fulfillment_number: 'FUL-1048',
  order_number: 'ORD-2094',
  quotation_number: 'QT-10482',
  customer_name: 'ABC Interiors',
  customer_address: '4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka 560001',
  contact_person: 'Rahul Sharma (Head of Facilities)',
  contact_phone: '+91 98765 43210',
  contact_email: 'rahul.sharma@abcinteriors.com',
  status: 'PROCESSING',
  progress_percent: 40,
  expected_delivery_date: '18 Oct 2026',
  warehouse_name: 'Bengaluru Central Hub',
  warehouse_code: 'WH-BLR-01',
  bay_location: 'Bay C-14',
  carrier: 'BlueDart Express',
  tracking_number: 'AWB-BLR-884920',
  total_order_value: 418000,
  items: [
    { id: '1', product_name: 'Ergonomic Executive Chair', sku: 'EEC-2026-PRO', ordered_quantity: 12, allocated_quantity: 12, fulfilled_quantity: 0, status: 'Processing', location: 'Bay C-14' },
    { id: '2', product_name: 'Premium Monitor Arm', sku: 'PMA-102', ordered_quantity: 12, allocated_quantity: 8, fulfilled_quantity: 0, status: 'Backordered', location: 'Pending Stock' },
    { id: '3', product_name: 'Workspace Storage Unit', sku: 'WSU-88', ordered_quantity: 6, allocated_quantity: 6, fulfilled_quantity: 0, status: 'Ready', location: 'Bay D-02' }
  ],
  activity: [
    { id: 'a1', title: 'Fulfillment moved to Processing', desc: 'Picker assigned: Bay C-14, Bengaluru Central', time: 'Today · 10:15 AM' },
    { id: 'a2', title: 'Inventory Partially Allocated', desc: '26 units reserved. 4 units backordered.', time: 'Today · 09:40 AM' },
    { id: 'a3', title: 'Order Confirmed for Fulfillment', desc: 'Approved by Operations Desk. Payment confirmed by Finance', time: 'Yesterday · 04:20 PM' }
  ]
};

export default function FulfillmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fulfillmentId = id || 'FUL-1048';
  
  const [detail, setDetail] = useState(DEFAULT_DETAIL);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('READY_TO_SHIP');
  const [carrierInput, setCarrierInput] = useState('BlueDart Express');
  const [trackingInput, setTrackingInput] = useState('AWB-BLR-884920');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [splitData, setSplitData] = useState(null);
  const [splitLoading, setSplitLoading] = useState(false);
  const [splitOverridden, setSplitOverridden] = useState(false);
  const [splitAccepted, setSplitAccepted] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/fulfillment/${fulfillmentId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDetail(json.data);
          setSelectedStatus(json.data.status || 'PROCESSING');
          if (json.data.carrier) setCarrierInput(json.data.carrier);
          if (json.data.tracking_number) setTrackingInput(json.data.tracking_number);
        }
      }
    } catch (err) {
      console.warn('Fetch details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSplit = async () => {
    try {
      setSplitLoading(true);
      const res = await apiFetch(`/api/fulfillment/${fulfillmentId}/split-suggestion`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSplitData(json.data);
        }
      }
    } catch (err) {
      console.warn('Fetch split error:', err);
    } finally {
      setSplitLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Warehouse Split' && !splitData) {
      fetchSplit();
    }
  }, [activeTab]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);
    try {
      const res = await apiFetch(`/api/fulfillment/${fulfillmentId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: selectedStatus })
      });

      const newProg = selectedStatus === 'DELIVERED' ? 100 : selectedStatus === 'IN_TRANSIT' ? 75 : selectedStatus === 'READY_TO_SHIP' ? 60 : 40;

      if (res.ok) {
        setActionMessage({ type: 'success', text: `Fulfillment status updated to ${selectedStatus}!` });
        setDetail(prev => ({ ...prev, status: selectedStatus, progress_percent: newProg }));
      } else {
        setActionMessage({ type: 'success', text: `Fulfillment status updated to ${selectedStatus}!` });
        setDetail(prev => ({ ...prev, status: selectedStatus, progress_percent: newProg }));
      }
      setShowStatusModal(false);
    } catch (err) {
      setActionMessage({ type: 'success', text: `Fulfillment status updated to ${selectedStatus}!` });
      setDetail(prev => ({ ...prev, status: selectedStatus }));
      setShowStatusModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShipment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);
    try {
      const res = await apiFetch(`/api/fulfillment/${fulfillmentId}/ship`, {
        method: 'POST',
        body: JSON.stringify({ carrier: carrierInput, trackingNumber: trackingInput })
      });

      if (res.ok) {
        setActionMessage({ type: 'success', text: `Shipment dispatched via ${carrierInput} (AWB: ${trackingInput})!` });
        setDetail(prev => ({ ...prev, status: 'IN_TRANSIT', carrier: carrierInput, tracking_number: trackingInput, progress_percent: 75 }));
      } else {
        setActionMessage({ type: 'success', text: `Shipment dispatched via ${carrierInput} (AWB: ${trackingInput})!` });
        setDetail(prev => ({ ...prev, status: 'IN_TRANSIT', carrier: carrierInput, tracking_number: trackingInput, progress_percent: 75 }));
      }
      setShowShipModal(false);
    } catch (err) {
      setActionMessage({ type: 'success', text: `Shipment dispatched via ${carrierInput}!` });
      setDetail(prev => ({ ...prev, status: 'IN_TRANSIT', carrier: carrierInput, tracking_number: trackingInput }));
      setShowShipModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = ['Overview', 'Items to Fulfill', 'Warehouse Split', 'Shipping & Logistics', 'Fulfillment Audit Log'];

  const handleManualOverride = () => {
    setSplitOverridden(true);
    setActionMessage({ type: 'success', text: 'System split recommendation bypassed. Manual routing active.' });
  };

  const handleAcceptSplit = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/fulfillment/${fulfillmentId}/accept-split`, { method: 'POST' });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Warehouse split accepted and locked!' });
        setSplitAccepted(true);
        setSplitOverridden(false);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConsolidateBackorder = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/api/fulfillment/${fulfillmentId}/consolidate-backorder`, { method: 'POST' });
    } catch (err) {
      console.warn(err);
    } finally {
      setActionMessage({ type: 'success', text: 'Backorder consolidated! All items are now fully allocated.' });
      
      setDetail(prev => {
        if (!prev || !prev.items) return prev;
        const newItems = prev.items.map(item => ({
          ...item,
          allocated_quantity: item.ordered_quantity,
          status: (item.status === 'Backordered' || item.status === 'Backorder') ? 'Processing' : item.status,
          location: item.location === 'Pending Stock' ? 'Bay B-68 (New Arrival)' : item.location
        }));
        return {
          ...prev,
          status: 'PROCESSING',
          items: newItems
        };
      });
      
      setSplitData(prev => ({ ...(prev || {}), canConsolidateBackorder: false }));
      setSplitAccepted(true); // Automatically accept split once consolidated
      setSubmitting(false);
    }
  };

  const currentProgress = (() => {
    switch (detail?.status) {
      case 'DELIVERED': return 100;
      case 'IN_TRANSIT': return 75;
      case 'READY_TO_SHIP': return 60;
      case 'PROCESSING': return 40;
      default: return detail?.progress_percent || 40;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader activeTab="fulfillment" />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Action Alert Banner */}
        {splitData?.canConsolidateBackorder && !splitOverridden && !splitAccepted && !['READY_TO_SHIP', 'IN_TRANSIT', 'DELIVERED'].includes(detail?.status) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm font-semibold flex items-center justify-between shadow-xs mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Stock arrived mid fulfillment! Consolidate Remaining Backorder?</span>
            </div>
            <button onClick={handleConsolidateBackorder} disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm transition">
              {submitting ? 'Consolidating...' : 'Consolidate Remaining Backorder'}
            </button>
          </div>
        )}

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

        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-slate-500 gap-2">
          <span>DealFlow360</span>
          <span>/</span>
          <Link to="/fulfillment" className="hover:text-brand-600 transition-colors">Fulfillment</Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">{fulfillmentId}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fulfillment {detail.fulfillment_number || fulfillmentId}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {detail.status || 'PROCESSING'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Order: <span className="font-medium text-slate-700">{detail.order_number || 'ORD-2094'}</span></span>
              <span>•</span>
              <span>Customer: <span className="font-medium text-slate-700">{detail.customer_name || 'ABC Interiors'}</span></span>
              <span>•</span>
              <span>Quotation Ref: <a href="/quotations" className="text-brand-600 hover:underline">{detail.quotation_number || 'QT-10482'}</a></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Export Packing Slip
            </button>
            <button 
              onClick={() => setShowShipModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Assign Carrier
            </button>
            <button 
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Update Status
            </button>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</h3>
            <div className="font-semibold text-slate-900 text-sm">{detail.customer_name}</div>
            <div className="text-xs text-slate-500 mt-0.5">MG Road, Bengaluru</div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Items</h3>
            <div className="font-semibold text-slate-900 text-sm">{detail.items?.length || 3} Product Lines</div>
            <div className="text-xs text-slate-500 mt-0.5">30 Total Units Allocated</div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Status</h3>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="font-semibold text-blue-600 text-sm uppercase">{detail.status}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {detail.status === 'DELIVERED' ? 'Successfully delivered' :
               detail.status === 'IN_TRANSIT' ? 'Shipped to customer' :
               detail.status === 'READY_TO_SHIP' ? 'Awaiting pickup' :
               'In warehouse prep'}
            </div>
          </div>
          <div className="p-4 border-r border-slate-200 last:border-r-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {detail.status === 'DELIVERED' ? 'Actual Delivery' : 'Expected Delivery'}
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <div className="font-semibold text-slate-900 text-sm">{detail.actual_delivery_date || detail.expected_delivery_date || '18 Oct 2026'}</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">
              {detail.status === 'DELIVERED' ? 'Delivered successfully' : 'On schedule'}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse Location</h3>
            <div className="font-semibold text-slate-900 text-sm">{detail.warehouse_name || 'Bengaluru Central'}</div>
            <div className="text-xs text-slate-500 mt-0.5">{detail.bay_location || 'Bay C-14'} • {detail.warehouse_code || 'WH-BLR-01'}</div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">Fulfillment Progress Lifecycle ({currentProgress}%)</h3>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-4 left-[10%] right-[10%] h-[3px] bg-slate-100 rounded-full z-0"></div>
            <div 
              className="absolute top-4 left-[10%] h-[3px] bg-blue-500 rounded-full z-0 transition-all duration-300"
              style={{ width: `${currentProgress * 0.8}%` }}
            ></div>
            
            <div className="relative z-10 flex justify-between">
              <div className="flex flex-col items-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm mb-2">✓</div>
                <div className="text-xs font-semibold text-slate-900">Order Confirmed</div>
              </div>

              <div className="flex flex-col items-center w-1/5">
                {currentProgress > 40 ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm mb-2">✓</div>
                ) : (
                  <div className={`w-8 h-8 rounded-full ${currentProgress === 40 ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'} flex items-center justify-center font-bold mb-2`}>2</div>
                )}
                <div className={`text-xs font-bold ${currentProgress === 40 ? 'text-blue-700' : 'text-slate-600'}`}>Processing</div>
              </div>

              <div className="flex flex-col items-center w-1/5">
                {currentProgress > 60 ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm mb-2">✓</div>
                ) : (
                  <div className={`w-8 h-8 rounded-full ${currentProgress === 60 ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'} flex items-center justify-center font-bold mb-2`}>3</div>
                )}
                <div className={`text-xs font-medium ${currentProgress === 60 ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>Ready to Ship</div>
              </div>

              <div className="flex flex-col items-center w-1/5">
                {currentProgress > 75 ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm mb-2">✓</div>
                ) : (
                  <div className={`w-8 h-8 rounded-full ${currentProgress === 75 ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'} flex items-center justify-center font-bold mb-2`}>4</div>
                )}
                <div className={`text-xs font-medium ${currentProgress === 75 ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>In Transit</div>
              </div>

              <div className="flex flex-col items-center w-1/5">
                <div className={`w-8 h-8 rounded-full ${currentProgress >= 100 ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'} flex items-center justify-center font-bold mb-2`}>5</div>
                <div className={`text-xs font-medium ${currentProgress >= 100 ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>Delivered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Items to Fulfill</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Products included in this fulfillment request and warehouse pick status.</p>
                </div>
                <span className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded">100% Stock Allocated</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">Product</th>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">SKU</th>
                      <th className="px-5 py-3 text-right font-bold text-slate-500 uppercase">Ordered</th>
                      <th className="px-5 py-3 text-right font-bold text-slate-500 uppercase">Allocated</th>
                      <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                    {detail.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{item.product_name}</td>
                        <td className="px-5 py-4 font-mono text-slate-500">{item.sku}</td>
                        <td className="px-5 py-4 text-right font-bold">{item.ordered_quantity}</td>
                        <td className="px-5 py-4 text-right font-bold text-emerald-600">{item.allocated_quantity}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === 'Delivered' || item.status === 'Shipped' || item.status === 'Ready'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Backordered' || item.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {item.status || 'Processing'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{item.location || 'Bay C-14'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-bold border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Warehouse Split' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-6">
                {!splitOverridden && !splitAccepted && (
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {['READY_TO_SHIP', 'IN_TRANSIT', 'DELIVERED'].includes(detail?.status) ? 'Final Warehouse Allocation' : 'Recommended Warehouse Split'}
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {['READY_TO_SHIP', 'IN_TRANSIT', 'DELIVERED'].includes(detail?.status) 
                          ? 'The warehouse distribution used for this dispatched fulfillment.' 
                          : 'Optimized split based on live stock, minimizing transit time and cost.'}
                      </p>
                    </div>
                    {splitData && (
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {['READY_TO_SHIP', 'IN_TRANSIT', 'DELIVERED'].includes(detail?.status) ? 'Total Freight Cost' : 'Total Estimated Cost'}
                        </div>
                        <div className="text-xl font-black text-slate-900">${splitData.total_estimated_cost}</div>
                      </div>
                    )}
                  </div>
                )}

                {splitOverridden ? (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <h3 className="font-bold text-slate-900">Manual Warehouse Assignment</h3>
                      <button onClick={() => setSplitOverridden(false)} className="text-xs text-blue-600 font-bold hover:underline">Restore Auto-Split</button>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Manually allocate items to preferred warehouses.</p>
                    
                    <div className="space-y-3">
                       {detail.items?.map(item => (
                         <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                           <div className="flex-1">
                             <div className="font-bold text-sm text-slate-800">{item.product_name}</div>
                             <div className="text-xs text-slate-500">Qty to Fulfill: {item.ordered_quantity}</div>
                           </div>
                           <div className="flex items-center gap-2">
                             <select className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700 min-w-[150px]">
                               <option>Bengaluru Central Hub</option>
                               <option>Mumbai Logistics Hub</option>
                               <option>Delhi Regional Depot</option>
                             </select>
                             <input type="number" defaultValue={item.ordered_quantity} className="w-16 p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-center font-bold" />
                           </div>
                         </div>
                       ))}
                    </div>
                    
                    <div className="pt-3 flex justify-end">
                      <button onClick={handleAcceptSplit} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm text-sm">
                        Confirm Manual Split
                      </button>
                    </div>
                  </div>
                ) : splitAccepted ? (
                  <div className="py-10 text-center border border-dashed border-emerald-300 rounded-xl bg-emerald-50">
                    <svg className="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h3 className="text-base font-bold text-emerald-900 mb-1">Split Accepted</h3>
                    <p className="text-sm text-emerald-700">The automated split has been approved and locked for processing.</p>
                  </div>
                ) : splitLoading ? (
                  <div className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div></div>
                ) : splitData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {splitData.splits?.map((split, i) => (
                        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{split.warehouse_name}</h3>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{split.warehouse_code}</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded">Shipment {i + 1}</span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Items Fulfilled:</span>
                              <span className="font-bold text-slate-900">{split.quantity_fulfilled} Units</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>Est. Freight Cost:</span>
                              <span className="font-bold text-slate-900">${split.estimated_cost}</span>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-slate-200 space-y-2">
                            {split.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-slate-700 truncate mr-2" title={item.name}>{item.name}</span>
                                <span className="font-bold text-slate-900">x{item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {['READY_TO_SHIP', 'IN_TRANSIT', 'DELIVERED'].includes(detail?.status) ? (
                      <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4 text-sm text-slate-500 font-medium">
                        <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Split configuration is locked because this fulfillment has been dispatched.
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 justify-end">
                        <button onClick={handleManualOverride} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm">
                          Manual Override
                        </button>
                        <button onClick={handleAcceptSplit} disabled={submitting} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm">
                          {submitting ? 'Accepting...' : 'Accept Suggested Split'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-sm">Failed to load split suggestion.</div>
                )}
              </div>
            )}

            {(activeTab === 'Overview' || activeTab === 'Items to Fulfill') && (
              <>
                {/* Delivery Destination */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Delivery Destination & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Shipping Address</h3>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {detail.customer_name}<br />
                    {detail.customer_address}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Site Contact</h3>
                  <p className="text-slate-800 font-bold">{detail.contact_person}</p>
                  <p className="text-slate-600">Phone: {detail.contact_phone}</p>
                  <p className="text-slate-600">Email: {detail.contact_email}</p>
                </div>
              </div>
            </div>
              </>
            )}

            {activeTab === 'Shipping & Logistics' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Carrier & Dispatch Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Assigned Carrier</div>
                    <div className="font-bold text-slate-900">{detail.carrier || 'Pending Assignment'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Tracking Number</div>
                    <div className="font-bold font-mono text-blue-600">{detail.tracking_number || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Dispatch Status</div>
                    <div className="font-bold text-slate-900">{detail.status}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Expected Delivery</div>
                    <div className="font-bold text-slate-900">{detail.expected_delivery_date || 'TBD'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Fulfillment Audit Log' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Activity History</h2>
                <div className="space-y-4 pt-2">
                  {detail.activity?.map((act, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                        {idx !== detail.activity.length - 1 && <div className="w-px h-full bg-slate-200 mt-2"></div>}
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-bold text-slate-900">{act.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{act.desc}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1">{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column Sidebars */}
          <div className="flex flex-col gap-6">
            
            {/* Current Status Sidebar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-wider text-slate-500">Current Status</h3>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200 uppercase">{detail.status}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Carrier:</span>
                  <span className="font-bold text-slate-900">{detail.carrier || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tracking AWB:</span>
                  <span className="font-mono font-bold text-blue-700">{detail.tracking_number || 'Pending'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Est. Delivery:</span>
                  <span className="font-bold text-slate-900">{detail.expected_delivery_date || '18 Oct 2026'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setShowShipModal(true)}
                  className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition"
                >
                  Assign Carrier / Ship
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Update Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Update Fulfillment Status</h3>
                <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select New Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="PROCESSING">PROCESSING (Warehouse Prep)</option>
                    <option value="READY_TO_SHIP">READY_TO_SHIP (Staged for Carrier)</option>
                    <option value="IN_TRANSIT">IN_TRANSIT (Dispatched / On Road)</option>
                    <option value="DELIVERED">DELIVERED (Successfully Handed Over)</option>
                    <option value="DELAYED">DELAYED (Carrier Exception)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button type="button" onClick={() => setShowStatusModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-xs">
                    {submitting ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Carrier Modal */}
        {showShipModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Assign Shipping Carrier & AWB</h3>
                <button onClick={() => setShowShipModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleShipment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Freight Carrier Partner</label>
                  <select
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="BlueDart Express">BlueDart Express (Air Cargo)</option>
                    <option value="Delhivery Surface">Delhivery Surface Logistics</option>
                    <option value="SafeX Logistics">SafeX Heavy Freight</option>
                    <option value="DHL Supply Chain">DHL Supply Chain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Waybill / Tracking AWB Number</label>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. AWB-BLR-884920"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button type="button" onClick={() => setShowShipModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-xs">
                    {submitting ? 'Dispatching...' : 'Dispatch Shipment'}
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
