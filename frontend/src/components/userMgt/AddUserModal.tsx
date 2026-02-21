// src/components/admin/AddUserModal.tsx
import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Building } from 'lucide-react';
import type { UserCreateInput } from '../../services/userService';
import { getSubCities, type SubCity } from '../../services/cityAdminService';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserCreateInput) => Promise<void>;
  currentUser: any;
  creatingUser: boolean;
}

const AddUserModal = ({ isOpen, onClose, onSubmit, currentUser, creatingUser }: AddUserModalProps) => {
  const [formData, setFormData] = useState<UserCreateInput>({
    username: '',
    password: '',
    full_name: '',
    role: getDefaultRole(currentUser),
    sub_city_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [subCities, setSubCities] = useState<SubCity[]>([]);
  const [loadingSubCities, setLoadingSubCities] = useState(false);
  const [subCitiesError, setSubCitiesError] = useState('');

  // Load sub-cities when modal opens and current user is CITY_ADMIN
  useEffect(() => {
    if (isOpen && currentUser?.role === 'CITY_ADMIN' && formData.role === 'SUBCITY_ADMIN') {
      loadSubCities();
    }
  }, [isOpen, currentUser?.role, formData.role]);

  const loadSubCities = async () => {
    setLoadingSubCities(true);
    setSubCitiesError('');
    try {
      const res = await getSubCities();
      if (res.success) {
        setSubCities(res.data?.sub_cities || []);
      } else {
        setSubCitiesError(res.error || 'Failed to load sub-cities');
      }
    } catch (error) {
      setSubCitiesError('Failed to load sub-cities');
    } finally {
      setLoadingSubCities(false);
    }
  };

  if (!isOpen) return null;

  const getCreatableRoles = () => {
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case 'CITY_ADMIN':
        return ['SUBCITY_ADMIN'];
      case 'SUBCITY_ADMIN':
        return ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'];
      case 'REVENUE_ADMIN':
        return ['REVENUE_USER'];
      default:
        return [];
    }
  };

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

  const shouldShowSubCityField = (role: string) => {
    return ['SUBCITY_ADMIN', 'SUBCITY_NORMAL', 'SUBCITY_AUDITOR'].includes(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleRoleChange = (role: string) => {
    const newFormData = {
      ...formData,
      role,
      sub_city_id: '',
    };

    // If role changed to SUBCITY_ADMIN and current user is CITY_ADMIN, load sub-cities
    if (role === 'SUBCITY_ADMIN' && currentUser?.role === 'CITY_ADMIN') {
      loadSubCities();
    }

    // If current user is SUBCITY_ADMIN and role is sub-city role, set their sub-city
    if (currentUser?.role === 'SUBCITY_ADMIN' && shouldShowSubCityField(role)) {
      newFormData.sub_city_id = currentUser.sub_city_id || '';
    }

    setFormData(newFormData);
  };

  const renderSubCityField = () => {
    if (!shouldShowSubCityField(formData.role)) return null;

    // SUBCITY_ADMIN creating NORMAL/AUDITOR users - show their own sub-city
    if (currentUser?.role === 'SUBCITY_ADMIN') {
      return (
        <div>
          <label className="block text-sm font-medium text-[#2a2718] mb-1">Sub-city ID *</label>
          <div className="flex items-center gap-2 p-2 bg-[#f0cd6e]/10 rounded-xl border border-[#f0cd6e]">
            <Building className="w-4 h-4 text-[#2a2718]" />
            <span className="text-[#2a2718]">{currentUser.sub_city_id}</span>
            <span className="text-xs text-[#2a2718]/70 ml-auto">(Your sub-city)</span>
          </div>
          <p className="text-xs text-[#2a2718]/70 mt-1">
            As a Sub-city Admin, you can only create users in your own sub-city
          </p>
        </div>
      );
    }

    // CITY_ADMIN creating SUBCITY_ADMIN - show dropdown
    if (currentUser?.role === 'CITY_ADMIN' && formData.role === 'SUBCITY_ADMIN') {
      return (
        <div>
          <label className="block text-sm font-medium text-[#2a2718] mb-1">Select Sub-city *</label>
          {loadingSubCities ? (
            <div className="px-4 py-2 border border-[#f0cd6e] rounded-xl bg-[#f0cd6e]/5">
              <p className="text-sm text-[#2a2718]/70">Loading sub-cities...</p>
            </div>
          ) : subCitiesError ? (
            <div className="px-4 py-2 border border-red-300 rounded-xl bg-red-50">
              <p className="text-sm text-red-600">{subCitiesError}</p>
              <button
                type="button"
                onClick={loadSubCities}
                className="mt-2 text-sm text-[#f0cd6e] hover:text-[#2a2718]"
              >
                Retry
              </button>
            </div>
          ) : subCities.length === 0 ? (
            <div className="px-4 py-2 border border-[#f0cd6e] rounded-xl bg-[#f0cd6e]/5">
              <p className="text-sm text-[#2a2718]/70">No sub-cities available</p>
            </div>
          ) : (
            <select
              value={formData.sub_city_id}
              onChange={(e) => setFormData({...formData, sub_city_id: e.target.value})}
              className="w-full px-4 py-2 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] bg-white"
              required
            >
              <option value="">Select a sub-city</option>
              {subCities.map((subCity) => (
                <option key={subCity.sub_city_id} value={subCity.sub_city_id}>
                  {subCity.name} ({subCity.sub_city_id.substring(0, 8)}...)
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-[#2a2718]/70 mt-1">
            Select the sub-city this admin will manage
          </p>
        </div>
      );
    }

    // CITY_ADMIN creating NORMAL/AUDITOR (this shouldn't happen based on backend rules, but just in case)
    if (currentUser?.role === 'CITY_ADMIN' && ['SUBCITY_NORMAL', 'SUBCITY_AUDITOR'].includes(formData.role)) {
      return (
        <div>
          <label className="block text-sm font-medium text-[#2a2718] mb-1">Sub-city ID *</label>
          <input
            type="text"
            value={formData.sub_city_id || ''}
            onChange={(e) => setFormData({...formData, sub_city_id: e.target.value})}
            className="w-full px-4 py-2 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            required
            placeholder="Enter sub-city ID"
          />
          <p className="text-xs text-[#2a2718]/70 mt-1">
            Enter the sub-city ID for this user
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#2a2718]">Add New User</h3>
            <p className="text-sm text-[#2a2718]/70 mt-1">Create a new user account</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f0cd6e]/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2a2718] mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-2 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2718] mb-1">Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-2 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-[#2a2718] mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2a2718]/70 hover:text-[#2a2718]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[#2a2718]/70 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2718] mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-4 py-2 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] bg-white"
            >
              {getCreatableRoles().map(role => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>

          {renderSubCityField()}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#f0cd6e]/10 text-[#2a2718] rounded-xl hover:bg-[#f0cd6e]/20 font-medium transition-colors border border-[#f0cd6e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingUser || (shouldShowSubCityField(formData.role) && !formData.sub_city_id)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-xl hover:from-[#2a2718] hover:to-[#f0cd6e] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingUser ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function getDefaultRole(currentUser: any): string {
  if (!currentUser) return 'SUBCITY_ADMIN';
  
  switch (currentUser.role) {
    case 'CITY_ADMIN': return 'SUBCITY_ADMIN';
    case 'SUBCITY_ADMIN': return 'SUBCITY_NORMAL';
    case 'REVENUE_ADMIN': return 'REVENUE_USER';
    default: return 'SUBCITY_NORMAL';
  }
}

export default AddUserModal;