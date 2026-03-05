// src/components/parcelDetail/ParcelDetailTabs.tsx
import { useTranslate } from '../../i18n/useTranslate';

type DetailTab = "parcel" | "lease" | "encumbrances" | "buildings" | "billing" | "history";

type Props = {
  tab: DetailTab;
  setTab: (tab: DetailTab) => void;
};

const ParcelDetailTabs = ({ tab, setTab }: Props) => {
  const { t } = useTranslate('parcelDetail');
  
  const tabs = [
    { id: "parcel", label: t('tabs.parcel') },
    { id: "lease", label: t('tabs.lease') },
    { id: "encumbrances", label: t('tabs.encumbrances') },
    { id: "history", label: t('tabs.history') }, 
    { id: "buildings", label: t('tabs.buildings') },
    { id: "billing", label: t('tabs.billing') },
  ] as const;

  return (
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
};

export default ParcelDetailTabs;