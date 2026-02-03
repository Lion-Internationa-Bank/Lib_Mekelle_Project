// src/components/wizard/OwnerStep.tsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createOwner } from "../../services/parcelApi";
import { searchOwnersLiteApi, addOwnerToParcel } from "../../services/parcelDetailApi";
import type { OwnerStepProps } from "../../types/wizard";
import type { LiteOwner } from "../../services/parcelDetailApi";
import {
  OwnerStepFormSchema,
  type OwnerStepFormData,
} from "../../validation/schemas";
import { toast } from 'sonner';

const OwnerStep = ({ nextStep, prevStep, onCreated }: OwnerStepProps) => {
  const [searchParams] = useSearchParams();
  const upin = searchParams.get("upin") || "";
  const subCity = searchParams.get("sub_city") || "";
  const today = new Date().toISOString().split("T")[0];

  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LiteOwner[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<LiteOwner | null>(null);
  const searchTimeoutRef = useRef<number | null>(null); // FIXED: Use number type for browser timeout

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<OwnerStepFormData>({
    resolver: zodResolver(OwnerStepFormSchema),
    defaultValues: {
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
      acquired_at: today,
    },
  });

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current !== null) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Watch for national_id changes to auto-search
  const nationalIdValue = watch("national_id");
  useEffect(() => {
    if (nationalIdValue && nationalIdValue.length >= 6) {
      setSearchQuery(nationalIdValue);
      handleSearch(nationalIdValue);
    }
  }, [nationalIdValue]);

  // Handle search for existing owners
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current !== null) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchOwnersLiteApi(query);
        setSearchResults(results);
      } catch (err: any) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Select an existing owner
  const handleSelectOwner = (owner: LiteOwner) => {
    setSelectedOwner(owner);
    setValue("full_name", owner.full_name);
    setValue("national_id", owner.national_id);
    setValue("tin_number", owner.tin_number || "");
    setValue("phone_number", owner.phone_number || "");
    setSearchResults([]);
    setSearchQuery("");
  };

  // Clear selection and switch to create mode
  const handleCreateNew = () => {
    setSelectedOwner(null);
    setMode('create');
    reset({
      full_name: "",
      national_id: "",
      tin_number: "",
      phone_number: "",
      acquired_at: today,
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  const onSubmit = async (data: OwnerStepFormData) => {
    try {
      if (selectedOwner) {
        // Link existing owner to parcel using addOwnerToParcel
        const response = await addOwnerToParcel(
          upin,
          selectedOwner.owner_id,
          data.acquired_at
        );
         console.log("response",response)
         console.log("response success",response.success)
        // FIX: Check response structure properly
        if (response && response.success) {
          toast.success(response.message || "Owner linked to parcel successfully");
          const owner_id = selectedOwner.owner_id;
          onCreated({ owner_id });
          nextStep();
        } else {
          // If response has error message
          const errorMessage = response?.message || "Failed to link owner to parcel";
          toast.error(errorMessage);
          console.error(errorMessage);
        }
      } else {
        // Create new owner and link to parcel
        const payload = {
          ...data,
          upin, // from URL
        };

        const res = await createOwner(payload);
        if (res && res.success) {
          toast.success(res.message || "Parcel owner created successfully");
          const { owner_id } = res.data;
          onCreated({ owner_id });
          nextStep();
        } else {
          toast.error(res?.message || "Failed to create owner");
          console.error(res?.message || "Failed to create owner");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process owner");
      console.error(err.message || "Failed to process owner");
    }
  };

  if (!upin) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold text-red-600 mb-4">
          Missing Parcel Information
        </p>
        <p className="text-gray-600 mb-6">
          Please complete the Parcel step first.
        </p>
        <button
          onClick={prevStep}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Register Owner</h2>
      <p className="text-gray-600 mb-8">
        Owner for{" "}
        <span className="font-semibold text-blue-600">{upin}</span> (
        {subCity})
      </p>

      {/* Mode Toggle */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {selectedOwner ? "Selected Owner" : "Find or Create Owner"}
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                setMode('search');
                setSelectedOwner(null);
                reset();
                setSearchResults([]);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'search' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Search Existing
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'create' 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Create New
            </button>
          </div>
        </div>

        {/* Selected Owner Display */}
        {selectedOwner && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-emerald-800">
                  {selectedOwner.full_name}
                </h4>
                <div className="text-sm text-emerald-600 mt-1">
                  <span className="font-medium">National ID:</span> {selectedOwner.national_id}
                  {selectedOwner.phone_number && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="font-medium">Phone:</span> {selectedOwner.phone_number}
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateNew}
                className="text-sm text-emerald-700 hover:text-emerald-900 underline"
              >
                Change Owner
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      {mode === 'search' && !selectedOwner && (
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Search by National ID, Name, or Phone Number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                Found {searchResults.length} owner{searchResults.length !== 1 ? 's' : ''}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((owner) => (
                  <div
                    key={owner.owner_id}
                    className="px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectOwner(owner)}
                  >
                    <div className="font-medium text-gray-900">
                      {owner.full_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">ID:</span> {owner.national_id}
                      {owner.phone_number && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium">Phone:</span> {owner.phone_number}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="mt-4 text-center py-6 border border-gray-200 rounded-xl">
              <p className="text-gray-600 mb-2">No owners found</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create new owner instead →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Owner Form (for new owner or acquisition date for existing) */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {!selectedOwner && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register("full_name")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g. John Doe"
                disabled={mode === 'search'}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                National ID *
              </label>
              <input
                {...register("national_id")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="1234567890"
                disabled={mode === 'search'}
              />
              {errors.national_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.national_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                {...register("phone_number")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="+251911223344"
                disabled={mode === 'search'}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                TIN Number
              </label>
              <input
                {...register("tin_number")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Optional"
                disabled={mode === 'search'}
              />
              {errors.tin_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tin_number.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Acquisition Date (always required) */}
        <div className={selectedOwner ? "md:col-span-2" : ""}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Acquisition Date *
            {selectedOwner && (
              <span className="text-gray-500 text-sm font-normal ml-2">
                (When did {selectedOwner.full_name} acquire this parcel?)
              </span>
            )}
          </label>
          <input
            type="date"
            max={today}
            {...register("acquired_at")}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.acquired_at && (
            <p className="mt-1 text-sm text-red-600">
              {errors.acquired_at.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2 flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting || (mode === 'search' && !selectedOwner)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (selectedOwner ? "Linking Owner..." : "Creating Owner...") 
              : (selectedOwner ? "Link Owner & Next" : "Create Owner & Next")}
          </button>
        </div>
      </form>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-medium text-blue-800 mb-1">How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <span className="font-medium">Search Existing:</span> Find an owner already in the system and link them to this parcel</li>
          <li>• <span className="font-medium">Create New:</span> Register a new owner and link them to this parcel</li>
          <li>• <span className="font-medium">Acquisition Date:</span> When the owner acquired/started owning this parcel</li>
        </ul>
      </div>
    </>
  );
};

export default OwnerStep;