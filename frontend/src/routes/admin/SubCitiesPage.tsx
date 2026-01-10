// src/routes/admin/SubCitiesPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">This page is only accessible to City Administrators.</p>
          <p className="text-sm text-gray-500">Your current role: {user?.role || 'Not authenticated'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-blue-600" />
              Sub-cities Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Manage all sub-cities within the city administration</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{subCities.length} sub-cities</span>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow hover:shadow-md flex items-center gap-2"
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
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
            <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                {editingId ? (
                  <>
                    <Edit className="w-5 h-5 text-blue-600" />
                    Edit Sub-city
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-blue-600" />
                    Add New Sub-city
                  </>
                )}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Sub-city Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    placeholder="e.g., Bole, Kirkos, Lideta"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Enter the official name of the sub-city</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Description
                    <span className="text-gray-500 text-sm font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px] resize-none placeholder:text-gray-400"
                    placeholder="Brief description about this sub-city..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-2">Add any relevant details about this sub-city</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow hover:shadow-md flex items-center justify-center gap-2 font-medium"
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
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sub-cities by name or description..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                Showing {filteredCities.length} of {subCities.length}
              </div>
              
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-cities List */}
        {loading && subCities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading sub-cities...</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-5" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching sub-cities found' : 'No sub-cities yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Get started by adding your first sub-city using the "Add Sub-city" button above.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow hover:shadow-md flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Your First Sub-city
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  All Sub-cities
                </h3>
                <div className="text-sm text-gray-500">
                  {filteredCities.length} sub-cities
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Name
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Description
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCities.map((sub, index) => (
                    <tr 
                      key={sub.sub_city_id} 
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{sub.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{sub.sub_city_id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-gray-600 text-sm">
                            {sub.description || (
                              <span className="text-gray-400 italic">No description</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(sub.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(sub)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
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
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
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