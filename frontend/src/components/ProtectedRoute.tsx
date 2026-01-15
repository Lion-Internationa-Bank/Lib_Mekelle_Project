// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../assets/contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Optional: restrict to specific roles
  children?: React.ReactNode; // Explicitly allow children
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps = {}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles specified, check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  // Render children if provided, otherwise Outlet (for layout routes)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;