// src/components/parcelDetail/sections/BuildingsSection.tsx
import BuildingCard from "../cards/BuildingCard";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  buildings: ParcelDetail["buildings"];

};

const BuildingsSection = ({ buildings }: Props) => {
  if (buildings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No buildings registered on this parcel</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900">Registered Buildings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {buildings.map((building) => (
          <BuildingCard key={building.building_id} building={building} />
        ))}
      </div>
    </div>
  );
};

export default BuildingsSection;