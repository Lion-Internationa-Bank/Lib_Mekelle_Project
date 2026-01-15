// src/routes/admin/ConfigsPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getConfig,
  saveConfig,
  type Config,
  type ConfigOption,
  type ConfigSaveInput,
} from "../../services/cityAdminService";
import {
  getCurrentRate,
  updateRate,
} from "../../services/revenueAdminService";
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
  AlertTriangle,
  Calculator,
  Info,
  type LucideIcon,
} from "lucide-react";
import UniversalDateInput from "../../components/UniversalDateInput";

// Role-based allowed categories
const CITY_ADMIN_CATEGORIES = [
  "LAND_TENURE",
  "LAND_USE",
  "ENCUMBRANCE_TYPE",
  "TRANSFER_TYPE",
] as const;

const REVENUE_ADMIN_CATEGORIES = [
  "LEASE_INTEREST_RATE",
  "PENALTY_RATE",
  "PAYMENT_METHOD",
  "REVENUE_TYPE",
] as const;

// Single-value rate categories (use revenueAdminService)
const SINGLE_VALUE_CATEGORIES = [
  "LEASE_INTEREST_RATE",
  "PENALTY_RATE",
] as const;

type SingleValueCategory = (typeof SINGLE_VALUE_CATEGORIES)[number];

// Category metadata - store icon components separately
const categoryMeta: Record<
  string,
  {
    label: string;
    icon: LucideIcon;
    desc: string;
    type: "single" | "multiple";
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
  LEASE_INTEREST_RATE: {
    label: "Lease Interest Rate",
    icon: Calculator,
    desc: "Annual interest rate applied to lease agreements (%)",
    type: "single",
  },
  PENALTY_RATE: {
    label: "Penalty Rate",
    icon: AlertTriangle,
    desc: "Penalty rate for late payments or violations (%)",
    type: "single",
  },
  PAYMENT_METHOD: {
    label: "Payment Methods",
    icon: CreditCard,
    desc: "Accepted payment channels (e.g., Bank, Mobile Money)",
    type: "multiple",
  },
  REVENUE_TYPE: {
    label: "Revenue Types",
    icon: Tag,
    desc: "Categories of government revenue sources",
    type: "multiple",
  },
} as const;

type AllowedCategory = keyof typeof categoryMeta;

const isSingleCategory = (
  cat: AllowedCategory | null
): cat is SingleValueCategory => {
  if (!cat) return false;
  return SINGLE_VALUE_CATEGORIES.includes(cat as SingleValueCategory);
};

const ConfigsPage: React.FC = () => {
  const { user } = useAuth();

  const [categories, setCategories] = useState<AllowedCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<AllowedCategory | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [options, setOptions] = useState<ConfigOption[]>([]);
  const [singleRate, setSingleRate] = useState<string>("");
  const [source, setSource] = useState<string>(""); // For rate categories
  const [description, setDescription] = useState<string>(""); // For config categories only
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fiscalYear, setFiscalYear] = useState<number>(
    new Date().getFullYear()
  );
  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(null);
  const [effectiveUntil, setEffectiveUntil] = useState<Date | null>(null);

  // Set allowed categories based on role
  useEffect(() => {
    if (!user) return;

    let allowed: AllowedCategory[] = [];

    if (user.role === "CITY_ADMIN") {
      allowed = [...CITY_ADMIN_CATEGORIES] as AllowedCategory[];
    } else if (user.role === "REVENUE_ADMIN") {
      allowed = [...REVENUE_ADMIN_CATEGORIES] as AllowedCategory[];
    }

    setCategories(allowed);

    if (allowed.length > 0 && !selectedCategory) {
      setSelectedCategory(allowed[0]);
    }
  }, [user, selectedCategory]);

  // Load config/rate when category or fiscalYear changes
  useEffect(() => {
    if (!selectedCategory) return;

    const loadData = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        if (isSingleCategory(selectedCategory)) {
          const res = await getCurrentRate(selectedCategory, fiscalYear);
          if (res.success && res.data) {
            setSingleRate(res.data.value.toString());
            setSource(res.data.source || "");
            
            // Parse effective dates
            if (res.data.effective_from) {
              setEffectiveFrom(new Date(res.data.effective_from));
            } else {
              setEffectiveFrom(null);
            }
            
            if (res.data.effective_until) {
              setEffectiveUntil(new Date(res.data.effective_until));
            } else {
              setEffectiveUntil(null);
            }
            
            setConfig(null);
            setOptions([]);
            setDescription(""); // Clear description for rate categories
          } else {
            setSingleRate("");
            setSource("");
            setEffectiveFrom(null);
            setEffectiveUntil(null);
            setError(res.error || "Rate not configured yet");
          }
        } else {
          const res = await getConfig(selectedCategory);
          if (res.success && res.data) {
            const data = res.data;
            setConfig(data);
            setOptions(data.options ? [...data.options] : []);
            setDescription(data.description || "");
            setSingleRate("");
            setSource(""); // Clear source for config categories
            setEffectiveFrom(null);
            setEffectiveUntil(null);
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
            setEffectiveFrom(null);
            setEffectiveUntil(null);
          }
        }
      } catch (err) {
        console.error("Failed to load configuration:", err);
        setError("Failed to load configuration");
        setOptions([]);
        setSingleRate("");
        setSource("");
        setDescription("");
        setEffectiveFrom(null);
        setEffectiveUntil(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, fiscalYear]);

  const handleSave = async () => {
    if (!selectedCategory) return;

    setSaving(true);
    setError("");

    try {
      if (isSingleCategory(selectedCategory)) {
        const rateNum = parseFloat(singleRate);
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
          setError("Rate must be a number between 0 and 100");
          setSaving(false);
          return;
        }

        // For rate categories, pass source parameter (description is optional)
        const res = await updateRate(
          selectedCategory,
          fiscalYear,
          rateNum,
          undefined, // description parameter (not used)
          source.trim() || undefined, // source parameter
          effectiveFrom ? effectiveFrom.toISOString().split('T')[0] : undefined, // effective_from
          effectiveUntil ? effectiveUntil.toISOString().split('T')[0] : undefined // effective_until
        );
        
        if (res.success && res.data) {
          setSuccess("Rate updated successfully!");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(res.error || "Failed to update rate");
        }
      } else {
        if (options.some((opt) => !opt.value.trim())) {
          setError("All option values are required");
          setSaving(false);
          return;
        }
        const values = options.map((opt) => opt.value.trim().toLowerCase());
        if (new Set(values).size !== values.length) {
          setError("Option values must be unique");
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
          setSuccess("Configuration saved successfully!");
          setTimeout(() => setSuccess(""), 3000);
          const refreshed = await getConfig(selectedCategory);
          if (refreshed.success && refreshed.data) {
            setConfig(refreshed.data);
            setOptions(refreshed.data.options ? [...refreshed.data.options] : []);
            setDescription(refreshed.data.description || "");
          }
        } else {
          setError(res.error || "Failed to save configuration");
        }
      }
    } catch (err) {
      console.error("Network error while saving:", err);
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    if (isSingleCategory(selectedCategory)) return;
    setOptions([...options, { value: "", description: "" }]);
  };

  const updateOption = (
    index: number,
    field: keyof ConfigOption,
    value: string
  ) => {
    if (isSingleCategory(selectedCategory)) return;
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (isSingleCategory(selectedCategory)) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  if (!user || !["CITY_ADMIN", "REVENUE_ADMIN"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only City Administrators and Revenue Administrators can manage
            system configurations.
          </p>
        </div>
      </div>
    );
  }

  const isSingleValue = isSingleCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              System Configurations
            </h1>
            <p className="text-gray-600 mt-1">
              {user.role === "CITY_ADMIN"
                ? "Manage land and property-related configuration options"
                : "Manage lease interest, penalty, revenue and payment configuration options"}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              {user.role === "CITY_ADMIN" ? (
                <Home className="w-5 h-5 text-blue-600" />
              ) : (
                <Percent className="w-5 h-5 text-green-600" />
              )}
              <span className="font-medium text-gray-800">
                {user.role.replace("_", " ")}
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
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Allowed Categories
              </h2>

              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">
                    No categories available for your role
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
                            ? "bg-blue-50 border-l-4 border-blue-600 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-md ${
                            selectedCategory === cat
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {IconComponent && <IconComponent className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {categoryMeta[cat]?.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {categoryMeta[cat]?.desc}
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
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-6 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                      {(() => {
                        const IconComponent = categoryMeta[selectedCategory]?.icon;
                        return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {categoryMeta[selectedCategory]?.label}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {categoryMeta[selectedCategory]?.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {loading ? (
                    <div className="text-center py-20">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading configuration...</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* Rate or Options */}
                      {isSingleValue ? (
                        <div className="max-w-2xl space-y-6">
                          {/* Fiscal year selector */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Fiscal Year
                              </label>
                              <input
                                type="number"
                                min="2000"
                                max="2100"
                                value={fiscalYear}
                                onChange={(e) =>
                                  setFiscalYear(
                                    Number(e.target.value) ||
                                      new Date().getFullYear()
                                  )
                                }
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Rates are stored per fiscal year.
                              </p>
                            </div>

                            {/* Rate input */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                {selectedCategory === "LEASE_INTEREST_RATE"
                                  ? "Annual Interest Rate (%)"
                                  : "Penalty Rate (%)"}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  value={singleRate}
                                  onChange={(e) => setSingleRate(e.target.value)}
                                  placeholder="e.g. 12.50"
                                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                  %
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Enter percentage value (0–100) for fiscal year {fiscalYear}.
                              </p>
                            </div>
                          </div>

                          {/* Effective Date Range */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Effective From
                              </label>
                              <UniversalDateInput
                                value={effectiveFrom}
                                onChange={setEffectiveFrom}
                                placeholder="Select start date"
                                size="sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Date when this rate becomes effective
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Effective Until
                              </label>
                              <UniversalDateInput
                                value={effectiveUntil}
                                onChange={setEffectiveUntil}
                                placeholder="Select end date"
                                size="sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Date when this rate expires (optional)
                              </p>
                            </div>
                          </div>

                          {/* Source for rate */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Source / Reference (optional)
                            </label>
                            <textarea
                              value={source}
                              onChange={(e) => setSource(e.target.value)}
                              placeholder="e.g., Council Resolution No. 123, Internal policy..."
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Reference or notes about this rate (e.g., resolution number, policy reference)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Description for config categories */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Description (optional)
                            </label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Purpose or notes about this configuration..."
                              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                            />
                          </div>

                          {/* Options for config categories */}
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                              Configuration Options
                            </h3>
                            <button
                              onClick={addOption}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                            >
                              <Plus className="w-4 h-4" />
                              Add Option
                            </button>
                          </div>

                          {options.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-600 font-medium mb-2">
                                No options configured yet
                              </p>
                              <p className="text-sm text-gray-500">
                                Add your first configuration option above
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {options.map((opt, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-all"
                                >
                                  <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center font-medium text-gray-700 flex-shrink-0">
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
                                      placeholder="Option value (required)"
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                      placeholder="Description (optional)"
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>

                                  <button
                                    onClick={() => removeOption(index)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove option"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Save Button */}
                      <div className="pt-8 border-t border-gray-200">
                        <button
                          onClick={handleSave}
                          disabled={
                            saving ||
                            loading ||
                            (isSingleValue && !singleRate.trim()) ||
                            (!isSingleValue &&
                              options.some((opt) => !opt.value.trim()))
                          }
                          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow hover:shadow-lg flex items-center justify-center gap-2 mx-auto font-medium"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Save Configuration
                            </>
                          )}
                        </button>

                        {(isSingleValue && !singleRate.trim()) ||
                        (!isSingleValue &&
                          options.some((opt) => !opt.value.trim())) ? (
                          <p className="text-sm text-red-500 mt-3 text-center flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {isSingleValue
                              ? "Rate value is required"
                              : "Fill all option values before saving"}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="max-w-lg mx-auto">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    No Category Selected
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Choose a configuration category from the list on the left
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    {categories.length} categories available for your role
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