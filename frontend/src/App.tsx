// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner'; // Add Sonner import [web:7]
// import 'sonner/toast.css'; // Import styles (Vite handles CSS) [web:7][web:14]
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './routes/LandingPage';
import LoginPage from './routes/LoginPage';
import CityAdminHome from './routes/admin/CityAdminHome';
import SubCityAdminHome from './routes/admin/SubCityAdminHome';
import SubcityHome from './routes/subcity/SubcityHome';
import RevenueHome from './routes/revenue/RevenueHome';
import ParcelWizard from './routes/ParcelWizard';
import ParcelDetailPage from './routes/ParcelDetailPage';
import OwnershipPage from './routes/subcity/OwnershipPage';
import SubCitiesPage from './routes/admin/SubCitiesPage';
import ConfigsPage from './routes/admin/ConfigsPage';
import UserManagementPage from './routes/UserManagementPage';
import { CalendarProvider } from './contexts/CalendarContext';
import RateConfigsPage from './routes/admin/RateConfigsPage';
import { WizardProvider } from './contexts/WizardContext';
import ParcelWizardV2 from './components/wizard/ParcelWizard';
import UserSessionsPage from './routes/subcity/UserSessionsPage';
import PendingRequestsPage from './routes/admin/PendingRequestsPage';
import RequestDetailPage from './routes/admin/RequestDetailPage';
import ParcelWizardV3 from './components/wizard/ParcleWizardV2';

const App = () => {
  const { isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  return (
    <CalendarProvider>
      <WizardProvider>
          <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<RoleBasedHome />} />

          {/* Common protected routes */}
          <Route path="/parcels/new" element={<ParcelWizardV2 />} />
          <Route path="/sessions" element={<UserSessionsPage />} />
        <Route path="/wizard/:sessionId" element={<ParcelWizardV2 />} /> 
          <Route path="/ownership" element={<OwnershipPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/sub-cities" element={<SubCitiesPage />} />
          <Route path="/configs" element={<ConfigsPage />} />
          <Route path="/rateConfigs" element={<RateConfigsPage />} />
          {/* pending requests  */}
      
        <Route path="/pending-requests" element={<PendingRequestsPage/>}/> 
        <Route path="/pending-requests/:requestId" element={<RequestDetailPage/>}/>
        </Route>
        <Route path="/parcels/:upin" element={<ParcelDetailPage />} />

        

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton /> {/* Add global Toaster */}
  
      </WizardProvider>
      </CalendarProvider>
  );
};

// Role-based home page (unchanged, minor cleanup)
const RoleBasedHome = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'CITY_ADMIN':
       return <CityAdminHome />;
    case 'SUBCITY_ADMIN':
      return <SubCityAdminHome />;
    case 'SUBCITY_NORMAL':
    case 'SUBCITY_AUDITOR':
        case 'REVENUE_USER':
      return <SubcityHome />;
    case 'REVENUE_ADMIN':
    // case 'REVENUE_USER':
      return <RevenueHome />;
    default:
      return <div>Unknown role</div>;
  }
};

export default App;
