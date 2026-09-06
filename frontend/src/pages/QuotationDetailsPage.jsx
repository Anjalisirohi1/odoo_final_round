import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import apiFetch from '../utils/api';

export default function QuotationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id === 'Q-1042') {
        setLoading(false);
        setError("This is a wireframe mock ID. You need to open a real quotation from the dashboard!");
        return;
      }
      try {
        const res = await apiFetch(`/api/quotations/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        } else {
          setError("Failed to fetch quotation details");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching details.");
      }

      try {
        const evalRes = await apiFetch(`/api/quotations/${id}/evaluate`);
        if (evalRes.ok) {
          const evalJson = await evalRes.json();
          setEvaluation(evalJson.data);
        }
      } catch (evalErr) {
        console.warn("Evaluation fetch warning:", evalErr);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!id || id === 'Q-1042') {
      alert("This is a wireframe mock ID. You need to open a real quotation from the dashboard!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/quotations/${id}/submit`, {
        method: 'POST'
      });
      const resJson = await res.json();
      if (res.ok) {
        const newStatus = resJson.data?.status;
        if (newStatus === 'APPROVED') {
          alert("✅ Quotation Auto-Approved! Discounts are within allowed thresholds.");
        } else {
          alert("⚠️ Quotation Submitted for Approval! Discount threshold exceeded.");
        }
        navigate('/quotations');
      } else {
        alert("Failed to submit: " + (resJson.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting.");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f3f7fd] font-sans text-slate-800 antialiased">
        <DashboardHeader activeTab="quotations" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f3f7fd] font-sans text-slate-800 antialiased">
        <DashboardHeader activeTab="quotations" />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
            <svg className="w-12 h-12 text-rose-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Could Not Load Quotation</h2>
            <p className="text-sm text-slate-500 mb-6">{error || 'Quotation not found'}</p>
            <button onClick={() => navigate('/quotations')} className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition">Back to Pipeline</button>
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  const { quotation, items } = data;

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f7fd] font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      <DashboardHeader activeTab="quotations" />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* BEGIN: BreadcrumbAndTitleHeader */}
        <section className="space-y-2">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="hover:text-slate-800 transition cursor-pointer">DealFlow360</span>
            <span>/</span>
            <span className="hover:text-slate-800 transition cursor-pointer">Operations</span>
            <span>/</span>
            <span className="hover:text-slate-800 transition cursor-pointer" onClick={() => navigate('/quotations')}>Quotations</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{quotation.quotation_number}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Quotation Detail: {quotation.quotation_number} ({quotation.customer_name})
                </h1>
                {quotation.status === 'PENDING_APPROVAL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending Approval
                  </span>
                )}
                {quotation.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
                    Approved
                  </span>
                )}
                {quotation.status === 'DRAFT' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 shadow-sm">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Configure products, apply discounts, and check live margin governance.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => navigate('/quotations')} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Pipeline
              </button>
            </div>
          </div>
        </section>

        {/* Customer & Price List Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Customer / Account</label>
              <span 
                onClick={() => navigate(`/customers/${quotation.customer_id || 'CUST-1000'}/billing`)}
                className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
              >
                View CRM Record ↗
              </span>
            </div>
            <div className="relative">
              <input readOnly className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 focus:bg-white transition" type="text" value={quotation.customer_name}/>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Tier ID: <strong className="text-slate-700">{quotation.tier_id}</strong></span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Price List &amp; Rate Schedule</label>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active Governance</span>
            </div>
            <div className="relative">
              <input readOnly className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 focus:bg-white transition" type="text" value={`Price List ID: ${quotation.price_list_id}`}/>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Created At: <strong className="text-slate-700">{new Date(quotation.created_at).toLocaleString()}</strong></span>
            </div>
          </div>
        </section>

        {/* Line Items Table */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">Quotation Line Items (CPQ)</h2>
              <p className="text-xs text-slate-500">Configure quantities, unit pricing, and line-level discount thresholds.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[260px]">Product / Service Description</th>
                  <th className="py-3 px-4 text-center w-24">Qty</th>
                  <th className="py-3 px-4 text-right w-32">Unit Price</th>
                  <th className="py-3 px-4 text-center w-36">Discount Applied</th>
                  <th className="py-3 px-4 text-right w-36">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.product_name || `Product ID: ${item.product_id}`}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-300 rounded px-2.5 py-1">
                        <span className="font-semibold text-slate-800 text-xs">{item.discount_percent}%</span>
                        <span className="text-[10px] text-slate-400">(-{formatCurrency(item.discount_amount)})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">
                      No items found for this quotation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Table Bottom Controls & Financial Rollup */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div></div>
            <div className="flex flex-wrap items-center justify-end gap-6 text-right">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subtotal (List)</div>
                <div className="text-sm font-semibold text-slate-700">{formatCurrency(quotation.subtotal)}</div>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Discounts</div>
                <div className="text-sm font-semibold text-rose-600">-{formatCurrency(quotation.discount_amount)}</div>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <div className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">Net Quote Total</div>
                <div className="text-xl font-black text-slate-900">{formatCurrency(quotation.total_amount)}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Action Toolbar */}
        <section className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {quotation.status === 'DRAFT' && evaluation && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                {evaluation.approval_required ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Requires {(evaluation?.approval_level || 'Manager').replace(/_/g, ' ')} Approval (Risk Score: {evaluation.risk_score || 0})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Discounts Within Allowed Thresholds • Eligible for Instant Auto-Approval
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3.5 w-full sm:w-auto">
            {quotation.status === 'DRAFT' && (
              <button 
                disabled={submitting} 
                onClick={handleSubmit} 
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                  evaluation && !evaluation.approval_required 
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/30' 
                    : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-brand-600/30'
                }`}
              >
                <span>
                  {submitting 
                    ? 'Processing Auto-Route...' 
                    : (evaluation && !evaluation.approval_required ? '⚡ Submit & Auto-Approve' : 'Submit for Approval')}
                </span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            )}
          </div>
        </section>
      </main>
      <DashboardFooter />
    </div>
  );
}
