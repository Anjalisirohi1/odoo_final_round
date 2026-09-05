import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import SalesDashboardPage from './pages/SalesDashboardPage';
import QuotationsListPage from './pages/QuotationsListPage';
import CustomerPortalPage from './pages/CustomerPortalPage';

import DealHealthPage from './pages/DealHealthPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import InvoicesPage from './pages/InvoicesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<SalesDashboardPage />} />
        <Route path="/quotations" element={<QuotationsListPage />} />
        <Route path="/portal" element={<CustomerPortalPage />} />
        <Route path="/deal-health" element={<DealHealthPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;