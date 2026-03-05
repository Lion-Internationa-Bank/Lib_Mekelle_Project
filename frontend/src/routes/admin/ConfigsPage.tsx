// src/routes/admin/ConfigsPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslate } from "../../i18n/useTranslate";
import {
  getConfig,
  saveConfig,
  type Config,
  type ConfigOption,
  type ConfigSaveInput,
} from "../../services/cityAdminService";
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
  Shield,
  Percent,
  CreditCard,
  Tag,
  Grid3x3,
  Type,
  Home,
  Info,
  type LucideIcon,
} from "lucide-react";

// Role-based allowed categories (config-only)
const CITY_ADMIN_CATEGORIES = [
  "LAND_TENURE",
  "LAND_USE",
  "ENCUMBRANCE_TYPE",
  "TRANSFER_TYPE",
] as const;

// Category metadata - config categories only (REVENUE_TYPE removed)
const categoryMeta: Record<
  string,
  {
    label: string;
    icon: LucideIcon;
    desc: string;
    type: "multiple";
  }
> = {
  LAND_TENURE: {
    label: "Land Tenure Types",
    icon: Home,
    desc: "Ownership and tenure types (e.g., Freehold, Leasehold)",
    type: "multiple",
  },
  LAND_USE: {
    label: "Land Use Categories",
    icon: Grid3x3,
    desc: "Permitted uses of land (e.g., Residential, Commercial)",
    type: "multiple",
  },
  ENCUMBRANCE_TYPE: {
    label: "Encumbrance Types",
    icon: CreditCard,
    desc: "Types of restrictions/liens (e.g., Mortgage, Court Freeze)",
    type: "multiple",
  },
  TRANSFER_TYPE: {
    label: "Transfer Types",
    icon: Type,
    desc: "Methods of property transfer (e.g., Sale, Gift, Inheritance)",
    type: "multiple",
  },
} as const;

type AllowedCategory = keyof typeof categoryMeta;

const ConfigsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslate('configs');
  const { t: tCommon } = useTranslate('common');
  const { t: tAuth } = useTranslate('auth');

  const [categories, setCategories] = useState<AllowedCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<AllowedCategory | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [options, setOptions] = useState<ConfigOption[]>([]);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set allowed categories based on role
  useEffect(() => {
    if (!user) return;

    let allowed: AllowedCategory[] = [];

    if (user.role === "CITY_ADMIN") {
      allowed = [...CITY_ADMIN_CATEGORIES] as AllowedCategory[];
    } 

    setCategories(allowed);

    if (allowed.length > 0 && !selectedCategory) {
      setSelectedCategory(allowed[0]);
    }
  }, [user, selectedCategory]);

  // Load config when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    const loadData = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const res = await getConfig(selectedCategory);
        if (res.success && res.data) {
          const data = res.data;
          setConfig(data);
          setOptions(data.options ? [...data.options] : []);
          setDescription(data.description || "");
        } else {
          setConfig({
            category: selectedCategory,
            key: selectedCategory.toLowerCase(),
            options: [],
            description: "",
            is_active: true,
          });
          setOptions([]);
          setDescription("");
        }
      } catch (err) {
        console.error("Failed to load configuration:", err);
        setError(t('errors.fetchFailed'));
        setOptions([]);
        setDescription("");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, t]);

  const handleSave = async () => {
    if (!selectedCategory) return;

    setSaving(true);
    setError("");

    try {
      if (options.some((opt) => !opt.value.trim())) {
        setError(t('validation.valueRequired'));
        setSaving(false);
        return;
      }
      const values = options.map((opt) => opt.value.trim().toLowerCase());
      if (new Set(values).size !== values.length) {
        setError(t('validation.valueUnique'));
        setSaving(false);
        return;
      }

      const configData: ConfigSaveInput = {
        options: options.map((opt) => ({
          value: opt.value.trim(),
          description: opt.description?.trim() || "",
        })),
        description: description.trim() || undefined,
      };

      const res = await saveConfig(selectedCategory, configData);
      if (res.success && res.data) {
        setSuccess(t('messages.saveSuccess'));
        setTimeout(() => setSuccess(""), 3000);
        const refreshed = await getConfig(selectedCategory);
        if (refreshed.success && refreshed.data) {
          setConfig(refreshed.data);
          setOptions(
            refreshed.data.options ? [...refreshed.data.options] : []
          );
          setDescription(refreshed.data.description || "");
        }
      } else {
        setError(res.error || t('errors.saveFailed'));
      }
    } catch (err) {
      console.error("Network error while saving:", err);
      setError(t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    setOptions([...options, { value: "", description: "" }]);
  };

  const updateOption = (
    index: number,
    field: keyof ConfigOption,
    value: string
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  if (!user || !["CITY_ADMIN", "REVENUE_ADMIN"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0cd6e]/10 to-[#2a2718]/10 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#2a2718] mb-3">
            {t('accessDenied.title')}
          </h2>
          <p className="text-[#2a2718]/70 mb-6">
            {t('accessDenied.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0cd6e]/10 to-[#2a2718]/10 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2a2718] flex items-center gap-3">
              <Settings className="w-8 h-8 text-[#f0cd6e]" />
              {t('pageTitle')}
            </h1>
            <p className="text-[#2a2718]/70 mt-1">
              {user.role === "CITY_ADMIN"
                ? t('pageDescription.cityAdmin')
                : t('pageDescription.revenueAdmin')}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-[#f0cd6e]">
            <div className="flex items-center gap-2">
              {user.role === "CITY_ADMIN" ? (
                <Home className="w-5 h-5 text-[#f0cd6e]" />
              ) : (
                <Percent className="w-5 h-5 text-[#f0cd6e]" />
              )}
              <span className="font-medium text-[#2a2718]">
                {tAuth(`roles.${user.role}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6 border border-[#f0cd6e]">
              <h2 className="text-lg font-semibold text-[#2a2718] mb-5 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#f0cd6e]" />
                {t('sidebar.title')}
              </h2>

              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-[#2a2718]/70 text-sm py-4 text-center">
                    {t('sidebar.noCategories')}
                  </p>
                ) : (
                  categories.map((cat) => {
                    const IconComponent = categoryMeta[cat]?.icon;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                          selectedCategory === cat
                            ? "bg-[#f0cd6e]/10 border-l-4 border-[#f0cd6e] text-[#2a2718]"
                            : "text-[#2a2718]/70 hover:bg-[#f0cd6e]/10"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-md ${
                            selectedCategory === cat
                              ? "bg-[#f0cd6e]/20"
                              : "bg-[#f0cd6e]/10"
                          }`}
                        >
                          {IconComponent && (
                            <IconComponent className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {t(`categories.${cat}.label`)}
                          </div>
                          <div className="text-xs text-[#2a2718]/70 mt-0.5 line-clamp-1">
                            {t(`categories.${cat}.description`)}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="lg:col-span-3">
            {selectedCategory ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#f0cd6e]">
                {/* Header */}
                <div className="border-b border-[#f0cd6e] px-6 py-6 bg-gradient-to-r from-[#f0cd6e]/5 to-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#f0cd6e]/10 text-[#2a2718] rounded-xl">
                      {(() => {
                        const IconComponent =
                          categoryMeta[selectedCategory]?.icon;
                        return IconComponent ? (
                          <IconComponent className="w-5 h-5" />
                        ) : null;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#2a2718]">
                        {t(`categories.${selectedCategory}.label`)}
                      </h2>
                      <p className="text-[#2a2718]/70 mt-1">
                        {t(`categories.${selectedCategory}.description`)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {loading ? (
                    <div className="text-center py-20">
                      <Loader2 className="w-12 h-12 text-[#f0cd6e] animate-spin mx-auto mb-4" />
                      <p className="text-[#2a2718]">
                        {t('loading')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                     
                      {/* Options for config categories */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-[#2a2718]">
                          {t('options.title')}
                        </h3>
                        <button
                          onClick={addOption}
                          className="flex items-center gap-2 px-4 py-2 bg-[#f0cd6e]/10 text-[#2a2718] rounded-lg hover:bg-[#f0cd6e]/20 transition border border-[#f0cd6e]"
                        >
                          <Plus className="w-4 h-4" />
                          {t('options.addButton')}
                        </button>
                      </div>

                      {options.length === 0 ? (
                        <div className="border-2 border-dashed border-[#f0cd6e] rounded-xl p-10 text-center">
                          <Tag className="w-12 h-12 text-[#f0cd6e]/30 mx-auto mb-3" />
                          <p className="text-[#2a2718] font-medium mb-2">
                            {t('options.empty.title')}
                          </p>
                          <p className="text-sm text-[#2a2718]/70">
                            {t('options.empty.description')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {options.map((opt, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-4 bg-[#f0cd6e]/5 p-4 rounded-xl border border-[#f0cd6e] hover:border-[#2a2718] transition-all"
                            >
                              <div className="w-8 h-8 bg-white border border-[#f0cd6e] rounded-full flex items-center justify-center font-medium text-[#2a2718] flex-shrink-0">
                                {index + 1}
                              </div>

                              <div className="flex-1 space-y-3">
                                <input
                                  value={opt.value}
                                  onChange={(e) =>
                                    updateOption(
                                      index,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  placeholder={t('options.valuePlaceholder')}
                                  className="w-full p-3 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
                                />
                                <input
                                  value={opt.description || ""}
                                  onChange={(e) =>
                                    updateOption(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder={t('options.descriptionPlaceholder')}
                                  className="w-full p-3 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
                                />
                              </div>

                              <button
                                onClick={() => removeOption(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title={t('options.remove')}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Save Button */}
                      <div className="pt-8 border-t border-[#f0cd6e]">
                        <button
                          onClick={handleSave}
                          disabled={
                            saving ||
                            loading ||
                            options.some((opt) => !opt.value.trim())
                          }
                          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-xl hover:from-[#2a2718] hover:to-[#f0cd6e] disabled:opacity-50 transition-all shadow hover:shadow-lg flex items-center justify-center gap-2 mx-auto font-medium"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {tCommon('saving')}
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              {t('saveButton')}
                            </>
                          )}
                        </button>

                        {options.some((opt) => !opt.value.trim()) ? (
                          <p className="text-sm text-red-500 mt-3 text-center flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {t('validation.valueRequired')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-[#f0cd6e]">
                <div className="max-w-lg mx-auto">
                  <Settings className="w-16 h-16 text-[#f0cd6e]/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-[#2a2718] mb-3">
                    {t('noCategory.title')}
                  </h3>
                  <p className="text-[#2a2718]/70 mb-8">
                    {t('noCategory.description')}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0cd6e]/5 rounded-lg text-sm text-[#2a2718] border border-[#f0cd6e]">
                    <Info className="w-4 h-4" />
                    {t('noCategory.categoriesAvailable', { count: categories.length })}
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