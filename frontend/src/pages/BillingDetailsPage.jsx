import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import { 
  Building2, Edit, ExternalLink, ShieldCheck, Clock, FileText, 
  CreditCard, CheckCircle2, AlertCircle, Bell, ArrowRight, X, Check
} from 'lucide-react';
import apiFetch from '../utils/api';

export default function BillingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Billing Details');
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    billing_address: '',
    gstin: '',
    pan: ''
  });
  
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [configureForm, setConfigureForm] = useState({
    generation_mode: 'Automatic (Scheduled on 1st of every month)',
    grace_period: '7 Days after due date',
    late_reminders: 'Enabled (3-step dunning workflow)',
    reminder_schedule: '3 days before due date, on due date, 3 days after',
    credit_limit: 10000000
  });

  const [isSaving, setIsSaving] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);

  const fetchBillingDetails = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/customers/billing-details${id ? `?id=${id}` : ''}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
          setEditForm({
            company_name: result.data.customer?.company_name || 'Acme Corporation',
            contact_name: result.data.billing_info?.contact_name || 'Rahul Sharma (Head of Finance)',
            email: result.data.billing_info?.email || 'accounts@acmecorp.com',
            phone: result.data.billing_info?.phone || '+91 98765 43210',
            billing_address: result.data.billing_info?.billing_address || 'Acme Corporation, 4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka - 560001, India',
            gstin: result.data.billing_info?.gstin || '29ABCDE1234F1Z5',
            pan: result.data.billing_info?.pan || 'ABCDE1234F'
          });
          setConfigureForm({
            generation_mode: result.data.billing_settings?.generation_mode || 'Automatic (Scheduled on 1st of every month)',
            grace_period: result.data.billing_settings?.grace_period || '7 Days after due date',
            late_reminders: result.data.billing_settings?.late_reminders || 'Enabled (3-step dunning workflow)',
            reminder_schedule: result.data.billing_settings?.reminder_schedule || '3 days before due date, on due date, 3 days after',
            credit_limit: result.data.billing_settings?.credit_limit || 10000000
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch billing details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfigure = (e) => {
    e.preventDefault();
    setData(prev => ({
      ...prev,
      billing_settings: {
        ...prev?.billing_settings,
        generation_mode: configureForm.generation_mode,
        grace_period: configureForm.grace_period,
        late_reminders: configureForm.late_reminders,
        reminder_schedule: configureForm.reminder_schedule,
        credit_limit: Number(configureForm.credit_limit) || 10000000
      }
    }));
    setIsConfigureModalOpen(false);
    alert('Billing settings & automation configuration updated successfully!');
  };

  useEffect(() => {
    fetchBillingDetails();
  }, [id]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await apiFetch(`/api/customers/${data?.customer?.id || id || 'default'}/billing`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        alert('Billing details updated successfully!');
        setIsEditModalOpen(false);
        fetchBillingDetails();
      } else {
        alert('Failed to update billing details');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating billing details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReminder = async () => {
    setReminderSending(true);
    try {
      const response = await apiFetch('/api/customers/send-reminder', {
        method: 'POST',
        body: JSON.stringify({
          customerId: data?.customer?.id,
          invoiceId: data?.payment_status?.latest_invoice || 'INV-2026-1048'
        })
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Payment reminder sent successfully!');
      } else {
        alert(result.message || 'Failed to send payment reminder');
      }
    } catch (error) {
      console.error(error);
      alert('Network error sending payment reminder.');
    } finally {
      setReminderSending(false);
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

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <DashboardHeader activeTab="billing" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">Loading Billing Details...</p>
          </div>
        </div>
        <DashboardFooter />
      </div>
    );
  }

  const cust = data?.customer;
  const billingInfo = data?.billing_info;
  const payPref = data?.payment_preferences;
  const taxComp = data?.tax_compliance;
  const billSet = data?.billing_settings;
  const billSum = data?.billing_summary;
  const payStat = data?.payment_status;
  const invoices = data?.recent_invoices || [];
  const activity = data?.recent_activity || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      <DashboardHeader activeTab="billing" />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/dashboard" className="hover:text-blue-600">DealFlow360</Link>
          <span className="text-slate-300">/</span>
          <span className="hover:text-blue-600">Customers</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-700">{cust?.company_name || 'Acme Corporation'}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">Billing Details</span>
        </nav>

        {/* Page Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Billing Details</h1>
            <p className="text-slate-500 text-sm mt-1">Manage billing information, payment preferences, tax details, and invoice settings.</p>
          </div>

          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit Billing Details
          </button>
        </div>

        {/* Customer Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold text-xl shadow-xs border border-blue-200/50">
                {cust?.company_name?.substring(0, 2).toUpperCase() || 'AC'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{cust?.company_name || 'Acme Corporation'}</h2>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {cust?.code || 'CUST-1042'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {cust?.customer_type || 'Enterprise Customer'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Account
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
                  <span>Billing Status: <strong className="text-emerald-600 font-semibold">{cust?.billing_status || 'Active'}</strong></span>
                  <span>•</span>
                  <span>Primary Currency: <strong className="text-slate-800 font-semibold">{cust?.primary_currency || 'INR (₹)'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:items-end justify-center border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Billed YTD</span>
              <span className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(cust?.total_billed_ytd || 1248000)}</span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="border-t border-slate-200/80 px-6 flex gap-6">
            {['Overview', 'Invoices', 'Billing Details'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Overview') navigate('/');
                  if (tab === 'Invoices') navigate('/invoices');
                }}
                className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600 font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Billing Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  <h3 className="text-base font-bold text-slate-900">Billing Information</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Billing Entity</span>
                  <span className="font-semibold text-slate-800">{billingInfo?.entity_name || 'Acme Corporation Private Limited'}</span>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Billing Contact</span>
                  <span className="font-semibold text-slate-800">{billingInfo?.contact_name || 'Rahul Sharma (Head of Finance)'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Email Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{billingInfo?.email || 'accounts@acmecorp.com'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Phone Number</span>
                  <span className="font-semibold text-slate-800">{billingInfo?.phone || '+91 98765 43210'}</span>
                </div>

                <div className="md:col-span-2 pt-1 border-t border-slate-50">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Billing Address</span>
                  <span className="font-medium text-slate-700 leading-relaxed block">{billingInfo?.billing_address || 'Acme Corporation, 4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka - 560001, India'}</span>
                </div>

                <div className="pt-1 border-t border-slate-50">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">GSTIN</span>
                  <span className="font-bold text-slate-900 tracking-wide font-mono text-xs">{billingInfo?.gstin || '29ABCDE1234F1Z5'}</span>
                </div>

                <div className="pt-1 border-t border-slate-50">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">PAN Number</span>
                  <span className="font-bold text-slate-900 tracking-wide font-mono text-xs">{billingInfo?.pan || 'ABCDE1234F'}</span>
                </div>
              </div>
            </div>

            {/* 2. Payment Preferences Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <h3 className="text-base font-bold text-slate-900">Payment Preferences</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Preferred Payment Method</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-slate-800">{payPref?.preferred_method || 'Bank Transfer (ACH / NEFT / RTGS)'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Payment Terms</span>
                  <span className="font-semibold text-slate-800">{payPref?.payment_terms || 'Net 30 Days'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Billing Currency</span>
                  <span className="font-semibold text-slate-800">{payPref?.billing_currency || 'INR (₹) - Indian Rupee'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Auto-Debit / Auto-Payment</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-semibold text-slate-800">{payPref?.auto_debit || 'Disabled (Manual Wire Remittance)'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Invoice Delivery Method</span>
                  <span className="font-semibold text-slate-800">{payPref?.invoice_delivery || 'Email (Automated PDF dispatch to AP team)'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Billing Frequency</span>
                  <span className="font-semibold text-slate-800">{payPref?.billing_frequency || 'Monthly Cycle (In Advance)'}</span>
                </div>
              </div>
            </div>

            {/* 3. Tax & Compliance Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Tax & Compliance</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {taxComp?.compliance_badge || 'GST Rule 46 Compliant'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Tax Region & State Code</span>
                  <span className="font-semibold text-slate-800">{taxComp?.tax_region || 'India (Karnataka State - Code 29)'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">GST Treatment</span>
                  <span className="font-semibold text-slate-800">{taxComp?.gst_treatment || 'Standard B2B Supply'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Applicable GST Rate</span>
                  <span className="font-semibold text-slate-800">{taxComp?.gst_rate || '18% (CGST 9% + SGST 9% intra-state)'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">GSTIN Status</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{billingInfo?.gstin || '29ABCDE1234F1Z5'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified on GSTN</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Reverse Charge Mechanism (RCM)</span>
                  <span className="font-semibold text-slate-800">{taxComp?.rcm || 'No (Forward Charge by Supplier)'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Tax Exemption / SEZ Unit</span>
                  <span className="font-semibold text-slate-800">{taxComp?.tax_exemption || 'Not Applicable (Full taxable supply)'}</span>
                </div>
              </div>
            </div>

            {/* 4. Billing Settings & Automation Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <h3 className="text-base font-bold text-slate-900">Billing Settings & Automation</h3>
                </div>
                <button 
                  onClick={() => setIsConfigureModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Configure
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Invoice Generation Mode</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-800">{billSet?.generation_mode || 'Automatic (Scheduled on 1st of every month)'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Grace Period</span>
                  <span className="font-semibold text-slate-800">{billSet?.grace_period || '7 Days after due date'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Late Payment Reminders</span>
                  <span className="font-semibold text-slate-800">{billSet?.late_reminders || 'Enabled (3-step dunning workflow)'}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Reminder Schedule</span>
                  <span className="font-semibold text-slate-800">{billSet?.reminder_schedule || '3 days before due date, on due date, 3 days after'}</span>
                </div>

                {/* Progress bar for credit limit */}
                <div className="md:col-span-2 pt-2">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">Commercial Credit Limit</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(billSet?.credit_utilized || 248000)} / {formatCurrency(billSet?.credit_limit || 10000000)} 
                      <span className="text-slate-400 font-normal ml-1">(24.8% utilized)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '24.8%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Recent Invoices Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
                <Link to="/invoices" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline">
                  View All Invoices <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Invoice</th>
                      <th className="px-5 py-3">Issue Date</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3">Due Date</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-bold text-blue-600 hover:underline">
                          <Link to={`/invoices/${inv.id}`}>{inv.id}</Link>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{inv.issue_date}</td>
                        <td className="px-5 py-4 font-bold text-slate-900 text-right">{formatCurrency(inv.amount)}</td>
                        <td className="px-5 py-4 text-rose-600 font-medium">{inv.due_date}</td>
                        <td className="px-5 py-4 text-center">
                          {inv.status_color === 'red' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              • {inv.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              • {inv.status}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link 
                            to={`/invoices/${inv.id}`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Sidebar (1/3) */}
          <div className="space-y-6">
            
            {/* 1. Billing Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Billing Summary</h3>
                <span className="text-xs font-medium text-slate-400">Current Terms</span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-400 block">Current Subscription</span>
                  <span className="font-bold text-slate-900 text-base">{billSum?.current_subscription || 'Enterprise Pro'}</span>
                  <span className="text-xs text-slate-500 block">{billSum?.subscription_detail || 'Annual tier billed monthly'}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span className="text-xs font-medium text-slate-500">Billing Cycle</span>
                  <span className="font-semibold text-slate-800">{billSum?.billing_cycle || 'Monthly'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500">Next Billing Date</span>
                  <span className="font-semibold text-slate-800">{billSum?.next_billing_date || '01 Nov 2026'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500">Monthly Commitment</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(billSum?.monthly_commitment || 48000)}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Outstanding Balance</span>
                    <span className="text-[11px] text-rose-500 font-semibold block">Immediate settlement required</span>
                  </div>
                  <span className="text-xl font-bold text-rose-600">{formatCurrency(billSum?.outstanding_balance || 248000)}</span>
                </div>
              </div>
            </div>

            {/* 2. Payment Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Payment Status</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  • Overdue
                </span>
              </div>

              {/* Red callout box */}
              <div className="bg-rose-50/70 border border-rose-200/80 p-4 rounded-xl space-y-1">
                <span className="text-lg font-bold text-rose-700 block">
                  {formatCurrency(payStat?.outstanding_amount || 248000)} Outstanding
                </span>
                <span className="text-xs text-rose-600 font-medium block">
                  {payStat?.due_date_text || 'Due date was 12 Oct 2026 (5 days overdue)'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Latest Invoice:</span>
                  <span className="font-bold text-slate-800">{payStat?.latest_invoice || 'INV-2026-1048'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-semibold text-slate-800">{payStat?.due_date || '12 Oct 2026'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Days Outstanding:</span>
                  <span className="font-bold text-rose-600">{payStat?.days_outstanding || '5 days'}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-600">{payStat?.payment_method || 'Not yet recorded'}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  to={`/invoices/${payStat?.latest_invoice || 'INV-2026-1048'}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Invoice
                </Link>

                <button
                  onClick={handleSendReminder}
                  disabled={reminderSending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  <Bell className="w-4 h-4 text-slate-500" />
                  {reminderSending ? 'Sending Reminder...' : 'Send Payment Reminder'}
                </button>
              </div>
            </div>

            {/* 3. Recent Activity (Automated Audit Log) Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                <span className="text-xs font-medium text-slate-400">Automated Audit Log</span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activity.map(item => (
                  <div key={item.id} className="relative pl-6 space-y-0.5">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                      item.type === 'red' ? 'bg-rose-500' :
                      item.type === 'amber' ? 'bg-amber-500' :
                      item.type === 'blue' ? 'bg-blue-500' : 'bg-slate-400'
                    }`}></div>
                    
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    <span className="text-[10px] text-slate-400 font-medium block pt-0.5">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Edit Billing Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-6 animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Edit Billing Details</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Billing Entity</label>
                  <input 
                    type="text" 
                    value={editForm.company_name}
                    onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Billing Contact Name</label>
                  <input 
                    type="text" 
                    value={editForm.contact_name}
                    onChange={e => setEditForm({ ...editForm, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Billing Address</label>
                  <textarea 
                    rows="2"
                    value={editForm.billing_address}
                    onChange={e => setEditForm({ ...editForm, billing_address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN</label>
                  <input 
                    type="text" 
                    value={editForm.gstin}
                    onChange={e => setEditForm({ ...editForm, gstin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number</label>
                  <input 
                    type="text" 
                    value={editForm.pan}
                    onChange={e => setEditForm({ ...editForm, pan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Billing & Automation Modal */}
      {isConfigureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Configure Billing & Automation</h3>
              </div>
              <button 
                onClick={() => setIsConfigureModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfigure} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Generation Mode</label>
                <select 
                  value={configureForm.generation_mode}
                  onChange={e => setConfigureForm({ ...configureForm, generation_mode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                >
                  <option value="Automatic (Scheduled on 1st of every month)">Automatic (Scheduled on 1st of every month)</option>
                  <option value="Manual Invoice Generation">Manual Invoice Generation</option>
                  <option value="Semi-Automatic (Approval required)">Semi-Automatic (Approval required)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grace Period</label>
                  <select 
                    value={configureForm.grace_period}
                    onChange={e => setConfigureForm({ ...configureForm, grace_period: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                  >
                    <option value="3 Days after due date">3 Days after due date</option>
                    <option value="7 Days after due date">7 Days after due date</option>
                    <option value="14 Days after due date">14 Days after due date</option>
                    <option value="30 Days after due date">30 Days after due date</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Late Payment Reminders</label>
                  <select 
                    value={configureForm.late_reminders}
                    onChange={e => setConfigureForm({ ...configureForm, late_reminders: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                  >
                    <option value="Enabled (3-step dunning workflow)">Enabled (3-step dunning workflow)</option>
                    <option value="Enabled (Standard reminder)">Enabled (Standard reminder)</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reminder Schedule</label>
                <input 
                  type="text"
                  value={configureForm.reminder_schedule}
                  onChange={e => setConfigureForm({ ...configureForm, reminder_schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Credit Limit (₹)</label>
                <input 
                  type="number"
                  value={configureForm.credit_limit}
                  onChange={e => setConfigureForm({ ...configureForm, credit_limit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsConfigureModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Configuration
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
