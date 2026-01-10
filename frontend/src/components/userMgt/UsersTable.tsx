// src/components/admin/UsersTable.tsx
import { User, Building, Eye, Shield, TrendingUp, UserX, UserCheck, Trash2 } from 'lucide-react';
import type { User  as UserType} from '../../services/userService';

interface UsersTableProps {
  users: UserType[];
  currentUserRole: string;
  onSuspendActivate: (user: UserType) => void;
  onDelete: (user: UserType) => void;
  getRoleIcon: (role: string) => JSX.Element | null;
  getRoleDisplayName: (role: string) => string;
}

const UsersTable = ({
  users,
  currentUserRole,
  onSuspendActivate,
  onDelete,
  getRoleIcon,
  getRoleDisplayName,
}: UsersTableProps) => {
  const showSubCityColumn = currentUserRole !== 'REVENUE_ADMIN';

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow border">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserX className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Role</th>
              {showSubCityColumn && (
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Sub-city</th>
              )}
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{u.full_name}</div>
                    <div className="text-sm text-gray-500">{u.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(u.role)}
                    <span className="text-gray-700">{getRoleDisplayName(u.role)}</span>
                  </div>
                </td>
                {showSubCityColumn && (
                  <td className="px-6 py-4">
                    {u.sub_city_id ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                        <Building className="w-3 h-3" />
                        {u.sub_city_id.substring(0, 8)}...
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`font-medium ${u.is_active ? 'text-green-700' : 'text-red-700'}`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onSuspendActivate(u)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        u.is_active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {u.is_active ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(u)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;