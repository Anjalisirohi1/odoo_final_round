import KanbanCard from './KanbanCard';

export default function KanbanBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0" data-purpose="pipeline-board">
      
      {/* Draft Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <h3 className="font-bold text-slate-900 text-sm">Draft</h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">2</span>
          </div>
          <span className="text-xs font-bold text-slate-500">$15,600 +</span>
        </div>
        <div className="flex flex-col gap-3">
          <KanbanCard 
            id="#QF-9642"
            amount="$12,400"
            client="Acme Corp"
            desc="Cloud Migration Package • 12mo"
            owner={{ initials: "MR", name: "M. Ramos", color: "bg-blue-100 text-blue-700" }}
            time="2h ago"
            status={{ label: "Draft in progress", color: "text-brand-600", dot: "bg-brand-500" }}
          />
          <KanbanCard 
            id="#QF-9845"
            amount="$3,200"
            client="Delta LLC"
            desc="Hardware Add-on & Licenses"
            owner={{ initials: "AV", name: "A. Vance", color: "bg-purple-100 text-purple-700" }}
            time="1d ago"
            status={{ label: "Needs SKU confirmation", color: "text-amber-600", dot: "bg-amber-500" }}
          />
        </div>
      </div>

      {/* Pending Approval Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3 rounded-xl bg-amber-50/30 border border-amber-100/50 p-2 -m-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Pending Approval</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">1</span>
          </div>
          <span className="text-xs font-bold text-slate-500">$28,900 +</span>
        </div>
        <div className="flex flex-col gap-3">
          <KanbanCard 
            id="#QF-8930"
            amount="$28,900"
            amountStyle="bg-amber-50 text-amber-700 border-amber-200 font-bold"
            client="Beta Industries"
            alert={{
              title: "18% Discount Override",
              desc: "Exceeds standard 15% margin gate",
              type: "warning"
            }}
            owner={{ initials: "AV", name: "A. Vance", color: "bg-blue-100 text-blue-700" }}
            time="Awaiting VP Review"
            timeColor="text-rose-600 font-bold"
            action={{ label: "Review Gate & Sign", type: "primary-amber" }}
            isHighlighted={true}
          />
        </div>
      </div>

      {/* Approved Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Approved</h3>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">1</span>
          </div>
          <span className="text-xs font-bold text-slate-500">$9,750 +</span>
        </div>
        <div className="flex flex-col gap-3">
          <KanbanCard 
            id="#QF-8925"
            amount="$9,750"
            client="Nova Retail"
            desc="POS Upgrade + 30 Endpoint Terminals"
            alert={{
              title: "Approved by Sarah Jenkins (Finance)",
              type: "success"
            }}
            owner={{ initials: "SK", name: "S. Kim", color: "bg-emerald-100 text-emerald-700" }}
            time="Ready to Send"
            timeColor="text-brand-600 font-bold"
            action={{ label: "Send to Customer", type: "dark" }}
          />
        </div>
      </div>

      {/* Negotiation Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Negotiation</h3>
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full border border-purple-200">1</span>
          </div>
          <span className="text-xs font-bold text-slate-500">$15,300 +</span>
        </div>
        <div className="flex flex-col gap-3">
          <KanbanCard 
            id="#QF-8918"
            amount="$15,300"
            client="Zenith Co"
            desc="Security Bundle V2 & Multi-Tenant..."
            portalBadge="Customer viewing portal"
            status={{ label: "2 SLA redlines proposed", color: "text-amber-700 font-medium", icon: "edit" }}
            owner={{ initials: "DR", name: "D. Ross", color: "bg-purple-100 text-purple-700" }}
            time="View Specs"
            timeColor="text-slate-400"
            action={{ label: "Track Portal Session", type: "outline" }}
          />
        </div>
      </div>

      {/* Confirmed Column */}
      <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500"></span>
            <h3 className="font-bold text-slate-900 text-sm">Confirmed</h3>
            <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full border border-brand-200">1</span>
          </div>
          <span className="text-xs font-bold text-slate-500">$41,000 +</span>
        </div>
        <div className="flex flex-col gap-3">
          <KanbanCard 
            id="#QF-8895"
            amount="$41,000"
            amountStyle="text-emerald-700 bg-emerald-50 border-emerald-200 font-bold"
            client="Orion Ltd"
            desc="Enterprise Telemetry & Multi-region..."
            alert={{
              title: "E-Signed & Contract Locked",
              type: "info"
            }}
            owner={{ initials: "MR", name: "M. Ramos", color: "bg-blue-100 text-blue-700" }}
            time="Synced to ERP"
            timeColor="text-slate-400"
            action={{ label: "✓ Handover to Fulfillment", type: "success" }}
          />
        </div>
      </div>
    </div>
  );
}
