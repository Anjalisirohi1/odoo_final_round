import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanCard from './KanbanCard';
import apiFetch from '../../utils/api';

const VISIBLE_LIMIT = 2;

function KanbanColumn({ title, quotes, dotColor, badgeBg, badgeText, badgeBorder, columnExtra, cardOverrides, sumTotal, getCardAction }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const visibleQuotes = expanded ? quotes : quotes.slice(0, VISIBLE_LIMIT);
  const hiddenCount = quotes.length - VISIBLE_LIMIT;

  return (
    <div className={`flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3 ${columnExtra || ''}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColor}`}></span>
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <span className={`${badgeBg} ${badgeText} text-xs font-bold px-2 py-0.5 rounded-full border ${badgeBorder}`}>{quotes.length}</span>
        </div>
        <span className="text-xs font-bold text-slate-500">₹{sumTotal.toLocaleString()}</span>
      </div>
      <div className="flex flex-col gap-3">
        {visibleQuotes.map(q => {
          const actionConfig = getCardAction ? getCardAction(q, navigate) : (cardOverrides?.action || null);

          return (
            <KanbanCard
              key={q.id}
              onClick={() => navigate(`/quotations/${q.id}`)}
              id={q.quotation_number}
              amount={`₹${Number(q.total_amount).toLocaleString()}`}
              client={q.customer_name || 'Unknown Customer'}
              desc={`Created on ${new Date(q.created_at).toLocaleDateString()}`}
              owner={{
                initials: q.sales_rep_name ? q.sales_rep_name.substring(0, 2).toUpperCase() : 'SR',
                name: q.sales_rep_name || 'Sales Rep',
                color: 'bg-blue-100 text-blue-700'
              }}
              time={new Date(q.created_at).toLocaleDateString()}
              status={{ label: q.status.replace('_', ' '), color: 'text-slate-600', dot: 'bg-slate-400' }}
              {...cardOverrides}
              action={actionConfig}
            />
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50/50 transition-all duration-200"
        >
          {expanded ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              Show Less
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              View {hiddenCount} More
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function KanbanBoard({ quotations = [] }) {
  const navigate = useNavigate();
  const draftQuotes = quotations.filter(q => q.status === 'DRAFT');
  const pendingQuotes = quotations.filter(q => q.status === 'PENDING_APPROVAL');
  const approvedQuotes = quotations.filter(q => q.status === 'APPROVED');
  const negotiationQuotes = quotations.filter(q => q.status === 'NEGOTIATION' || q.status === 'NEGOTIATING');
  const confirmedQuotes = quotations.filter(q => q.status === 'CONFIRMED' || q.status === 'ACCEPTED' || q.status === 'ORDER_CREATED');

  const sumTotal = (quotes) => quotes.reduce((sum, q) => sum + Number(q.total_amount), 0);

  const handleSendToCustomer = async (quote) => {
    try {
      const res = await apiFetch(`/api/quotations/${quote.id}/send`, { method: 'POST' });
      if (res.ok) {
        alert(`Quotation ${quote.quotation_number} sent to Customer Portal!`);
        window.location.reload();
      } else {
        alert('Failed to send quotation to customer.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while sending quotation.');
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0" data-purpose="pipeline-board">

      {/* 1. Draft Column */}
      <KanbanColumn
        title="Draft"
        quotes={draftQuotes}
        dotColor="bg-slate-400"
        badgeBg="bg-slate-100"
        badgeText="text-slate-600"
        badgeBorder="border-slate-200"
        sumTotal={sumTotal(draftQuotes)}
        cardOverrides={{ status: { label: 'Draft in progress', color: 'text-brand-600', dot: 'bg-brand-500' } }}
        getCardAction={(q) => ({
          label: 'View / Edit Quote',
          type: 'outline',
          onClick: () => navigate(`/quotations/${q.id}`)
        })}
      />

      {/* 2. Pending Approval Column */}
      <KanbanColumn
        title="Pending Approval"
        quotes={pendingQuotes}
        dotColor="bg-amber-500"
        badgeBg="bg-amber-100"
        badgeText="text-amber-800"
        badgeBorder="border-amber-200"
        columnExtra="rounded-xl bg-amber-50/30 border border-amber-100/50 p-2 -m-2"
        sumTotal={sumTotal(pendingQuotes)}
        cardOverrides={{
          amountStyle: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
          timeColor: 'text-rose-600 font-bold',
          isHighlighted: true
        }}
        getCardAction={(q) => ({
          label: 'Review Gate & Sign',
          type: 'primary-amber',
          onClick: () => navigate('/approvals')
        })}
      />

      {/* 3. Approved Column */}
      <KanbanColumn
        title="Approved"
        quotes={approvedQuotes}
        dotColor="bg-emerald-500"
        badgeBg="bg-emerald-50"
        badgeText="text-emerald-700"
        badgeBorder="border-emerald-200"
        sumTotal={sumTotal(approvedQuotes)}
        cardOverrides={{
          timeColor: 'text-brand-600 font-bold'
        }}
        getCardAction={(q) => ({
          label: 'Send to Customer',
          type: 'dark',
          onClick: () => handleSendToCustomer(q)
        })}
      />

      {/* 4. Negotiation Column */}
      <KanbanColumn
        title="Negotiation"
        quotes={negotiationQuotes}
        dotColor="bg-purple-500"
        badgeBg="bg-purple-50"
        badgeText="text-purple-700"
        badgeBorder="border-purple-200"
        sumTotal={sumTotal(negotiationQuotes)}
        cardOverrides={{
          timeColor: 'text-slate-400'
        }}
        getCardAction={(q) => ({
          label: 'Track Portal Session',
          type: 'outline',
          onClick: () => navigate('/portal')
        })}
      />

      {/* 5. Confirmed Column */}
      <KanbanColumn
        title="Confirmed"
        quotes={confirmedQuotes}
        dotColor="bg-brand-500"
        badgeBg="bg-brand-50"
        badgeText="text-brand-700"
        badgeBorder="border-brand-200"
        sumTotal={sumTotal(confirmedQuotes)}
        cardOverrides={{
          amountStyle: 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold',
          timeColor: 'text-slate-400'
        }}
        getCardAction={(q) => ({
          label: '✓ Handover to Fulfillment',
          type: 'success',
          onClick: () => navigate('/fulfillment')
        })}
      />

    </div>
  );
}
