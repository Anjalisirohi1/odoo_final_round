export default function CustomerPortalPage() {
  return (
    <div className="bg-slate-50/70 text-slate-800 font-sans min-h-screen flex flex-col antialiased">
      {/* BEGIN: CustomerPortalHeader */}
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Context Badge */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-blue-500 text-white shadow-md shadow-brand-500/25">
                  <svg className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                  </svg>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  DealFlow<span className="text-brand-600">360</span>
                </span>
              </div>
              <span className="hidden md:inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600 border border-slate-200">
                Client Portal
              </span>
            </div>
            
            {/* Navigation Tabs */}
            <nav aria-label="Portal Navigation" className="hidden md:flex items-center space-x-1 sm:space-x-2">
              <a className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-bold text-brand-700 bg-white shadow-sm ring-1 ring-slate-200/80 transition" href="#">
                My Quotation
              </a>
              <a className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition" href="#">
                <span>Messages</span>
                <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">2</span>
              </a>
              <a className="inline-flex items-center rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition" href="#">
                Profile
              </a>
            </nav>

            {/* User Company & Security Badge */}
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-semibold text-slate-800 leading-tight">Acme Corp Global</div>
                <div className="text-[11px] text-slate-500">Customer Account</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200">
                AC
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* END: CustomerPortalHeader */}

      {/* BEGIN: MainContent */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* BEGIN: TitleAndMetaSection */}
        <section aria-labelledby="page-title" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 tracking-wide uppercase">
              <span>Quote Ref: Q-1042</span>
              <span className="text-slate-400">•</span>
              <span>Acme Corp</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">Valid until Nov 30, 2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1" id="page-title">
              Customer Portal Negotiation Screen
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Customer reviews and negotiates the quote directly, no email needed
            </p>
          </div>
          {/* Live Sync / Sales Contact Info */}
          <div className="flex items-center space-x-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-900">Sales Lead:</span> Marcus Vance (Online)
            </div>
          </div>
        </section>
        {/* END: TitleAndMetaSection */}

        {/* BEGIN: StatusBadgeSection */}
        <section aria-label="Quote Status Banner">
          <div className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-2.5 rounded-xl shadow-sm border border-amber-600">
            <svg aria-hidden="true" className="w-5 h-5 text-amber-100 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-bold tracking-wide text-sm sm:text-base">
              Status: Under Negotiation
            </span>
            <span className="text-amber-100 text-xs pl-2 border-l border-amber-400/40 hidden sm:inline">
              Active revision in progress
            </span>
          </div>
        </section>
        {/* END: StatusBadgeSection */}

        {/* BEGIN: ItemizedNegotiationTableSection */}
        <section aria-labelledby="table-title" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900" id="table-title">Line Items &amp; Customer Comments</h2>
              <p className="text-xs text-slate-500">Review specified lines, enter inline requests, and submit counter proposals.</p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-md">2 Line Items Targeted</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="negotiation-lines-table">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-700 tracking-wider">
                  <th className="py-3 px-6 w-1/3" scope="col">Line / Product Description</th>
                  <th className="py-3 px-4 w-1/6" scope="col">Original Price</th>
                  <th className="py-3 px-4 w-1/6" scope="col">Current Discount</th>
                  <th className="py-3 px-6 w-2/5" scope="col">Customer Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {/* Line Item 1 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 align-top">
                    <div className="font-semibold text-slate-900">Extended Warranty</div>
                    <div className="text-xs text-slate-500 mt-0.5">3-Year Enterprise Hardware Replacement SLA (24/7 Support)</div>
                    <div className="mt-2 inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Item #HW-EW-3Y
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top text-slate-700 font-medium">
                    $1,200.00
                  </td>
                  <td className="py-4 px-4 align-top">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                      10% Applied
                    </span>
                    <div className="text-xs text-slate-500 mt-1">($1,080.00 Net)</div>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-slate-800 shadow-sm relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path clipRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" fillRule="evenodd"></path>
                          </svg>
                          <span>Acme Procurement Request:</span>
                        </span>
                        <span className="text-[11px] text-slate-500">Today, 10:14 AM</span>
                      </div>
                      <p className="font-medium text-slate-900 text-sm">
                        Can this be 15% off instead of 10%?
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Target rate aligns with our regional volume purchase bracket.
                      </p>
                    </div>
                  </td>
                </tr>
                {/* Line Item 2 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 align-top">
                    <div className="font-semibold text-slate-900">Onsite Setup</div>
                    <div className="text-xs text-slate-500 mt-0.5">Rack deployment, network config &amp; certification by Field Engineers</div>
                    <div className="mt-2 inline-flex items-center text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Item #SV-ONS-SET
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top text-slate-700 font-medium">
                    $1,500.00
                  </td>
                  <td className="py-4 px-4 align-top">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                      0% (Standard)
                    </span>
                    <div className="text-xs text-slate-500 mt-1">($1,500.00 Net)</div>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-blue-900 flex items-center space-x-1">
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path clipRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" fillRule="evenodd"></path>
                          </svg>
                          <span>Acme IT Operations:</span>
                        </span>
                        <span className="text-[11px] text-slate-500">Today, 10:22 AM</span>
                      </div>
                      <p className="font-medium text-slate-900 text-sm">
                        Can we push this to next month?
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Server room facility renovations are scheduled through end of current month.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Table Summary Footer */}
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Current Revised Total: <strong className="text-slate-900 font-semibold">$2,580.00 USD</strong> (Subject to counter approvals)</span>
            </div>
            <div className="text-slate-500 text-xs">
              Terms: Net 30 • Freight Prepaid
            </div>
          </div>
        </section>
        {/* END: ItemizedNegotiationTableSection */}

        {/* BEGIN: CounterOfferControlsSection */}
        <section aria-labelledby="negotiation-parameters" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 mb-1" id="negotiation-parameters">
            Negotiation Parameters &amp; Counter Terms
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            Specify your overall preferred counter rate and target delivery milestone for vendor consideration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Counter Discount % Input */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-slate-800 flex items-center justify-between" htmlFor="counter-discount-input">
                <span>Counter Discount %</span>
                <span className="text-xs font-normal text-slate-500">Proposed concession</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input aria-describedby="discount-hint" className="block w-full rounded-xl border-slate-300 py-3 pl-4 pr-12 text-slate-900 font-medium placeholder-slate-400 focus:border-brand-600 focus:ring-brand-600 sm:text-base border shadow-sm transition-colors" id="counter-discount-input" max="50" min="0" name="counter-discount" placeholder="e.g. 15" step="0.5" type="number" defaultValue="15" />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-slate-500 font-semibold sm:text-base">%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500" id="discount-hint">
                Applying 15% counter request to warranty &amp; qualifying software services.
              </p>
            </div>
            {/* Requested Delivery Date Input */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-slate-800 flex items-center justify-between" htmlFor="delivery-date-input">
                <span>Requested Delivery Date</span>
                <span className="text-xs font-normal text-slate-500">Milestone target</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input aria-describedby="date-hint" className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 font-medium focus:border-brand-600 focus:ring-brand-600 sm:text-base border shadow-sm transition-colors" id="delivery-date-input" name="requested-delivery-date" type="date" defaultValue="2025-12-15" />
              </div>
              <p className="text-xs text-slate-500" id="date-hint">
                Pushed to next month as requested for facility setup window.
              </p>
            </div>
          </div>
          {/* Customer Additional Negotiation Note */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2" htmlFor="negotiation-message">
              Accompanying Note to Account Executive
            </label>
            <textarea className="block w-full rounded-xl border-slate-300 py-2.5 px-3.5 text-sm text-slate-800 focus:border-brand-600 focus:ring-brand-600 border shadow-sm" id="negotiation-message" placeholder="Add any extra clarifications, PO requirement notes, or approval timeline restrictions..." rows="2" defaultValue="We are ready to execute contract immediately upon agreement on the 15% warranty rate and December onsite window."></textarea>
          </div>
        </section>
        {/* END: CounterOfferControlsSection */}

        {/* BEGIN: ActionButtonsSection */}
        <section aria-label="Quote Actions" className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-start gap-3.5 pt-2">
          {/* Submit Request Button */}
          <button className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-slate-300 rounded-xl text-sm sm:text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 shadow-sm transition-all" type="button">
            <svg aria-hidden="true" className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            Submit Request
          </button>
          {/* Confirm Quotation Button */}
          <button className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-xl text-sm sm:text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-md transition-all tracking-wide" type="button">
            <svg aria-hidden="true" className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Confirm Quotation
          </button>
          {/* Tertiary Support Link */}
          <button className="sm:ml-auto inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none" type="button">
            <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            Need clarification? Request Sales Call
          </button>
        </section>
        {/* END: ActionButtonsSection */}

        {/* BEGIN: GovernanceAlertBanner */}
        <section aria-label="Governance and Approval Rules Notice" className="bg-amber-50/90 border-2 border-amber-300/80 rounded-xl p-4 sm:p-5 shadow-sm text-amber-950">
          <div className="flex items-start space-x-3.5">
            <div className="flex-shrink-0 mt-0.5">
              <svg aria-hidden="true" className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path>
              </svg>
            </div>
            <div className="flex-1 text-sm font-medium">
              <span className="font-bold text-amber-900">Governance Notice:</span>
              <span> If final terms exceed thresholds, the quote automatically re-enters approval (Screen 6).</span>
              <p className="text-xs text-amber-800/85 mt-1">
                Standard sales discretion allows up to 12% warranty adjustments. The requested 15% discount will be routed to Regional Finance for swift 2-hour turnaround.
              </p>
            </div>
          </div>
        </section>
        {/* END: GovernanceAlertBanner */}

      </main>
      {/* END: MainContent */}

      {/* BEGIN: EnterprisePortalFooter */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">DealFlow360™ Customer Gateway</span>
            <span>•</span>
            <span>Quote ID #Q-1042-REV3</span>
            <span>•</span>
            <span className="inline-flex items-center text-emerald-600">
              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" fillRule="evenodd"></path>
              </svg>
              256-Bit Encrypted Portal
            </span>
          </div>
          <div className="flex items-center space-x-6 text-slate-500">
            <a className="hover:text-slate-800 transition-colors" href="#">Portal Terms</a>
            <a className="hover:text-slate-800 transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-slate-800 transition-colors" href="#">Support Center</a>
            <span>© 2025 DealFlow360 Inc.</span>
          </div>
        </div>
      </footer>
      {/* END: EnterprisePortalFooter */}
    </div>
  );
}
