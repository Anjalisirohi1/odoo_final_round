export default function QuotationsFilterBar({
  selectedOwner = 'ALL',
  setSelectedOwner,
  ownersList = [],
  selectedDealValue = 'ALL',
  setSelectedDealValue,
  quickFilter = 'ALL',
  setQuickFilter,
  onExportCSV
}) {
  return (
    <section className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm" data-purpose="filter-bar">
      <div className="flex flex-wrap items-center gap-2">
        {/* Owner Dropdown */}
        <div className="relative">
          <select 
            value={selectedOwner}
            onChange={(e) => setSelectedOwner && setSelectedOwner(e.target.value)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Owners (Any)</option>
            {ownersList.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Deal Value Dropdown */}
        <div className="relative">
          <select 
            value={selectedDealValue}
            onChange={(e) => setSelectedDealValue && setSelectedDealValue(e.target.value)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">Deal Value: All</option>
            <option value="UNDER_50K">Under ₹50,000</option>
            <option value="50K_200K">₹50,000 - ₹200,000</option>
            <option value="ABOVE_200K">Above ₹200,000</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Filter:</span>
        <button 
          onClick={() => setQuickFilter && setQuickFilter(quickFilter === 'MY_QUOTES' ? 'ALL' : 'MY_QUOTES')}
          className={`rounded px-2.5 py-1 text-xs font-semibold border transition ${
            quickFilter === 'MY_QUOTES'
              ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
              : 'bg-blue-50 text-brand-600 border-blue-200 hover:bg-blue-100'
          }`}
        >
          My Quotes
        </button>
        <button 
          onClick={() => setQuickFilter && setQuickFilter(quickFilter === 'HIGH_MARGIN' ? 'ALL' : 'HIGH_MARGIN')}
          className={`rounded px-2.5 py-1 text-xs font-semibold border transition ${
            quickFilter === 'HIGH_MARGIN'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          High Margin
        </button>
        {quickFilter !== 'ALL' && (
          <button 
            onClick={() => setQuickFilter && setQuickFilter('ALL')}
            className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Clear Filters
          </button>
        )}
        <button 
          onClick={onExportCSV}
          className="flex items-center gap-1.5 rounded bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 ml-2 hover:bg-slate-50 hover:text-slate-900 transition active:scale-[0.98]"
          title="Export CSV File"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>
    </section>
  );
}
