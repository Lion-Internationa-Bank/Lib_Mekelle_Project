// components/BillingCard.tsx
import type { ParcelDetail } from "../../services/parcelDetailApi";

interface BillingCardProps {
  bill: ParcelDetail["billing_records"][number];
}

const BillingCard = ({ bill }: BillingCardProps) => {
  return (
    <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold text-gray-900">
          {bill.bill_type} • FY {bill.fiscal_year}
        </div>
        <div className="text-xs text-gray-600">Status: {bill.payment_status}</div>
      </div>
      <div className="text-gray-700">Amount Due: {Number(bill.amount_due).toLocaleString()} ETB</div>
      <div className="text-gray-700">Amount Paid: {Number(bill.amount_paid).toLocaleString()} ETB</div>
      <div className="text-gray-700">Penalty: {Number(bill.penalty_amount).toLocaleString()} ETB</div>
    </div>
  );
};

export default BillingCard;