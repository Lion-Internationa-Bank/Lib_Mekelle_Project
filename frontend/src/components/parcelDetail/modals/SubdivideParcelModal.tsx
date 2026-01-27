// src/components/modals/SubdivideParcelModal.tsx
import { useState } from 'react';
import { X, Plus, Trash2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { subdivideParcel } from './../../../services/parcelDetailApi';
import type { ParcelDetail } from '../../../services/parcelDetailApi';
import { toast } from 'sonner';

interface SubdivideParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: ParcelDetail;
  onSuccess: () => Promise<void>;
}

export default function SubdivideParcelModal({
  isOpen,
  onClose,
  parcel,
  onSuccess,
}: SubdivideParcelModalProps) {
  const [children, setChildren] = useState<Array<{
    upin: string;
    file_number: string;
    total_area_m2: number;
    boundary_coords?: string; // JSON string
    boundary_north?: string;
    boundary_east?: string;
    boundary_south?: string;
    boundary_west?: string;
    showBoundaries?: boolean; // toggle visibility
  }>>([
    { 
      upin: `${parcel.upin}-A`, 
      file_number: `${parcel.file_number}-A`, 
      total_area_m2: 0,
      showBoundaries: false
    },
    { 
      upin: `${parcel.upin}-B`, 
      file_number: `${parcel.file_number}-B`, 
      total_area_m2: 0,
      showBoundaries: false
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const addChild = () => {
    const suffix = String.fromCharCode(65 + children.length);
    setChildren([
      ...children,
      {
        upin: `${parcel.upin}-${suffix}`,
        file_number: `${parcel.file_number}-${suffix}`,
        total_area_m2: 0,
        showBoundaries: false,
      },
    ]);
  };

  const removeChild = (index: number) => {
    if (children.length <= 2) {
      setError("Minimum 2 child parcels required for subdivision");
      return;
    }
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof typeof children[0], value: any) => {
    setChildren(prev =>
      prev.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      )
    );
    setError(null);
  };

  const toggleBoundaries = (index: number) => {
    setChildren(prev =>
      prev.map((c, i) =>
        i === index ? { ...c, showBoundaries: !c.showBoundaries } : c
      )
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Area validation with tolerance
      const totalChildArea = children.reduce((sum, c) => sum + Number(c.total_area_m2), 0);
      const parentArea = Number(parcel.total_area_m2);

      if (totalChildArea > parentArea + 0.1) {
        throw new Error(
          `Total child area (${totalChildArea.toFixed(2)} m²) exceeds parent area (${parentArea.toFixed(2)} m²)`
        );
      }

      if (children.some(c => Number(c.total_area_m2) <= 0)) {
        throw new Error("All child parcels must have positive area");
      }

      // Check duplicate UPINs
      const upins = new Set(children.map(c => c.upin.trim()));
      if (upins.size !== children.length) {
        throw new Error("Duplicate UPINs detected. Each child must have a unique UPIN.");
      }

      // Prepare payload (filter out undefined/empty boundary fields)
      const payload = children.map(child => ({
        upin: child.upin.trim(),
        file_number: child.file_number.trim(),
        total_area_m2: Number(child.total_area_m2),
        ...(child.boundary_coords?.trim() && { boundary_coords: child.boundary_coords.trim() }),
        ...(child.boundary_north?.trim() && { boundary_north: child.boundary_north.trim() }),
        ...(child.boundary_east?.trim() && { boundary_east: child.boundary_east.trim() }),
        ...(child.boundary_south?.trim() && { boundary_south: child.boundary_south.trim() }),
        ...(child.boundary_west?.trim() && { boundary_west: child.boundary_west.trim() }),
      }));

      // Call API
    const res =  await subdivideParcel(parcel.upin, payload);

      await onSuccess();
      toast.success(res.message || "Subdived successfully ")
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to subdivide parcel")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Subdivide Parcel</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Parent Info */}
          <div className="bg-blue-50 p-5 rounded-lg mb-8">
            <p className="text-blue-800 font-medium text-lg">
              Parent Parcel: <strong>{parcel.upin}</strong>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Total Area: <strong>{parcel.total_area_m2.toLocaleString()} m²</strong>
            </p>
            <p className="text-sm text-blue-600 mt-3">
              All active owners will be automatically copied to every child parcel.
              Boundary fields are optional — they will default to parent's values if left blank.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg mb-6 flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Children */}
          {children.map((child, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 mb-8 bg-gray-50">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-lg text-gray-800">
                  Child Parcel {String.fromCharCode(65 + index)}
                </h3>
                {children.length > 2 && (
                  <button
                    onClick={() => removeChild(index)}
                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* UPIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    UPIN *
                  </label>
                  <input
                    value={child.upin}
                    onChange={e => updateChild(index, 'upin', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* File Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    File Number *
                  </label>
                  <input
                    value={child.file_number}
                    onChange={e => updateChild(index, 'file_number', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Area */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Total Area (m²) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={child.total_area_m2}
                    onChange={e => updateChild(index, 'total_area_m2', Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Optional Boundaries - Collapsible */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => toggleBoundaries(index)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {child.showBoundaries ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span className="ml-1.5">
                    {child.showBoundaries ? 'Hide' : 'Add/Edit'} Boundary Details (optional)
                  </span>
                </button>

                {child.showBoundaries && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-200">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Boundary Coordinates (JSON)
                      </label>
                      <textarea
                        value={child.boundary_coords || ''}
                        onChange={e => updateChild(index, 'boundary_coords', e.target.value)}
                        rows={4}
                        placeholder='{"type":"Polygon","coordinates":[[[...]]]}'
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        North Boundary
                      </label>
                      <input
                        value={child.boundary_north || ''}
                        onChange={e => updateChild(index, 'boundary_north', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        East Boundary
                      </label>
                      <input
                        value={child.boundary_east || ''}
                        onChange={e => updateChild(index, 'boundary_east', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        South Boundary
                      </label>
                      <input
                        value={child.boundary_south || ''}
                        onChange={e => updateChild(index, 'boundary_south', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        West Boundary
                      </label>
                      <input
                        value={child.boundary_west || ''}
                        onChange={e => updateChild(index, 'boundary_west', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add More Child */}
          <button
            onClick={addChild}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2 mt-6 transition-all"
          >
            <Plus size={20} />
            Add Another Child Parcel
          </button>

          {/* Footer Actions */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                'Confirm Subdivision'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}