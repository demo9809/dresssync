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
import AgentDashboard from "./pages/agent/AgentDashboard";
import NewOrder from "./pages/agent/NewOrder";
import OrderList from "./pages/agent/OrderList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () =>
<QueryClientProvider client={queryClient} data-id="fz3atux5p" data-path="src/App.tsx">
    <TooltipProvider data-id="vp1lme5z8" data-path="src/App.tsx">
      <AuthProvider data-id="in5ov7cga" data-path="src/App.tsx">
        <Toaster data-id="e27b4wcmc" data-path="src/App.tsx" />
        <BrowserRouter data-id="048iz2j4y" data-path="src/App.tsx">
          <Routes data-id="nf3jxopl9" data-path="src/App.tsx">
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage data-id="12vojzgqm" data-path="src/App.tsx" />} data-id="8izy9pl9o" data-path="src/App.tsx" />
            
            {/* Protected Manager Routes */}
            <Route path="/manager/*" element={
          <ProtectedRoute requiredRole="manager" data-id="49farqi4p" data-path="src/App.tsx">
                <Layout data-id="sgxj13os9" data-path="src/App.tsx">
                  <Routes data-id="7ogbodaae" data-path="src/App.tsx">
                    <Route path="dashboard" element={<ManagerDashboard data-id="dqt9euwq3" data-path="src/App.tsx" />} data-id="xsktilz4c" data-path="src/App.tsx" />
                    <Route path="orders" element={<OrderManagement data-id="wm5zymid1" data-path="src/App.tsx" />} data-id="py8ettfu0" data-path="src/App.tsx" />
                    <Route path="stock" element={<StockManagement data-id="lemlvpz8d" data-path="src/App.tsx" />} data-id="c6yh1llsr" data-path="src/App.tsx" />
                    <Route path="agents" element={<AgentManagement data-id="kdm575h18" data-path="src/App.tsx" />} data-id="amditzxcw" data-path="src/App.tsx" />
                    <Route path="reports" element={<ReportsPage data-id="6enk21phw" data-path="src/App.tsx" />} data-id="8trlv9au8" data-path="src/App.tsx" />
                    <Route path="*" element={<Navigate to="/manager/dashboard" replace data-id="foen54phj" data-path="src/App.tsx" />} data-id="wp3fsgoeq" data-path="src/App.tsx" />
                  </Routes>
                </Layout>
              </ProtectedRoute>
          } data-id="mguynul9w" data-path="src/App.tsx" />
            
            {/* Protected Agent Routes */}
            <Route path="/agent/*" element={
          <ProtectedRoute requiredRole="agent" data-id="f8mlwzu0i" data-path="src/App.tsx">
                <Layout data-id="06t7wcj5t" data-path="src/App.tsx">
                  <Routes data-id="d6mb03yfd" data-path="src/App.tsx">
                    <Route path="dashboard" element={<AgentDashboard data-id="fs753fqds" data-path="src/App.tsx" />} data-id="l3a1m7oz8" data-path="src/App.tsx" />
                    <Route path="orders/new" element={<NewOrder data-id="9nw7j3nwm" data-path="src/App.tsx" />} data-id="0cxfdpy5g" data-path="src/App.tsx" />
                    <Route path="orders" element={<OrderList data-id="3g7jppuu5" data-path="src/App.tsx" />} data-id="lgdjdlu9t" data-path="src/App.tsx" />
                    <Route path="history" element={<OrderList data-id="fyjip2j88" data-path="src/App.tsx" />} data-id="71sjwyzk6" data-path="src/App.tsx" />
                    <Route path="*" element={<Navigate to="/agent/dashboard" replace data-id="dd4whq6xy" data-path="src/App.tsx" />} data-id="6b9yi55he" data-path="src/App.tsx" />
                  </Routes>
                </Layout>
              </ProtectedRoute>
          } data-id="ug0td17p5" data-path="src/App.tsx" />
            
            {/* Default redirect based on auth */}
            <Route path="/" element={<Navigate to="/login" replace data-id="adx0nfw1g" data-path="src/App.tsx" />} data-id="haqrosvux" data-path="src/App.tsx" />
            
            {/* Direct routes for testing */}
            <Route path="/stock" element={<Navigate to="/manager/stock" replace data-id="2nbhput71" data-path="src/App.tsx" />} data-id="pfhgp13ar" data-path="src/App.tsx" />
            <Route path="/agents" element={<Navigate to="/manager/agents" replace data-id="tib6gez5v" data-path="src/App.tsx" />} data-id="yycbtu3ck" data-path="src/App.tsx" />
            <Route path="/reports" element={<Navigate to="/manager/reports" replace data-id="wollu04tx" data-path="src/App.tsx" />} data-id="wr58ji4ax" data-path="src/App.tsx" />
            
            {/* Legacy route redirects */}
            <Route path="/dashboard" element={<Navigate to="/login" replace data-id="p3p4am0ie" data-path="src/App.tsx" />} data-id="xxjbqs795" data-path="src/App.tsx" />
            <Route path="/orders/*" element={<Navigate to="/login" replace data-id="r6e29kgk1" data-path="src/App.tsx" />} data-id="xbrvvqelo" data-path="src/App.tsx" />
            <Route path="/history" element={<Navigate to="/login" replace data-id="j5qea2f01" data-path="src/App.tsx" />} data-id="66jpwqghk" data-path="src/App.tsx" />
            
            {/* 404 */}
            <Route path="*" element={<NotFound data-id="n1168q7zo" data-path="src/App.tsx" />} data-id="7uy03qikq" data-path="src/App.tsx" />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>;


export default App;