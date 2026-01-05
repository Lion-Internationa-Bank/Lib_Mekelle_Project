import TransferHistoryCard from "../cards/TransferHistoryCard";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  history: ParcelDetail["history"];
  upin: string;
  onReload: () => Promise<void>;
};

const TransferHistorySection = ({ history, upin, onReload }: Props) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ownership Transfer History
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl">
            <div className="max-w-md mx-auto">
              <div className="text-5xl mb-4">Initial Allocation</div>
              <p className="text-xl font-semibold text-gray-800 mb-2">
                Old Possession / Initial Allocation
              </p>
              <p className="text-gray-600">
                This parcel has no recorded ownership transfers.<br />
                Current owners hold it under original/old possession rights.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => (
              <TransferHistoryCard
                key={entry.history_id}
                entry={entry}
                upin={upin}
                onReload={onReload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferHistorySection;