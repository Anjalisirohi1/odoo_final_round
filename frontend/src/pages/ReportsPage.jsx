import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';

export default function ReportsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      <DashboardHeader activeTab="reports" />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <span>DealFlow360</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span className="text-slate-900 font-semibold">Admin Reporting</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-900">Executive & Admin Reporting</h1>
            <p className="text-xs text-slate-500 mt-1">Cross-functional revenue analytics, discount compliance, and deal pipeline performance.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 shadow-xs">Export Executive Summary</button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase">ARR Recognized</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹4.82 Cr</div>
            <span className="text-[11px] text-emerald-600 font-semibold">↑ +18.4% vs last Qtr</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg Discount Rate</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">11.2%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">✓ Within 15% threshold</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase">Approval SLA (Avg)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">3.4 Hours</div>
            <span className="text-[11px] text-blue-600 font-semibold">⚡ Fast turn-around</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase">Win Rate</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">68.5%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">↑ +4.2% YoY</span>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Regional & Product Performance Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Region / Business Unit</th>
                  <th className="py-3 px-4">Total Quotes</th>
                  <th className="py-3 px-4">Approved Volume</th>
                  <th className="py-3 px-4">Avg Discount</th>
                  <th className="py-3 px-4 text-right">Revenue Converted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">North America Enterprise</td>
                  <td className="py-3.5 px-4">42</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">₹2.10 Cr</td>
                  <td className="py-3.5 px-4">9.8%</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">₹1.85 Cr</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">APAC Tech & Cloud</td>
                  <td className="py-3.5 px-4">38</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">₹1.65 Cr</td>
                  <td className="py-3.5 px-4">12.4%</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">₹1.42 Cr</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">EMEA Government & BFSI</td>
                  <td className="py-3.5 px-4">24</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">₹1.20 Cr</td>
                  <td className="py-3.5 px-4">11.5%</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">₹1.05 Cr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
