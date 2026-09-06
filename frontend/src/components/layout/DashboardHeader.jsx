import { getUserRole, getCurrentUser, clearSession } from '../../utils/auth';

export default function DashboardHeader({ activeTab = 'dashboard' }) {
  const role = getUserRole() || 'SALES_REP';
  const user = getCurrentUser();

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  // Define screen permissions per role according to matrix
  const isSales = role === 'SALES_REP' || role === 'SALES_MANAGER';
  const isManager = role === 'SALES_MANAGER';
  const isFinance = role === 'FINANCE';
  const isAdmin = role === 'ADMIN';
  const isCustomer = role === 'CUSTOMER';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top utility row */}
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a className="flex items-center gap-2.5 focus:outline-none rounded-lg py-1" href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-blue-500 text-white shadow-md shadow-brand-500/25">
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              DealFlow<span className="text-brand-600">360</span>
            </span>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
              {role}
            </span>
          </a>


        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-3.5">
          {/* Live System Status Badge */}
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SSO & RBAC Online</span>
          </div>

          <div className="h-5 w-px bg-slate-200"></div>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs border border-brand-200">
              {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="hidden text-left md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user.fullName || 'Enterprise User'}</div>
              <div className="text-[11px] text-slate-500 font-medium">{role} Access</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
              title="Log Out of Session"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar (Role Filtered according to Matrix) */}
      <nav aria-label="Global Module Navigation" className="border-t border-slate-100 bg-slate-50/90 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="mx-auto flex max-w-[1600px] items-center space-x-1 py-1.5 min-w-max">
          
          {/* Sales Dashboard: Sales Rep, Sales Manager */}
          {isSales && (
            <a href="/dashboard" className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition ${activeTab === 'dashboard' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              <svg className={`h-3.5 w-3.5 ${activeTab === 'dashboard' ? 'text-brand-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <span>Sales Dashboard</span>
            </a>
          )}

          {/* Quotations List & Detail: Sales Rep, Sales Manager */}
          {isSales && (
            <a href="/quotations" className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition ${activeTab === 'quotations' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              <svg className={`h-3.5 w-3.5 ${activeTab === 'quotations' ? 'text-brand-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Quotation List</span>
            </a>
          )}

          {/* Approvals: Sales Manager, Finance Team */}
          {(isManager || isFinance) && (
            <a href="/approvals" className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'approvals' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              <span>Approvals</span>
              <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">4</span>
            </a>
          )}

          {/* Fulfillment: Finance Team */}
          {isFinance && (
            <a href="/fulfillment" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'fulfillment' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>Fulfillment</a>
          )}

          {/* Subscriptions: Finance Team */}
          {isFinance && (
            <a href="/subscriptions" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'subscriptions' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>Subscriptions</a>
          )}

          {/* Billing Details: Finance Team, Manager, Admin */}
          {(isFinance || isManager || isAdmin) && (
            <a href="/billing" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'billing' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>Billing Details</a>
          )}

          {/* Invoices List: Finance Team */}
          {isFinance && (
            <a href="/invoices" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'invoices' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>Invoices List</a>
          )}

          {/* Customer Portal: Customer ONLY */}
          {isCustomer && (
            <a href="/portal" className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition ${activeTab === 'portal' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              <span>Customer Portal</span>
            </a>
          )}

          {/* Deal Health Dashboard: Sales Manager, Admin */}
          {(isManager || isAdmin) && (
            <a href="/deal-health" className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition ${activeTab === 'deal-health' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              <span>Deal Health</span>
              <span className="inline-flex items-center justify-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">3</span>
            </a>
          )}

          {/* Admin Reporting: Admin, Sales Manager */}
          {(isAdmin || isManager) && (
            <a href="/reports" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'reports' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              Admin Reporting
            </a>
          )}

          {/* Product Dashboard: Admin, Sales Manager */}
          {(isAdmin || isManager) && (
            <a href="/products" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'products' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              Product Catalog
            </a>
          )}

          {/* Discount Tiers Setup: Admin */}
          {isAdmin && (
            <a href="/discount-rules" className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition ${activeTab === 'discount-rules' ? 'bg-white font-bold text-brand-700 shadow-sm ring-1 ring-slate-200/80' : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
              Discount Tiers Setup
            </a>
          )}

        </div>
      </nav>
    </header>
  );
}
