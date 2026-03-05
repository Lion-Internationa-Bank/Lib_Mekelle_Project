// src/components/ParcelSearch.tsx
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useTranslate } from "../i18n/useTranslate";
import type { SubCity } from "../services/cityAdminService";
import { getConfig } from "../services/cityAdminService";

interface ParcelSearchProps {
  onSearch: (filters: {
    search: string;
    sub_city: string;
    ketena: string;
    tenure_type: string;
    land_use: string;
  }) => void;

  // Optional clear callback from parent
  onClear?: () => void;

  // Optional sub-city selection support for non-subcity roles
  subCities?: SubCity[];
  selectedSubCity?: string;
  onSubCityChange?: (subCityId: string) => void;
  subCitiesLoading?: boolean;

  // For SUBCITY_* roles, show a locked label instead of an input
  lockedSubCityName?: string;
}

const ParcelSearch = ({
  onSearch,
  onClear,
  subCities,
  selectedSubCity,
  onSubCityChange,
  subCitiesLoading = false,
  lockedSubCityName,
}: ParcelSearchProps) => {
  const { t } = useTranslate('parcelSearch');
  const { t: tCommon } = useTranslate('common');
  
  const [filters, setFilters] = useState({
    search: "",
    sub_city: "",
    ketena: "",
    tenure_type: "",
    land_use: "",
  });

  const [tenureTypes, setTenureTypes] = useState<string[]>([]);
  const [landUses, setLandUses] = useState<string[]>([]);
  const [loadingTenureTypes, setLoadingTenureTypes] = useState(false);
  const [loadingLandUses, setLoadingLandUses] = useState(false);
  const [errorTenureTypes, setErrorTenureTypes] = useState("");
  const [errorLandUses, setErrorLandUses] = useState("");

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        // Fetch both configs in parallel
        const [tenureResponse, landUseResponse] = await Promise.all([
          getConfig('LAND_TENURE'),
          getConfig('LAND_USE'),
        ]);

        if (tenureResponse.success && tenureResponse.data) {
          setTenureTypes(tenureResponse.data.options.map(opt => opt.value));
        } else {
          setErrorTenureTypes(tenureResponse.error || t('errors.loadTenureFailed'));
        }

        if (landUseResponse.success && landUseResponse.data) {
          setLandUses(landUseResponse.data.options.map(opt => opt.value));
        } else {
          setErrorLandUses(landUseResponse.error || t('errors.loadLandUseFailed'));
        }
      } catch (err) {
        setErrorTenureTypes(t('errors.loadTenureFailed'));
        setErrorLandUses(t('errors.loadLandUseFailed'));
        console.error("Error fetching configs:", err);
      } finally {
        setLoadingTenureTypes(false);
        setLoadingLandUses(false);
      }
    };

    // Set loading states before fetching
    setLoadingTenureTypes(true);
    setLoadingLandUses(true);
    fetchConfigs();
  }, [t]);

  // Keep internal sub_city in sync with controlled prop when provided
  useEffect(() => {
    if (selectedSubCity !== undefined) {
      setFilters((prev) => ({ ...prev, sub_city: selectedSubCity }));
    }
  }, [selectedSubCity]);

  const triggerSearch = (nextFilters: typeof filters) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      onSearch(nextFilters);
    }, 300) as number;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // sub_city is special if parent controls it
    if (name === "sub_city" && onSubCityChange) {
      onSubCityChange(value);
      // parent will update selectedSubCity, which syncs via useEffect
      return;
    }

    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      triggerSearch(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const cleared = {
      search: "",
      sub_city: "",
      ketena: "",
      tenure_type: "",
      land_use: "",
    };
    setFilters(cleared);
    onSearch(cleared);
    if (onSubCityChange) onSubCityChange("");
    if (onClear) onClear();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white/80 rounded-2xl p-6 border border-[#f0cd6e] shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-[#2a2718] mb-1">
            {t('labels.search')}
          </label>
          <input
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder={t('placeholders.search')}
            className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2a2718] mb-1">
            {t('labels.subCity')}
          </label>

          {lockedSubCityName ? (
            // For SUBCITY_* roles: show fixed label, no input
            <input
              value={lockedSubCityName}
              disabled
              className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg bg-[#f0cd6e]/10 text-[#2a2718]"
            />
          ) : subCities && subCities.length > 0 ? (
            // For other roles: dropdown of sub-cities from API
            <select
              name="sub_city"
              value={selectedSubCity ?? filters.sub_city}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            >
              <option value="">
                {subCitiesLoading ? tCommon('loading') : t('options.allSubCities')}
              </option>
              {subCities.map((sc) => (
                <option key={sc.sub_city_id} value={sc.sub_city_id}>
                  {sc.name}
                </option>
              ))}
            </select>
          ) : (
            // Fallback: free-text if no list provided
            <input
              name="sub_city"
              value={filters.sub_city}
              onChange={handleChange}
              placeholder={t('placeholders.subCity')}
              className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2a2718] mb-1">
            {t('labels.ketena')}
          </label>
          <input
            name="ketena"
            value={filters.ketena}
            onChange={handleChange}
            placeholder={t('placeholders.ketena')}
            className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2a2718] mb-1">
            {t('labels.tenureType')}
          </label>
          <select
            name="tenure_type"
            value={filters.tenure_type}
            onChange={handleChange}
            disabled={loadingTenureTypes}
            className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] disabled:bg-[#f0cd6e]/10"
          >
            <option value="">{t('options.all')}</option>
            {loadingTenureTypes ? (
              <option value="" disabled>{tCommon('loading')}</option>
            ) : errorTenureTypes ? (
              <option value="" disabled>{t('errors.loadTenureFailed')}</option>
            ) : (
              tenureTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))
            )}
          </select>
          {errorTenureTypes && (
            <p className="text-xs text-[#2a2718] mt-1">{errorTenureTypes}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2a2718] mb-1">
            {t('labels.landUse')}
          </label>
          <select
            name="land_use"
            value={filters.land_use}
            onChange={handleChange}
            disabled={loadingLandUses}
            className="w-full px-3 py-2 text-sm border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] disabled:bg-[#f0cd6e]/10"
          >
            <option value="">{t('options.all')}</option>
            {loadingLandUses ? (
              <option value="" disabled>{tCommon('loading')}</option>
            ) : errorLandUses ? (
              <option value="" disabled>{t('errors.loadLandUseFailed')}</option>
            ) : (
              landUses.map((use) => (
                <option key={use} value={use}>
                  {use}
                </option>
              ))
            )}
          </select>
          {errorLandUses && (
            <p className="text-xs text-[#2a2718] mt-1">{errorLandUses}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <button
          onClick={clearFilters}
          className="px-4 py-1.5 text-[#2a2718] bg-[#f0cd6e]/20 hover:bg-[#f0cd6e]/40 rounded-lg transition-colors text-xs font-medium"
        >
          {t('actions.clearFilters')}
        </button>
        {activeCount > 0 && (
          <span className="text-[#2a2718]/70">
            {t('activeFilters', { count: activeCount })}
          </span>
        )}
      </div>
    </div>
  );
};

export default ParcelSearch;