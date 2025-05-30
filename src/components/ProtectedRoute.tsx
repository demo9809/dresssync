import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'manager' | 'agent';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" data-id="0rkw88aof" data-path="src/components/ProtectedRoute.tsx">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" data-id="3umtskmvy" data-path="src/components/ProtectedRoute.tsx"></div>
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" replace data-id="69kajvx5v" data-path="src/components/ProtectedRoute.tsx" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace data-id="oz58t8527" data-path="src/components/ProtectedRoute.tsx" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;