export default function KanbanCard({ 
  id, 
  amount, 
  amountStyle = "bg-slate-50 text-slate-900 font-bold", 
  client, 
  desc, 
  owner, 
  time,
  timeColor = "text-slate-400",
  status,
  alert,
  portalBadge,
  action,
  isHighlighted = false
}) {
  return (
    <div className={`rounded-xl bg-white p-3.5 shadow-sm border transition-shadow hover:shadow-md ${isHighlighted ? 'border-amber-300 shadow-amber-100/50' : 'border-slate-200'}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider">{id}</span>
        <span className={`text-xs px-2 py-0.5 rounded border border-slate-100 ${amountStyle}`}>
          {amount}
        </span>
      </div>

      {/* Body */}
      <h4 className="font-bold text-slate-900 text-sm mb-0.5">{client}</h4>
      {desc && <p className="text-[11px] text-slate-500 leading-snug mb-3">{desc}</p>}

      {/* Dynamic Insertions (Alerts, Portal Badges) */}
      {alert && (
        <div className={`rounded-lg p-2 mb-3 border ${
          alert.type === 'warning' ? 'bg-amber-50/50 border-amber-200' :
          alert.type === 'success' ? 'bg-emerald-50/50 border-emerald-200' :
          'bg-blue-50/50 border-blue-200'
        }`}>
          <div className="flex items-start gap-1.5">
            {alert.type === 'warning' && <svg className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            {alert.type === 'success' && <svg className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
            {alert.type === 'info' && <svg className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            <div>
              <p className={`text-[11px] font-bold ${
                alert.type === 'warning' ? 'text-amber-800' :
                alert.type === 'success' ? 'text-emerald-700' :
                'text-blue-700'
              }`}>{alert.title}</p>
              {alert.desc && <p className="text-[10px] text-amber-700/80 mt-0.5 leading-tight">{alert.desc}</p>}
            </div>
          </div>
        </div>
      )}

      {portalBadge && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-md px-2 py-1.5 mb-2">
          <span className="text-[10px] font-medium text-purple-700">{portalBadge}</span>
          <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
        </div>
      )}

      {status && status.icon === 'edit' && (
        <div className="flex items-center gap-1.5 mb-3">
          <svg className={`h-3 w-3 ${status.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          <span className={`text-[11px] ${status.color}`}>{status.label}</span>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${owner.color}`}>
            {owner.initials}
          </span>
          <span className="text-[11px] font-medium text-slate-600">{owner.name}</span>
        </div>
        <span className={`text-[10px] ${timeColor}`}>{time}</span>
      </div>

      {status && !status.icon && (
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`}></span>
          <span className={`text-[11px] font-medium ${status.color}`}>{status.label}</span>
        </div>
      )}

      {/* Primary Action Button */}
      {action && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button className={`w-full rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            action.type === 'primary-amber' ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600' :
            action.type === 'dark' ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800' :
            action.type === 'outline' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' :
            action.type === 'success' ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' :
            'bg-brand-600 text-white shadow-sm'
          }`}>
            {action.label}
          </button>
        </div>
      )}

    </div>
  );
}
