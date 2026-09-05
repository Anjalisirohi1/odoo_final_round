import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import SalesDashboardPage from './pages/SalesDashboardPage';
import QuotationsListPage from './pages/QuotationsListPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<SalesDashboardPage />} />
        <Route path="/quotations" element={<QuotationsListPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;