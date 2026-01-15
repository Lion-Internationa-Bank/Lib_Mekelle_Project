// src/routes/revenue/RevenueHome.tsx
import { useAuth } from '../../contexts/AuthContext';

const RevenueHome = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Revenue Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg mb-4">
          Welcome, {user?.full_name} ({user?.role})
        </p>
        <p className="text-lg">
          Username: {user?.username}
        </p>
      </div>
    </div>
  );
};

export default RevenueHome;