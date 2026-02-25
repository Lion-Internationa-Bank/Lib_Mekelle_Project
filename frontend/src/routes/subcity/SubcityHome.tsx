// src/routes/subcity/SubcityHome.tsx
import { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ParcelSearch from "../../components/ParcelSearch";
import ParcelTable from "../../components/ParcelTable";
import { fetchParcels } from "../../services/parcelApi";
import type { Parcel, Pagination } from "../../services/parcelApi";
import { getSubCities } from "../../services/cityAdminService";
import type { SubCity } from "../../services/cityAdminService";

const SubcityHome = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [subCities, setSubCities] = useState<SubCity[]>([]);
  const [subCitiesLoading, setSubCitiesLoading] = useState(false);

  // sub_city in filter state (optional; for non-subcity roles it comes from dropdown)
  const [currentFilters, setCurrentFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    sub_city: "",
    ketena: "",
    tenure_type: "",
    land_use: "",
  });

  const isSubcityRole =
    !!user &&
    (user.role === "SUBCITY_NORMAL" ||
      user.role === "SUBCITY_AUDITOR" ||
      user.role === "SUBCITY_ADMIN");

  // Load sub-cities only for non-subcity roles (so they can search by any sub-city)
  useEffect(() => {
    const loadSubCities = async () => {
      if (!user) return;
      if (isSubcityRole) return; // these users are locked to their own sub-city

      setSubCitiesLoading(true);
      try {
        const res = await getSubCities();
        if (res.success && res.data) {
          setSubCities(res.data.sub_cities);
        } else {
          console.error(res.error || "Failed to load sub-cities");
        }
      } catch (err) {
        console.error("Failed to load sub-cities", err);
      } finally {
        setSubCitiesLoading(false);
      }
    };

    loadSubCities();
  }, [user, isSubcityRole]);

  const fetchData = useCallback(
    async (filters: typeof currentFilters) => {
      if (!user) return;

      // For sub-city roles: force sub_city to the user's assigned sub_city_id
      const effectiveFilters = {
        ...filters,
        sub_city:
          isSubcityRole && user.sub_city_id
            ? user.sub_city_id
            : filters.sub_city, // for other roles, use selected value
      };

      if (isSubcityRole && !user.sub_city_id) {
        setError("No sub-city assigned to your account.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetchParcels(effectiveFilters);

        if (response.success) {
          setParcels(response.data.parcels);
          setPagination(response.data.pagination);
        } else {
          setError("Failed to load parcels from API");
        }
      } catch (err) {
        setError("Failed to load parcels. Please check your connection.");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, isSubcityRole]
  );

  const handleSearch = useCallback(
    (newFilters: {
      search: string;
      ketena: string;
      tenure_type: string;
      land_use: string;
      sub_city?: string;
    }) => {
      setCurrentFilters((prev) => ({
        ...prev,
        ...newFilters,
        sub_city:
          newFilters.sub_city !== undefined
            ? newFilters.sub_city
            : prev.sub_city,
        page: 1,
      }));
    },
    []
  );

  const handleSubCityChange = (subCityId: string) => {
    // Only meaningful for non-subcity roles; for subcity roles it's ignored in fetchData
    setCurrentFilters((prev) => ({
      ...prev,
      sub_city: subCityId,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setCurrentFilters({
      page: 1,
      limit: 20,
      search: "",
      sub_city: "",
      ketena: "",
      tenure_type: "",
      land_use: "",
    });
  };

  useEffect(() => {
    if (user) {
      fetchData(currentFilters);
    }
  }, [currentFilters, fetchData, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isSubcityNormal = user.role === "SUBCITY_NORMAL";

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-16">
      {/* Quick Action Cards - Sub-city focused (only for SUBCITY_NORMAL) */}
      {isSubcityNormal && (
        <div className="grid md:grid-cols-2  gap-6">
          <Link
            to="/parcels/new"
            className="group bg-linear-to-br from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center h-full"
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl">+</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Add Land Parcel</h3>
            <p className="opacity-90 text-sm">
              Register new parcel in your sub-city
            </p>
          </Link>

          <div className="bg-linear-to-br from-[#f0cd6e] to-[#2a2718] text-white p-8 rounded-3xl shadow-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold">
                {pagination?.total?.toLocaleString() || "0"}
              </div>
              <div className="text-white/80 text-sm font-medium">
                Parcels in Your Sub-city
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <ParcelSearch
        onSearch={handleSearch}
        onClear={clearFilters}
        // Pass sub-city list and selection only for non-subcity roles
        subCities={!isSubcityRole ? subCities : undefined}
        selectedSubCity={!isSubcityRole ? currentFilters.sub_city : undefined}
        onSubCityChange={!isSubcityRole ? handleSubCityChange : undefined}
        subCitiesLoading={!isSubcityRole ? subCitiesLoading : false}
        // Locked label for subcity roles (if you later add sub_city_name to user, you can use it here)
        lockedSubCityName={isSubcityRole ? "Your Sub-city" : undefined}
      />

      {/* Parcels Table Section */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-[#f0cd6e]/30 shadow-2xl overflow-hidden">
        {loading && (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0cd6e] mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-[#2a2718]">
              Loading parcels{isSubcityRole ? " in your sub-city" : ""}...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="p-16 text-center border-t border-[#f0cd6e]/30 bg-[#2a2718]/5">
            <h3 className="text-2xl font-bold text-[#2a2718] mb-4">{error}</h3>
            <button
              onClick={() => fetchData(currentFilters)}
              className="bg-[#f0cd6e] hover:bg-[#2a2718] text-[#2a2718] hover:text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && parcels.length === 0 && (
          <div className="p-16 text-center border-t border-[#f0cd6e]/30 bg-linear-to-br from-[#f0cd6e]/10 to-[#2a2718]/10">
            <span className="text-7xl mb-8 block animate-bounce">📭</span>
            <h3 className="text-3xl font-bold text-[#2a2718] mb-4">
              No parcels found
            </h3>
            <p className="text-xl text-[#2a2718]/70 mb-8 max-w-md mx-auto leading-relaxed">
              Try adjusting your search filters or add a new parcel
            </p>
            {isSubcityNormal && (
              <Link
                to="/parcels/new"
                className="bg-linear-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
              >
                <span>+</span>
                Add First Parcel
              </Link>
            )}
          </div>
        )}

        {!loading && !error && parcels.length > 0 && (
          <ParcelTable parcels={parcels} />
        )}
      </div>

      {pagination && parcels.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-[#f0cd6e]/30 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-sm text-[#2a2718]/70 mb-4 sm:mb-0">
            Showing{" "}
            <span className="font-semibold text-[#2a2718]">
              {(currentFilters.page - 1) * currentFilters.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#2a2718]">
              {Math.min(
                currentFilters.page * currentFilters.limit,
                pagination.total
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#2a2718]">
              {pagination.total.toLocaleString()}
            </span>{" "}
            parcels
            {isSubcityRole ? " in your sub-city" : ""}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentFilters.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="px-6 py-3 text-sm font-semibold text-[#2a2718] bg-[#f0cd6e]/20 hover:bg-[#f0cd6e]/40 rounded-xl transition-all disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-6 py-3 text-sm font-bold text-[#2a2718] bg-white border-2 border-[#f0cd6e] rounded-xl min-w-35 text-center">
              Page {currentFilters.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentFilters.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="px-6 py-3 text-sm font-semibold text-[#2a2718] bg-[#f0cd6e]/20 hover:bg-[#f0cd6e]/40 rounded-xl transition-all disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcityHome;