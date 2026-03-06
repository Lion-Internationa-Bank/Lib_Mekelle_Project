// src/routes/admin/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslate } from '../../i18n/useTranslate';
import {
  getUsers,
  suspendUser,
  deleteUser,
  createUser,
  type User as UserType,
  type UserCreateInput,
  type ApprovalRequestResponse,
  isApprovalRequest
} from '../../services/userService';
import { Plus, RefreshCw, AlertCircle, User, Shield, Building, TrendingUp, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Import components
import UserStats from '../../components/userMgt/UserStats';
import UserFilters from '../../components/userMgt/UserFilters';
import UsersTable from '../../components/userMgt/UsersTable';
import AddUserModal from '../../components/userMgt/AddUserModal';
import SuspendActivateModal from '../../components/userMgt/SuspendActivateModal';
import DeleteUserModal from '../../components/userMgt/DeleteUserModal';
import MessageAlert from '../../components/common/MessageAlert';
import ApprovalPendingModal from '../../components/userMgt/ApprovalPendingModal';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequestResponse | null>(null);

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
      setError(res.error || t('errors.fetchFailed'));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);




const handleSuspend = async (reason?: string) => {
  if (!suspendModal) return;
  const { user, suspend } = suspendModal;

  const res = await suspendUser(user.user_id, suspend, reason);  // Pass reason here
  
  if (res.success) {
    if (res.data && isApprovalRequest(res.data)) {
      // Show approval pending modal
      setPendingApproval(res.data);
      toast.info(t('messages.approvalSubmitted'));
    } else {
      // Direct success
      fetchUsers();
      toast.success(suspend ? t('messages.userSuspended') : t('messages.userActivated'));
    }
    setSuspendModal(null);
  } else {
    toast.error(res.error || (suspend ? t('errors.suspendFailed') : t('errors.activateFailed')));
  }
};

// src/routes/admin/UserManagementPage.tsx - Update handleDelete function

const handleDelete = async (reason?: string) => {
  if (!deleteModal) return;

  const res = await deleteUser(deleteModal.user_id, reason);  // Pass reason here
  
  if (res.success) {
    if (res.data && isApprovalRequest(res.data)) {
      // Show approval pending modal
      setPendingApproval(res.data);
      toast.info(t('messages.approvalSubmitted'));
    } else {
      // Direct success (though delete always requires approval)
      fetchUsers();
      toast.success(t('messages.userDeleted'));
    }
    setDeleteModal(null);
  } else {
    toast.error(res.error || t('errors.deleteFailed'));
  }
};


  const handleAddUser = async (userData: UserCreateInput) => {
    setCreatingUser(true);
    setError('');

    try {
      const res = await createUser(userData);
      
      if (res.success) {
        if (res.data && isApprovalRequest(res.data)) {
          // Show approval pending modal
          setPendingApproval(res.data);
          toast.info(t('messages.approvalSubmitted'));
          setAddUserModal(false);
        } else {
          // Direct creation
          fetchUsers();
          setAddUserModal(false);
          toast.success(t('messages.userCreated'));
        }
      } else {
        setError(res.error || t('errors.createFailed'));
      }
    } catch (err: any) {
      toast.error(err.message || t('errors.createFailed'));
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
      case 'CITY_APPROVER': return <Shield className="w-4 h-4 text-yellow-600" />;
      case 'SUBCITY_ADMIN': return <Building className="w-4 h-4" />;
      case 'SUBCITY_APPROVER': return <Building className="w-4 h-4 text-yellow-600" />;
      case 'REVENUE_ADMIN': return <TrendingUp className="w-4 h-4" />;
      case 'REVENUE_APPROVER': return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'REVENUE_USER': return <TrendingUp className="w-4 h-4" />;
      case 'SUBCITY_NORMAL': return <User className="w-4 h-4" />;
      case 'SUBCITY_AUDITOR': return <Eye className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Get display name for role (now using translations)
  const getRoleDisplayName = (role: string) => {
    return t(`roles.${role}`);
  };

  if (!currentUser || !['CITY_ADMIN', 'CITY_APPROVER', 'SUBCITY_ADMIN', 'SUBCITY_APPROVER', 'REVENUE_ADMIN', 'REVENUE_APPROVER'].includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2a2718] mb-2">{t('accessDenied.title') || 'Access Denied'}</h2>
          <p className="text-[#2a2718]/70">{t('accessDenied.message') || "You don't have permission to access this page."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718]">
            {t(`pageTitle.${currentUser?.role || 'default'}`)}
          </h1>
          <p className="text-[#2a2718]/70 mt-1">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-[#f0cd6e]/10 text-[#2a2718] rounded-xl hover:bg-[#f0cd6e]/20 transition-colors border border-[#f0cd6e]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('actions.refresh')}
          </button>
          {currentUser.role.includes('ADMIN') && (
            <button 
              onClick={() => setAddUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-xl hover:from-[#2a2718] hover:to-[#f0cd6e] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('actions.addUser')}
            </button>
          )}
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
          <RefreshCw className="w-8 h-8 text-[#f0cd6e] animate-spin mx-auto mb-4" />
          <p className="text-[#2a2718]">{t('messages.loading')}</p>
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

      {/* Approval Pending Modal */}
      <ApprovalPendingModal
        isOpen={!!pendingApproval}
        request={pendingApproval}
        onClose={() => setPendingApproval(null)}
      />
    </div>
  );
};

export default UserManagementPage;