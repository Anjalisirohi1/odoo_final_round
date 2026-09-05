export default function AuthFeatures() {
  return (
    <section className="lg:col-span-6 flex flex-col justify-between space-y-6 text-left order-2 lg:order-1" data-purpose="product-highlights">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4 shadow-sm">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
          </svg>
          Unified Deal &amp; Quote Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Accelerate every quote from pipeline to signature.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          The single workspace connecting internal enterprise sales teams and B2B customers for rapid CPQ, live deal revisions, and instant margin approvals.
        </p>
      </div>

      <div className="bg-white/80 rounded-2xl p-5 border border-slate-200/90 space-y-4 shadow-sm backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intelligent Landing Destinations</div>
        
        <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-xs">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Sales Dashboard</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Internal Users</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Multi-deal velocity, gross margin controls, quote approvals, and team CRM sync.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-xs">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Quotation Portal</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Customer Accounts</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Review customized itemized quotes, download purchase specs, and e-sign contracts.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-base font-bold text-slate-900">99.99%</div>
          <div className="text-[10px] text-slate-500 font-medium">SLA Uptime</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-base font-bold text-slate-900">SOC-2 Type II</div>
          <div className="text-[10px] text-slate-500 font-medium">Certified</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-base font-bold text-slate-900">SAML 2.0</div>
          <div className="text-[10px] text-slate-500 font-medium">Okta / Azure</div>
        </div>
      </div>
    </section>
  );
}
