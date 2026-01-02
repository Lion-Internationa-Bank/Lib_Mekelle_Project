// components/BuildingCard.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";

interface BuildingCardProps {
  building: ParcelDetail["buildings"][number];
}

const BuildingCard = ({ building }: BuildingCardProps) => {
  return (
    <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 text-sm">
      <div className="font-semibold text-gray-900">Usage: {building.usage_type}</div>
      <div className="text-gray-600">Total Area: {Number(building.total_area).toLocaleString()} m²</div>
      <div className="text-gray-600">Floors: {building.floor_count}</div>
    </div>
  );
};

export default BuildingCard;