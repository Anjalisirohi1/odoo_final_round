export default function CalloutBanner() {
  return (
    <section className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-4 text-xs shadow-xs" data-purpose="role-routing-notice">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </div>
        <p className="text-slate-700 leading-relaxed">
          <strong className="text-amber-900 font-semibold">Role-Based Routing Note:</strong> Internal enterprise team members operate on this 
          <span className="font-semibold text-slate-900"> Sales Dashboard</span>. Verified external buyers and clients automatically load directly into the 
          <span className="font-semibold text-brand-700"> DealFlow360 Quotation Portal</span> for self-service spec adjustments, margin reviews, and legally binding e-signatures.
        </p>
      </div>
    </section>
  );
}
