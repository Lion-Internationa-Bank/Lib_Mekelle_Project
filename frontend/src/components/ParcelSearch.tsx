import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";

interface ParcelSearchProps {
  onSearch: (filters: {
    search: string;
    sub_city: string;
    ketena: string;
    tenure_type: string;
    land_use: string;
  }) => void;
}

const tenureTypes = ["Freehold", "Leasehold", "Government", "Communal"];
const landUses = ["Residential", "Commercial", "Industrial", "Agricultural", "Public"];

const ParcelSearch = ({ onSearch }: ParcelSearchProps) => {
  const [filters, setFilters] = useState({
    search: "",
    sub_city: "",
    ketena: "",
    tenure_type: "",
    land_use: "",
  });

  const timeoutRef = useRef<number | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        onSearch(newFilters);
      }, 300) as number;

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
    <div className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search UPIN/File</label>
          <input
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="UPIN, file..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sub City</label>
          <input
            name="sub_city"
            value={filters.sub_city}
            onChange={handleChange}
            placeholder="Adi Haki..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ketena</label>
          <input
            name="ketena"
            value={filters.ketena}
            onChange={handleChange}
            placeholder="Ketena 01..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tenure Type</label>
          <select
            name="tenure_type"
            value={filters.tenure_type}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            {tenureTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Land Use</label>
          <select
            name="land_use"
            value={filters.land_use}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            {landUses.map((use) => (
              <option key={use} value={use}>
                {use}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <button
          onClick={clearFilters}
          className="px-4 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs font-medium"
        >
          Clear Filters
        </button>
        {activeCount > 0 && (
          <span className="text-gray-500">
            {activeCount} active filter{activeCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default ParcelSearch;