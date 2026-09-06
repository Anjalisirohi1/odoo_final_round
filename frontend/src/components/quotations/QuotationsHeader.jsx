export default function QuotationsHeader({ onOpenModal, totalQuotes = 0, viewMode = 'pipeline', setViewMode }) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2" data-purpose="quotations-heading">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
          <span>DealFlow360</span>
          <span className="text-slate-300">/</span>
          <span>Operations</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">Quotations</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Quotations
          </h1>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            {totalQuotes} Active Quotes
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Every quotation in the system, one row per quotation, click a row to open it • Manage CPQ pipeline stages, approvals, and e-signatures.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* View Toggle */}
        <div className="flex items-center rounded-lg bg-white p-1 border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode && setViewMode('pipeline')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              viewMode === 'pipeline' 
                ? 'bg-brand-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
            </svg>
            Pipeline
          </button>
          <button 
            onClick={() => setViewMode && setViewMode('table')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition ${
              viewMode === 'table' 
                ? 'bg-brand-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
            </svg>
            Table View
          </button>
        </div>

        {/* Action Button */}
        <button 
          onClick={onOpenModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 transition"
        >
          <svg className="h-4 w-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          New Quotation
        </button>
      </div>
    </section>
  );
}
