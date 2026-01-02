// components/parcelDetail/LeaseCard.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import DocumentList from "../DocumentList";

interface LeaseCardProps {
  lease: NonNullable<ParcelDetail["lease_agreement"]>;
  onEdit: () => void;
}

const LeaseCard = ({ lease, onEdit }: LeaseCardProps) => {
  return (
    <div className="bg-white/80 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header with Edit Button */}
      <div className="  px-6 py-4  flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Lease Agreement</h2>
        <button
          onClick={onEdit}
          className="px-5 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
        >
          Edit Lease
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Lease Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Lease Info
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-600">Lease ID</dt>
                <dd className="mt-1 font-mono text-gray-900">{lease.lease_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Total Lease Amount</dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {Number(lease.total_lease_amount).toLocaleString()} ETB
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Down Payment</dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {Number(lease.down_payment_amount).toLocaleString()} ETB
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Price per m²</dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {Number(lease.price_per_m2).toLocaleString()} ETB
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Column - Period & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Period & Legal
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-600">Lease Period</dt>
                <dd className="mt-1 font-semibold text-gray-900">{lease.lease_period_years} years</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Payment Term</dt>
                <dd className="mt-1 font-semibold text-gray-900">{lease.payment_term_years} years</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Annual Installment</dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {Number(lease.annual_installment).toLocaleString()} ETB
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Start Date</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(lease.start_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Expiry Date</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(lease.expiry_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Legal Framework</dt>
                <dd className="mt-1 text-gray-700">{lease.legal_framework || "-"}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Lease Documents */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Lease Documents</h3>
          <DocumentList documents={lease.documents} title="Lease Documents" />
        </div>
      </div>
    </div>
  );
};

export default LeaseCard;