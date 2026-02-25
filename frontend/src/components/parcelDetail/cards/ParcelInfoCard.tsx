// src/components/cards/ParcelInfoCard.tsx
import { useState } from "react";
import { MoreVertical, Edit, UserPlus, Scissors, ChevronDown, ChevronUp } from "lucide-react";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { useAuth } from "../../../contexts/AuthContext";

interface ParcelInfoCardProps {
  data?: ParcelDetail | null; // ← Make data optional
  onEditParcel: () => void;
  onAddCoOwner: () => void;
  onSubdivide: () => void;
}

export default function ParcelInfoCard({
  data,
  onEditParcel,
  onAddCoOwner,
  onSubdivide,
}: ParcelInfoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCoords, setShowCoords] = useState(false);
  const {user} = useAuth();
    const isSubcityNormal = user?.role === "SUBCITY_NORMAL";
  // If no data yet, show loading/fallback UI
  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-6 relative min-h-[400px] flex items-center justify-center">
        <div className="text-center text-[#2a2718]/70">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f0cd6e] mx-auto mb-4" />
          <p>Loading parcel information...</p>
        </div>
      </div>
    );
  }

  // Pretty-print boundary_coords preview
  const coordsPreview = data.boundary_coords
    ? JSON.stringify(data.boundary_coords, null, 2).slice(0, 200) + 
      (JSON.stringify(data.boundary_coords).length > 200 ? "..." : "")
    : "—";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-6 relative">
      {/* 3-dot menu button */}
      {isSubcityNormal && (
 <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#f0cd6e]/20 transition-colors"
        aria-label="Parcel actions"
      >
        <MoreVertical size={20} className="text-[#2a2718]" />
      </button>

      )

      }
     
      {/* Dropdown Menu */}
      {isSubcityNormal && menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-14 right-4 z-20 w-64 bg-white shadow-xl rounded-lg border border-[#f0cd6e] py-1">
            <button
              onClick={() => { onEditParcel(); setMenuOpen(false); }}
              className="w-full text-left px-5 py-3 text-sm text-[#2a2718] hover:bg-[#f0cd6e]/10 flex items-center gap-3 transition-colors"
            >
              <Edit size={18} className="text-[#2a2718]" />
              Edit Parcel Details
            </button>

            <button
              onClick={() => { onAddCoOwner(); setMenuOpen(false); }}
              className="w-full text-left px-5 py-3 text-sm text-[#2a2718] hover:bg-[#f0cd6e]/10 flex items-center gap-3 transition-colors"
            >
              <UserPlus size={18} className="text-[#2a2718]" />
              Add Co-Owner
            </button>

            <button
              onClick={() => { onSubdivide(); setMenuOpen(false); }}
              className="w-full text-left px-5 py-3 text-sm text-[#f0cd6e] hover:bg-[#f0cd6e]/10 flex items-center gap-3 transition-colors border-t border-[#f0cd6e] mt-1"
            >
              <Scissors size={18} className="text-[#f0cd6e]" />
              Subdivide Parcel
            </button>
          </div>
        </>
      )}

      {/* Parcel Information Content */}
      <h2 className="text-xl font-semibold text-[#2a2718] mb-6">Parcel Information</h2>

      {/* Four-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Column 1: Basic Information */}
        <div>
          <h4 className="text-base font-semibold text-[#2a2718] mb-4 pb-2 border-b border-[#f0cd6e]">
            Basic Information
          </h4>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">UPIN</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.upin || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">File Number</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.file_number || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Total Area</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {Number(data.total_area_m2).toLocaleString()} m²
              </dd>
            </div>
             <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Tender</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.tender || "—"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Column 2: Location */}
        <div>
          <h4 className="text-base font-semibold text-[#2a2718] mb-4 pb-2 border-b border-[#f0cd6e]">
            Location
          </h4>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Sub City</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.sub_city?.name || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Tabia</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.tabia || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Ketena</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.ketena || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Block</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.block || "—"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Column 3: Tenure & Classification */}
        <div>
          <h4 className="text-base font-semibold text-[#2a2718] mb-4 pb-2 border-b border-[#f0cd6e]">
            Tenure & Classification
          </h4>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Land Use</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right capitalize">
                {data.land_use || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Tenure Type</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right capitalize">
                {data.tenure_type || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">Land Grade</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.land_grade || "—"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Column 4: Boundary Information */}
        <div>
          <h4 className="text-base font-semibold text-[#2a2718] mb-4 pb-2 border-b border-[#f0cd6e]">
            Boundary Information
          </h4>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">North</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.boundary_north || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">East</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.boundary_east || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">South</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.boundary_south || "—"}
              </dd>
            </div>
            <div className="flex justify-between items-baseline">
              <dt className="text-[#2a2718]/70 font-medium w-32">West</dt>
              <dd className="text-[#2a2718] font-normal flex-1 text-right">
                {data.boundary_west || "—"}
              </dd>
            </div>

            {/* Boundary Coords - Collapsible Preview */}
            <div className="mt-2">
              <button
                onClick={() => setShowCoords(!showCoords)}
                className="flex items-center text-sm text-[#f0cd6e] hover:text-[#2a2718]"
              >
                {showCoords ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span className="ml-1">
                  Boundary Coordinates {data.boundary_coords ? "(JSON)" : "(none)"}
                </span>
              </button>

              {showCoords && (
                <div className="mt-2 p-3 bg-[#f0cd6e]/5 rounded-lg text-xs font-mono text-[#2a2718] border border-[#f0cd6e] max-h-40 overflow-auto">
                  {data.boundary_coords ? (
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(data.boundary_coords, null, 2)}
                    </pre>
                  ) : (
                    "No coordinates available"
                  )}
                </div>
              )}
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}