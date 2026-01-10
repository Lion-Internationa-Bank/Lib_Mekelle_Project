// src/routes/admin/ConfigsPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { 
  getConfig, 
  saveConfig, 
  type Config, 
  type ConfigOption,
  type ConfigSaveInput
} from '../../services/cityAdminService';
import { 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Settings,
  ChevronRight,
  Calendar,
  Info,
  Shield,
  Grid3x3,
  Type,
  Tag,
  FileText,
  CreditCard,
  DollarSign,
  Home,
  Lock,
  Globe
} from 'lucide-react';

// Hardcoded fallback categories (remove if you add /configs/categories endpoint)
const fallbackCategories = [
  'LAND_TENURE',
  'LAND_USE',
  'ENCUMBRANCE_TYPE',
  'TRANSFER_TYPE',
  'REVENUE_TYPE',
  'DOCUMENT_TYPE',
  'PAYMENT_METHOD',
  'GENERAL',
  'REVENUE_RATES',
] as const;

const ConfigsPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [options, setOptions] = useState<ConfigOption[]>([]);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call when available
      // For now, use fallback categories
      setCategories([...fallbackCategories]);
    } catch {
      setCategories([...fallbackCategories]);
    }
  };

  // Fetch configuration data for a specific category
  const fetchConfigData = async (category: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await getConfig(category);
      
      if (response.success && response.data) {
        const configData = response.data;
        setConfig(configData);
        setOptions(configData.options || []);
        setDescription(configData.description || '');
      } else {
        // If no config exists, initialize empty config
        setConfig({
          category,
          key: category.toLowerCase(),
          options: [],
          description: '',
          is_active: true
        });
        setOptions([]);
        setDescription('');
        
        if (response.error && response.error !== 'Not found') {
          setError(response.error);
        }
      }
    } catch (err: any) {
      setError('Failed to load configuration');
      setOptions([]);
      setDescription('');
    }
    
    setLoading(false);
  };

  // Save configuration
  const handleSave = async () => {
    if (!selectedCategory) return;

    setSaving(true);
    setError('');
    
    const configData: ConfigSaveInput = {
      options: options.map(opt => ({
        value: opt.value.trim(),
        description: opt.description?.trim() || ''
      })),
      description: description.trim() || undefined
    };

    try {
      const response = await saveConfig(selectedCategory, configData);

      if (response.success && response.data) {
        setSuccess('Configuration saved successfully!');
        fetchConfigData(selectedCategory);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      setError('Network error while saving');
    }
    
    setSaving(false);
  };

  const addOption = () => {
    setOptions([...options, { 
      value: '', 
      description: ''
    }]);
  };

  const updateOption = (index: number, field: keyof ConfigOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const formatCategoryName = (category: string) => {
    return category
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not saved yet';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Validate form before saving
  const validateForm = () => {
    // Check for empty required values
    const hasEmptyValues = options.some(opt => !opt.value.trim());
    if (hasEmptyValues) {
      return 'Please fill in all option values';
    }
    
    // Check for duplicate values
    const values = options.map(opt => opt.value.trim().toLowerCase());
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
      return 'Duplicate option values are not allowed';
    }
    
    return null;
  };

  const handleSaveClick = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    await handleSave();
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: Record<string, React.ReactNode> = {
      LAND_TENURE: <Home className="w-4 h-4" />,
      LAND_USE: <Grid3x3 className="w-4 h-4" />,
      ENCUMBRANCE_TYPE: <Lock className="w-4 h-4" />,
      TRANSFER_TYPE: <Type className="w-4 h-4" />,
      REVENUE_TYPE: <DollarSign className="w-4 h-4" />,
      DOCUMENT_TYPE: <FileText className="w-4 h-4" />,
      PAYMENT_METHOD: <CreditCard className="w-4 h-4" />,
      GENERAL: <Settings className="w-4 h-4" />,
      REVENUE_RATES: <DollarSign className="w-4 h-4" />,
    };
    
    return categoryIcons[category] || <Settings className="w-4 h-4" />;
  };

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      LAND_TENURE: 'Types of land ownership and tenure',
      LAND_USE: 'Categories of land usage',
      ENCUMBRANCE_TYPE: 'Types of land restrictions or liens',
      TRANSFER_TYPE: 'Methods of property transfer',
      REVENUE_TYPE: 'Categories of government revenue',
      DOCUMENT_TYPE: 'Types of legal documents',
      PAYMENT_METHOD: 'Accepted payment methods',
      GENERAL: 'General system settings',
      REVENUE_RATES: 'Tax and revenue rates',
    };
    
    return descriptions[category] || 'System configuration options';
  };

  useEffect(() => {
    if (user?.role === 'CITY_ADMIN') {
      fetchCategories();
    }
  }, [user]);

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
              <Settings className="w-7 h-7 text-blue-600" />
              System Configurations
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Manage system settings and configuration options</p>
          </div>
          
          <div className="flex items-center gap-3">
            {config && (
              <div className={`hidden md:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${config.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                <div className={`w-2 h-2 rounded-full ${config.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{config.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            )}
            
            {selectedCategory && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-gray-400">Active:</span>
                <span className="font-medium text-gray-700">{formatCategoryName(selectedCategory)}</span>
              </div>
            )}
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Categories
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      fetchConfigData(cat);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all group ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${selectedCategory === cat ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                          {getCategoryIcon(cat)}
                        </div>
                        <span className="font-medium">{formatCategoryName(cat)}</span>
                      </div>
                      {selectedCategory === cat && (
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-9">{getCategoryDescription(cat)}</div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <p className="mb-1">Total categories: {categories.length}</p>
                  <p>Select a category to edit its configuration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Editor */}
          <div className="lg:col-span-3">
            {selectedCategory ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Editor Header */}
                <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                        {getCategoryIcon(selectedCategory)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {formatCategoryName(selectedCategory)}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">{getCategoryDescription(selectedCategory)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {config && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                          <Tag className="w-4 h-4" />
                          <span className="font-mono text-xs">{config.key}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading configuration...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Description Section */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Category Description
                            <span className="text-gray-500 font-normal text-sm">(optional)</span>
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px] resize-none placeholder:text-gray-400"
                            placeholder="Describe what this configuration category is used for..."
                          />
                        </div>
                      </div>

                      {/* Options Section */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <Type className="w-5 h-5" />
                              Configuration Options
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Add the available options for this category. Values must be unique.
                            </p>
                          </div>
                          
                          <button
                            onClick={addOption}
                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Option
                          </button>
                        </div>

                        <div className="space-y-4">
                          {options.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                              <Type className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 mb-1">No options configured</p>
                              <p className="text-sm text-gray-400">
                                Click "Add Option" to create your first configuration option
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Table Header */}
                              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider px-4">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-5">Value</div>
                                <div className="col-span-5">Description</div>
                                <div className="col-span-1 text-center">Actions</div>
                              </div>
                              
                              {/* Options List */}
                              {options.map((opt, index) => (
                                <div 
                                  key={index} 
                                  className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-all group"
                                >
                                  <div className="col-span-1 flex justify-center">
                                    <div className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                                      {index + 1}
                                    </div>
                                  </div>
                                  
                                  <div className="col-span-5">
                                    <input
                                      value={opt.value}
                                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                                      placeholder="Enter value (required)"
                                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                                      required
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                      Will be saved as: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{opt.value.trim() || '...'}</code>
                                    </div>
                                  </div>
                                  
                                  <div className="col-span-5">
                                    <input
                                      value={opt.description || ''}
                                      onChange={(e) => updateOption(index, 'description', e.target.value)}
                                      placeholder="Enter description (optional)"
                                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    />
                                  </div>
                                  
                                  <div className="col-span-1 flex justify-center">
                                    <button
                                      onClick={() => removeOption(index)}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                      title="Remove option"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Save Section */}
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              <p>
                                {config 
                                  ? `Editing existing configuration • ${options.length} option${options.length !== 1 ? 's' : ''}`
                                  : `Creating new configuration • ${options.length} option${options.length !== 1 ? 's' : ''}`}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleSaveClick}
                            disabled={saving || loading || options.some(opt => !opt.value.trim())}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow hover:shadow-md flex items-center justify-center gap-2 min-w-[180px] font-medium"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Save Configuration
                              </>
                            )}
                          </button>
                        </div>
                        
                        {options.some(opt => !opt.value.trim()) && (
                          <p className="text-sm text-red-500 mt-3 text-center flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Please fill in all option values before saving
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="max-w-md mx-auto">
                  <Settings className="w-14 h-14 text-gray-300 mx-auto mb-5" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Category</h3>
                  <p className="text-gray-600 mb-6">
                    Choose a configuration category from the sidebar to begin editing
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                    <Info className="w-4 h-4" />
                    <span>{categories.length} categories available</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigsPage;