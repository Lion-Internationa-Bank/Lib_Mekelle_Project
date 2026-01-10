// src/routes/admin/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getUsers,
  suspendUser,
  deleteUser,
  createUser,
  type User as UserType ,
  type UserCreateInput,
} from '../services/userService';
import { Plus, RefreshCw, AlertCircle, User, Shield, Building, TrendingUp, Eye } from 'lucide-react';

// Import components
import UserStats from '../components/userMgt/UserStats';
import UserFilters from '../components/userMgt/UserFilters';
import UsersTable from '../components/userMgt/UsersTable';
import AddUserModal from '../components/userMgt/AddUserModal';
import SuspendActivateModal from '../components/userMgt/SuspendActivateModal';
import DeleteUserModal from '../components/userMgt/DeleteUserModal';
import MessageAlert from '../components/common/MessageAlert';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [suspendModal, setSuspendModal] = useState<{ user: UserType; suspend: boolean } | null>(null);
  const [deleteModal, setDeleteModal] = useState<UserType | null>(null);
  const [addUserModal, setAddUserModal] = useState(false);

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New user state
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const res = await getUsers();
    if (res.success) {
      setUsers(res.data?.users || []);
      setSuccessMessage('');
    } else {
      setError(res.error || 'Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleSuspend = async () => {
    if (!suspendModal) return;
    const { user, suspend } = suspendModal;

    const res = await suspendUser(user.user_id, suspend);
    if (res.success) {
      fetchUsers();
      setSuspendModal(null);
      setSuccessMessage(`User ${suspend ? 'suspended' : 'activated'} successfully`);
    } else {
      setError(res.error || `Failed to ${suspend ? 'suspend' : 'activate'} user`);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    const res = await deleteUser(deleteModal.user_id);
    if (res.success) {
      fetchUsers();
      setDeleteModal(null);
      setSuccessMessage('User deleted successfully');
    } else {
      setError(res.error || 'Failed to delete user');
    }
  };

  const handleAddUser = async (userData: UserCreateInput) => {
    setCreatingUser(true);
    setError('');

    try {
      const res = await createUser(userData);
      if (res.success) {
        fetchUsers();
        setAddUserModal(false);
        setSuccessMessage('User created successfully');
      } else {
        setError(res.error || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  // Get filtered users
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? u.is_active : !u.is_active);
    const matchesSearch = searchTerm === '' || 
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Get unique roles for filter dropdown
  const availableRoles = Array.from(new Set(users.map(u => u.role)));

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CITY_ADMIN': return <Shield className="w-4 h-4" />;
      case 'SUBCITY_ADMIN': return <Building className="w-4 h-4" />;
      case 'REVENUE_ADMIN': return <TrendingUp className="w-4 h-4" />;
      case 'REVENUE_USER': return <TrendingUp className="w-4 h-4" />;
      case 'SUBCITY_NORMAL': return <User className="w-4 h-4" />;
      case 'SUBCITY_AUDITOR': return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Get display name for role
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'CITY_ADMIN': 'City Admin',
      'SUBCITY_ADMIN': 'Sub-city Admin',
      'REVENUE_ADMIN': 'Revenue Admin',
      'REVENUE_USER': 'Revenue User',
      'SUBCITY_NORMAL': 'Sub-city Normal',
      'SUBCITY_AUDITOR': 'Sub-city Auditor',
    };
    return roleMap[role] || role.replace('_', ' ');
  };

  // Dynamic page title based on role
  const pageTitle = {
    CITY_ADMIN: 'Manage Sub-city Admins',
    SUBCITY_ADMIN: 'Manage Sub-city Users',
    REVENUE_ADMIN: 'Manage Revenue Users',
  }[currentUser?.role || ''] || 'User Management';

  if (!currentUser || !['CITY_ADMIN', 'SUBCITY_ADMIN', 'REVENUE_ADMIN'].includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and permissions in your scope
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStats
        totalUsers={users.length}
        activeUsers={users.filter(u => u.is_active).length}
        suspendedUsers={users.filter(u => !u.is_active).length}
      />

      {/* Filters and Search */}
      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        availableRoles={availableRoles}
        getRoleDisplayName={getRoleDisplayName}
      />

      {/* Messages */}
      {successMessage && (
        <MessageAlert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {error && (
        <MessageAlert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          currentUserRole={currentUser.role}
          onSuspendActivate={(user) => setSuspendModal({ user, suspend: user.is_active })}
          onDelete={(user) => setDeleteModal(user)}
          getRoleIcon={getRoleIcon}
          getRoleDisplayName={getRoleDisplayName}
        />
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={addUserModal}
        onClose={() => setAddUserModal(false)}
        onSubmit={handleAddUser}
        currentUser={currentUser}
        creatingUser={creatingUser}
      />

      <SuspendActivateModal
        isOpen={!!suspendModal}
        user={suspendModal?.user || null}
        suspend={suspendModal?.suspend || false}
        onClose={() => setSuspendModal(null)}
        onConfirm={handleSuspend}
      />

      <DeleteUserModal
        isOpen={!!deleteModal}
        user={deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UserManagementPage;