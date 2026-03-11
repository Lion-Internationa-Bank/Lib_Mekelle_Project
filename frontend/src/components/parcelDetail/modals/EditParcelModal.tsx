// src/components/parcelDetail/modals/EditParcelModal.tsx
import { useEffect, useState } from "react";
import { useTranslate } from "../../../i18n/useTranslate";
import { updateParcelApi } from "../../../services/parcelDetailApi";
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import {
  EditParcelFormSchema,
  type EditParcelFormData,
} from "../../../validation/schemas";
import { z } from "zod";
import {
  getConfig,
  type ConfigOption,
} from "../../../services/cityAdminService";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";

type Props = {
  parcel: ParcelDetail;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

const EditParcelModal = ({ parcel, open, onClose, onSuccess }: Props) => {
  const { t } = useTranslate('editParcelModal');
  const { t: tCommon } = useTranslate('common');
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<EditParcelFormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Dynamic dropdown data
  const [landUses, setLandUses] = useState<ConfigOption[]>([]);
  const [tenureTypes, setTenureTypes] = useState<ConfigOption[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !parcel) return;

    // Pre-fill form
    setForm({
      file_number: parcel.file_number || "",
      sub_city_id: user?.sub_city_id || undefined,
      tabia: parcel.tabia || "",
      ketena: parcel.ketena || "",
      block: parcel.block || "",
      total_area_m2: Number(parcel.total_area_m2) ?? undefined,
      land_use: parcel.land_use || undefined,
      land_grade: Number(parcel.land_grade) ?? undefined,
      tenure_type: parcel.tenure_type || undefined,
      tender: parcel.tender || undefined,
      boundary_north: parcel.boundary_north || "",
      boundary_east: parcel.boundary_east || "",
      boundary_south: parcel.boundary_south || "",
      boundary_west: parcel.boundary_west || "",
      boundary_coords: parcel.boundary_coords
        ? typeof parcel.boundary_coords === "string"
          ? parcel.boundary_coords
          : JSON.stringify(parcel.boundary_coords, null, 2)
        : "",
    });

    // Fetch dropdown options
    const loadOptions = async () => {
      setLoadingOptions(true);
      setOptionsError(null);

      try {
        const landUseRes = await getConfig("LAND_USE");
        if (landUseRes.success && landUseRes.data?.options) {
          setLandUses(landUseRes.data.options);
        }

        const tenureRes = await getConfig("LAND_TENURE");
        if (tenureRes.success && tenureRes.data?.options) {
          setTenureTypes(tenureRes.data.options);
        }
      } catch (err: any) {
        setOptionsError(t('errors.loadOptions'));
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
    setError(null);
  }, [open, parcel, user?.sub_city_id, t]);

  const handleSave = async () => {
    try {
      setError(null);
      setSaving(true);

      const parsed = EditParcelFormSchema.parse(form) as EditParcelFormData;

      const res = await updateParcelApi(parcel.upin, parsed);
      toast.success(res.message || t('messages.success'));
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || t('errors.validation'));
      } else if (err instanceof Error) {
        toast.error(err.message || t('errors.update'));
      } else {
        toast.error(t('errors.unexpected'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full my-8">
        <h2 className="text-2xl font-bold text-[#2a2718] mb-6">{t('title')}</h2>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loadingOptions ? (
          <div className="text-center py-12 text-[#2a2718]/70">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f0cd6e] mx-auto mb-2" />
            {tCommon('loading')}
          </div>
        ) : optionsError ? (
          <div className="text-red-600 text-center py-8">{optionsError}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Number */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.fileNumber')}
              </label>
              <input
                type="text"
                value={form.file_number ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, file_number: e.target.value || undefined }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>

            {/* Tabia */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.tabia')}
              </label>
              <input
                type="text"
                value={form.tabia ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tabia: e.target.value || undefined }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>

            {/* Ketena */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.ketena')}
              </label>
              <input
                type="text"
                value={form.ketena ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ketena: e.target.value || undefined }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>

            {/* Block */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.block')}
              </label>
              <input
                type="text"
                value={form.block ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, block: e.target.value || undefined }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>

            {/* Total Area m² */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.totalArea')}
              </label>
              <input
                type="number"
                value={form.total_area_m2 ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    total_area_m2: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>

            {/* Land Use */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.landUse')}
              </label>
              <select
                value={form.land_use ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, land_use: e.target.value || undefined }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              >
                <option value="">{t('placeholders.selectLandUse')}</option>
                {landUses.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value} {opt.description ? `(${opt.description})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Land Grade */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.landGrade')}
              </label>
              <input
                type="number"
                value={form.land_grade ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    land_grade: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>

            {/* Tenure Type */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.tenureType')}
              </label>
              <select
                value={form.tenure_type ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tenure_type: e.target.value || undefined }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              >
                <option value="">{t('placeholders.selectTenureType')}</option>
                {tenureTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value} {opt.description ? `(${opt.description})` : ""}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tender */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] mb-1">
                {t('fields.tender')}
              </label>
              <input
                type="text"
                value={form.tender ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tender: e.target.value || undefined }))
                }
                className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
              />
            </div>

            {/* NEW: Boundary Fields - All Optional */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
                  {t('fields.north')}
                </label>
                <input
                  type="text"
                  value={form.boundary_north ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, boundary_north: e.target.value || undefined }))
                  }
                  className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
                  placeholder={t('placeholders.north')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
                  {t('fields.east')}
                </label>
                <input
                  type="text"
                  value={form.boundary_east ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, boundary_east: e.target.value || undefined }))
                  }
                  className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
                  placeholder={t('placeholders.east')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
                  {t('fields.south')}
                </label>
                <input
                  type="text"
                  value={form.boundary_south ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, boundary_south: e.target.value || undefined }))
                  }
                  className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
                  placeholder={t('placeholders.south')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
                  {t('fields.west')}
                </label>
                <input
                  type="text"
                  value={form.boundary_west ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, boundary_west: e.target.value || undefined }))
                  }
                  className="w-full px-4 py-2 border border-[#f0cd6e] rounded-lg focus:ring-2 focus:ring-[#f0cd6e]"
                  placeholder={t('placeholders.west')}
                />
              </div>

              {/* Boundary Coordinates (JSON) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#2a2718] mb-1.5">
                  {t('fields.boundaryCoords')}
                </label>
                <textarea
                  value={form.boundary_coords ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, boundary_coords: e.target.value || undefined }))
                  }
                  rows={5}
                  className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] font-mono text-sm"
                  placeholder={t('placeholders.boundaryCoords')}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]/20 transition"
            disabled={saving}
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-linear-to-r from-[#f0cd6e] to-[#2a2718] text-white hover:from-[#2a2718] hover:to-[#f0cd6e] transition disabled:opacity-50"
          >
            {saving ? tCommon('saving') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditParcelModal;