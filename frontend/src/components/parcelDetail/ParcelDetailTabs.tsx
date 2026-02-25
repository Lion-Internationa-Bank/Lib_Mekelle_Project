// src/components/parcelDetail/ParcelDetailTabs.tsx

type DetailTab = "parcel" | "lease" | "encumbrances" | "buildings" | "billing" | "history";

type Props = {
  tab: DetailTab;
  setTab: (tab: DetailTab) => void;
};

const tabs = [
  { id: "parcel", label: "Parcel & Owners" },
  { id: "lease", label: "Lease" },
  { id: "encumbrances", label: "Encumbrances" },
   { id: "history", label: "Transfer History" }, 
  { id: "buildings", label: "Buildings" },
  { id: "billing", label: "Billing" },
 
] as const;

const ParcelDetailTabs = ({ tab, setTab }: Props) => (
  <div className="border-b border-[#f0cd6e] mb-8">
    <nav className="flex space-x-8 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
            tab === t.id
              ? "border-[#2a2718] text-[#2a2718]"
              : "border-transparent text-[#2a2718]/50 hover:text-[#2a2718] hover:border-[#f0cd6e]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  </div>
);

export default ParcelDetailTabs;