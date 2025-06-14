import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import StockManagement from "./pages/manager/StockManagement";
import AgentManagement from "./pages/manager/AgentManagement";
import OrderManagement from "./pages/manager/OrderManagement";
import ReportsPage from "./pages/manager/ReportsPage";
import PasswordManagement from "./pages/manager/PasswordManagement";
import ConfigurationManager from "./pages/manager/ConfigurationManager";

import AgentDashboard from "./pages/agent/AgentDashboard";
import NewOrder from "./pages/agent/NewOrder";
import OrderList from "./pages/agent/OrderList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Manager Routes */}
            <Route path="/manager/*" element={
              <ProtectedRoute requiredRole="manager">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<ManagerDashboard />} />
                    <Route path="stock" element={<StockManagement />} />
                    <Route path="agents" element={<AgentManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="passwords" element={<PasswordManagement />} />
                    <Route path="configuration" element={<ConfigurationManager />} />
                    <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Protected Agent Routes */}
            <Route path="/agent/*" element={
              <ProtectedRoute requiredRole="agent">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<AgentDashboard />} />
                    <Route path="orders/new" element={<NewOrder />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="history" element={<OrderList />} />
                    <Route path="*" element={<Navigate to="/agent/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Default redirect based on auth */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Direct routes for testing */}
            <Route path="/stock" element={<Navigate to="/manager/stock" replace />} />
            
            {/* Legacy route redirects */}
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="/orders/*" element={<Navigate to="/login" replace />} />
            <Route path="/history" element={<Navigate to="/login" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;