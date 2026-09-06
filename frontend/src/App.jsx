import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Screen 1: Login / Signup
import AuthPage from './pages/AuthPage';

// Screen 2: Sales Dashboard
import SalesDashboardPage from './pages/SalesDashboardPage';

// Screen 3 & 4: Quotation List & Detail
import QuotationsListPage from './pages/QuotationsListPage';
import QuotationDetailsPage from './pages/QuotationDetailsPage';

// Screen 5 & 6: Approval List & Detail
import ApprovalsPage from './pages/ApprovalsPage';

// Screen 7 & 8: Fulfillment List & Detail
import FulfillmentPage from './pages/FulfillmentPage';
import FulfillmentDetailsPage from './pages/FulfillmentDetailsPage';

// Screen 9 & 10: Subscription List & Billing Detail
import SubscriptionsPage from './pages/SubscriptionsPage';
import BillingDetailsPage from './pages/BillingDetailsPage';

// Screen 11: Customer Portal
import CustomerPortalPage from './pages/CustomerPortalPage';

// Screen 12 & 13: Invoices List & Detail
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage';

// Screen 14: Deal Health Dashboard
import DealHealthPage from './pages/DealHealthPage';

// Screen 15: Admin Reporting
import ReportsPage from './pages/ReportsPage';

// Screen 16 & 17: Product Dashboard & Product Details Page
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';

// Screen 18: Discount Tiers Setup
import DiscountRulesPage from './pages/DiscountRulesPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Login / Signup (All 5 Roles / Public) */}
        <Route path="/" element={<AuthPage />} />

        {/* 2. Sales Dashboard (Sales Rep, Sales Manager) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SALES_REP', 'SALES_MANAGER']}>
              <SalesDashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* 3. Quotation List (Sales Rep, Sales Manager, Admin, Finance) */}
        <Route 
          path="/quotations" 
          element={
            <ProtectedRoute allowedRoles={['SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE']}>
              <QuotationsListPage />
            </ProtectedRoute>
          } 
        />

        {/* 4. Quotation Detail (Sales Rep, Sales Manager, Admin, Finance) */}
        <Route 
          path="/quotations/:id" 
          element={
            <ProtectedRoute allowedRoles={['SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE']}>
              <QuotationDetailsPage />
            </ProtectedRoute>
          } 
        />

        {/* 5. Approval List & 6. Approval Detail (Sales Manager, Finance Team) */}
        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute allowedRoles={['SALES_MANAGER', 'FINANCE']}>
              <ApprovalsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/approvals/:id" 
          element={
            <ProtectedRoute allowedRoles={['SALES_MANAGER', 'FINANCE']}>
              <ApprovalsPage />
            </ProtectedRoute>
          } 
        />

        {/* 7. Fulfillment List (Finance Team - Ops) */}
        <Route 
          path="/fulfillment" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE']}>
              <FulfillmentPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fulfillments" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE']}>
              <FulfillmentPage />
            </ProtectedRoute>
          } 
        />

        {/* 8. Fulfillment Detail (Finance Team - Ops) */}
        <Route 
          path="/fulfillment/:id" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE']}>
              <FulfillmentDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fulfillments/:id" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE']}>
              <FulfillmentDetailsPage />
            </ProtectedRoute>
          } 
        />

        {/* 9. Subscription List (Finance Team) */}
        <Route 
          path="/subscriptions" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE']}>
              <SubscriptionsPage />
            </ProtectedRoute>
          } 
        />

        {/* 10. Billing Detail (Finance Team, Sales Manager, Admin, Sales Rep) */}
        <Route 
          path="/subscriptions/:id" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE', 'SALES_MANAGER', 'ADMIN', 'SALES_REP']}>
              <BillingDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/billing" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE', 'SALES_MANAGER', 'ADMIN', 'SALES_REP']}>
              <BillingDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/billing/:id" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE', 'SALES_MANAGER', 'ADMIN', 'SALES_REP']}>
              <BillingDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/billing-details" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE', 'SALES_MANAGER', 'ADMIN', 'SALES_REP']}>
              <BillingDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers/billing" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE', 'SALES_MANAGER', 'ADMIN', 'SALES_REP']}>
              <BillingDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers/:id/billing" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE', 'SALES_MANAGER', 'ADMIN', 'SALES_REP']}>
              <BillingDetailsPage />
            </ProtectedRoute>
          } 
        />

        {/* 11. Customer Portal (Customer ONLY) */}
        <Route 
          path="/portal" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerPortalPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/portal/:id" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerPortalPage />
            </ProtectedRoute>
          } 
        />

        {/* 12. Invoices List (Finance Team) */}
        <Route 
          path="/invoices" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE']}>
              <InvoicesPage />
            </ProtectedRoute>
          } 
        />

        {/* 13. Invoice Detail (Finance Team) */}
        <Route 
          path="/invoices/:id" 
          element={
            <ProtectedRoute allowedRoles={['FINANCE']}>
              <InvoiceDetailsPage />
            </ProtectedRoute>
          } 
        />

        {/* 14. Deal Health Dashboard (Sales Manager, Admin) */}
        <Route 
          path="/deal-health" 
          element={
            <ProtectedRoute allowedRoles={['SALES_MANAGER', 'ADMIN']}>
              <DealHealthPage />
            </ProtectedRoute>
          } 
        />

        {/* 15. Admin Reporting (Admin, Sales Manager) */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />

        {/* 16. Product Dashboard (Admin, Sales Manager) */}
        <Route 
          path="/products" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />

        {/* 17. Product Details Page (Admin, Sales Manager) */}
        <Route 
          path="/products/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
              <ProductDetailsPage />
            </ProtectedRoute>
          } 
        />

        {/* 18. Discount Tiers Setup (Admin) */}
        <Route 
          path="/discount-rules" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DiscountRulesPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;