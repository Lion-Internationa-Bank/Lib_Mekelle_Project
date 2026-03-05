// src/components/ParcelTable.tsx
import { useNavigate } from "react-router-dom";
import { useTranslate } from "../i18n/useTranslate";

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
  const { t } = useTranslate('parcelTable');

  return (
    <div className="bg-white/80 rounded-2xl border border-[#f0cd6e] shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_1.5fr_2fr_auto] gap-3 md:gap-4 px-4 py-4 text-xs font-semibold text-[#2a2718] uppercase tracking-wider bg-[#f0cd6e]/20 border-b-2 border-[#f0cd6e] sticky top-0 z-10">
        <div>{t('headers.upin')}</div>
        <div>{t('headers.fileNumber')}</div>
        <div>{t('headers.subCity')}</div>
        <div>{t('headers.ketena')}</div>
        <div>{t('headers.area')}</div>
        <div>{t('headers.landUse')}</div>
        <div>{t('headers.tenureType')}</div>
        <div>{t('headers.encumbrance')}</div>
        <div className="hidden xl:block">{t('headers.owners')}</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[#f0cd6e]/30">
        {parcels.length === 0 ? (
          <div className="text-center py-12 text-[#2a2718]/70 text-sm">
            {t('empty.message')}
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
  const { t } = useTranslate('parcelTable');

  const handleRowClick = () => {
    navigate(`/parcels/${encodeURIComponent(parcel.upin)}`);
  }

  return (
    <div 
      className="group grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_1.5fr_2fr_auto] gap-3 md:gap-4 px-4 py-4 text-sm hover:bg-[#f0cd6e]/10 transition-colors cursor-pointer" 
      onClick={handleRowClick}
    >
      {/* UPIN */}
      <div className="font-semibold text-[#2a2718]">{parcel.upin}</div>

      {/* File Number */}
      <div className="text-[#2a2718]/80">{parcel.file_number}</div>

      {/* Sub City */}
      <div className="font-medium text-[#2a2718]">{parcel.sub_city}</div>

      {/* Ketena */}
      <div className="text-[#2a2718]/80">{parcel.ketena}</div>

      {/* Area */}
      <div className="font-medium text-[#2a2718]">{parcel.total_area_m2.toLocaleString()}</div>

      {/* Land Use */}
      <div className="text-[#2a2718]/80 capitalize">{parcel.land_use}</div>

      {/* Tenure Type */}
      <div className="text-[#2a2718]/80 capitalize">{parcel.tenure_type}</div>

      {/* Encumbrance Status */}
      <div>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
            parcel.encumbrance_status === "Clear"
              ? "bg-[#f0cd6e]/30 text-[#2a2718]"
              : "bg-[#2a2718]/20 text-[#2a2718]"
          }`}
        >
          {parcel.encumbrance_status === "Clear" 
            ? t('encumbrance.clear') 
            : t('encumbrance.encumbered')}
        </span>
      </div>

      {/* Owner(s) - hidden on smaller screens */}
      <div
        className="hidden xl:block text-[#2a2718]/70 text-xs truncate max-w-xs"
        title={parcel.owners}
      >
        {parcel.owners}
      </div>

      {/* Mobile-only: Extra details */}
      <div className="xl:hidden mt-3 pt-3 border-t border-[#f0cd6e]/30 text-xs text-[#2a2718]/70 space-y-1">
        <div>
          <span className="font-medium text-[#2a2718]">{t('headers.fileNumber')}:</span> {parcel.file_number}
        </div>
        <div>
          <span className="font-medium text-[#2a2718]">{t('headers.tenureType')}:</span> {parcel.tenure_type}
        </div>
        <div>
          <span className="font-medium text-[#2a2718]">{t('headers.owners')}:</span> {parcel.owners}
        </div>
      </div>
    </div>
  );
};

export default ParcelTable;