// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider,useAuth } from './auth/AuthContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './routes/LandingPage';
import LoginPage from './routes/LoginPage';
import AdminHome from './routes/admin/AdminHome';
import SubcityHome from './routes/subcity/SubcityHome';
import RevenueHome from './routes/revenue/RevenueHome';
import ParcelWizard from './routes/ParcelWizard';
import ParcelDetailPage from './routes/ParcelDetailPage';
import OwnershipPage from './routes/subcity/OwnershipPage';
import SubCitiesPage from './routes/admin/SubCitiesPage';
import ConfigsPage from './routes/admin/ConfigsPage';
import UserManagementPage from './routes/UserManagementPage';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* All protected pages use MainLayout */}
        <Route element={<MainLayout />}>
          {/* Role-based home pages */}
          <Route path="/home" element={<RoleBasedHome />} />

          {/* Common protected routes */}
          <Route path="/parcels/new" element={<ParcelWizard />} />
          <Route path="/parcels/:upin" element={<ParcelDetailPage />} />
          <Route path="/ownership" element={<OwnershipPage />} />
          <Route path="/users" element={<UserManagementPage />} />

<Route path="/sub-cities" element={<SubCitiesPage />} />
  <Route path="/configs" element={<ConfigsPage />} />

          {/* Add more role-specific routes here */}
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  );
};

// Dynamically render home page based on role
const RoleBasedHome = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'CITY_ADMIN':
    case 'SUBCITY_ADMIN':
      return <AdminHome />;
    case 'SUBCITY_NORMAL':
    case 'SUBCITY_AUDITOR':
      return <SubcityHome />;
    case 'REVENUE_ADMIN':
    case 'REVENUE_USER':
      return <RevenueHome />;
    default:
      return <div>Unknown role</div>;
  }
};

export default App;