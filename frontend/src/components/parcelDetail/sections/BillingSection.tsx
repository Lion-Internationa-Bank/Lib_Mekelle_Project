// src/components/parcelDetail/sections/BillingSection.tsx
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  billingRecords: ParcelDetail["billing_records"];
};

const statusClasses: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-800 border-red-200",
  PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  OVERDUE: "bg-orange-100 text-orange-800 border-orange-200",
};

const BillingSection = ({ billingRecords }: Props) => {
  if (!billingRecords || billingRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No billing records found</p>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Billing History</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-50">
              <tr>
                {/* Identification */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Installment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Fiscal Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Due Date
                </th>
                
                {/* Bill Components */}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Base
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Interest
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Amount Due
                </th>
                
                {/* Payment Status */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Paid
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Remaining
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Penalty
                </th>
                
                {/* Reference */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Bank Ref
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {billingRecords.map((record) => {
                const dueDate = record.due_date
                  ? new Date(record.due_date)
                  : null;
                const isPastDue =
                  dueDate !== null && dueDate.getTime() < now.getTime();
                const penaltyVisible =
                  isPastDue && (Number(record.penalty_amount) ?? 0) > 0;
                const penaltyDisplay = penaltyVisible
                  ? (record.penalty_amount ?? 0).toLocaleString()
                  : "-";

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

                // Determine remaining amount display style
                const isRemainingZero = Number(remainingAmount) === 0;
                const remainingText = Number(remainingAmount).toLocaleString();
                const remainingClass = isRemainingZero
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium";

                return (
                  <tr
                    key={record.bill_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Identification */}
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {record.installment_number ? `#${record.installment_number}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.fiscal_year}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {dueDate ? dueDate.toLocaleDateString() : "-"}
                    </td>
                    
                    {/* Bill Components */}
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {Number(basePayment).toLocaleString()} ETB
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {Number(interestAmount).toLocaleString()} ETB
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {(record.amount_due || 0).toLocaleString()} ETB
                    </td>
                    
                    {/* Payment Status */}
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${badgeClass}`}
                      >
                        {record.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {(record.amount_paid || 0).toLocaleString()} ETB
                    </td>
                    <td className={`px-4 py-3 text-sm text-right ${remainingClass}`}>
                      {remainingText} ETB
                      {isRemainingZero && (
                        <span className="ml-1 text-xs text-green-500">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {penaltyDisplay} {penaltyVisible ? "ETB" : ""}
                    </td>
                    
                    {/* Reference */}
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {record.bank_reference || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;