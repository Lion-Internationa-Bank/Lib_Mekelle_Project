// components/modals/TransferOwnershipModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, UserPlus, UserMinus, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { searchOwnersLiteApi, transferOwnershipApi,type LiteOwner } from "../../../services/parcelDetailApi";
import { getConfig } from "../../../services/cityAdminService";
import GenericDocsUpload from "../../../components/GenericDocsUpload"; // ← import for upload step
import { toast } from 'sonner';

// onRefreshParcel is not a function
interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelUpin: string;
  currentOwners: Array<{ owner_id: string; full_name: string }>;
  onSuccess?: (historyId: string) => void; // optional external callback
  onRefreshParcel: () => Promise<void>;    // required: to refresh parcel after transfer/upload
}

export default function TransferOwnershipModal({
  isOpen,
  onClose,
  parcelUpin,
  currentOwners,
  onSuccess,
  onRefreshParcel,
}: TransferOwnershipModalProps) {
  const [formData, setFormData] = useState({
    from_owner_id: '',
    to_owner_id: '',
    transfer_type: '',
    transfer_price: '',
    reference_no: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic transfer types
  const [transferTypes, setTransferTypes] = useState<{ value: string; label: string }[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Document upload step after transfer
  const [showUploadStep, setShowUploadStep] = useState(false);
  const [latestHistoryId, setLatestHistoryId] = useState<string | null>(null);

  // Searchable buyer
  const [buyerSearch, setBuyerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<LiteOwner[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch transfer types
  useEffect(() => {
    if (!isOpen) return;

    const fetchTypes = async () => {
      try {
        setLoadingTypes(true);
        const res = await getConfig('TRANSFER_TYPE');
        const options = res.data.options || [];
        setTransferTypes(
          options.map((opt: any) => ({
            value: opt.value,
            label: opt.description || opt.value,
          }))
        );
      } catch (err) {
        console.error('Failed to load transfer types:', err);
        setError('Failed to load transfer types');
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchTypes();
  }, [isOpen]);

  // Debounced search + outside click
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (buyerSearch.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const owners = await searchOwnersLiteApi(buyerSearch);
        setSearchResults(owners);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [buyerSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const selectBuyer = (owner: LiteOwner) => {
    setFormData(prev => ({ ...prev, to_owner_id: owner.owner_id }));
    setBuyerSearch('');
    setShowDropdown(false);
  };

  const handleTransferSuccess = async (historyId: string) => {
    setLatestHistoryId(historyId);
    setShowUploadStep(true);
    await onRefreshParcel(); // refresh parcel data immediately
    if (onSuccess) onSuccess(historyId);
  };

  const handleUploadComplete = async () => {
    setShowUploadStep(false);
    setLatestHistoryId(null);
    await onRefreshParcel();
    onClose();
  };

  const handleSkipUpload = async () => {
    setShowUploadStep(false);
    setLatestHistoryId(null);
    await onRefreshParcel();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.to_owner_id) return setError('Please select the new owner');
    if (!formData.transfer_type) return setError('Please select transfer type');
    if (formData.from_owner_id && formData.from_owner_id === formData.to_owner_id) {
      return setError('Seller and buyer cannot be the same person');
    }

    try {
      setLoading(true);
      const payload = {
        from_owner_id: formData.from_owner_id || undefined,
        to_owner_id: formData.to_owner_id,
        transfer_type: formData.transfer_type,
        transfer_price: formData.transfer_price ? Number(formData.transfer_price) : undefined,
        reference_no: formData.reference_no || undefined,
      };

      const result = await transferOwnershipApi(parcelUpin, payload);
      toast.success(result.message || "Transfer occurred successfully")
      await handleTransferSuccess(result.history.history_id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to transfer ownership' )
     
    } finally {
      setLoading(false);
    }
  };

  const fromOwnerName = currentOwners.find(o => o.owner_id === formData.from_owner_id)?.full_name;
  const selectedBuyer = searchResults.find(o => o.owner_id === formData.to_owner_id);

  // ──────────────────────────────────────────────
  // Show document upload step after successful transfer
  // ──────────────────────────────────────────────
  if (showUploadStep && latestHistoryId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Transfer Completed ✓
                </h2>
                <p className="text-gray-600">
                  Upload supporting documents for parcel{' '}
                  <span className="font-mono font-bold text-blue-600">{parcelUpin}</span>
                </p>
              </div>
              <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Optional Step
              </span>
            </div>
          </div>

          {/* Upload Area */}
          <div className="p-8">
            <GenericDocsUpload
              title="Transfer supporting documents"
              upin={parcelUpin}
              subCity="" // can be passed if you have subcity info
              historyId={latestHistoryId}
              hideTitle={true}
              allowedDocTypes={[
                { value: "TRANSFER_CONTRACT", label: "Transfer Contract / Agreement" },
                { value: "ID_COPY", label: "ID Copies (Buyer & Seller)" },
                { value: "PAYMENT_PROOF", label: "Payment Receipt" },
                { value: "POWER_OF_ATTORNEY", label: "Power of Attorney (if applicable)" },
                { value: "OTHER", label: "Other Supporting Document" },
              ]}
              onUploadSuccess={handleUploadComplete}
            />
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
            <button
              onClick={handleSkipUpload}
              className="text-sm text-gray-600 hover:text-gray-900 underline transition"
            >
              Skip for now
            </button>

            <button
              onClick={handleUploadComplete}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Done – Close
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Main transfer form (shown before upload)
  // ──────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transfer Ownership
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              UPIN: {parcelUpin}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong className="font-medium block mb-1">Full Ownership Transfer</strong>
                <p>The selected current owner's entire share will be transferred to the new owner.</p>
              </div>
            </div>
          </div>

          {/* From Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Current Owner (Seller) <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <select
              name="from_owner_id"
              value={formData.from_owner_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Whole parcel transfer —</option>
              {currentOwners.map(owner => (
                <option key={owner.owner_id} value={owner.owner_id}>
                  {owner.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Buyer Search */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <UserPlus size={16} />
              New Owner (Buyer/Receiver) <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={buyerSearch}
                onChange={e => {
                  setBuyerSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name, national ID, phone or TIN..."
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Searching...
                  </div>
                ) : searchResults.length === 0 && buyerSearch.length >= 2 ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No matching owners found
                    <button
                      type="button"
                      onClick={() => alert("Create new owner feature - to be implemented")}
                      className="ml-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Plus size={14} className="mr-1" />
                      Create New
                    </button>
                  </div>
                ) : (
                  <div className="py-1">
                    {searchResults.map(owner => (
                      <div
                        key={owner.owner_id}
                        onClick={() => selectBuyer(owner)}
                        className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors ${
                          formData.to_owner_id === owner.owner_id ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                        }`}
                      >
                        {formData.to_owner_id === owner.owner_id && (
                          <Check size={16} className="text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium">{owner.full_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {owner.national_id} • {owner.phone_number || '—'} • {owner.tin_number || '—'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transfer Type - Dynamic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Transfer Type <span className="text-red-500">*</span>
            </label>
            {loadingTypes ? (
              <div className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500">
                Loading transfer types...
              </div>
            ) : (
              <select
                name="transfer_type"
                value={formData.transfer_type}
                onChange={handleChange}
                required
                disabled={transferTypes.length === 0}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="">— Select type —</option>
                {transferTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Price & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Transfer Price (ETB)
              </label>
              <input
                type="number"
                name="transfer_price"
                value={formData.transfer_price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Reference Number
              </label>
              <input
                type="text"
                name="reference_no"
                value={formData.reference_no}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {formData.to_owner_id && selectedBuyer && (
            <div className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center border border-gray-200 dark:border-gray-700">
              Transferring full ownership → <strong>{selectedBuyer.full_name}</strong>
              {formData.from_owner_id && <> from <strong>{fromOwnerName}</strong></>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !formData.to_owner_id || !formData.transfer_type || loadingTypes}
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <UserMinus size={18} />
                  Confirm Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}