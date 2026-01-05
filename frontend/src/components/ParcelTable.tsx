// ParcelTable.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Parcel {
  upin: string;
  file_number: string;
  sub_city: string;
  ketena: string;
  total_area_m2: number;
  land_use: string;
  tenure_type: string;
  encumbrance_status: "Encumbered" | "Clear";
  owners: string;
}

interface ParcelTableProps {
  parcels: Parcel[];
}

const ParcelTable = ({ parcels }: ParcelTableProps) => {
  return (
    <div className="bg-white/80 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_1.5fr_2fr_auto] gap-3 md:gap-4 px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50/90 border-b-2 border-gray-300 sticky top-0 z-10">
        <div>UPIN</div>
        <div>File Number</div>
        <div>Sub City</div>
        <div>Ketena</div>
        <div>Area (m²)</div>
        <div>Land Use</div>
        <div>Tenure Type</div>
        <div>Status</div>
        <div className="hidden xl:block">Owner(s)</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200/70">
        {parcels.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No parcels found
          </div>
        ) : (
          parcels.map((parcel) => (
            <ParcelRow key={parcel.upin} parcel={parcel} />
          ))
        )}
      </div>
    </div>
  );
};

// Internal ParcelRow component (kept inside the same file)
const ParcelRow = ({ parcel }: { parcel: Parcel }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/parcels/${encodeURIComponent(parcel.upin)}`);
  }

  return (
    <div className="group grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_1.5fr_2fr_auto] gap-3 md:gap-4 px-4 py-4 text-sm hover:bg-gray-50/70 transition-colors cursor-pointer "onClick={handleRowClick}>
      {/* UPIN */}
      <div className="font-semibold text-gray-900">{parcel.upin}</div>

      {/* File Number */}
      <div className="text-gray-700">{parcel.file_number}</div>

      {/* Sub City */}
      <div className="font-medium text-gray-800">{parcel.sub_city}</div>

      {/* Ketena */}
      <div className="text-gray-700">{parcel.ketena}</div>

      {/* Area */}
      <div className="font-medium">{parcel.total_area_m2.toLocaleString()}</div>

      {/* Land Use */}
      <div className="text-gray-700 capitalize">{parcel.land_use}</div>

      {/* Tenure Type */}
      <div className="text-gray-700 capitalize">{parcel.tenure_type}</div>

      {/* Encumbrance Status */}
      <div>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
            parcel.encumbrance_status === "Clear"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {parcel.encumbrance_status}
        </span>
      </div>

      {/* Owner(s) - hidden on smaller screens */}
      <div
        className="hidden xl:block text-gray-600 text-xs truncate max-w-xs"
        title={parcel.owners}
      >
        {parcel.owners}
      </div>

      {/* Mobile-only: Extra details */}
      <div className="xl:hidden mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-600 space-y-1">
        <div>
          <span className="font-medium">File:</span> {parcel.file_number}
        </div>
        <div>
          <span className="font-medium">Tenure:</span> {parcel.tenure_type}
        </div>
        <div>
          <span className="font-medium">Owner(s):</span> {parcel.owners}
        </div>
      </div>
    </div>
  );
};

export default ParcelTable;