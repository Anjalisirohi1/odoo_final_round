export default function ActivityFeed() {
  return (
    <section className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between" data-purpose="recent-activity-feed">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <p className="text-xs text-slate-500">Live transaction stream & audit logs</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            Real-time
          </span>
        </div>
        
        {/* Activity Items */}
        <div className="mt-4 space-y-4">
          {/* Item 1 */}
          <div className="relative flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50/80 transition group">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Acme Corp quotation approved by Finance</p>
                <span className="text-[11px] text-slate-400">12m ago</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                Deal #QF-8942 ($184,500) • Cleared by CFO Sarah Jenkins
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  Ready for Customer E-Sign
                </span>
                <a className="text-[11px] font-semibold text-brand-600 hover:underline" href="#">View Spec</a>
              </div>
            </div>
          </div>
          
          {/* Item 2 */}
          <div className="relative flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/20 p-3.5 hover:bg-amber-50/40 transition group">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Beta Industries requested a discount change</p>
                <span className="text-[11px] text-slate-400">45m ago</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                Deal #QF-8930 ($92,000) • Requesting 18% tier override
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                  Requires VP Sales Review
                </span>
                <a className="text-[11px] font-semibold text-amber-800 hover:underline" href="#">Open Gate</a>
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="relative flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50/80 transition group">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-brand-700 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">East Depot stock updated for Order #2291</p>
                <span className="text-[11px] text-slate-400">2h ago</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                Inventory reserved • Warehouse East-2 • SKU-5840 allocated
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                  ERP Inventory Synced
                </span>
              </div>
            </div>
          </div>

          {/* Item 4 */}
          <div className="relative flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50/80 transition group">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Global Logistics executed Contract #QF-8890</p>
                <span className="text-[11px] text-slate-400">4h ago</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                $310,000 ARR • Multi-year master service agreement signed via portal
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
                  Contract Locked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-5 pt-3 border-t border-slate-100 text-center">
        <a className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition" href="#">
          View Complete System Audit Log →
        </a>
      </div>
    </section>
  );
}
