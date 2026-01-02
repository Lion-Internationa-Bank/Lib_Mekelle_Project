// src/components/parcelDetail/ParcelDetailTabs.tsx
type DetailTab = "parcel" | "lease" | "encumbrances" | "buildings" | "billing";

type Props = {
  tab: DetailTab;
  setTab: (tab: DetailTab) => void;
};

const tabs = [
  { id: "parcel", label: "Parcel & Owners" },
  { id: "lease", label: "Lease" },
  { id: "encumbrances", label: "Encumbrances" },
  { id: "buildings", label: "Buildings" },
  { id: "billing", label: "Billing" },
] as const;

const ParcelDetailTabs = ({ tab, setTab }: Props) => (
  <div className="border-b border-gray-200 mb-8">
    <nav className="flex space-x-8">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            tab === t.id
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  </div>
);

export default ParcelDetailTabs;