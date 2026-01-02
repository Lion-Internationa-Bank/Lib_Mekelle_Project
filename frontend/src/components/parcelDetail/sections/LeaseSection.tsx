// src/components/parcelDetail/LeaseSection.tsx
import { useState } from "react";
import LeaseCard from "../cards/LeaseCard";
import EditLeaseModal from "../modals/EditLeaseModal";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Lease = NonNullable<ParcelDetail["lease_agreement"]>;

type Props = {
  lease: Lease;
  onReload: () => Promise<void>;
};

const LeaseSection = ({ lease, onReload }: Props) => {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <LeaseCard lease={lease} onEdit={() => setEditing(true)} />

      <EditLeaseModal
        lease={lease}
        open={editing}
        onClose={() => setEditing(false)}
        onSuccess={onReload}
      />
    </>
  );
};

export default LeaseSection;