// src/components/parcelDetail/sections/BillingSection.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";
import { CalendarDays, DollarSign, FileText, Clock, CreditCard, Download } from "lucide-react";
import DateDisplay from "../../DateDisplay";
import { generateBillingPDF } from "../../../utils/pdfGenerator";

type Props = {
  data: ParcelDetail;
};

const statusClasses: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-800 border-red-200",
  PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  OVERDUE: "bg-orange-100 text-orange-800 border-orange-200",
};

const formatCurrency = (value: number) => {
  return Number(value).toLocaleString('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const BillingSection = ({ data }: Props) => {
  const { billing_records, lease_agreement: lease, owners, upin, file_number, sub_city, tabia, ketena, block, total_area_m2 } = data;
  const now = new Date();

  // Check if we have valid lease data
  const hasValidLease = lease && typeof lease === 'object';

  // Get owner name from the nested owner object structure
  const getOwnerName = (): string => {
    if (!owners || owners.length === 0) return 'N/A';
    
    // Get the first owner's full name from the nested owner object
    const firstOwner = owners[0];
    if (firstOwner?.owner?.full_name) {
      return firstOwner.owner.full_name;
    }
    
    return 'N/A';
  };

  const ownerName = getOwnerName();

  const handleDownloadPDF = () => {
    generateBillingPDF(data);
  };

  return (
    <div className="space-y-6">
      {/* Header with PDF button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing History</h2>
          <p className="text-gray-600 mt-1">Payment records and financial overview</p>
        </div>
        
        <div className="flex items-center gap-3">
          {billing_records && billing_records.length > 0 && (
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          )}
          
          {hasValidLease && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Lease Term: {lease.payment_term_years} years
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Owner Information Card */}
      {owners && owners.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Owner</p>
              <p className="font-semibold text-gray-900">{ownerName}</p>
              {owners[0]?.owner?.national_id && (
                <p className="text-xs text-gray-500">ID: {owners[0].owner.national_id}</p>
              )}
            </div>
            {owners.length > 1 && (
              <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                +{owners.length - 1} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lease Summary Card - Removed Lease ID display */}
      {hasValidLease ? (
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lease Overview</h3>
              {/* Removed Lease ID display */}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Financial Terms Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-medium text-gray-700">Financial Terms</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Total Lease Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(Number(lease.total_lease_amount) || 0)} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Down Payment</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(Number(lease.down_payment_amount) || 0)} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Other Payment</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(Number(lease.other_payment) || 0)} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100 bg-blue-50">
                  <span className="text-sm text-gray-600">Annual Installment</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(Number(lease.annual_installment) || 0)} ETB
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payment Terms Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-medium text-gray-700">Payment Terms</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-100 bg-purple-50">
                  <span className="text-sm text-gray-600">Payment Term</span>
                  <span className="font-bold text-purple-700">
                    {lease.payment_term_years || 0} years
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Lease Period</span>
                  <span className="font-semibold text-gray-900">
                    {lease.lease_period_years || 0} years
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Price per m²</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(Number(lease.price_per_m2) || 0)} ETB
                  </span>
                </div>
              </div>
            </div>
            
            {/* Timeline Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-medium text-gray-700">Lease Timeline</h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-green-100 bg-green-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">Start Date</span>
                    {lease.start_date ? (
                      <DateDisplay 
                        date={lease.start_date} 
                        format="short"
                        className="font-semibold text-green-700"
                        showTooltip={true}
                      />
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Lease commencement date</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">Contract Date</span>
                    {lease.contract_date ? (
                      <DateDisplay 
                        date={lease.contract_date} 
                        format="short"
                        className="font-semibold text-gray-900"
                        showTooltip={true}
                      />
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Agreement signing date</div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-red-100 bg-red-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">Expiry Date</span>
                    {lease.expiry_date ? (
                      <DateDisplay 
                        date={lease.expiry_date} 
                        format="short"
                        className="font-semibold text-red-700"
                        showTooltip={true}
                      />
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Lease termination date</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">No Lease Agreement Found</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This parcel does not have an associated lease agreement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing Table - Removed Paid column */}
      {!billing_records || billing_records.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Billing Records
            </h3>
            <p className="text-gray-500">
              There are no billing records available.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                Billing Records ({billing_records.length})
              </h3>
              <div className="text-sm text-gray-600">
                Total amount due:{" "}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(
                    billing_records.reduce((sum, record) => sum + (Number(record.amount_due) || 0), 0)
                  )}{" "}
                  ETB
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    S.NO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Base (ETB)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Interest (ETB)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Penalty (ETB)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Amount Due (ETB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Remaining (ETB)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {billing_records.map((record) => {
                  const dueDate = record.due_date
                    ? new Date(record.due_date)
                    : null;
                  const isPastDue =
                    dueDate !== null && dueDate.getTime() < now.getTime();
                  const penaltyVisible =
                    isPastDue && (Number(record.penalty_amount) ?? 0) > 0;

                  const statusKey =
                    record.payment_status as keyof typeof statusClasses;
                  const badgeClass =
                    statusClasses[statusKey] ??
                    "bg-gray-100 text-gray-800 border-gray-200";

                  const basePayment =
                    (record as any).base_payment ?? (record.amount_due ?? 0);
                  const interestAmount =
                    (record as any).interest_amount ?? 0;
                  const remainingAmount =
                    (record as any).remaining_amount ?? 0;

                  const isRemainingZero = Number(remainingAmount) === 0;
                  const remainingText = formatCurrency(remainingAmount);
                  const remainingClass = isRemainingZero
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium";

                  return (
                    <tr
                      key={record.bill_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        {record.installment_number ? `#${record.installment_number}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium">
                          {record.fiscal_year}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {dueDate ? (
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-3 h-3 text-gray-400" />
                            <DateDisplay 
                              date={record.due_date}
                              format="short"
                              className={`font-medium ${isPastDue ? 'text-red-600' : 'text-gray-700'}`}
                              showTooltip={true}
                            />
                            {isPastDue && (
                              <span className="text-xs text-red-500">Overdue</span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(basePayment)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {formatCurrency(interestAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {penaltyVisible ? formatCurrency(Number(record.penalty_amount) || 0) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                        {formatCurrency(Number(record.amount_due) || 0)} 
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${badgeClass}`}
                        >
                          {record.payment_status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm text-right font-medium ${remainingClass}`}>
                        <div className="flex items-center justify-end gap-1">
                          {remainingText} 
                          {isRemainingZero ? (
                            <span className="ml-1 text-green-500">✓</span>
                          ) : (
                            <span className="ml-1 text-red-500">●</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSection;