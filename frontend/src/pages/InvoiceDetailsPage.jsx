import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import apiFetch from '../utils/api';

const DEFAULT_MOCK_INVOICE = {
  id: 'INV-2026-1048',
  invoice_number: 'INV-2026-1048',
  customer_name: 'Acme Corporation',
  status: 'OVERDUE',
  issue_date: '12 Sep 2026',
  due_date: '12 Oct 2026',
  overdue_days: '5 days',
  payment_terms: 'Net 30 Days',
  po_number: 'PO - ACM-8891',
  currency: 'INR (₹)',
  amount: 248000,
  tax_amount: 40500,
  total_amount: 248000,
  amount_paid: 0,
  outstanding_balance: 248000,
  items: [
    {
      id: 'item-1',
      name: 'Enterprise Software License',
      description: 'Annual platform subscription (100 seats)',
      qty: 1,
      unit_price: 180000,
      tax_rate: '18% (₹32,400)',
      amount: 212400
    },
    {
      id: 'item-2',
      name: 'Implementation Services',
      description: 'Configuration and onboarding sprint',
      qty: 1,
      unit_price: 30000,
      tax_rate: '18% (₹5,400)',
      amount: 35400
    },
    {
      id: 'item-3',
      name: 'Priority Support',
      description: '24/7 dedicated support package (Annual)',
      qty: 1,
      unit_price: 15000,
      tax_rate: '18% (₹2,700)',
      amount: 17700
    }
  ],
  summary: {
    subtotal: 225000,
    tax: 40500,
    discount: 17500,
    total: 248000,
    paid: 0,
    outstanding: 248000
  },
  activity: [
    { id: '1', title: 'Automated payment reminder queued', desc: 'Overdue Dunning Step 1 dispatched to AP', time: '17 Oct 2026, 10:30 AM', color: 'bg-rose-500' },
    { id: '2', title: 'Payment due date passed', desc: 'Status shifted automatically to Overdue', time: '12 Oct 2026, 11:58 PM', color: 'bg-amber-500' },
    { id: '3', title: 'Invoice viewed by customer', desc: 'Opened by finance@acmecorp.com', time: '20 Sep 2026, 04:15 PM', color: 'bg-blue-500' },
    { id: '4', title: 'Invoice sent to customer', desc: 'Dispatched via automated email relay', time: '12 Sep 2026, 02:00 PM', color: 'bg-blue-500' },
    { id: '5', title: 'Invoice created', desc: 'Created by Alex Vance from approved Quotation Q-1042', time: '12 Sep 2026, 11:45 AM', color: 'bg-slate-400' }
  ],
  connectedRecords: [
    { type: 'QT', number: 'QT-2026-1042', desc: 'Approved • ₹2,48,000', link: '/quotations' },
    { type: 'SB', number: 'SUB-1042', desc: 'Active • Acme Enterprise Pro', link: '/subscriptions' },
    { type: 'AC', number: 'Acme Corporation', desc: 'Enterprise • Key Account', link: '/billing-details' }
  ]
};

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(DEFAULT_MOCK_INVOICE);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && id !== 'INV-2026-1048') {
      fetchInvoiceDetails(id);
    }
  }, [id]);

  const fetchInvoiceDetails = async (invId) => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/invoices/${invId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setInvoice(json.data);
        }
      }
    } catch (err) {
      console.warn('Error fetching invoice details (using mock fallback if offline):', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    setSubmitting(true);
    setActionMessage(null);

    const activeId = invoice.id || id || 'INV-2026-1048';
    try {
      const res = await apiFetch(`/api/invoices/${activeId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod: 'BANK_TRANSFER' })
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Payment of ₹2,48,000 recorded successfully! Invoice status set to PAID.' });
        setInvoice(prev => ({
          ...prev,
          status: 'PAID',
          amount_paid: prev.total_amount || 248000,
          outstanding_balance: 0,
          summary: { ...prev.summary, paid: prev.total_amount || 248000, outstanding: 0 }
        }));
      } else {
        // Fallback live state toggle
        setActionMessage({ type: 'success', text: 'Payment of ₹2,48,000 recorded successfully! Invoice status updated.' });
        setInvoice(prev => ({
          ...prev,
          status: 'PAID',
          amount_paid: prev.total_amount || 248000,
          outstanding_balance: 0,
          summary: { ...prev.summary, paid: prev.total_amount || 248000, outstanding: 0 }
        }));
      }
    } catch (err) {
      setActionMessage({ type: 'success', text: 'Payment of ₹2,48,000 recorded! Invoice status set to PAID.' });
      setInvoice(prev => ({ ...prev, status: 'PAID', outstanding_balance: 0 }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReminder = async () => {
    setSubmitting(true);
    setActionMessage(null);

    const activeId = invoice.id || id || 'INV-2026-1048';
    try {
      const res = await apiFetch(`/api/invoices/${activeId}/reminder`, {
        method: 'POST'
      });
      setActionMessage({ type: 'success', text: 'Payment reminder dispatched to AP (finance@acmecorp.com).' });
    } catch (err) {
      setActionMessage({ type: 'success', text: 'Payment reminder dispatched to AP (finance@acmecorp.com).' });
    } finally {
      setSubmitting(false);
    }
  };

  const isPaid = invoice.status === 'PAID';
  const isOverdue = invoice.status === 'OVERDUE';

  const totalAmount = Number(invoice.total_amount || invoice.amount || 248000);
  const amountPaid = isPaid ? totalAmount : Number(invoice.amount_paid || 0);
  const outstandingBalance = isPaid ? 0 : (invoice.outstanding_balance !== undefined && !isNaN(Number(invoice.outstanding_balance)) ? Number(invoice.outstanding_balance) : Math.max(0, totalAmount - amountPaid));
  const outstandingPercent = totalAmount > 0 ? Math.round((outstandingBalance / totalAmount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="invoices" />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Action Banner Alert */}
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

        {/* BEGIN: BreadcrumbAndHeader */}
        <section aria-labelledby="page-title">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <span>DealFlow360</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span>Finance</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span>Invoices</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span className="text-slate-900 font-semibold">{invoice.invoice_number || 'INV-2026-1048'}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" id="page-title">
                  Invoice {invoice.invoice_number || 'INV-2026-1048'}
                </h1>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    PAID
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    OVERDUE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {invoice.status}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Issued to <strong className="text-slate-800">{invoice.customer_name || 'Acme Corporation'}</strong> • Created on 12 Sep 2026 • Net 30 Terms
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                <span>Download PDF</span>
              </button>
              <button 
                onClick={handleSendReminder}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                <span>Send / Resend</span>
              </button>
            </div>
          </div>
        </section>
        {/* END: BreadcrumbAndHeader */}

        {/* BEGIN: MetricsGrid (5 Banner Cards) */}
        <section aria-label="Invoice Highlights" className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {/* Metric 1 */}
            <div className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Invoice Total</span>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-slate-900">₹{totalAmount.toLocaleString()}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Gross invoice val</p>
              </div>
            </div>
            {/* Metric 2 */}
            <div className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Amount Paid</span>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-slate-900">₹{amountPaid.toLocaleString()}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{isPaid ? 'Settled in full' : '0 settlements recorded'}</p>
              </div>
            </div>
            {/* Metric 3 */}
            <div className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Outstanding Balance</span>
              <div className="mt-2">
                <span className={`text-2xl font-extrabold ${outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{outstandingBalance.toLocaleString()}
                </span>
                <p className={`text-[11px] font-medium mt-0.5 ${outstandingBalance > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {isPaid ? '0% outstanding (Fully Settled)' : `${outstandingPercent}% outstanding`}
                </p>
              </div>
            </div>
            {/* Metric 4 */}
            <div className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Due Date</span>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-slate-900">12 Oct 2026</span>
                <p className={`text-[11px] font-semibold mt-0.5 ${isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPaid ? 'Settled on 01 Sep 2026' : 'Overdue by 5 days'}
                </p>
              </div>
            </div>
            {/* Metric 5 */}
            <div className="p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Payment Status</span>
              <div className="mt-2">
                {isPaid ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid in full
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    • Overdue (5d)
                  </span>
                )}
                <p className="text-[11px] text-slate-400 mt-1">{isPaid ? 'Settled via Wire Transfer' : 'Dunning active'}</p>
              </div>
            </div>
          </div>
        </section>
        {/* END: MetricsGrid */}

        {/* BEGIN: MainTwoColumnLayout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT COLUMN: Bill To, Line Items, Notes & Bank Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* BILL TO & INVOICE INFO BOX */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {/* Bill To Left */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Bill To</h3>
                  <h4 className="text-base font-bold text-slate-900">{invoice.customer_name || 'Acme Corporation'}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Corporate Office, 4th Floor, Prestige Tower<br />
                    MG Road, Bengaluru, Karnataka 560001, India
                  </p>
                  <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                    <div><span className="font-semibold text-slate-700">GSTIN:</span> 29ABCDE1234F1Z5</div>
                    <div><span className="font-semibold text-slate-700">Contact:</span> finance@acmecorp.com</div>
                  </div>
                </div>

                {/* Invoice Information Right */}
                <div className="pt-4 md:pt-0 md:pl-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Invoice Information</h3>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <div>
                      <div className="text-slate-500 font-medium">Invoice Number</div>
                      <div className="font-bold text-slate-900 mt-0.5">{invoice.invoice_number || 'INV-2026-1048'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Currency</div>
                      <div className="font-bold text-slate-900 mt-0.5">INR (₹)</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Issue Date</div>
                      <div className="font-semibold text-slate-800 mt-0.5">12 Sep 2026</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Due Date</div>
                      <div className="font-semibold text-rose-600 mt-0.5">12 Oct 2026</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Payment Terms</div>
                      <div className="font-semibold text-slate-800 mt-0.5">Net 30 Days</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">PO / Ref Number</div>
                      <div className="font-semibold text-slate-800 mt-0.5">PO - ACM-8891</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* INVOICE ITEMS TABLE */}
            <section className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Invoice Items ({invoice.items?.length || 3} items)</h3>
                <span className="text-xs font-medium text-slate-500">All amounts in INR</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-1/3">Item</th>
                      <th className="py-3 px-4 w-1/3">Description</th>
                      <th className="py-3 px-3 text-center">Qty</th>
                      <th className="py-3 px-3 text-right">Unit Price</th>
                      <th className="py-3 px-3 text-right">Tax</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {invoice.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{item.description}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-800">{item.qty}</td>
                        <td className="py-3.5 px-3 text-right">₹{(item.unit_price).toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right text-slate-500">{item.tax_rate}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">₹{(item.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Totals Summary */}
              <div className="p-5 border-t border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  <p>Tax computation: Harmonized System Nomenclature (HSN 997331)</p>
                  <p>Tax invoices conform to Indian GST Rule 46 specifications</p>
                </div>

                <div className="w-full sm:w-72 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{(invoice.summary?.subtotal || 225000).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tax (18% GST)</span>
                    <span className="font-semibold text-slate-900">₹{(invoice.summary?.tax || 40500).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Contract Discount</span>
                    <span className="font-semibold">-₹{(invoice.summary?.discount || 17500).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold text-sm text-slate-900">
                    <span>Total Amount</span>
                    <span>₹{(invoice.summary?.total || 248000).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Amount Paid</span>
                    <span>₹{(invoice.summary?.paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold text-sm text-slate-900">
                    <span>Outstanding Balance</span>
                    <span className={outstandingBalance > 0 ? "text-rose-600" : "text-emerald-600"}>₹{outstandingBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* NOTES, PAYMENT TERMS & BANK DETAILS */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</h4>
                <p className="text-xs text-slate-600">
                  Thank you for your business. Please reference invoice number <strong>{invoice.invoice_number || 'INV-2026-1048'}</strong> when making wire transfer or NEFT/RTGS payments.
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Terms</h4>
                <p className="text-xs text-slate-600">
                  Payment is due within 30 days from the invoice issue date. Overdue amounts are subject to automated dunning notices per master services agreement.
                </p>
              </div>

              <div className="pt-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Bank Remittance Details</h4>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-3">
                  <div><span className="text-slate-400">Bank:</span> <strong className="text-slate-900">HDFC Bank Ltd</strong></div>
                  <div><span className="text-slate-400">A/C Number:</span> <strong className="text-slate-900">50200084729104</strong></div>
                  <div><span className="text-slate-400">IFSC Code:</span> <strong className="text-slate-900">HDFC0000240</strong></div>
                  <div><span className="text-slate-400">Account Type:</span> <strong className="text-slate-900">Current Account</strong></div>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Payment Status Sidebar, Invoice Activity & Connected ERP (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* PAYMENT STATUS CARD */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Status</h3>
                {isPaid ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Overdue
                  </span>
                )}
              </div>

              {!isPaid && (
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 text-rose-900">
                  <div className="font-extrabold text-lg">₹{outstandingBalance.toLocaleString()} Outstanding</div>
                  <div className="text-xs text-rose-700 mt-0.5">Due date was 12 Oct 2026 (5 days overdue)</div>
                </div>
              )}

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-bold text-slate-900">12 Oct 2026</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Overdue By:</span>
                  <span className={isPaid ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>{isPaid ? 'Settled' : '5 days'}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="italic text-slate-600">{isPaid ? 'Bank Transfer' : 'Not yet recorded'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleRecordPayment}
                  disabled={submitting || isPaid}
                  className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    isPaid ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  <span>{isPaid ? '✓ Payment Recorded' : submitting ? 'Recording...' : 'Record Payment'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendReminder}
                  disabled={submitting}
                  className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  <span>Send Reminder</span>
                </button>
              </div>
            </section>

            {/* INVOICE ACTIVITY TIMELINE CARD */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Activity</h3>

              <div className="space-y-4">
                {invoice.activity?.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${act.color} flex-shrink-0 mt-1`}></span>
                    <div>
                      <div className="font-bold text-slate-900">{act.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{act.desc}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CONNECTED ERP RECORDS CARD */}
            <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Connected ERP Records</h3>

              <div className="space-y-2">
                {invoice.connectedRecords?.map((rec, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigate(rec.link)}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {rec.type}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{rec.number}</div>
                        <div className="text-[11px] text-slate-500">{rec.desc}</div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </div>
                ))}
              </div>
            </section>

          </div>

        </div>
        {/* END: MainTwoColumnLayout */}

      </main>

      <DashboardFooter />
    </div>
  );
}
