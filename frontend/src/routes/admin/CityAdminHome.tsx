// src/routes/subcity/SubcityHome.tsx
import { useAuth } from '../../contexts/AuthContext';

const CityAdminHome = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">City Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg mb-4">
          <strong>Welcome:</strong> {user?.full_name}
        </p>
        <p className="text-lg">
          <strong>Role:</strong> {user?.role}
        </p>
        <p className="text-lg">
          <strong>Sub-city ID:</strong> {user?.sub_city_id || 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default CityAdminHome;