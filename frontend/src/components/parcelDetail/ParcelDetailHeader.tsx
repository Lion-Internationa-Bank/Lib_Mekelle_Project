// src/components/parcelDetail/ParcelDetailHeader.tsx
import { Link } from "react-router-dom";
import type { ParcelDetail } from "../../services/parcelDetailApi";

type Props = { data: ParcelDetail };

const ParcelDetailHeader = ({ data }: Props) => (
  <div className="mb-8 flex justify-between items-start">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Parcel Detail — <span className="font-mono text-blue-600">{data.upin}</span>
      </h1>
      <p className="text-gray-600 mt-1">
        {data.sub_city} • {data.ketena || "N/A"} • Block {data.block || "N/A"}
      </p>
    </div>
    <Link
      to="/home"
      className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
    >
      ← Dashboard
    </Link>
  </div>
);

export default ParcelDetailHeader;