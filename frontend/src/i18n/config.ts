// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import english translations
import { navigation as enNavigation } from './locales/en/navigation';
import { requests as enRequests } from './locales/en/requests';
import { common as enCommon } from './locales/en/common';
import { users as enUsers } from './locales/en/users';
import { rates as enRates } from './locales/en/rates';
import { auth as enAuth } from './locales/en/auth';
import { subcity as enSubcity } from './locales/en/subcity';
import { configs as enConfigs } from './locales/en/configs';
import { ownership as enOwnership } from './locales/en/ownership';
import { sessions as enSessions } from './locales/en/sessions';
import { subcityHome as enSubcityHome } from './locales/en/subcityHome';
import { parcelTable as enParcelTable } from './locales/en/parcelTable';
import { parcelSearch as enParcelSearch } from './locales/en/parcelSearch';
import { parcelDetail as enParcelDetail } from './locales/en/parcelDetail';
import { billingSection as enBillingSection } from './locales/en/billingSection';
import { parcelInfo as enParcelInfo } from './locales/en/parcelInfo';
import { editParcelModal as enEditParcelModal } from './locales/en/editParcelModal';
import { subdivideModal as enSubdivideModal } from './locales/en/subdivideModal';
import { ownersSection as enOwnersSection } from './locales/en/ownersSection';
import { ownerCard as enOwnerCard } from './locales/en/ownerCard';
import { editOwnerModal as enEditOwnerModal } from './locales/en/editOwnerModal';
import { transferModal as enTransferModal } from './locales/en/transferModal';
import { leaseSection as enLeaseSection } from './locales/en/leaseSection';
import { leaseCard as enLeaseCard } from './locales/en/leaseCard';
import { createLeaseModal as enCreateLeaseModal } from './locales/en/createLeaseModal';
import { editLeaseModal as enEditLeaseModal } from './locales/en/editLeaseModal';
import { encumbrancesSection as enEncumbrancesSection } from './locales/en/encumbrancesSection';
import { encumbranceCard as enEncumbranceCard } from './locales/en/encumbranceCard';
import { encumbranceModal as enEncumbranceModal } from './locales/en/encumbranceModal';
import { transferHistoryCard as enTransferHistoryCard } from './locales/en/transferHistoryCard';
import { transferHistorySection as enTransferHistorySection } from './locales/en/transferHistorySection';
import { wizard as enWizard } from './locales/en/wizard';
import { validationStep as enValidationStep } from './locales/en/validationStep';
import { ownerStep as enOwnerStep } from './locales/en/ownerStep';
import { leaseDocsStep as enLeaseDocsStep } from './locales/en/leaseDocsStep';
import { leaseStep as enLeaseStep } from './locales/en/leaseStep';
import { ownerDocsStep as enOwnerDocsStep } from './locales/en/ownerDocsStep';
import { parcelStep as enParcelStep } from './locales/en/parcelStep';
import { parcelDocsStep as enParcelDocsStep } from './locales/en/parcelDocsStep';
import { encumbrancesReport as enEncumbrancesReport } from './locales/en/encumbrancesReport';
import { reportFilters as enReportFilters } from './locales/en/reportFilters';
import { landParcelsReport as enLandParcelsReport } from './locales/en/landParcelsReport';
import { ownersMultipleParcels as enOwnersMultipleParcels } from './locales/en/ownersMultipleParcels';
import { billsReport as enBillsReport } from './locales/en/billsReport';
import { requestDetail as enRequestDetail } from './locales/en/requestDetail';
import { leaseInstallmentRange as enLeaseInstallementRange } from './locales/en/leaseInstallmentRange';
import { reportsLayout as enReportsLayout } from './locales/en/reportsLayout';

// Import amharic translations
import { navigation as amNavigation } from './locales/am/navigation';
import { requests as amRequests } from './locales/am/requests';
import { common as amCommon } from './locales/am/common';
import { users as amUsers } from './locales/am/users';
import { rates as amRates } from './locales/am/rates';
import { auth as amAuth } from './locales/am/auth';
import { subcity as amSubcity } from './locales/am/subcity';
import { configs as amConfigs } from './locales/am/configs';
import { ownership as amOwnership } from './locales/am/ownership';
import { sessions as amSessions } from './locales/am/sessions';
import { subcityHome as amSubcityHome } from './locales/am/subcityHome';
import { parcelTable as amParcelTable } from './locales/am/parcelTable';
import { parcelSearch as amParcelSearch } from './locales/am/parcelSearch';
import { parcelDetail as amParcelDetail } from './locales/am/parcelDetail';
import { billingSection as amBillingSection } from './locales/am/billingSection';
import { parcelInfo as amParcelInfo } from './locales/am/parcelInfo';
import { editParcelModal as amEditParcelModal } from './locales/am/editParcelModal';
import { subdivideModal as amSubdivideModal } from './locales/am/subdivideModal';
import { ownersSection as amOwnersSection } from './locales/am/ownersSection';
import { ownerCard as amOwnerCard } from './locales/am/ownerCard';
import { editOwnerModal as amEditOwnerModal } from './locales/am/editOwnerModal';
import { transferModal as amTransferModal } from './locales/am/transferModal';
import { leaseSection as amLeaseSection } from './locales/am/leaseSection';
import { leaseCard as amLeaseCard } from './locales/am/leaseCard';
import { createLeaseModal as amCreateLeaseModal } from './locales/am/createLeaseModal';
import { editLeaseModal as amEditLeaseModal } from './locales/am/editLeaseModal';
import { encumbrancesSection as amEncumbrancesSection } from './locales/am/encumbrancesSection';
import { encumbranceCard as amEncumbranceCard } from './locales/am/encumbranceCard';
import { encumbranceModal as amEncumbranceModal } from './locales/am/encumbranceModal';
import { transferHistoryCard as amTransferHistoryCard } from './locales/am/transferHistoryCard';
import { transferHistorySection as amTransferHistorySection } from './locales/am/transferHistorySection';
import { wizard as amWizard } from './locales/am/wizard';
import { validationStep as amValidationStep } from './locales/am/validationStep';
import { ownerStep as amOwnerStep } from './locales/am/ownerStep';
import { leaseDocsStep as amLeaseDocsStep } from './locales/am/leaseDocsStep';
import { leaseStep as amLeaseStep } from './locales/am/leaseStep';
import { ownerDocsStep as amOwnerDocsStep } from './locales/am/ownerDocsStep';
import { parcelStep as amParcelStep } from './locales/am/parcelStep';
import { parcelDocsStep as amParcelDocsStep } from './locales/am/parcelDocsStep';
import { encumbrancesReport as amEncumbrancesReport } from './locales/am/encumbrancesReport';
import { reportFilters as amReportFilters } from './locales/am/reportFilters';
import { landParcelsReport as amLandParcelsReport } from './locales/am/landParcelsReport';
import { ownersMultipleParcels as amOwnersMultipleParcels } from './locales/am/ownersMultipleParcels';
import { billsReport as amBillsReport } from './locales/am/billsReport';
import { requestDetail as amRequestDetail } from './locales/am/requestDetail';
import { leaseInstallmentRange as amLeaseInstallementRange } from './locales/am/leaseInstallmentRange';
import { reportsLayout as amReportsLayout } from './locales/am/reportsLayout';

// Import tigrinya (tg) translations
import { navigation as tgNavigation } from './locales/tg/navigation';
import { requests as tgRequests } from './locales/tg/requests';
import { common as tgCommon } from './locales/tg/common';
import { users as tgUsers } from './locales/tg/users';
import { rates as tgRates } from './locales/tg/rates';
import { auth as tgAuth } from './locales/tg/auth';
import { subcity as tgSubcity } from './locales/tg/subcity';
import { configs as tgConfigs } from './locales/tg/configs';
import { ownership as tgOwnership } from './locales/tg/ownership';
import { sessions as tgSessions } from './locales/tg/sessions';
import { subcityHome as tgSubcityHome } from './locales/tg/subcityHome';
import { parcelTable as tgParcelTable } from './locales/tg/parcelTable';
import { parcelSearch as tgParcelSearch } from './locales/tg/parcelSearch';
import { parcelDetail as tgParcelDetail } from './locales/tg/parcelDetail';
import { billingSection as tgBillingSection } from './locales/tg/billingSection';
import { parcelInfo as tgParcelInfo } from './locales/tg/parcelInfo';
import { editParcelModal as tgEditParcelModal } from './locales/tg/editParcelModal';
import { subdivideModal as tgSubdivideModal } from './locales/tg/subdivideModal';
import { ownersSection as tgOwnersSection } from './locales/tg/ownersSection';
import { ownerCard as tgOwnerCard } from './locales/tg/ownerCard';
import { editOwnerModal as tgEditOwnerModal } from './locales/tg/editOwnerModal';
import { transferModal as tgTransferModal } from './locales/tg/transferModal';
import { leaseSection as tgLeaseSection } from './locales/tg/leaseSection';
import { leaseCard as tgLeaseCard } from './locales/tg/leaseCard';
import { createLeaseModal as tgCreateLeaseModal } from './locales/tg/createLeaseModal';
import { editLeaseModal as tgEditLeaseModal } from './locales/tg/editLeaseModal';
import { encumbrancesSection as tgEncumbrancesSection } from './locales/tg/encumbrancesSection';
import { encumbranceCard as tgEncumbranceCard } from './locales/tg/encumbranceCard';
import { encumbranceModal as tgEncumbranceModal } from './locales/tg/encumbranceModal';
import { transferHistoryCard as tgTransferHistoryCard } from './locales/tg/transferHistoryCard';
import { transferHistorySection as tgTransferHistorySection } from './locales/tg/transferHistorySection';
import { wizard as tgWizard } from './locales/tg/wizard';
import { validationStep as tgValidationStep } from './locales/tg/validationStep';
import { ownerStep as tgOwnerStep } from './locales/tg/ownerStep';
import { leaseDocsStep as tgLeaseDocsStep } from './locales/tg/leaseDocsStep';
import { leaseStep as tgLeaseStep } from './locales/tg/leaseStep';
import { ownerDocsStep as tgOwnerDocsStep } from './locales/tg/ownerDocsStep';
import { parcelStep as tgParcelStep } from './locales/tg/parcelStep';
import { parcelDocsStep as tgParcelDocsStep } from './locales/tg/parcelDocsStep';
import { encumbrancesReport as tgEncumbrancesReport } from './locales/tg/encumbrancesReport';
import { reportFilters as tgReportFilters } from './locales/tg/reportFilters';
import { landParcelsReport as tgLandParcelsReport } from './locales/tg/landParcelsReport';
import { ownersMultipleParcels as tgOwnersMultipleParcels } from './locales/tg/ownersMultipleParcels';
import { billsReport as tgBillsReport } from './locales/tg/billsReport';
import { requestDetail as tgRequestDetail } from './locales/tg/requestDetail';
import { leaseInstallmentRange as tgLeaseInstallementRange } from './locales/tg/leaseInstallmentRange';
import { reportsLayout as tgReportsLayout } from './locales/tg/reportsLayout';

const resources = {
  en: {
    navigation: enNavigation,
    requests: enRequests,
    common: enCommon,
    users: enUsers,
    rates: enRates,
    auth: enAuth,
    subcity: enSubcity,
    configs: enConfigs,
    ownership: enOwnership,
    sessions: enSessions,
    subcityHome: enSubcityHome,
    parcelTable: enParcelTable,
    parcelSearch: enParcelSearch,
    parcelDetail: enParcelDetail,
    billingSection: enBillingSection,
    parcelInfo: enParcelInfo,
    editParcelModal: enEditParcelModal,
    subdivideModal: enSubdivideModal,
    ownersSection: enOwnersSection,
    ownerCard: enOwnerCard,
    editOwnerModal: enEditOwnerModal,
    transferModal: enTransferModal,
    leaseSection: enLeaseSection,
    leaseCard: enLeaseCard,
    createLeaseModal: enCreateLeaseModal,
    editLeaseModal: enEditLeaseModal,
    encumbrancesSection: enEncumbrancesSection,
    encumbranceCard: enEncumbranceCard,
    encumbranceModal: enEncumbranceModal,
    transferHistoryCard: enTransferHistoryCard,
    transferHistorySection: enTransferHistorySection,
    wizard: enWizard,
    validationStep: enValidationStep,
    ownerStep: enOwnerStep,
    leaseDocsStep: enLeaseDocsStep,
    leaseStep: enLeaseStep,
    ownerDocsStep: enOwnerDocsStep,
    parcelStep: enParcelStep,
    parcelDocsStep: enParcelDocsStep,
    encumbrancesReport: enEncumbrancesReport,
    reportFilters: enReportFilters,
    landParcelsReport: enLandParcelsReport,
    ownersMultipleParcels: enOwnersMultipleParcels,
    billsReport: enBillsReport,
    requestDetail: enRequestDetail,
    leaseInstallmentRange:enLeaseInstallementRange,
    reportsLayout:enReportsLayout
  },

  am: {
    navigation: amNavigation,
    requests: amRequests,
    common: amCommon,
    users: amUsers,
    rates: amRates,
    auth: amAuth,
    subcity: amSubcity,
    configs: amConfigs,
    ownership: amOwnership,
    sessions: amSessions,
    subcityHome: amSubcityHome,
    parcelTable: amParcelTable,
    parcelSearch: amParcelSearch,
    parcelDetail: amParcelDetail,
    billingSection: amBillingSection,
    parcelInfo: amParcelInfo,
    editParcelModal: amEditParcelModal,
    subdivideModal: amSubdivideModal,
    ownersSection: amOwnersSection,
    ownerCard: amOwnerCard,
    editOwnerModal: amEditOwnerModal,
    transferModal: amTransferModal,
    leaseSection: amLeaseSection,
    leaseCard: amLeaseCard,
    createLeaseModal: amCreateLeaseModal,
    editLeaseModal: amEditLeaseModal,
    encumbrancesSection: amEncumbrancesSection,
    encumbranceCard: amEncumbranceCard,
    encumbranceModal: amEncumbranceModal,
    transferHistoryCard: amTransferHistoryCard,
    transferHistorySection: amTransferHistorySection,
    wizard: amWizard,
    validationStep: amValidationStep,
    ownerStep: amOwnerStep,
    leaseDocsStep: amLeaseDocsStep,
    leaseStep: amLeaseStep,
    ownerDocsStep: amOwnerDocsStep,
    parcelStep: amParcelStep,
    parcelDocsStep: amParcelDocsStep,
    encumbrancesReport: amEncumbrancesReport,
    reportFilters: amReportFilters,
    landParcelsReport: amLandParcelsReport,
    ownersMultipleParcels: amOwnersMultipleParcels,
    billsReport: amBillsReport,
    requestDetail: amRequestDetail,
    leaseInstallmentRange:amLeaseInstallementRange,
     reportsLayout:amReportsLayout
  },

  // Tigrinya (tg)
  tg: {
    navigation: tgNavigation,
    requests: tgRequests,
    common: tgCommon,
    users: tgUsers,
    rates: tgRates,
    auth: tgAuth,
    subcity: tgSubcity,
    configs: tgConfigs,
    ownership: tgOwnership,
    sessions: tgSessions,
    subcityHome: tgSubcityHome,
    parcelTable: tgParcelTable,
    parcelSearch: tgParcelSearch,
    parcelDetail: tgParcelDetail,
    billingSection: tgBillingSection,
    parcelInfo: tgParcelInfo,
    editParcelModal: tgEditParcelModal,
    subdivideModal: tgSubdivideModal,
    ownersSection: tgOwnersSection,
    ownerCard: tgOwnerCard,
    editOwnerModal: tgEditOwnerModal,
    transferModal: tgTransferModal,
    leaseSection: tgLeaseSection,
    leaseCard: tgLeaseCard,
    createLeaseModal: tgCreateLeaseModal,
    editLeaseModal: tgEditLeaseModal,
    encumbrancesSection: tgEncumbrancesSection,
    encumbranceCard: tgEncumbranceCard,
    encumbranceModal: tgEncumbranceModal,
    transferHistoryCard: tgTransferHistoryCard,
    transferHistorySection: tgTransferHistorySection,
    wizard: tgWizard,
    validationStep: tgValidationStep,
    ownerStep: tgOwnerStep,
    leaseDocsStep: tgLeaseDocsStep,
    leaseStep: tgLeaseStep,
    ownerDocsStep: tgOwnerDocsStep,
    parcelStep: tgParcelStep,
    parcelDocsStep: tgParcelDocsStep,
    encumbrancesReport: tgEncumbrancesReport,
    reportFilters: tgReportFilters,
    landParcelsReport: tgLandParcelsReport,
    ownersMultipleParcels: tgOwnersMultipleParcels,
    billsReport: tgBillsReport,
    requestDetail: tgRequestDetail,
    leaseInstallmentRange:tgLeaseInstallementRange,
     reportsLayout:tgReportsLayout
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',                    // default language
    fallbackLng: 'en',
    ns: [
      'navigation',
      'requests',
      'common',
      'users',
      'rates',
      'auth',
      'subcity',
      'subcityHome',
      'parcelTable',
      'parcelSearch',
      'parcelDetail',
      'billingSection',
      'parcelInfo',
      'editParcelModal',
      'subdivideModal',
      'ownersSection',
      'ownerCard',
      'editOwnerModal',
      'transferModal',
      'leaseSection',
      'leaseCard',
      'createLeaseModal',
      'editLeaseModal',
      'encumbrancesSection',
      'encumbranceCard',
      'encumbranceModal',
      'transferHistoryCard',
      'transferHistorySection',
      'wizard',
      'validationStep',
      'ownerStep',
      'leaseDocsStep',
      'leaseStep',
      'ownerDocsStep',
      'parcelStep',
      'parcelDocsStep',
      'encumbrancesReport',
      'reportFilters',
      'landParcelsReport',
      'ownersMultipleParcels',
      'billsReport',
      'requestDetail',
    ],
    defaultNS: 'navigation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;