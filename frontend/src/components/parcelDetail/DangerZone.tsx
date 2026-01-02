// src/components/parcelDetail/DangerZone.tsx
import { useState } from "react";
import DeleteParcelModal from "./modals/DeleteParcelModal";

type Props = {
  upin: string;
  onDeleted: () => void;
};

const DangerZone = ({ upin, onDeleted }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
        <p className="text-sm text-red-700 mb-6">
          Once you delete a parcel, there is no going back. All data will be permanently removed.
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-6 py-3 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete this parcel
        </button>
      </div>

      <DeleteParcelModal
        upin={upin}
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onDeleted={onDeleted}
      />
    </>
  );
};

export default DangerZone;