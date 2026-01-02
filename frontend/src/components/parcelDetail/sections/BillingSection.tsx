// src/components/parcelDetail/sections/BillingSection.tsx

import BillingCard from "../cards/BillingCard";
import type { ParcelDetail } from "../../../services/parcelDetailApi";

type Props = {
  billingRecords: ParcelDetail["billing_records"];
};

const BillingSection = ({ billingRecords }: Props) => {
  if (billingRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No billing records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900">Billing History</h2>
      <div className="space-y-6">
        {billingRecords.map((record) => (
          <div
            key={record.bill_id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Bill #{record.bill_id}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Year: {record.year} • Status: <span className="font-medium">{record.status}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {(record.amount || 0).toLocaleString()} ETB
                </p>
                {record.paid_amount !== undefined && (
                  <p className="text-sm text-gray-600">
                    Paid: {record.paid_amount.toLocaleString()} ETB
                  </p>
                )}
              </div>
            </div>
            {record.due_date && (
              <p className="text-sm text-gray-500 mt-4">
                Due: {new Date(record.due_date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingSection;