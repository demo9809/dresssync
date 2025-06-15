import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import InstallationPage from './pages/InstallationPage';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import StockManagement from './pages/manager/StockManagement';
import AgentManagement from './pages/manager/AgentManagement';
import OrderManagement from './pages/manager/OrderManagement';
import ReportsPage from './pages/manager/ReportsPage';
import PasswordManagement from './pages/manager/PasswordManagement';
import ConfigurationManager from './pages/manager/ConfigurationManager';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import NewOrder from './pages/agent/NewOrder';
import OrderList from './pages/agent/OrderList';

// Demo Page
import ProductItemDemo from './pages/ProductItemDemo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Installation Route */}
                <Route path="/install" element={<InstallationPage />} />
                
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Root redirect to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Manager Routes with Layout */}
                <Route path="/manager/*" element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <Layout>
                      <Routes>
                        <Route index element={<ManagerDashboard />} />
                        <Route path="dashboard" element={<ManagerDashboard />} />
                        <Route path="stock" element={<StockManagement />} />
                        <Route path="agents" element={<AgentManagement />} />
                        <Route path="orders" element={<OrderManagement />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="passwords" element={<PasswordManagement />} />
                        <Route path="configuration" element={<ConfigurationManager />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Agent Routes with Layout */}
                <Route path="/agent/*" element={
                  <ProtectedRoute allowedRoles={['agent']}>
                    <Layout>
                      <Routes>
                        <Route index element={<AgentDashboard />} />
                        <Route path="dashboard" element={<AgentDashboard />} />
                        <Route path="new-order" element={<NewOrder />} />
                        <Route path="orders" element={<OrderList />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Direct routes for backward compatibility */}
                <Route path="/dashboard" element={<Navigate to="/manager/dashboard" replace />} />
                <Route path="/stock" element={<Navigate to="/manager/stock" replace />} />
                <Route path="/agents" element={<Navigate to="/manager/agents" replace />} />
                <Route path="/orders" element={<Navigate to="/manager/orders" replace />} />
                <Route path="/reports" element={<Navigate to="/manager/reports" replace />} />
                <Route path="/passwords" element={<Navigate to="/manager/passwords" replace />} />
                <Route path="/configuration" element={<Navigate to="/manager/configuration" replace />} />
                <Route path="/new-order" element={<Navigate to="/agent/new-order" replace />} />
                
                {/* Demo Route */}
                <Route path="/demo" element={<ProductItemDemo />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;