// src/components/parcelDetail/cards/LeaseCard.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import DocumentList from "../DocumentList";
import { useCalendar } from "../../../contexts/CalendarContext";
import DateDisplay from "../../common/DateDisplay";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  CalendarDays, 
  FileText, 
  Info, 
  Clock, 
  Scale,
  DollarSign,
  Calendar
} from "lucide-react";

interface LeaseCardProps {
  lease: NonNullable<ParcelDetail["lease_agreement"]>;
}

const LeaseCard = ({ lease }: LeaseCardProps) => {
  const { calendarType, isEthiopian } = useCalendar();
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";

  const formatCurrency = (value: number) => {
    return Number(value).toLocaleString('en-ET', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#f0cd6e] shadow-sm overflow-hidden">
      {/* Header with Calendar Indicator */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#f0cd6e]/10 to-[#2a2718]/10 border-b border-[#f0cd6e]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f0cd6e]/20 rounded-lg">
              <FileText className="w-5 h-5 text-[#2a2718]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2a2718]">Lease Agreement</h2>
              <p className="text-sm text-[#2a2718]/70">Contract details and financial terms</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#f0cd6e] rounded-lg">
              <Calendar className="w-4 h-4 text-[#2a2718]" />
              <span className="text-sm font-medium text-[#2a2718]">
                {isEthiopian ? 'ዓ/ም' : 'GC'}
              </span>
            </div>
            <div className="text-sm text-[#2a2718]/70">
              {isEthiopian ? 'የኢትዮጵያ ቀን መቁጠሪያ' : 'Gregorian Calendar'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Financial Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-base font-semibold text-[#2a2718]">Financial Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#2a2718]/70">Lease Amount</span>
                </div>
                <div className="text-lg font-bold text-[#2a2718]">
                  {formatCurrency(lease.total_lease_amount)} ETB
                </div>
              </div>
              
              <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#2a2718]/70">Down Payment</span>
                </div>
                <div className="text-lg font-bold text-[#2a2718]">
                  {formatCurrency(lease.down_payment_amount)} ETB
                </div>
              </div>
              
              <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#2a2718]/70">Price per m²</span>
                </div>
                <div className="text-lg font-bold text-[#2a2718]">
                  {formatCurrency(lease.price_per_m2)} ETB
                </div>
              </div>
              
              <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#2a2718]/70">Other Payment</span>
                </div>
                <div className="text-lg font-bold text-[#2a2718]">
                  {formatCurrency(lease.other_payment)} ETB
                </div>
              </div>

              {/* New Fee Fields */}
              {lease.demarcation_fee !== null && lease.demarcation_fee !== undefined && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-purple-600">Demarcation Fee</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {formatCurrency(Number(lease.demarcation_fee))} ETB
                  </div>
                </div>
              )}

              {lease.engineering_service_fee !== null && lease.engineering_service_fee !== undefined && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-purple-600">Engineering Fee</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {formatCurrency(Number(lease.engineering_service_fee))} ETB
                  </div>
                </div>
              )}

              {lease.contract_registration_fee !== null && lease.contract_registration_fee !== undefined && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-purple-600">Registration Fee</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {typeof lease.contract_registration_fee === 'string' 
                      ? lease.contract_registration_fee 
                      : formatCurrency(Number(lease.contract_registration_fee))} 
                    {typeof lease.contract_registration_fee === 'string' ? '' : ' ETB'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional Financial Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#f0cd6e]/10 rounded-lg border border-[#f0cd6e]">
                <div>
                  <div className="text-sm font-medium text-[#2a2718]/70">Annual Installment</div>
                  <div className="text-2xl font-bold text-[#f0cd6e]">
                    {formatCurrency(lease.annual_installment)} ETB
                  </div>
                </div>
                <div className="text-sm text-[#f0cd6e] bg-white px-3 py-1 rounded-full border border-[#f0cd6e]">
                  Yearly
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-[#f0cd6e]/5 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-[#2a2718]/70">Lease ID</div>
                  <div className="font-mono text-[#2a2718]">{lease.lease_id}</div>
                </div>
                <div className="text-xs px-2 py-1 bg-[#f0cd6e]/20 text-[#2a2718] rounded">
                  Unique Identifier
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Legal Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-[#2a2718]">Timeline & Legal</h3>
            </div>
            
            <div className="space-y-4">
              {/* Period Information */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                  <div className="text-xs font-medium text-[#2a2718]/70 mb-1">Lease Period</div>
                  <div className="text-lg font-bold text-[#2a2718]">
                    {lease.lease_period_years} years
                  </div>
                </div>
                
                <div className="bg-[#f0cd6e]/5 p-4 rounded-lg border border-[#f0cd6e]">
                  <div className="text-xs font-medium text-[#2a2718]/70 mb-1">Payment Term</div>
                  <div className="text-lg font-bold text-[#2a2718]">
                    {lease.payment_term_years} years
                  </div>
                </div>
              </div>
              
              {/* Date Timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#2a2718]/70">
                  <CalendarDays className="w-4 h-4" />
                  <span>Key Dates</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-[#f0cd6e] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded">
                        <CalendarDays className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#2a2718]/70">Contract Date</div>
                        <DateDisplay 
                          date={lease.contract_date} 
                          format="medium"
                          className="font-semibold text-[#2a2718]"
                          showTooltip={true}
                          showCalendarIndicator={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-[#f0cd6e] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <CalendarDays className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#2a2718]/70">Start Date</div>
                        <DateDisplay 
                          date={lease.start_date} 
                          format="medium"
                          className="font-semibold text-[#2a2718]"
                          showTooltip={true}
                          showCalendarIndicator={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-red-100 rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-red-100 rounded">
                        <CalendarDays className="w-3 h-3 text-red-600" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#2a2718]/70">Expiry Date</div>
                        <DateDisplay 
                          date={lease.expiry_date} 
                          format="medium"
                          className="font-semibold"
                          showTooltip={true}
                          showCalendarIndicator={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legal Framework */}
              <div className="p-4 bg-[#f0cd6e]/5 rounded-lg border border-[#f0cd6e]">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-[#2a2718]/70">Legal Framework</span>
                </div>
                <div className="text-[#2a2718]">
                  {lease.legal_framework || "No legal framework specified"}
                </div>
              </div>
              
              {/* Calendar Tooltip Hint */}
              <div className="p-4 bg-[#f0cd6e]/10 rounded-lg border border-[#f0cd6e]">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#2a2718] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#2a2718] mb-1">
                      Calendar Information
                    </div>
                    <p className="text-xs text-[#2a2718]/70">
                      {isEthiopian 
                        ? "Hover over dates to view Gregorian calendar equivalents" 
                        : "Hover over dates to view Ethiopian calendar equivalents"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-8 pt-8 border-t border-[#f0cd6e]">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-[#2a2718]" />
            <h3 className="text-lg font-semibold text-[#2a2718]">Lease Documents</h3>
            <span className="ml-2 text-sm text-[#2a2718]/70">
              • {lease.documents?.length || 0} document(s)
            </span>
          </div>
          
          <div className="bg-[#f0cd6e]/5 rounded-xl border border-[#f0cd6e] p-4">
            <DocumentList
              documents={lease.documents}
              title="Lease Documents"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaseCard;