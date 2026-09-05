import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import QuotationsHeader from '../components/quotations/QuotationsHeader';
import QuotationsStats from '../components/quotations/QuotationsStats';
import QuotationsFilterBar from '../components/quotations/QuotationsFilterBar';
import KanbanBoard from '../components/quotations/KanbanBoard';
import QuotationsBanner from '../components/quotations/QuotationsBanner';

export default function QuotationsListPage() {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50/60 font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="quotations" />
      
      <main className="flex-1 pb-10">
        <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8 space-y-6 flex flex-col h-full">
          
          {/* Header Row */}
          <QuotationsHeader />

          {/* Top Metrics Row */}
          <QuotationsStats />

          {/* Filters Row */}
          <QuotationsFilterBar />

          {/* Main Pipeline Board area (flex-1 to take remaining space) */}
          <div className="flex-1 min-h-[400px]">
            <KanbanBoard />
          </div>

          {/* Bottom Banner */}
          <QuotationsBanner />

        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
