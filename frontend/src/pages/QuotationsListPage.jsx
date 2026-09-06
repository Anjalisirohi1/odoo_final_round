import { useState, useEffect, useMemo } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import QuotationsHeader from '../components/quotations/QuotationsHeader';
import QuotationsStats from '../components/quotations/QuotationsStats';
import QuotationsFilterBar from '../components/quotations/QuotationsFilterBar';
import KanbanBoard from '../components/quotations/KanbanBoard';
import QuotationsTable from '../components/quotations/QuotationsTable';
import QuotationsBanner from '../components/quotations/QuotationsBanner';
import NewQuotationModal from '../components/quotations/NewQuotationModal';
import apiFetch from '../utils/api';

export default function QuotationsListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [quotations, setQuotations] = useState([]);
  
  // View & Filter States
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' | 'table'
  const [selectedOwner, setSelectedOwner] = useState('ALL');
  const [selectedDealValue, setSelectedDealValue] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState('ALL'); // 'ALL' | 'MY_QUOTES' | 'HIGH_MARGIN'

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
    const interval = setInterval(fetchQuotations, 3000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Derive unique sales reps / owners
  const ownersList = useMemo(() => {
    const names = quotations.map(q => q.sales_rep_name).filter(Boolean);
    return [...new Set(names)];
  }, [quotations]);

  // Current logged in user info
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('dealflow_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      // 1. Owner Filter
      if (selectedOwner !== 'ALL') {
        if (q.sales_rep_name !== selectedOwner) return false;
      }

      // 2. Deal Value Filter
      const amt = Number(q.total_amount || 0);
      if (selectedDealValue === 'UNDER_50K' && amt >= 50000) return false;
      if (selectedDealValue === '50K_200K' && (amt < 50000 || amt > 200000)) return false;
      if (selectedDealValue === 'ABOVE_200K' && amt <= 200000) return false;

      // 3. Quick Filter
      if (quickFilter === 'MY_QUOTES') {
        if (currentUser) {
          const userRep = currentUser.fullName || currentUser.name || '';
          if (userRep && q.sales_rep_name && !q.sales_rep_name.toLowerCase().includes(userRep.toLowerCase())) {
            return false;
          }
        }
      } else if (quickFilter === 'HIGH_MARGIN') {
        if (amt < 100000 && q.status !== 'APPROVED' && q.status !== 'CONFIRMED') {
          return false;
        }
      }

      return true;
    });
  }, [quotations, selectedOwner, selectedDealValue, quickFilter, currentUser]);

  // Export CSV functionality
  const handleExportCSV = () => {
    if (!filteredQuotations || filteredQuotations.length === 0) {
      alert('No quotations to export.');
      return;
    }

    const headers = ['Quotation Number', 'Customer Name', 'Sales Rep', 'Date', 'Total Amount', 'Status'];
    const rows = filteredQuotations.map(q => [
      `"${q.quotation_number || ''}"`,
      `"${(q.customer_name || 'Unknown Customer').replace(/"/g, '""')}"`,
      `"${(q.sales_rep_name || 'Sales Rep').replace(/"/g, '""')}"`,
      `"${new Date(q.created_at).toLocaleDateString()}"`,
      `"${q.total_amount || 0}"`,
      `"${q.status || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quotations_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50/60 font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader activeTab="quotations" />
      
      <main className="flex-1 pb-10">
        <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8 space-y-6 flex flex-col h-full">
          
          {/* Header Row */}
          <QuotationsHeader 
            onOpenModal={() => setIsModalOpen(true)} 
            totalQuotes={filteredQuotations.length} 
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Top Metrics Row */}
          <QuotationsStats quotations={filteredQuotations} />

          {/* Filters Row */}
          <QuotationsFilterBar 
            selectedOwner={selectedOwner}
            setSelectedOwner={setSelectedOwner}
            ownersList={ownersList}
            selectedDealValue={selectedDealValue}
            setSelectedDealValue={setSelectedDealValue}
            quickFilter={quickFilter}
            setQuickFilter={setQuickFilter}
            onExportCSV={handleExportCSV}
          />

          {/* Main Pipeline Board / Table area */}
          <div className="flex-1 min-h-[400px]">
            {viewMode === 'pipeline' ? (
              <KanbanBoard quotations={filteredQuotations} />
            ) : (
              <QuotationsTable quotations={filteredQuotations} />
            )}
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
