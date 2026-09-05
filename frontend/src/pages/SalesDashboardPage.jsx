import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import PageTitle from '../components/dashboard/PageTitle';
import KeyMetrics from '../components/dashboard/KeyMetrics';
import WorkflowsLaunch from '../components/dashboard/WorkflowsLaunch';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ActiveDealsTable from '../components/dashboard/ActiveDealsTable';
import CalloutBanner from '../components/dashboard/CalloutBanner';
import apiFetch from '../utils/api';

export default function SalesDashboardPage() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/quotations?t=${Date.now()}`).then(r => r.ok ? r.json() : { data: [] }),
      apiFetch('/api/customers').then(r => r.ok ? r.json() : { data: [] }),
      apiFetch('/api/products').then(r => r.ok ? r.json() : { data: [] }),
    ]).then(([qData, cData, pData]) => {
      setQuotations(qData.data || []);
      setCustomers(cData.data || []);
      setProducts(pData.data || []);
    }).catch(err => console.error('Dashboard fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <DashboardHeader />
      
      <main className="flex-1 bg-blue-50/60 pb-16">
        <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
          <PageTitle />
          <KeyMetrics quotations={quotations} customers={customers} products={products} />
          <WorkflowsLaunch />
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <ActivityFeed quotations={quotations} />
            <ActiveDealsTable quotations={quotations} />
          </div>
          
          <CalloutBanner />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
