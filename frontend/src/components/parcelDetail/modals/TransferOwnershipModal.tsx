// src/components/modals/TransferOwnershipModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, UserPlus, UserMinus, Check, ChevronsUpDown, Plus, FileText, AlertCircle } from 'lucide-react';
import { searchOwnersLiteApi, transferOwnershipApi, type LiteOwner } from "../../../services/parcelDetailApi";
import { getConfig } from "../../../services/cityAdminService";
import GenericDocsUpload from "../../../components/GenericDocsUpload";
import ApprovalRequestDocsModal from "../../../components/ApprovalRequestDocsModal";
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelUpin: string;
  currentOwners: Array<{ owner_id: string; full_name: string }>;
  onSuccess?: (historyId: string) => void;
  onRefreshParcel: () => Promise<void>;
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

  // Document upload step after immediate execution
  const [showUploadStep, setShowUploadStep] = useState(false);
  const [latestHistoryId, setLatestHistoryId] = useState<string | null>(null);

  // Approval request document upload
  const [showApprovalDocsModal, setShowApprovalDocsModal] = useState(false);
  const [currentApprovalRequest, setCurrentApprovalRequest] = useState<{
    id: string;
    title: string;
    description: string;
    resultData?: any;
  } | null>(null);

  // Searchable buyer
  const [buyerSearch, setBuyerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<LiteOwner[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {user} = useAuth();

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
    setBuyerSearch(owner.full_name);
    setShowDropdown(false);
  };

  const handleTransferSuccess = async (result: any) => {
    console.log("Transfer success result:", result);
    
    // Check if approval is required
    if (result?.approval_request_id) {
      setCurrentApprovalRequest({
        id: result.approval_request_id,
        title: "Upload Ownership Transfer Documents",
        description: "Upload supporting documents for the ownership transfer approval request",
        resultData: result
      });
      setShowApprovalDocsModal(true);
    } 
    // If immediate execution (self-approval or no approval needed)
    else if (result?.history_id) {
      setLatestHistoryId(result.history_id);
      setShowUploadStep(true);
      
      if (onSuccess) onSuccess(result.history_id);
    }
    
    await onRefreshParcel();
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

  const handleApprovalDocsModalClose = () => {
    setShowApprovalDocsModal(false);
    setCurrentApprovalRequest(null);
    onRefreshParcel();
    onClose();
  };

  const handleApprovalDocsComplete = () => {
    setShowApprovalDocsModal(false);
    setCurrentApprovalRequest(null);
    
    if (currentApprovalRequest?.resultData?.history_id) {
      if (onSuccess) onSuccess(currentApprovalRequest.resultData.history_id);
    }
    
    onRefreshParcel();
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
      
      if (result.success) {
        // Check if approval is required
        if (result.data?.approval_request_id) {
          toast.info(result.message || "Transfer request submitted for approval");
          await handleTransferSuccess({
            approval_request_id: result.data.approval_request_id,
            ...result.data
          });
        } else if (result.history?.history_id || result.data?.history_id) {
          // Immediate execution
          const historyId = result.history?.history_id || result.data?.history_id;
          toast.success(result.message || "Transfer completed successfully");
          await handleTransferSuccess({
            history_id: historyId,
            ...result.data
          });
        } else {
          // Fallback
          toast.success(result.message || "Transfer completed successfully");
          await onRefreshParcel();
          onClose();
        }
      } else {
        throw new Error(result.error || 'Failed to transfer ownership');
      }
    } catch (err: any) {
      console.error('Transfer error:', err);
      toast.error(err.message || 'Failed to transfer ownership');
      setError(err.message || 'Failed to transfer ownership');
    } finally {
      setLoading(false);
    }
  };

  const fromOwnerName = currentOwners.find(o => o.owner_id === formData.from_owner_id)?.full_name;
  const selectedBuyer = searchResults.find(o => o.owner_id === formData.to_owner_id);

  // ──────────────────────────────────────────────
  // Show document upload step after successful immediate transfer
  // ──────────────────────────────────────────────
  if (showUploadStep && latestHistoryId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-8 border-b border-[#f0cd6e] bg-gradient-to-r from-[#f0cd6e]/10 to-[#2a2718]/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#2a2718] mb-2">
                  Transfer Completed ✓
                </h2>
                <p className="text-[#2a2718]/70">
                  Upload supporting documents for parcel{' '}
                  <span className="font-mono font-bold text-[#f0cd6e]">{parcelUpin}</span>
                </p>
              </div>
              <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-[#f0cd6e] text-[#2a2718] rounded-full">
                Optional Step
              </span>
            </div>
          </div>

          {/* Upload Area */}
          <div className="p-8">
            <GenericDocsUpload
              title="Transfer supporting documents"
              upin={parcelUpin}
              subCity=""
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
          <div className="p-8 border-t border-[#f0cd6e] bg-[#f0cd6e]/5 rounded-b-2xl flex justify-between items-center">
            <button
              onClick={handleSkipUpload}
              className="text-sm text-[#2a2718] hover:text-[#2a2718]/80 underline transition"
            >
              Skip for now
            </button>

            <button
              onClick={handleUploadComplete}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
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
  // Main transfer form (shown before submission)
  // ──────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-[#f0cd6e] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#2a2718] dark:text-white">
                Transfer Ownership
              </h2>
              <p className="text-sm text-[#2a2718]/70 dark:text-gray-400 mt-0.5">
                UPIN: {parcelUpin}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#f0cd6e]/20 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Info banner */}
            <div className="bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-[#2a2718] mt-1 shrink-0" />
                <div className="text-sm text-[#2a2718]">
                  <strong className="font-medium block mb-1">Full Ownership Transfer</strong>
                  <p>The selected current owner's entire share will be transferred to the new owner.</p>
                  <p className="mt-2 text-xs">
                    {user?.role === "SUBCITY_NORMAL" ? 
                      "Your request will be submitted for approval by a higher authority." :
                      "You have permission to execute transfers directly."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* From Owner */}
            <div>
              <label className="block text-sm font-medium text-[#2a2718] dark:text-gray-300 mb-1.5">
                Current Owner (Seller) <span className="text-[#2a2718]/70 font-normal">(optional)</span>
              </label>
              <select
                name="from_owner_id"
                value={formData.from_owner_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#f0cd6e] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] text-[#2a2718]"
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
              <label className="text-sm font-medium text-[#2a2718] dark:text-gray-300 mb-1.5 flex items-center gap-2">
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
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#f0cd6e] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] pr-10 text-[#2a2718]"
                />
                <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#f0cd6e] pointer-events-none" />
              </div>

              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-[#f0cd6e] dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-[#2a2718]/70 dark:text-gray-400">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 && buyerSearch.length >= 2 ? (
                    <div className="p-4 text-center text-sm text-[#2a2718]/70 dark:text-gray-400">
                      No matching owners found
                      <button
                        type="button"
                        onClick={() => alert("Create new owner feature - to be implemented")}
                        className="ml-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#f0cd6e] bg-[#f0cd6e]/10 border border-[#f0cd6e] rounded hover:bg-[#f0cd6e]/20 transition-colors"
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
                          className={`px-4 py-2.5 cursor-pointer hover:bg-[#f0cd6e]/10 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors ${
                            formData.to_owner_id === owner.owner_id ? 'bg-[#f0cd6e]/20 dark:bg-blue-950/30' : ''
                          }`}
                        >
                          {formData.to_owner_id === owner.owner_id && (
                            <Check size={16} className="text-[#f0cd6e]" />
                          )}
                          <div>
                            <div className="font-medium text-[#2a2718]">{owner.full_name}</div>
                            <div className="text-xs text-[#2a2718]/70 dark:text-gray-400">
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
              <label className="block text-sm font-medium text-[#2a2718] dark:text-gray-300 mb-1.5">
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
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#f0cd6e] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] text-[#2a2718] disabled:opacity-60"
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
                <label className="block text-sm font-medium text-[#2a2718] dark:text-gray-300 mb-1.5">
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
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#f0cd6e] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] text-[#2a2718]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2a2718] dark:text-gray-300 mb-1.5">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="reference_no"
                  value={formData.reference_no}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#f0cd6e] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] text-[#2a2718]"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {formData.to_owner_id && selectedBuyer && (
              <div className="text-sm bg-[#f0cd6e]/10 p-3 rounded-lg text-center border border-[#f0cd6e] text-[#2a2718]">
                Transferring full ownership → <strong>{selectedBuyer.full_name}</strong>
                {formData.from_owner_id && <> from <strong>{fromOwnerName}</strong></>}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#f0cd6e] dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-2.5 border border-[#f0cd6e] dark:border-gray-700 rounded-lg hover:bg-[#f0cd6e]/20 dark:hover:bg-gray-800 transition-colors disabled:opacity-60 text-[#2a2718]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !formData.to_owner_id || !formData.transfer_type || loadingTypes}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* === Approval Request Document Upload Modal === */}
      {showApprovalDocsModal && currentApprovalRequest && (
        <ApprovalRequestDocsModal
          isOpen={showApprovalDocsModal}
          onClose={handleApprovalDocsModalClose}
          onComplete={handleApprovalDocsComplete}
          approvalRequestId={currentApprovalRequest.id}
          title={currentApprovalRequest.title}
          description={currentApprovalRequest.description}
          entityType="HISTORY"
          actionType="TRANSFER"
        />
      )}
    </>
  );
}