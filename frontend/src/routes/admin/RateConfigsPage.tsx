// src/routes/admin/RateConfigsPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslate } from "../../i18n/useTranslate";
import {
  getCurrentRate,
  getRateHistory,
  createRate,
  updateRate,
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
import UniversalDateInput from "../../components/common/UniversalDateInput";
import DateDisplay from "../../components/common/DateDisplay";
import { formatLocalDate, parseLocalDate } from "../../utils/calendarUtils";
import { toast } from "sonner";

const RATE_TYPES = [
  "LEASE_INTEREST_RATE",
  "PENALTY_RATE",
] as const;

type RateType = (typeof RATE_TYPES)[number];

// const rateMeta: Record<
//   RateType,
//   {
//     label: string;
//     desc: string;
//   }
// > = {
//   LEASE_INTEREST_RATE: {
//     label: "Lease Interest Rate",
//     desc: "Annual interest rate applied to lease agreements (%)",
//   },
//   PENALTY_RATE: {
//     label: "Penalty Rate",
//     desc: "Penalty rate for late payments or violations (%)",
//   },
// };

type FormMode = "view" | "edit-existing" | "create-new";

const RateConfigsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslate('rates');
  const { t: tCommon } = useTranslate('common');
  const { t: tAuth } = useTranslate('auth');

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
      <div className="min-h-screen bg-linear-to-br from-[#f0cd6e]/10 to-[#2a2718]/10 flex items-center justify-center p-4">
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

  const isPercentageType = true;

  // Format rate for display (convert decimal to percentage with 2 decimal places)
  const formatRateForDisplay = (decimalValue: number): string => {
    return (decimalValue * 100).toFixed(2);
  };

  // Format rate for backend (convert percentage to decimal)
  const formatRateForBackend = (percentageValue: number): number => {
    return Number((percentageValue / 100).toFixed(4));
  };

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

        // Backend stores 0–1; UI shows percent with 2 decimal places
        const raw = r.value ?? 0;
        const uiValue = isPercentageType ? formatRateForDisplay(raw) : raw.toString();
        setValue(uiValue);

        setSource(r.source || "");
        
        // Parse dates using parseLocalDate to ensure consistent handling
        setEffectiveFrom(r.effective_from ? parseLocalDate(r.effective_from) : null);
        setEffectiveUntil(r.effective_until ? parseLocalDate(r.effective_until) : null);
      } else {
        setCurrentRate(null);
        setValue("");
        setSource("");
        setEffectiveFrom(null);
        setEffectiveUntil(null);
        setError(res.error || t('errors.noCurrentRate'));
      }
    } catch {
      setCurrentRate(null);
      setValue("");
      setSource("");
      setEffectiveFrom(null);
      setEffectiveUntil(null);
      setError(t('errors.fetchFailed'));
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

      const percent = parseFloat(value);
      if (isNaN(percent) || percent <= 0 || percent > 100) {
        setError(t('validation.valueBetween'));
        setSaving(false);
        return;
      }
      // Convert percent to decimal 0–1 for backend
      numericValue = formatRateForBackend(percent);
      
      // Ensure value is between 0 and 1
      if (numericValue <= 0 || numericValue > 1) {
        setError(t('validation.valueBetween'));
        setSaving(false);
        return;
      }

      if (!effectiveFrom) {
        setError(t('validation.effectiveFromRequired'));
        setSaving(false);
        return;
      }

      // Format dates using formatLocalDate to ensure YYYY-MM-DD format without timezone issues
      const payload = {
        value: numericValue,
        source: source.trim() || undefined,
        effective_from: formatLocalDate(effectiveFrom),
        effective_until: effectiveUntil ? formatLocalDate(effectiveUntil) : undefined,
      };

      const res =
        formMode === "edit-existing"
          ? await updateRate(selectedRateType, payload)
          : await createRate(selectedRateType, payload);

      if (res.success && res.data) {
        // Success toast based on form mode
        if (formMode === "edit-existing") {
          toast.success(t('messages.updateSuccess'), {
            description: t('messages.updateDescription', { type: selectedRateType.replace(/_/g, ' ').toLowerCase() }),
            duration: 3000,
          });
        } else {
          toast.success(t('messages.createSuccess'), {
            description: t('messages.createDescription', { type: selectedRateType.replace(/_/g, ' ').toLowerCase() }),
            duration: 3000,
          });
        }
        
        setSuccess(
          formMode === "edit-existing"
            ? t('messages.updateSuccess')
            : t('messages.createSuccess')
        );
        setCurrentRate(res.data);
        setFormMode("view");
        setTimeout(() => setSuccess(""), 3000);
        loadHistory(selectedRateType);
      } else {
        // Error toast based on form mode
        if (formMode === "edit-existing") {
          toast.error(t('errors.updateFailed'), {
            description: res.error || t('errors.updateGeneric'),
            duration: 5000,
          });
        } else {
          toast.error(t('errors.createFailed'), {
            description: res.error || t('errors.createGeneric'),
            duration: 5000,
          });
        }
      }
    } catch (error) {
      // Network/unknown error toast based on form mode
      if (formMode === "edit-existing") {
        toast.error(t('errors.updateFailed'), {
          description: t('errors.networkError'),
          duration: 5000,
        });
      } else {
        toast.error(t('errors.createFailed'), {
          description: t('errors.networkError'),
          duration: 5000,
        });
      }
      
      // Also log to console for debugging
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // const handleDeactivate = async () => {
  //   if (!currentRate || !currentRate.effective_from) return;
  //   setSaving(true);
  //   setError("");
  //   setSuccess("");
  //   try {
  //     // Use formatLocalDate for the effective_from date
  //     const res = await deactivateRate(selectedRateType, {
  //       effective_from: formatLocalDate(parseLocalDate(currentRate.effective_from) || new Date()),
  //     });
  //     if (res.success) {
  //       setSuccess(t('messages.deactivateSuccess'));
  //       setTimeout(() => setSuccess(""), 3000);
  //       loadCurrent(selectedRateType);
  //       loadHistory(selectedRateType);
  //     } else {
  //       setError(res.error || t('errors.deactivateFailed'));
  //     }
  //   } catch {
  //     setError(t('errors.networkError'));
  //   } finally {
  //     setSaving(false);
  //   }
  // };

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

  // Helper to format date for display in the header
  const formatDateForHeader = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    const date = parseLocalDate(dateString);
    return date ? date.toLocaleDateString() : tCommon('date.invalid');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f0cd6e]/10 to-[#2a2718]/10 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2a2718] flex items-center gap-3">
              <Settings className="w-8 h-8 text-[#f0cd6e]" />
              {t('pageTitle')}
            </h1>
            <p className="text-[#2a2718]/70 mt-1">
              {t('pageDescription')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSidebar((prev) => !prev)}
              className="md:hidden px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg bg-white text-[#2a2718] hover:bg-[#f0cd6e]/20"
            >
              {showSidebar ? t('actions.hideTypes') : t('actions.showTypes')}
            </button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-[#f0cd6e]">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#f0cd6e]" />
                <span className="font-medium text-[#2a2718]">
                  {tAuth('roles.REVENUE_ADMIN')}
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
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6 border border-[#f0cd6e]">
                <h2 className="text-lg font-semibold text-[#2a2718] mb-5 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#f0cd6e]" />
                  {t('rateTypes')}
                </h2>
                <div className="space-y-2">
                  {RATE_TYPES.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setSelectedRateType(rt)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedRateType === rt
                          ? "bg-[#f0cd6e]/10 border-l-4 border-[#f0cd6e] text-[#2a2718]"
                          : "text-[#2a2718]/70 hover:bg-[#f0cd6e]/10"
                      }`}
                    >
                      <div className="font-medium">
                        {t(`types.${rt}.label`)}
                      </div>
                      <div className="text-xs text-[#2a2718]/70 mt-0.5 line-clamp-1">
                        {t(`types.${rt}.description`)}
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
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#f0cd6e]">
              <div className="border-b border-[#f0cd6e] px-6 py-6 bg-linear-to-r from-[#f0cd6e]/5 to-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#f0cd6e]/10 text-[#2a2718] rounded-xl">
                      {selectedRateType === "PENALTY_RATE" ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Calculator className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#2a2718]">
                        {t(`types.${selectedRateType}.label`)}
                      </h2>
                      <p className="text-[#2a2718]/70 mt-1">
                        {t(`types.${selectedRateType}.description`)}
                      </p>
                      {currentRate && (
                        <p className="text-xs text-[#2a2718]/70 mt-1">
                          {t('current.effectiveFrom')}{" "}
                          {currentRate.effective_from
                            ? formatDateForHeader(currentRate.effective_from)
                            : "N/A"}{" "}
                          {currentRate.effective_until
                            ? `${t('current.to')} ${formatDateForHeader(currentRate.effective_until)}`
                            : t('current.noEndDate')}{" "}
                          • {currentRate.is_active ? t('status.active') : t('status.inactive')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3-dot menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className="p-2 rounded-full hover:bg-[#f0cd6e]/10 text-[#2a2718]"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-44 bg-white border border-[#f0cd6e] rounded-md shadow-lg z-10"
                        onMouseLeave={() => setMenuOpen(false)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            startCreateNew();
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#f0cd6e]/10 text-[#2a2718]"
                        >
                          {t('actions.addNew')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            startEditExisting();
                          }}
                          disabled={!currentRate}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#f0cd6e]/10 text-[#2a2718] disabled:text-[#2a2718]/40 disabled:cursor-not-allowed"
                        >
                          {t('actions.updateCurrent')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-12 h-12 text-[#f0cd6e] animate-spin mx-auto mb-4" />
                    <p className="text-[#2a2718]">{t('loading')}</p>
                  </div>
                ) : (
                  <div className="space-y-8 max-w-2xl">
                    {/* Value */}
                    <div>
                      <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                        {t('fields.value')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-full p-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] disabled:bg-[#f0cd6e]/5"
                          placeholder={t('placeholders.value')}
                          disabled={isReadOnly}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2a2718]/70 font-bold">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-[#2a2718]/70 mt-1">
                        {t('hints.value')}
                      </p>
                    </div>

                    {/* Effective dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                          {t('fields.effectiveFrom')}
                        </label>
                        <UniversalDateInput
                          value={effectiveFrom}
                          onChange={setEffectiveFrom}
                          placeholder={t('placeholders.effectiveFrom')}
                          size="sm"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                          {t('fields.effectiveUntil')}
                        </label>
                        <UniversalDateInput
                          value={effectiveUntil}
                          onChange={setEffectiveUntil}
                          placeholder={t('placeholders.effectiveUntil')}
                          size="sm"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                        {t('fields.source')}
                      </label>
                      <textarea
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full p-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] min-h-20 resize-none disabled:bg-[#f0cd6e]/5"
                        placeholder={t('placeholders.source')}
                        disabled={isReadOnly}
                      />
                    </div>

                    {/* Actions */}
                    {formMode !== "view" && (
                      <div className="pt-6 border-t border-[#f0cd6e] flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleSave}
                          disabled={
                            saving ||
                            loading ||
                            !value.trim() ||
                            !effectiveFrom
                          }
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#f0cd6e] to-[#2a2718] text-white rounded-xl hover:from-[#2a2718] hover:to-[#f0cd6e] disabled:opacity-50 transition-all shadow hover:shadow-lg"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {tCommon('saving')}
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              {formMode === "edit-existing"
                                ? t('actions.update')
                                : t('actions.create')}
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormMode("view");
                            if (currentRate) {
                              const raw = currentRate.value ?? 0;
                              const uiValue = isPercentageType
                                ? formatRateForDisplay(raw)
                                : raw.toString();
                              setValue(uiValue);
                              setSource(currentRate.source || "");
                              setEffectiveFrom(
                                currentRate.effective_from
                                  ? parseLocalDate(currentRate.effective_from)
                                  : null
                              );
                              setEffectiveUntil(
                                currentRate.effective_until
                                  ? parseLocalDate(currentRate.effective_until)
                                  : null
                              );
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#f0cd6e] text-[#2a2718] rounded-xl hover:bg-[#f0cd6e]/10 transition-all"
                        >
                          {tCommon('cancel')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#f0cd6e]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#2a2718]" />
                  <h3 className="text-lg font-semibold text-[#2a2718]">
                    {t('history.title')}
                  </h3>
                </div>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#f0cd6e] animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-[#2a2718]/70">
                  {t('history.empty')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b bg-[#f0cd6e]/10">
                        <th className="px-3 py-2 text-left text-[#2a2718]">
                          {t('history.columns.value')}
                        </th>
                        <th className="px-3 py-2 text-left text-[#2a2718]">
                          {t('history.columns.effectiveFrom')}
                        </th>
                        <th className="px-3 py-2 text-left text-[#2a2718]">
                          {t('history.columns.effectiveUntil')}
                        </th>
                        <th className="px-3 py-2 text-left text-[#2a2718]">
                          {t('history.columns.active')}
                        </th>
                        <th className="px-3 py-2 text-left text-[#2a2718]">
                          {t('history.columns.source')}
                        </th>
                        <th className="px-3 py-2 text-left text-[#2a2718]">
                          {t('history.columns.updatedAt')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, idx) => {
                        const raw = h.value ?? 0;
                        const uiValue = isPercentageType
                          ? formatRateForDisplay(raw)
                          : raw.toString();
                        return (
                          <tr
                            key={idx}
                            className="border-b last:border-0 hover:bg-[#f0cd6e]/5"
                          >
                            <td className="px-3 py-2 text-[#2a2718]">
                              {uiValue}%
                            </td>

                            <td className="px-3 py-2">
                              <DateDisplay
                                date={h.effective_from ? parseLocalDate(h.effective_from) : null}
                                format="medium"
                                className="font-semibold"
                                showTooltip={true}
                                showCalendarIndicator={true}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <DateDisplay
                                date={h.effective_until ? parseLocalDate(h.effective_until) : null}
                                format="medium"
                                className="font-semibold"
                                showTooltip={true}
                                showCalendarIndicator={true}
                              />
                            </td>
                            <td className="px-3 py-2 text-[#2a2718]">
                              {h.is_active ? t('history.yes') : t('history.no')}
                            </td>
                            <td className="px-3 py-2 max-w-xs truncate text-[#2a2718]">
                              {h.source || "-"}
                            </td>
                            <td className="px-3 py-2">
                              <DateDisplay
                                date={h.updated_at ?? h.created_at ? parseLocalDate(h.updated_at ?? h.created_at) : null}
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