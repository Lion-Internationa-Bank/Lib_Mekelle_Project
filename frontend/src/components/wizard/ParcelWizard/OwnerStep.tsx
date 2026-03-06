// src/components/wizard/ParcelWizard/OwnerStep.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslate } from "../../../i18n/useTranslate";
import { useWizard } from "../../../contexts/WizardContext";
import type { OwnerStepProps } from "../../../types/wizard";
import {
  OwnerFormSchema,
  type OwnerFormData,
} from "../../../validation/schemas";
import { toast } from 'sonner';
import { searchOwnersLiteApi } from "../../../services/parcelDetailApi";
import { Search, X, Check, UserCheck, UserPlus } from "lucide-react";

const OwnerStep = ({ nextStep, prevStep }: OwnerStepProps) => {
  const { t } = useTranslate('ownerStep');
  const { t: tCommon } = useTranslate('common');
  const { currentSession, saveStep, isLoading } = useWizard();
  const today = new Date().toISOString().split("T")[0];
  
  // State for owner search
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null);
  const [acquisitionDate] = useState(today);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,

    trigger,
  } = useForm<OwnerFormData>({
    resolver: zodResolver(OwnerFormSchema),
    defaultValues: {
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
      acquired_at: today,
      owner_id: undefined,
    },
    mode: "onChange",
  });

 

  // Load existing data if available
  useEffect(() => {
    if (currentSession?.owner_data) {
      const ownerData = Array.isArray(currentSession.owner_data) 
        ? currentSession.owner_data[0] 
        : currentSession.owner_data;
      
      // Check if this is an existing owner (has owner_id)
      if (ownerData.owner_id) {
        setSelectedOwner({
          owner_id: ownerData.owner_id,
          full_name: ownerData.full_name,
          national_id: ownerData.national_id,
          tin_number: ownerData.tin_number,
          phone_number: ownerData.phone_number,
        });
        setIsCreatingNew(false);
        
        // Set all form values with the owner data including owner_id
        reset({
          full_name: ownerData.full_name,
          national_id: ownerData.national_id,
          tin_number: ownerData.tin_number || "",
          phone_number: ownerData.phone_number,
          acquired_at: ownerData.acquired_at || today,
          owner_id: ownerData.owner_id,
        });
      } else {
        // This is a new owner being created
        reset({
          full_name: ownerData.full_name || "",
          national_id: ownerData.national_id || "",
          tin_number: ownerData.tin_number || "",
          phone_number: ownerData.phone_number || "",
          acquired_at: ownerData.acquired_at || today,
          owner_id: undefined,
        });
        setIsCreatingNew(true);
      }
    }
  }, [currentSession?.owner_data, reset, today]);

  // Debounced search for existing owners
  useEffect(() => {
    if (!showSearch || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const owners = await searchOwnersLiteApi(searchTerm);
        setSearchResults(owners);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, showSearch]);

  const handleSelectOwner = (owner: any) => {
    // Store complete owner details including all fields
    setSelectedOwner({
      owner_id: owner.owner_id,
      full_name: owner.full_name,
      national_id: owner.national_id,
      tin_number: owner.tin_number,
      phone_number: owner.phone_number,
    });
    setIsCreatingNew(false);
    
    // Set all the form values with the owner data including owner_id
    setValue("owner_id", owner.owner_id);
    setValue("full_name", owner.full_name);
    setValue("national_id", owner.national_id);
    setValue("tin_number", owner.tin_number || "");
    setValue("phone_number", owner.phone_number);
    setValue("acquired_at", acquisitionDate);
    
    // Trigger validation to update form state
    trigger();
    
    // Close search modal
    setShowSearch(false);
    setSearchTerm("");
    setSearchResults([]);
    
    toast.success(t('messages.ownerSelected', { name: owner.full_name }));
  };

  const handleCreateNew = () => {
    setSelectedOwner(null);
    setIsCreatingNew(true);
    setShowSearch(false);
    setSearchTerm("");
    setSearchResults([]);
    
    // Reset form for new owner
    reset({
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
      acquired_at: today,
      owner_id: undefined,
    });
  };

  const handleClearSelected = () => {
    setSelectedOwner(null);
    setIsCreatingNew(true);
    reset({
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
      acquired_at: today,
      owner_id: undefined,
    });
  };

  const onSubmit = async (data: OwnerFormData) => {
    try {
      console.log("submit started ", data);
      console.log("selectedOwner state: ", selectedOwner);
      
      let ownerData;

      if (data.owner_id) {
        // Case 1: Using existing owner - send owner_id AND all owner details
        ownerData = [{
          owner_id: data.owner_id,
          full_name: data.full_name,
          national_id: data.national_id,
          tin_number: data.tin_number,
          phone_number: data.phone_number,
          acquired_at: data.acquired_at || today,
        }];
        console.log("existing owner", ownerData);
      } else {
        // Case 2: Creating new owner - send all fields
        ownerData = [{
          full_name: data.full_name,
          national_id: data.national_id,
          tin_number: data.tin_number || null,
          phone_number: data.phone_number,
          acquired_at: data.acquired_at || today,
        }];
        console.log("creating new user", ownerData);
      }

      // Save to backend
      await saveStep('owner', ownerData);
      
      toast.success(data.owner_id 
        ? t('messages.existingOwnerSaved') 
        : t('messages.newOwnerSaved')
      );
      
      nextStep();
    } catch (err: any) {
      toast.error(err.message || t('errors.saveFailed'));
      console.error("Save error:", err);
    }
  };

  // Debug: Log form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form errors:", errors);
    }
  }, [errors]);

  // Show warning if no parcel data
  if (!currentSession?.parcel_data) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">
          {t('errors.missingParcel')}
        </p>
        <p className="text-gray-600 mb-6">
          {t('errors.missingParcelDesc')}
        </p>
        <button
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
        >
          ← {t('actions.goBack')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#2a2718]">{t('title')}</h2>
          <p className="text-[#2a2718]/70 mt-1">
            {selectedOwner 
              ? t('subtitle.existingOwner', { name: selectedOwner.full_name })
              : t('subtitle.newOwner')}
          </p>
        </div>
        
        {!selectedOwner && !showSearch && !isCreatingNew && (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="px-4 py-2 bg-[#f0cd6e]/20 text-[#2a2718] rounded-xl hover:bg-[#f0cd6e]/30 transition-colors flex items-center gap-2"
          >
            <Search size={18} />
            {t('actions.search')}
          </button>
        )}
      </div>

      {/* Owner Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#f0cd6e] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2a2718]">{t('search.title')}</h2>
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 rounded-full hover:bg-[#f0cd6e]/20"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Search input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#2a2718] mb-2">
                  {t('search.label')}
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
                  autoFocus
                />
              </div>

              {/* Search results */}
              {isSearching ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#f0cd6e] border-t-transparent" />
                  <p className="mt-2">{tCommon('searching')}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border border-[#f0cd6e] rounded-lg divide-y">
                  {searchResults.map((owner) => (
                    <div
                      key={owner.owner_id}
                      onClick={() => handleSelectOwner(owner)}
                      className="px-4 py-3 hover:bg-[#f0cd6e]/10 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-[#2a2718]">{owner.full_name}</div>
                        <div className="text-sm text-[#2a2718]/70">
                          {owner.national_id && `${t('fields.id')}: ${owner.national_id}`}
                          {owner.phone_number && ` • ${owner.phone_number}`}
                          {owner.tin_number && ` • ${t('fields.tin')}: ${owner.tin_number}`}
                        </div>
                      </div>
                      <Check size={18} className="text-[#f0cd6e]" />
                    </div>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="text-center py-8 text-[#2a2718]/70">
                  {t('search.noResults')}
                </div>
              ) : null}

              <div className="mt-6 pt-4 border-t border-[#f0cd6e]">
                <button
                  onClick={handleCreateNew}
                  className="w-full py-3 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  {t('actions.createNew')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Owner Banner */}
      {selectedOwner && (
        <div className="mb-6 p-4 bg-[#f0cd6e]/20 border border-[#f0cd6e] rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <UserCheck size={20} className="text-[#2a2718] mt-0.5" />
              <div>
                <h3 className="font-medium text-[#2a2718]">{t('selected.title')}</h3>
                <p className="text-[#2a2718] mt-1">
                  <span className="font-medium">{selectedOwner.full_name}</span>
                  {selectedOwner.national_id && ` (${t('fields.id')}: ${selectedOwner.national_id})`}
                </p>
                <p className="text-sm text-[#2a2718]/70 mt-1">
                  {t('selected.ownerId')}: {selectedOwner.owner_id}
                </p>
                <p className="text-sm text-[#2a2718]/70 mt-1">
                  {t('selected.note')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClearSelected}
              className="text-[#2a2718] hover:text-[#2a2718]/80 text-sm font-medium"
            >
              {t('actions.change')}
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Hidden owner_id field */}
        <input type="hidden" {...register("owner_id")} />

        {/* Conditionally render fields based on whether we're using existing owner */}
        {!selectedOwner ? (
          <>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.fullName')} *
              </label>
              <input
                {...register("full_name")}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
                placeholder={t('placeholders.fullName')}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.nationalId')} *
              </label>
              <input
                {...register("national_id")}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
                placeholder={t('placeholders.nationalId')}
              />
              {errors.national_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.national_id.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.phone')} *
              </label>
              <input
                {...register("phone_number")}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
                placeholder={t('placeholders.phone')}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* TIN Number */}
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.tin')}
              </label>
              <input
                {...register("tin_number")}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
                placeholder={tCommon('optional')}
              />
              {errors.tin_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tin_number.message}
                </p>
              )}
            </div>
          </>
        ) : (
          /* Show read-only summary of owner data when existing owner is selected */
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.fullName')}
              </label>
              <input
                type="text"
                value={selectedOwner.full_name}
                disabled
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl bg-[#f0cd6e]/10 text-[#2a2718]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.nationalId')}
              </label>
              <input
                type="text"
                value={selectedOwner.national_id}
                disabled
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl bg-[#f0cd6e]/10 text-[#2a2718]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.phone')}
              </label>
              <input
                type="text"
                value={selectedOwner.phone_number}
                disabled
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl bg-[#f0cd6e]/10 text-[#2a2718]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2a2718] mb-2">
                {t('fields.tin')}
              </label>
              <input
                type="text"
                value={selectedOwner.tin_number || tCommon('notProvided')}
                disabled
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl bg-[#f0cd6e]/10 text-[#2a2718]"
              />
            </div>
          </div>
        )}

        {/* Acquisition Date - Always shown */}
        <div className={selectedOwner ? "md:col-span-2" : "md:col-span-2"}>
          <label className="block text-sm font-semibold text-[#2a2718] mb-2">
            {t('fields.acquiredAt')} *
          </label>
          <input
            type="date"
            max={today}
            {...register("acquired_at")}
            className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718]"
          />
          {errors.acquired_at && (
            <p className="mt-1 text-sm text-red-600">
              {errors.acquired_at.message}
            </p>
          )}
          {selectedOwner && (
            <p className="mt-1 text-sm text-[#2a2718]/70">
              {t('hints.acquiredAt')}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="md:col-span-2 flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 rounded-xl border border-[#f0cd6e] text-[#2a2718] font-semibold hover:bg-[#f0cd6e]/20 transition"
          >
            ← {t('actions.back')}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isSubmitting ? tCommon('saving') : selectedOwner ? t('actions.linkAndContinue') : t('actions.saveAndContinue')}
          </button>
        </div>
      </form>

      {/* Help text */}
      <div className="mt-6 p-4 bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded-xl">
        <h4 className="font-medium text-[#2a2718] mb-1">{t('note.title')}:</h4>
        <ul className="text-sm text-[#2a2718]/70 space-y-1">
          <li>• {t('note.item1')}</li>
          <li>• {t('note.item2')}</li>
          <li>• {t('note.item3')}</li>
          <li>• {t('note.item4')}</li>
        </ul>
      </div>
    </>
  );
};

export default OwnerStep;