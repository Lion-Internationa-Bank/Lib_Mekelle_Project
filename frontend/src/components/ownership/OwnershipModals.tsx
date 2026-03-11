// src/components/ownership/OwnershipModals.tsx
import { Info, X } from 'lucide-react';
import { useTranslate } from '../../i18n/useTranslate';
import GenericDocsUpload from "../common/GenericDocsUpload";
import type { OwnerWithParcels } from "../../services/ownersApi";

// Updated CreateOwnerModal to handle approval requests
export const CreateOwnerModal = ({
  saving,
  form,
  onChangeForm,
  onClose,
  onSave,
}: {
  saving: boolean;
  form: {
    full_name: string;
    national_id: string;
    tin_number: string;
    phone_number: string;
  };
  onChangeForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onClose: () => void;
  onSave: () => void;
}) => {
  const { t } = useTranslate('ownership');
  const { t: tCommon } = useTranslate('common');
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-sm">
        <h2 className="text-lg font-semibold mb-4 text-[#2a2718]">{t('modals.create.title')}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.fullName')} *</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.full_name}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, full_name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.nationalId')} *</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.national_id}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, national_id: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.phone')}</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.phone_number}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, phone_number: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.tin')}</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.tin_number}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, tin_number: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mt-4 p-3 bg-[#f0cd6e]/20 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-[#2a2718] mt-0.5">
              <Info size={16} />
            </div>
            <div className="text-sm text-[#2a2718]">
              <p className="font-medium">{t('modals.create.note')}</p>
              <p>{t('modals.create.noteDescription')}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]/20"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-linear-to-r from-[#f0cd6e] to-[#2a2718] text-white hover:from-[#2a2718] hover:to-[#f0cd6e] disabled:opacity-50"
          >
            {saving ? tCommon('submitting') : tCommon('submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const OwnerDocsUploadModal = ({
  ownerId,
  approvalRequestId,
  onClose,
  onRefresh,
}: {
  ownerId?: string;
  approvalRequestId?: string;
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const { t } = useTranslate('ownership');
  const isApprovalRequest = !!approvalRequestId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-[#f0cd6e] bg-linear-to-r from-[#f0cd6e]/20 to-[#2a2718]/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#2a2718] mb-2">
                {isApprovalRequest ? t('docs.requestSubmitted') : t('docs.ownerCreated')}
              </h2>
              <p className="text-[#2a2718]/70">
                {isApprovalRequest 
                  ? t('docs.requestDescription')
                  : t('docs.ownerDescription')}
              </p>
              {isApprovalRequest && (
                <div className="mt-2 text-sm text-[#2a2718]/70">
                  <p>{t('docs.reviewNote')}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-2 text-sm font-bold bg-[#f0cd6e] text-[#2a2718] rounded-full">
                {t('docs.optionalStep')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <GenericDocsUpload
            title={t('docs.uploadTitle')}
            upin=""
            subCity=""
            ownerId={ownerId}
            approvalRequestId={approvalRequestId}
            isApprovalRequest={isApprovalRequest}
            hideTitle={true}
            allowedDocTypes={[
              { value: "ID_COPY", label: t('docs.docTypes.idCopy') },
              { value: "PASSPORT_PHOTO", label: t('docs.docTypes.passportPhoto') },
              { value: "TIN_CERT", label: t('docs.docTypes.tinCert') },
              { value: "POWER_OF_ATTORNEY", label: t('docs.docTypes.powerOfAttorney') },
              { value: "OTHER", label: t('docs.docTypes.other') },
            ]}
            allowDelete={isApprovalRequest}
            showExisting={true}
            maxFiles={5}
            onUploadSuccess={onRefresh}
          />
        </div>

        <div className="p-8 border-t border-[#f0cd6e] bg-[#f0cd6e]/10 rounded-b-2xl flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-sm text-[#2a2718] hover:text-[#2a2718]/80 underline transition flex items-center gap-2"
          >
            <X size={16} />
            {t('docs.skipForNow')}
          </button>

          <button
            onClick={() => {
              onClose();
              onRefresh();
            }}
            className="px-8 py-3 rounded-xl bg-linear-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            {t('docs.doneClose')}
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditOwnerModal = ({
  saving,
  form,
  onChangeForm,
  onClose,
  onSave,
}: {
  saving: boolean;
  form: {
    full_name: string;
    national_id: string;
    tin_number: string;
    phone_number: string;
  };
  onChangeForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onClose: () => void;
  onSave: () => void;
}) => {
  const { t } = useTranslate('ownership');
  const { t: tCommon } = useTranslate('common');
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-sm">
        <h2 className="text-lg font-semibold mb-4 text-[#2a2718]">{t('modals.edit.title')}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.fullName')}</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.full_name}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, full_name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.nationalId')}</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.national_id}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, national_id: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.phone')}</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.phone_number}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, phone_number: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-[#2a2718] mb-1">{t('fields.tin')}</label>
            <input
              className="w-full border border-[#f0cd6e] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
              value={form.tin_number}
              onChange={(e) =>
                onChangeForm((f) => ({ ...f, tin_number: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]/20"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-linear-to-r from-[#f0cd6e] to-[#2a2718] text-white hover:from-[#2a2718] hover:to-[#f0cd6e] disabled:opacity-50"
          >
            {saving ? tCommon('saving') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeleteOwnerModal = ({
  saving,
  owner,
  onClose,
  onConfirm,
}: {
  saving: boolean;
  owner: OwnerWithParcels;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const { t } = useTranslate('ownership');
  const { t: tCommon } = useTranslate('common');
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-sm">
        <h2 className="text-lg font-semibold mb-4 text-red-700">
          {t('modals.delete.title')}
        </h2>
        <p className="mb-4 text-[#2a2718]">
          {t('modals.delete.confirmMessage', { name: owner.full_name })}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]/20"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? tCommon('deleting') : tCommon('delete')}
          </button>
        </div>
      </div>
    </div>
  );
};