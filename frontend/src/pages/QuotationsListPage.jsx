import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import QuotationsHeader from '../components/quotations/QuotationsHeader';
import QuotationsStats from '../components/quotations/QuotationsStats';
import QuotationsFilterBar from '../components/quotations/QuotationsFilterBar';
import KanbanBoard from '../components/quotations/KanbanBoard';
import QuotationsBanner from '../components/quotations/QuotationsBanner';
import NewQuotationModal from '../components/quotations/NewQuotationModal';
import apiFetch from '../utils/api';

export default function QuotationsListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [quotations, setQuotations] = useState([]);

  const fetchQuotations = async () => {
    try {
      const res = await apiFetch(`/api/quotations?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [refreshKey]);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50/60 font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="quotations" />
      
      <main className="flex-1 pb-10">
        <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8 space-y-6 flex flex-col h-full">
          
          {/* Header Row */}
          <QuotationsHeader onOpenModal={() => setIsModalOpen(true)} totalQuotes={quotations.length} />

          {/* Top Metrics Row */}
          <QuotationsStats quotations={quotations} />

          {/* Filters Row */}
          <QuotationsFilterBar />

          {/* Main Pipeline Board area (flex-1 to take remaining space) */}
          <div className="flex-1 min-h-[400px]">
            <KanbanBoard quotations={quotations} />
          </div>

          {/* Bottom Banner */}
          <QuotationsBanner />

        </div>
      </main>

      <DashboardFooter />

      <NewQuotationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
      />
    </div>
  );
}
