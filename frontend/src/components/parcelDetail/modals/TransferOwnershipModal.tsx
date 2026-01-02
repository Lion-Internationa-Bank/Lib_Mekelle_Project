// src/modals/TransferOwnershipModal.tsx
import { useState } from "react";
import {
  searchOwnersLiteApi,
  transferOwnershipApi,
  type TransferType,
  type LiteOwner,
} from "../../../services/parcelDetailApi";

type OwnerRelation = {
  owner: { owner_id: string; full_name: string };
  share_ratio: number;
};

type Props = {
  fromOwner: OwnerRelation;
  upin: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (historyId: string) => Promise<void>;
};

const TransferOwnershipModal = ({ fromOwner, upin, open, onClose, onSuccess }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<LiteOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    to_owner_id: "",
    to_owner_name: "",
    to_share_ratio: "",
    transfer_type: "SALE" as TransferType,
    transfer_price: "",
    reference_no: "",
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const owners = await searchOwnersLiteApi(searchTerm.trim());
      setResults(owners);
    } catch (err: any) {
      alert(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.to_owner_id) return alert("Select a target owner");
    const ratio = parseFloat(form.to_share_ratio);
    if (isNaN(ratio) || ratio <= 0 || ratio > 1) return alert("Invalid share ratio");

    setSaving(true);
    try {
      const result = await transferOwnershipApi(upin, {
        from_owner_id: fromOwner.owner.owner_id,
        to_owner_id: form.to_owner_id,
        to_share_ratio: ratio,
        transfer_type: form.transfer_type,
        transfer_price: form.transfer_price ? Number(form.transfer_price) : undefined,
        reference_no: form.reference_no || undefined,
      });
      await onSuccess(result.history.history_id);
      onClose();
    } catch (err: any) {
      alert(err.message || "Transfer failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
        <h2 className="text-lg font-semibold mb-2">Transfer Ownership</h2>
        <p className="text-sm text-gray-600 mb-6">
          From: <strong>{fromOwner.owner.full_name}</strong> ({(fromOwner.share_ratio * 100).toFixed(1)}%)
        </p>

        {/* Search target owner */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Search target owner</label>
          <div className="flex gap-2">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, ID, phone..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-3 max-h-48 overflow-auto border rounded-lg">
              {results.map((o) => (
                <button
                  key={o.owner_id}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      to_owner_id: o.owner_id,
                      to_owner_name: o.full_name,
                    }))
                  }
                  className={`w-full text-left p-3 hover:bg-blue-50 ${
                    form.to_owner_id === o.owner_id ? "bg-blue-100" : ""
                  }`}
                >
                  <div className="font-medium">{o.full_name}</div>
                  <div className="text-xs text-gray-600">{o.national_id} • {o.phone_number}</div>
                </button>
              ))}
            </div>
          )}

          {form.to_owner_name && (
            <p className="mt-2 text-sm text-green-700">Selected: {form.to_owner_name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Share to transfer (0–1)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={form.to_share_ratio}
              onChange={(e) => setForm({ ...form, to_share_ratio: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transfer type</label>
            <select
              value={form.transfer_type}
              onChange={(e) => setForm({ ...form, transfer_type: e.target.value as TransferType })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="SALE">Sale</option>
              <option value="GIFT">Gift</option>
              <option value="HEREDITY">Heredity</option>
              <option value="CONVERSION">Conversion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (optional)</label>
            <input
              type="number"
              value={form.transfer_price}
              onChange={(e) => setForm({ ...form, transfer_price: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference (optional)</label>
            <input
              value={form.reference_no}
              onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.to_owner_id || !form.to_share_ratio}
            className="px-6 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? "Transferring..." : "Confirm Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferOwnershipModal;