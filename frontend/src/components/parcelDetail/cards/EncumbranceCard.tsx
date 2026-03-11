// src/components/parcelDetail/cards/EncumbranceCard.tsx
import { useTranslate } from "../../../i18n/useTranslate";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import DocumentList from "../DocumentList";

interface EncumbranceCardProps {
  encumbrance?: ParcelDetail["encumbrances"][number]; 
  onEdit?: () => void;
  onAddNew?: () => void; // new prop for adding
  isNew?: boolean; // flag to indicate this is the "add new" placeholder
}

const EncumbranceCard = ({ encumbrance, onEdit, onAddNew, isNew = false }: EncumbranceCardProps) => {
  const { t } = useTranslate('encumbranceCard');

  if (isNew) {
    return (
      <div className="bg-white/80 border border-dashed border-[#f0cd6e] rounded-2xl p-8 text-center">
        <p className="text-[#2a2718]/70 mb-4">{t('empty.message')}</p>
        <button
          onClick={onAddNew}
          className="px-6 py-3 text-sm font-medium text-[#f0cd6e] bg-white border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20 hover:border-[#2a2718] transition-all shadow-sm"
        >
          + {t('empty.addButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 border border-[#f0cd6e] rounded-2xl overflow-hidden">
      {/* Header with Edit Button */}
      <div className="bg-linear-to-r from-[#f0cd6e]/10 to-[#2a2718]/10 px-6 py-4 border-b border-[#f0cd6e] flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#2a2718]">
          {encumbrance!.type} ({encumbrance!.status})
        </h3>
        <button
          onClick={onEdit}
          className="px-5 py-2 text-sm font-medium text-[#f0cd6e] bg-white border border-[#f0cd6e] rounded-lg hover:bg-[#f0cd6e]/20 hover:border-[#2a2718] transition-all shadow-sm"
        >
          {t('editButton')}
        </button>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-[#2a2718]/70">{t('fields.issuingEntity')}</dt>
            <dd className="mt-1 text-[#2a2718]">{encumbrance!.issuing_entity}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#2a2718]/70">{t('fields.referenceNumber')}</dt>
            <dd className="mt-1 text-[#2a2718]">{encumbrance!.reference_number || "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#2a2718]/70">{t('fields.registrationDate')}</dt>
            <dd className="mt-1 text-[#2a2718]">
              {encumbrance!.registration_date
                ? new Date(encumbrance!.registration_date).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[#2a2718]/70">{t('fields.status')}</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                  encumbrance!.status === "ACTIVE"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {encumbrance!.status === "ACTIVE" ? t('status.active') : t('status.released')}
              </span>
            </dd>
          </div>
        </dl>

        {/* Documents */}
        <div className="pt-4 border-t border-[#f0cd6e]">
          <DocumentList
            documents={encumbrance!.documents}
            title={t('documents.title')}
          />
        </div>
      </div>
    </div>
  );
};

export default EncumbranceCard;