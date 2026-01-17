// src/components/parcelDetail/cards/LeaseCard.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import DocumentList from "../DocumentList";
import { useCalendar } from "../../../contexts/CalendarContext";
import DateDisplay from "../../DateDisplay";

interface LeaseCardProps {
  lease: NonNullable<ParcelDetail["lease_agreement"]>;
}

const LeaseCard = ({ lease }: LeaseCardProps) => {
  const { calendarType, isEthiopian } = useCalendar();
  // console.log('Current calendar type:', calendarType, 'Is Ethiopian:', isEthiopian);

  return (
    <div className="bg-white/80 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Lease Agreement</h2>
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-gray-600">
              {isEthiopian ? 'የኢትዮጵያ ቀን መቁጠሪያ' : 'Gregorian Calendar'}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${isEthiopian ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
              {isEthiopian ? 'ዓ/ም' : 'GC'}
            </div>
          </div>
        </div>
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
                <dd className="mt-1 font-mono text-gray-900">
                  {lease.lease_id}
                </dd>
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
              <div>
                <dt className="font-medium text-gray-600">Annual Lease Fee</dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {Number(lease.annual_lease_fee).toLocaleString()} ETB
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
                <dd className="mt-1 font-semibold text-gray-900">
                  {lease.lease_period_years} years
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Payment Term</dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {lease.payment_term_years} years
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Annual Installment</dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {Number(lease.annual_installment).toLocaleString()} ETB
                </dd>
              </div>
              
              {/* Contract Date */}
              <div>
                <dt className="font-medium text-gray-600">Contract Date</dt>
                <dd className="mt-1 text-gray-900">
                  <DateDisplay 
                    date={lease.contract_date} 
                    format="medium"
                    className="font-semibold"
                    showTooltip={true}
                    showCalendarIndicator={true}
                  />
                </dd>
              </div>
              
              {/* Start Date */}
              <div>
                <dt className="font-medium text-gray-600">Start Date</dt>
                <dd className="mt-1 text-gray-900">
                  <DateDisplay 
                    date={lease.start_date} 
                    format="medium"
                    className="font-semibold"
                    showTooltip={true}
                    showCalendarIndicator={true}
                  />
                </dd>
              </div>
              
              {/* Expiry Date */}
              <div>
                <dt className="font-medium text-gray-600">Expiry Date</dt>
                <dd className="mt-1 text-gray-900">
                  <DateDisplay 
                    date={lease.expiry_date} 
                    format="medium"
                    className="font-semibold"
                    showTooltip={true}
                    showCalendarIndicator={true}
                  />
                </dd>
              </div>
              
              {/* Legal Framework */}
              <div>
                <dt className="font-medium text-gray-600">Legal Framework</dt>
                <dd className="mt-1 text-gray-700">
                  {lease.legal_framework || "-"}
                </dd>
              </div>
            </dl>
            
            {/* Tooltip Hint */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <div className="mt-0.5">
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>
                  {isEthiopian 
                    ? "Hover over dates to see Gregorian equivalent" 
                    : "Hover over dates to see Ethiopian equivalent"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lease Documents */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Lease Documents</h3>
          <DocumentList
            documents={lease.documents}
            title="Lease Documents"
          />
        </div>
      </div>
    </div>
  );
};

export default LeaseCard;