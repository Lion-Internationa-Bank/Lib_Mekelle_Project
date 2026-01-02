// src/components/parcelDetail/EncumbrancesSection.tsx
import { useState } from "react";

import EncumbranceCard from "../cards/EncumbranceCard";
import EncumbranceModal from "../modals/EncumbranceModal";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  encumbrances: ParcelDetail["encumbrances"];
  upin: string;
  onReload: () => Promise<void>;
};

const EncumbrancesSection = ({ encumbrances, upin, onReload }: Props) => {
  const [editing, setEditing] = useState<ParcelDetail["encumbrances"][number] | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  return (
    <div className="space-y-6">
      {encumbrances.length === 0 ? (
        <div className="text-center py-8">
          <button
            onClick={() => setAddingNew(true)}
            className="px-6 py-3 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
          >
            + Add First Encumbrance
          </button>
        </div>
      ) : (
        encumbrances.map((e) => (
          <EncumbranceCard
            key={e.encumbrance_id}
            encumbrance={e}
            onEdit={() => setEditing(e)}
          />
        ))
      )}

      {encumbrances.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setAddingNew(true)}
            className="px-6 py-3 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
          >
            + Add New Encumbrance
          </button>
        </div>
      )}

      <EncumbranceModal
        upin={upin}
        encumbrance={editing}
        open={!!editing || addingNew}
        onClose={() => {
          setEditing(null);
          setAddingNew(false);
        }}
        onSuccess={onReload}
      />
    </div>
  );
};

export default EncumbrancesSection;