// src/components/admin/UserStats.tsx
import { Shield, UserCheck, UserX } from 'lucide-react';

interface UserStatsProps {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
}

const UserStats = ({ totalUsers, activeUsers, suspendedUsers }: UserStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-6 shadow border border-[#f0cd6e]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#2a2718]/70">Total Users</p>
            <p className="text-3xl font-bold text-[#2a2718] mt-2">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 bg-[#f0cd6e]/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#2a2718]" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow border border-[#f0cd6e]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#2a2718]/70">Active Users</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{activeUsers}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow border border-[#f0cd6e]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#2a2718]/70">Suspended Users</p>
            <p className="text-3xl font-bold text-red-700 mt-2">{suspendedUsers}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;