// src/routes/admin/RateConfigsPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCurrentRate,
  getRateHistory,
  createRate,
  updateRate,
  deactivateRate,
  type RateResponse,
  type RateHistoryItem,
} from "../../services/revenueAdminService";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
  Shield,
  Percent,
  Calculator,
  AlertTriangle,
  History,
  MoreVertical,
} from "lucide-react";
import UniversalDateInput from "../../components/UniversalDateInput";
import DateDisplay from "../../components/DateDisplay";
import { toast } from "sonner";

const RATE_TYPES = [
  "LEASE_INTEREST_RATE",
  "PENALTY_RATE",
  "PENALTY_CONSTRUCTION_DELAY",
  "GRADE_FACTOR_MULTIPLIER",
  "ANNUAL_ESCALATION_RATE",
  "DOWN_PAYMENT_INTEREST",
  "LATE_PAYMENT_GRACE_DAYS",
  "BANK_REFERENCE_RATE",
] as const;

type RateType = (typeof RATE_TYPES)[number];

const rateMeta: Record<
  RateType,
  {
    label: string;
    desc: string;
  }
> = {
  LEASE_INTEREST_RATE: {
    label: "Lease Interest Rate",
    desc: "Annual interest rate applied to lease agreements (%)",
  },
  PENALTY_RATE: {
    label: "Penalty Rate",
    desc: "Penalty rate for late payments or violations (%)",
  },
  PENALTY_CONSTRUCTION_DELAY: {
    label: "Construction Delay Penalty",
    desc: "Penalty rate for construction delays",
  },
  GRADE_FACTOR_MULTIPLIER: {
    label: "Grade Factor Multiplier",
    desc: "Multiplier factor based on land/building grade",
  },
  ANNUAL_ESCALATION_RATE: {
    label: "Annual Escalation Rate",
    desc: "Yearly escalation rate for lease or tax (%)",
  },
  DOWN_PAYMENT_INTEREST: {
    label: "Down Payment Interest",
    desc: "Interest rate applied on down payment (%)",
  },
  LATE_PAYMENT_GRACE_DAYS: {
    label: "Late Payment Grace Days",
    desc: "Number of days before late payment penalty applies",
  },
  BANK_REFERENCE_RATE: {
    label: "Bank Reference Rate",
    desc: "Reference interest rate from central bank (%)",
  },
};

type FormMode = "view" | "edit-existing" | "create-new";

const RateConfigsPage: React.FC = () => {
  const { user } = useAuth();

  const [selectedRateType, setSelectedRateType] =
    useState<RateType>("LEASE_INTEREST_RATE");
  const [currentRate, setCurrentRate] = useState<RateResponse | null>(null);
  const [value, setValue] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(null);
  const [effectiveUntil, setEffectiveUntil] = useState<Date | null>(null);

  const [history, setHistory] = useState<RateHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formMode, setFormMode] = useState<FormMode>("view");

  const [showSidebar, setShowSidebar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user || user.role !== "REVENUE_ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only Revenue Administrators can manage rate configurations.
          </p>
        </div>
      </div>
    );
  }

  const isPercentageType = (type: RateType) =>
    type !== "LATE_PAYMENT_GRACE_DAYS";

  const loadCurrent = async (type: RateType) => {
    setLoading(true);
    setError("");
    setSuccess("");
    setFormMode("view");
    try {
      const res = await getCurrentRate(type);
      if (res.success && res.data) {
        const r = res.data;
        setCurrentRate(r);

        // Backend stores 0–1; UI shows percent except for grace days
        const raw = r.value ?? 0;
        const uiValue = isPercentageType(type) ? raw * 100 : raw;
        setValue(uiValue.toString());

        setSource(r.source || "");
        setEffectiveFrom(r.effective_from ? new Date(r.effective_from) : null);
        setEffectiveUntil(
          r.effective_until ? new Date(r.effective_until) : null
        );
      } else {
        setCurrentRate(null);
        setValue("");
        setSource("");
        setEffectiveFrom(null);
        setEffectiveUntil(null);
        setError(res.error || "No currently effective rate for this type");
      }
    } catch {
      setCurrentRate(null);
      setValue("");
      setSource("");
      setEffectiveFrom(null);
      setEffectiveUntil(null);
      setError("Failed to load current rate");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (type: RateType) => {
    setHistoryLoading(true);
    try {
      const res = await getRateHistory(type, 20);
      if (res.success && res.data) {
        setHistory(res.data.history);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadCurrent(selectedRateType);
    loadHistory(selectedRateType);
  }, [selectedRateType]);

const handleSave = async () => {
  if (!selectedRateType) return;
  setSaving(true);
  setError("");
  setSuccess("");

  try {
    let numericValue: number;

    if (selectedRateType === "LATE_PAYMENT_GRACE_DAYS") {
      numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        setError("Grace days must be a non-negative number");
        setSaving(false);
        return;
      }
    } else {
      const percent = parseFloat(value);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        setError("Rate must be a number between 0 and 100");
        setSaving(false);
        return;
      }
      // Convert percent to decimal 0–1 for backend
      numericValue = percent / 100;
    }

    if (!effectiveFrom) {
      setError("Effective from date is required");
      setSaving(false);
      return;
    }

    const payload = {
      value: numericValue,
      source: source.trim() || undefined,
      effective_from: effectiveFrom.toISOString(),
      effective_until: effectiveUntil
        ? effectiveUntil.toISOString()
        : undefined,
    };

    const res =
      formMode === "edit-existing"
        ? await updateRate(selectedRateType, payload)
        : await createRate(selectedRateType, payload);

    if (res.success && res.data) {
      // Success toast based on form mode
      if (formMode === "edit-existing") {
        toast.success("Rate updated successfully!", {
          description: `The ${selectedRateType.replace(/_/g, ' ').toLowerCase()} has been updated.`,
          duration: 3000,
        });
      } else {
        toast.success("Rate created successfully!", {
          description: `New ${selectedRateType.replace(/_/g, ' ').toLowerCase()} rate has been created.`,
          duration: 3000,
        });
      }
      
      setSuccess(
        formMode === "edit-existing"
          ? "Rate updated successfully!"
          : "Rate created successfully!"
      );
      setCurrentRate(res.data);
      setFormMode("view");
      setTimeout(() => setSuccess(""), 3000);
      loadHistory(selectedRateType);
    } else {
      // Error toast based on form mode
      if (formMode === "edit-existing") {
        toast.error("Failed to update rate", {
          description: res.error || "Could not update the rate. Please try again.",
          duration: 5000,
        });
      } else {
        toast.error("Failed to create rate", {
          description: res.error || "Could not create the rate. Please try again.",
          duration: 5000,
        });
      }
    }
  } catch (error) {
    // Network/unknown error toast based on form mode
    if (formMode === "edit-existing") {
      toast.error("Update failed", {
        description: "A network error occurred while updating the rate.",
        duration: 5000,
      });
    } else {
      toast.error("Creation failed", {
        description: "A network error occurred while creating the rate.",
        duration: 5000,
      });
    }
    
    // Also log to console for debugging
    console.error("Save error:", error);
  } finally {
    setSaving(false);
  }
};

  const handleDeactivate = async () => {
    if (!currentRate || !currentRate.effective_from) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await deactivateRate(selectedRateType, {
        effective_from: currentRate.effective_from,
      });
      if (res.success) {
        setSuccess("Rate deactivated successfully");
        setTimeout(() => setSuccess(""), 3000);
        loadCurrent(selectedRateType);
        loadHistory(selectedRateType);
      } else {
        setError(res.error || "Failed to deactivate rate");
      }
    } catch {
      setError("Network error while deactivating");
    } finally {
      setSaving(false);
    }
  };

  const startEditExisting = () => {
    if (!currentRate) return;
    setFormMode("edit-existing");
    setError("");
    setSuccess("");
  };

  const startCreateNew = () => {
    setFormMode("create-new");
    setCurrentRate(currentRate); // keep header info
    setValue("");
    setSource("");
    setEffectiveFrom(null);
    setEffectiveUntil(null);
    setError("");
    setSuccess("");
  };

  const isReadOnly = formMode === "view";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-green-600" />
              Rate Configurations
            </h1>
            <p className="text-gray-600 mt-1">
              Manage interest, penalty and other revenue-related rates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSidebar((prev) => !prev)}
              className="md:hidden px-3 py-2 text-sm border rounded-lg bg-white text-gray-700"
            >
              {showSidebar ? "Hide Rate Types" : "Show Rate Types"}
            </button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-800">
                  {user.role.replace("_", " ")}
                </span>
              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: rate types */}
          {showSidebar && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-green-600" />
                  Rate Types
                </h2>
                <div className="space-y-2">
                  {RATE_TYPES.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setSelectedRateType(rt)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedRateType === rt
                          ? "bg-green-50 border-l-4 border-green-600 text-green-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">
                        {rateMeta[rt].label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {rateMeta[rt].desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main editor + history */}
          <div
            className={
              showSidebar ? "lg:col-span-3 space-y-6" : "col-span-1 space-y-6"
            }
          >
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-6 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                      {selectedRateType === "PENALTY_RATE" ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Calculator className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {rateMeta[selectedRateType].label}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {rateMeta[selectedRateType].desc}
                      </p>
                      {currentRate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Currently effective from{" "}
                          {currentRate.effective_from
                            ? new Date(
                                currentRate.effective_from
                              ).toLocaleDateString()
                            : "N/A"}{" "}
                          {currentRate.effective_until
                            ? `to ${new Date(
                                currentRate.effective_until
                              ).toLocaleDateString()}`
                            : "(no end date)"}{" "}
                          • {currentRate.is_active ? "Active" : "Inactive"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3-dot menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        onMouseLeave={() => setMenuOpen(false)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            startCreateNew();
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Add new rate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            startEditExisting();
                          }}
                          disabled={!currentRate}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Update current rate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading current rate...</p>
                  </div>
                ) : (
                  <div className="space-y-8 max-w-2xl">
                    {/* Value */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {selectedRateType === "LATE_PAYMENT_GRACE_DAYS"
                          ? "Grace Days"
                          : "Rate Value"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                          placeholder={
                            selectedRateType === "LATE_PAYMENT_GRACE_DAYS"
                              ? "e.g. 15"
                              : "e.g. 12.50"
                          }
                          disabled={isReadOnly}
                        />
                        {selectedRateType !== "LATE_PAYMENT_GRACE_DAYS" && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                            %
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Effective dates */}
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
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Effective Until
                        </label>
                        <UniversalDateInput
                          value={effectiveUntil}
                          onChange={setEffectiveUntil}
                          placeholder="Select end date (optional)"
                          size="sm"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Source / Reference (optional)
                      </label>
                      <textarea
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 min-h-[80px] resize-none disabled:bg-gray-100"
                        placeholder="e.g., Council Resolution No. 123..."
                        disabled={isReadOnly}
                      />
                    </div>

                    {/* Actions */}
                    {formMode !== "view" && (
                      <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleSave}
                          disabled={
                            saving ||
                            loading ||
                            !value.trim() ||
                            !effectiveFrom
                          }
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all shadow hover:shadow-lg"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              {formMode === "edit-existing"
                                ? "Update Rate"
                                : "Create Rate"}
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormMode("view");
                            if (currentRate) {
                              const raw = currentRate.value ?? 0;
                              const uiValue = isPercentageType(
                                selectedRateType
                              )
                                ? raw * 100
                                : raw;
                              setValue(uiValue.toString());
                              setSource(currentRate.source || "");
                              setEffectiveFrom(
                                currentRate.effective_from
                                  ? new Date(currentRate.effective_from)
                                  : null
                              );
                              setEffectiveUntil(
                                currentRate.effective_until
                                  ? new Date(currentRate.effective_until)
                                  : null
                              );
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* (Optional) deactivate button if needed */}
                    {/* <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleDeactivate}
                        disabled={
                          saving ||
                          loading ||
                          !currentRate ||
                          !currentRate.effective_from ||
                          !currentRate.is_active
                        }
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-red-500 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all"
                      >
                        Deactivate Current
                      </button>
                    </div> */}
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Rate History
                  </h3>
                </div>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No history found for this rate type.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-3 py-2 text-left text-gray-600">
                          Value
                        </th>
                        <th className="px-3 py-2 text-left text-gray-600">
                          Effective From
                        </th>
                        <th className="px-3 py-2 text-left text-gray-600">
                          Effective Until
                        </th>
                        <th className="px-3 py-2 text-left text-gray-600">
                          Active
                        </th>
                        <th className="px-3 py-2 text-left text-gray-600">
                          Source
                        </th>
                        <th className="px-3 py-2 text-left text-gray-600">
                          Updated At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, idx) => {
                        const raw = h.value ?? 0;
                        const uiValue = isPercentageType(selectedRateType)
                          ? raw * 100
                          : raw;
                        return (
                          <tr
                            key={idx}
                            className="border-b last:border-0 hover:bg-gray-50"
                          >
                            <td className="px-3 py-2">
                              {uiValue}
                              {selectedRateType !== "LATE_PAYMENT_GRACE_DAYS"
                                ? " %"
                                : ""}
                            </td>

                            <td className="px-3 py-2">
                              <DateDisplay
                                date={h.effective_from}
                                format="medium"
                                className="font-semibold"
                                showTooltip={true}
                                showCalendarIndicator={true}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <DateDisplay
                                date={h.effective_until}
                                format="medium"
                                className="font-semibold"
                                showTooltip={true}
                                showCalendarIndicator={true}
                              />
                            </td>
                            <td className="px-3 py-2">
                              {h.is_active ? "Yes" : "No"}
                            </td>
                            <td className="px-3 py-2 max-w-xs truncate">
                              {h.source || "-"}
                            </td>
                            <td className="px-3 py-2">
                              <DateDisplay
                                date={h.updated_at ?? h.created_at}
                                format="medium"
                                className="font-semibold"
                                showTooltip={true}
                                showCalendarIndicator={true}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateConfigsPage;
