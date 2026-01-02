// src/components/parcelDetail/ParcelInfoSection.tsx
import { useState } from "react";
import ParcelInfoCard from "../cards/ParcelInfoCard";
import EditParcelModal from "../modals/EditParcelModal";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  parcel: ParcelDetail;
  onReload: () => Promise<void>;
};

const ParcelInfoSection = ({ parcel, onReload }: Props) => {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <ParcelInfoCard data={parcel} onEdit={() => setShowEdit(true)} />
      <EditParcelModal
        parcel={parcel}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={onReload}
      />
    </>
  );
};

export default ParcelInfoSection;