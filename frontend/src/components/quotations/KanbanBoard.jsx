import { useState, useEffect } from 'react';
import KanbanCard from './KanbanCard';

export default function KanbanBoard({ refreshTrigger }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quotations to see real data
  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('dealflow_token');
      const res = await fetch('http://localhost:5000/api/quotations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [refreshTrigger]);

  const draftQuotes = quotations.filter(q => q.status === 'DRAFT');
  const pendingQuotes = quotations.filter(q => q.status === 'PENDING_APPROVAL');
  const approvedQuotes = quotations.filter(q => q.status === 'APPROVED');
  const negotiationQuotes = quotations.filter(q => q.status === 'NEGOTIATION');
  const confirmedQuotes = quotations.filter(q => q.status === 'CONFIRMED');

  const sumTotal = (quotes) => quotes.reduce((sum, q) => sum + Number(q.total_amount), 0);

  const renderCard = (q, overrides = {}) => (
    <KanbanCard 
      key={q.id}
      id={q.quotation_number}
      amount={`₹${Number(q.total_amount).toLocaleString()}`}
      client={q.customer_name || 'Unknown Customer'}
      desc={`Created on ${new Date(q.created_at).toLocaleDateString()}`}
      owner={{ initials: q.sales_rep_name ? q.sales_rep_name.substring(0, 2).toUpperCase() : 'SR', name: q.sales_rep_name || 'Sales Rep', color: "bg-blue-100 text-blue-700" }}
      time={new Date(q.created_at).toLocaleDateString()}
      status={{ label: q.status.replace('_', ' '), color: "text-slate-600", dot: "bg-slate-400" }}
      {...overrides}
    />
  );

  if (loading) {
    return <div className="p-4 text-slate-500">Loading pipeline...</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0" data-purpose="pipeline-board">
      
      {/* Draft Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <h3 className="font-bold text-slate-900 text-sm">Draft</h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">{draftQuotes.length}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">₹{sumTotal(draftQuotes).toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-3">
          {draftQuotes.map(q => renderCard(q, {
            status: { label: "Draft in progress", color: "text-brand-600", dot: "bg-brand-500" }
          }))}
        </div>
      </div>

      {/* Pending Approval Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3 rounded-xl bg-amber-50/30 border border-amber-100/50 p-2 -m-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Pending Approval</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">{pendingQuotes.length}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">₹{sumTotal(pendingQuotes).toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-3">
          {pendingQuotes.map(q => renderCard(q, {
            amountStyle: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
            timeColor: "text-rose-600 font-bold",
            action: { label: "Review Gate & Sign", type: "primary-amber" },
            isHighlighted: true
          }))}
        </div>
      </div>

      {/* Approved Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Approved</h3>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">{approvedQuotes.length}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">₹{sumTotal(approvedQuotes).toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-3">
          {approvedQuotes.map(q => renderCard(q, {
            timeColor: "text-brand-600 font-bold",
            action: { label: "Send to Customer", type: "dark" }
          }))}
        </div>
      </div>

      {/* Negotiation Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Negotiation</h3>
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full border border-purple-200">{negotiationQuotes.length}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">₹{sumTotal(negotiationQuotes).toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-3">
          {negotiationQuotes.map(q => renderCard(q, {
            timeColor: "text-slate-400",
            action: { label: "Track Portal Session", type: "outline" }
          }))}
        </div>
      </div>

      {/* Confirmed Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Confirmed</h3>
            <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full border border-brand-200">{confirmedQuotes.length}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">₹{sumTotal(confirmedQuotes).toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-3">
          {confirmedQuotes.map(q => renderCard(q, {
            amountStyle: "text-emerald-700 bg-emerald-50 border-emerald-200 font-bold",
            timeColor: "text-slate-400",
            action: { label: "✓ Handover to Fulfillment", type: "success" }
          }))}
        </div>
      </div>
    </div>
  );
}
