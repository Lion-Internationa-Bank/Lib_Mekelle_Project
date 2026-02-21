// src/components/parcelDetail/ParcelDetailHeader.tsx
import { Link } from 'react-router-dom';
import type { ParcelDetail } from '../../services/parcelDetailApi';

interface ParcelDetailHeaderProps {
  data: ParcelDetail;
}

const ParcelDetailHeader = ({ data }: ParcelDetailHeaderProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-8 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left: UPIN & File Number */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#2a2718] tracking-tight">
            UPIN: {data.upin}
          </h1>
          <p className="text-xl text-[#2a2718]/70">
            File Number: <span className="font-medium">{data.file_number || '—'}</span>
          </p>
        </div>

        {/* Right: Back Button */}
        <Link
          to="/home"
          className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-[#f0cd6e] hover:bg-[#2a2718] text-[#2a2718] hover:text-white rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#f0cd6e] focus:ring-offset-2"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ParcelDetailHeader;