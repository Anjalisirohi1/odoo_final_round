export default function ActiveDealsTable() {
  return (
    <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_12px_0_rgba(15,23,42,0.04),0_1px_2px_0_rgba(15,23,42,0.02)]" data-purpose="active-deals-snapshot">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Active Deals Snapshot</h3>
          <p className="text-xs text-slate-500">Quotes pending conversion, review or e-signature</p>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">All (12)</button>
          <button className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900">Approvals (4)</button>
          <button className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900">At-Risk (3)</button>
        </div>
      </div>

      {/* Table element */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-2.5 pl-1">Client / Account</th>
              <th className="py-2.5 px-3">Owner</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Lifecycle Stage</th>
              <th className="py-2.5 px-3">Deal Health</th>
              <th className="py-2.5 pr-1 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* Deal 1 */}
            <tr className="hover:bg-slate-50/80 transition">
              <td className="py-3 pl-1">
                <div className="font-bold text-slate-900">Acme Corporation</div>
                <div className="text-[11px] text-slate-400">#QF-8942 • Cloud Modernization</div>
              </td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">MR</span>
                  <span>M. Ramos</span>
                </span>
              </td>
              <td className="py-3 px-3 font-semibold text-slate-900">$184,500</td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Approved by Finance
                </span>
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-emerald-700">96 / 100</span>
                </div>
              </td>
              <td className="py-3 pr-1 text-right">
                <a className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-50 transition" href="#">
                  Send Quote
                </a>
              </td>
            </tr>
            {/* Deal 2 */}
            <tr className="hover:bg-slate-50/80 transition">
              <td className="py-3 pl-1">
                <div className="font-bold text-slate-900">Beta Industries</div>
                <div className="text-[11px] text-slate-400">#QF-8930 • Hardware Infrastructure</div>
              </td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">AV</span>
                  <span>A. Vance</span>
                </span>
              </td>
              <td className="py-3 px-3 font-semibold text-slate-900">$92,000</td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                  Discount Revision
                </span>
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="font-bold text-amber-700">64 / 100</span>
                </div>
              </td>
              <td className="py-3 pr-1 text-right">
                <a className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-700 transition" href="#">
                  Review Gate
                </a>
              </td>
            </tr>
            {/* Deal 3 */}
            <tr className="hover:bg-slate-50/80 transition">
              <td className="py-3 pl-1">
                <div className="font-bold text-slate-900">Titan Logistics Co.</div>
                <div className="text-[11px] text-slate-400">#QF-8912 • Enterprise Telemetry</div>
              </td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">SK</span>
                  <span>S. Kim</span>
                </span>
              </td>
              <td className="py-3 px-3 font-semibold text-slate-900">$425,000</td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                  Margin Warning
                </span>
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                  <span className="font-bold text-rose-700">42 / 100</span>
                </div>
              </td>
              <td className="py-3 pr-1 text-right">
                <a className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition" href="#">
                  Fix Margin
                </a>
              </td>
            </tr>
            {/* Deal 4 */}
            <tr className="hover:bg-slate-50/80 transition">
              <td className="py-3 pl-1">
                <div className="font-bold text-slate-900">Zenith Financial Group</div>
                <div className="text-[11px] text-slate-400">#QF-8901 • Security Bundle V2</div>
              </td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">DR</span>
                  <span>D. Ross</span>
                </span>
              </td>
              <td className="py-3 px-3 font-semibold text-slate-900">$215,000</td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Customer Reviewing
                </span>
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-emerald-700">91 / 100</span>
                </div>
              </td>
              <td className="py-3 pr-1 text-right">
                <a className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition" href="#">
                  Track Portal
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Bottom Summary */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-2">
        <span>Showing 4 of 12 active quotation pipelines</span>
        <div className="flex items-center gap-2">
          <a className="font-semibold text-brand-600 hover:text-brand-800" href="#">
            Go to Quotation Management System →
          </a>
        </div>
      </div>
    </section>
  );
}
