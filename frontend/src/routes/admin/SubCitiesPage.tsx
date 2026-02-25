// src/routes/admin/SubCitiesPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSubCities,
  createSubCity,
  updateSubCity,
  deleteSubCity,
  type SubCity,
  type SubCityCreateInput,
  type SubCityUpdateInput,
} from '../../services/cityAdminService';
import {
  Building2,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Users,
  Globe,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const SubCitiesPage = () => {
  const { user } = useAuth();
  const [subCities, setSubCities] = useState<SubCity[]>([]);
  const [filteredCities, setFilteredCities] = useState<SubCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<SubCityCreateInput>({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchSubCities = async () => {
    setLoading(true);
    setError('');
    const res = await getSubCities();
    if (res.success) {
      const cities = res.data?.sub_cities || [];
      setSubCities(cities);
      setFilteredCities(cities);
    } else {
      setError(res.error || 'Failed to load sub-cities');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'CITY_ADMIN') {
      fetchSubCities();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCities(subCities);
    } else {
      const filtered = subCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (city.description && city.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCities(filtered);
    }
  }, [searchTerm, subCities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Sub-city name is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = editingId
        ? await updateSubCity(editingId, form as SubCityUpdateInput)
        : await createSubCity(form);

      if (res.success) {
        setSuccess(editingId 
          ? 'Sub-city updated successfully!' 
          : 'Sub-city created successfully!'
        );
        setForm({ name: '', description: '' });
        setEditingId(null);
        setShowForm(false);
        fetchSubCities();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Operation failed');
      }
    } catch (err: any) {
      setError('Network error occurred');
    }
    
    setSaving(false);
  };

  const handleEdit = (sub: SubCity) => {
    setForm({
      name: sub.name,
      description: sub.description || '',
    });
    setEditingId(sub.sub_city_id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sub-city? This action cannot be undone.')) return;

    setLoading(true);
    const res = await deleteSubCity(id);
    if (res.success) {
      setSuccess('Sub-city deleted successfully!');
      fetchSubCities();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to delete sub-city');
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  if (user?.role !== 'CITY_ADMIN') {
    return (
      <div className="min-h-screen bg-linear-0-to-br from-[#f0cd6e]/10 to-[#2a2718]/10 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2a2718] mb-2">Access Denied</h2>
          <p className="text-[#2a2718]/70 mb-4">This page is only accessible to City Administrators.</p>
          <p className="text-sm text-[#2a2718]/70">Your current role: {user?.role || 'Not authenticated'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-0-to-br from-[#f0cd6e]/10 to-[#2a2718]/10 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2a2718] flex items-center gap-3">
              <Building2 className="w-7 h-7 text-[#f0cd6e]" />
              Sub-cities Management
            </h1>
            <p className="text-[#2a2718]/70 mt-1 text-sm">Manage all sub-cities within the city administration</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-[#2a2718]/70 bg-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 border border-[#f0cd6e]">
              <Globe className="w-4 h-4" />
              <span>{subCities.length} sub-cities</span>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-xl hover:from-[#2a2718] hover:to-[#f0cd6e] transition-colors"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Add Sub-city'}
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn border border-[#f0cd6e]">
            <div className="border-b border-[#f0cd6e] px-6 py-5 bg-linear-0-to-r from-[#f0cd6e]/5 to-white">
              <h2 className="text-xl font-bold text-[#2a2718] flex items-center gap-3">
                {editingId ? (
                  <>
                    <Edit className="w-5 h-5 text-[#f0cd6e]" />
                    Edit Sub-city
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-[#f0cd6e]" />
                    Add New Sub-city
                  </>
                )}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className=" text-sm font-semibold text-[#2a2718] mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Sub-city Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-all placeholder:text-[#2a2718]/40"
                    placeholder="e.g., Bole, Kirkos, Lideta"
                    required
                  />
                  <p className="text-xs text-[#2a2718]/70 mt-2">Enter the official name of the sub-city</p>
                </div>

                <div>
                  <label className=" text-sm font-semibold text-[#2a2718] mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Description
                    <span className="text-[#2a2718]/70 text-sm font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-all min-h-25 resize-none placeholder:text-[#2a2718]/40"
                    placeholder="Brief description about this sub-city..."
                    rows={3}
                  />
                  <p className="text-xs text-[#2a2718]/70 mt-2">Add any relevant details about this sub-city</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#f0cd6e]">
                <button
                  type="submit"
                  disabled={saving}
                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-xl hover:from-[#2a2718] hover:to-[#f0cd6e] transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingId ? 'Update Sub-city' : 'Create Sub-city'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-[#f0cd6e]/10 text-[#2a2718] rounded-lg hover:bg-[#f0cd6e]/20 transition-all flex items-center justify-center gap-2 font-medium border border-[#f0cd6e]"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-[#f0cd6e]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-[#f0cd6e] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sub-cities by name or description..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#2a2718]/70 bg-[#f0cd6e]/10 px-3 py-1.5 rounded-lg border border-[#f0cd6e]">
                Showing {filteredCities.length} of {subCities.length}
              </div>
              
              <button className="p-2 border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/10 transition-colors">
                <Filter className="w-5 h-5 text-[#2a2718]" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-cities List */}
        {loading && subCities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-[#f0cd6e]">
            <Loader2 className="w-12 h-12 text-[#f0cd6e] animate-spin mx-auto mb-4" />
            <p className="text-[#2a2718]">Loading sub-cities...</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-[#f0cd6e]">
            <MapPin className="w-16 h-16 text-[#f0cd6e]/30 mx-auto mb-5" />
            <h3 className="text-xl font-semibold text-[#2a2718] mb-2">
              {searchTerm ? 'No matching sub-cities found' : 'No sub-cities yet'}
            </h3>
            <p className="text-[#2a2718]/70 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Get started by adding your first sub-city using the "Add Sub-city" button above.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-linear-0-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-lg hover:from-[#2a2718] hover:to-[#f0cd6e] transition-all shadow hover:shadow-md flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Your First Sub-city
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#f0cd6e]">
            {/* Table Header */}
            <div className="border-b border-[#f0cd6e] px-6 py-4 bg-linear-0-to-r from-[#f0cd6e]/5 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2a2718] flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  All Sub-cities
                </h3>
                <div className="text-sm text-[#2a2718]/70">
                  {filteredCities.length} sub-cities
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f0cd6e]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#2a2718] uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Name
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#2a2718] uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Description
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#2a2718] uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#2a2718] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0cd6e]/30">
                  {filteredCities.map((sub, index) => (
                    <tr 
                      key={sub.sub_city_id} 
                      className={`hover:bg-[#f0cd6e]/10 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#f0cd6e]/5'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#f0cd6e]/10 text-[#2a2718] rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-[#2a2718]">{sub.name}</div>
                            <div className="text-xs text-[#2a2718]/70 font-mono">{sub.sub_city_id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-[#2a2718]/70 text-sm">
                            {sub.description || (
                              <span className="text-[#2a2718]/50 italic">No description</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#f0cd6e]" />
                          <span className="text-sm text-[#2a2718]">{formatDate(sub.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(sub)}
                            className="p-2 text-[#f0cd6e] hover:text-[#2a2718] hover:bg-[#f0cd6e]/10 rounded-lg transition-colors"
                            title="Edit sub-city"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.sub_city_id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete sub-city"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="border-t border-[#f0cd6e] px-6 py-4 bg-[#f0cd6e]/5">
              <div className="flex items-center justify-between text-sm text-[#2a2718]/70">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Total sub-cities: {subCities.length}</span>
                </div>
                <div>
                  {searchTerm && (
                    <span>Showing results for: "{searchTerm}"</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCitiesPage;