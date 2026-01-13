// src/components/parcelDetail/ParcelDetailHeader.tsx
import { Link } from 'react-router-dom';
import type { ParcelDetail } from '../../services/parcelDetailApi';

interface ParcelDetailHeaderProps {
  data: ParcelDetail;
}

const ParcelDetailHeader = ({ data }: ParcelDetailHeaderProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Left: UPIN & File Number */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            UPIN: {data.upin}
          </h1>
          <p className="text-xl text-gray-600">
            File Number: <span className="font-medium">{data.file_number || '—'}</span>
          </p>
        </div>

        {/* Right: Back Button */}
        <Link
          to="/home"
          className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ParcelDetailHeader;