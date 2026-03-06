// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import english translations
import { navigation as enNavigation } from './locales/en/navigation';
import {requests as enRequests,} from './locales/en/requests'
import {common as enCommon } from './locales/en/common'
import {users as enUsers} from './locales/en/users'
import {rates as enRates} from './locales/en/rates'
import {auth as enAuth} from './locales/en/auth'
import {subcity as enSubcity} from './locales/en/subcity'
import {configs as enConfigs} from './locales/en/configs'
import {ownership as enOwnership} from './locales/en/ownership'
import {sessions as enSessions} from './locales/en/sessions'
import {subcityHome as enSubcityHome} from './locales/en/subcityHome'
import {parcelTable as enParcelTable} from './locales/en/parcelTable'
import { parcelSearch as enParcelSearch } from './locales/en/parcelSearch';
import {parcelDetail as enParcelDetail } from './locales/en/parcelDetail'
import { billingSection as enBillingSection } from './locales/en/billingSection.ts';
import {parcelInfo as enParcelInfo } from './locales/en/parcelInfo'
import {editParcelModal as enEditParcelModal} from './locales/en/editParcelModal'
import { subdivideModal as enSubdivideModal } from './locales/en/subdivideModal';
import { ownersSection as enOwnersSection } from './locales/en/ownersSection.ts';
import { ownerCard as enOwnerCard } from './locales/en/ownerCard.ts';
import { editOwnerModal as enEditOwnerModal } from './locales/en/editOwnerModal.ts';
import { transferModal as enTransferModal } from './locales/en/transferModal.ts';
import { leaseSection as enLeaseSection } from './locales/en/leaseSection.ts';
import { leaseCard as enLeaseCard } from './locales/en/leaseCard.ts';
import {  createLeaseModal as enCreateLeaseModal } from './locales/en/createLeaseModal.ts';
import {  editLeaseModal as enEditLeaseModal } from './locales/en/editLeaseModal.ts';
import {  encumbrancesSection as enEncumbrancesSection } from './locales/en/encumbrancesSection.ts';
import {  encumbranceCard as enEncumbranceCard } from './locales/en/encumbranceCard.ts';
import {  encumbranceModal as enEncumbranceModal } from './locales/en/encumbranceModal.ts';
import { transferHistoryCard as enTransferHistoryCard } from './locales/en/transferHistoryCard.ts';
import { transferHistorySection as enTrasferHistorySection } from './locales/en/transferHistorySection.ts';
import { wizard as enWizard} from './locales/en/wizard.ts';
import { validationStep as enValidationStep}from './locales/en/validationStep.ts';
import { ownerStep as enOwnerStep } from './locales/en/ownerStep.ts';
import { leaseDocsStep as enLeaseDocsStep } from './locales/en/leaseDocsStep.ts';
import { leaseStep as enLeaseStep } from './locales/en/leaseStep.ts';
import { ownerDocsStep as enOwnerDocsStep } from './locales/en/ownerDocsStep.ts';
import { parcelStep as enParcelStep } from './locales/en/parcelStep.ts';
import { parcelDocsStep as enParcleDocsStep} from './locales/en/parcelDocsStep.ts'

// import amharic translation 
import { navigation as amNavigation } from './locales/am/navigation';
import {requests as amRequests} from './locales/am/requests'
import {common as amCommon } from './locales/am/common'
import {users as amUsers} from './locales/am/users'
import {rates as amRates} from './locales/am/rates'
import {auth as amAuth} from './locales/am/auth'
import {subcity as amSubcity} from './locales/am/subcity'
import {configs as amConfigs} from './locales/am/configs'
import {ownership as amOwnership} from './locales/am/ownership'
import {sessions as amSessions} from './locales/am/sessions'
import {subcityHome as amSubcityHome} from './locales/am/subcityHome'
import {parcelTable as amParcelTable} from './locales/am/parcelTable'
import { parcelSearch as amParcelSearch } from './locales/am/parcelSearch';
import {parcelDetail as amParcelDetail } from './locales/am/parcelDetail'
import { billingSection as amBillingSection } from './locales/am/billingSection.ts';
import {parcelInfo as amParcelInfo } from './locales/am/parcelInfo'
import {editParcelModal as amEditParcelInfo} from './locales/am/editParcelModal'
import { subdivideModal as amSubdivideModal } from './locales/am/subdivideModal.ts';
import { ownersSection as amOwnersSection } from './locales/am/ownersSection.ts';
import { ownerCard as amOwnerCard } from './locales/am/ownerCard.ts';
import { editOwnerModal as amEditOwnerModal } from './locales/am/editOwnerModal.ts';
import { transferModal as amTransferModal } from './locales/am/transferModal.ts';
import { leaseSection as amLeaseSection } from './locales/am/leaseSection.ts';
import { leaseCard as amLeaseCard } from './locales/am/leaseCard.ts';
import { createLeaseModal as amCreateLeaaseModal } from './locales/am/createLeaseModal.ts';
import { editLeaseModal as amEditLeaseModal } from './locales/am/editLeaseModal.ts';
import { encumbrancesSection as amEncumbrancesSection } from './locales/am/encumbrancesSection.ts';
import { encumbranceCard as amEncumbranceCard } from './locales/am/encumbranceCard.ts';
import { encumbranceModal as amEncumbranceModal } from './locales/am/encumbranceModal.ts';
import { transferHistoryCard as amTransferHistoryCard } from './locales/am/transferHistoryCard.ts';
import { transferHistorySection as amTrasferHistorySection } from './locales/am/transferHistorySection.ts';
import { wizard as amWizard } from './locales/am/wizard.ts';
import { validationStep as amValidationStep } from './locales/am/validationStep.ts';
import { ownerStep as amOwnerStep } from './locales/am/ownerStep.ts';
import { leaseDocsStep as amLeaseDocsStep } from './locales/am/leaseDocsStep.ts';
import { leaseStep as amLeaseStep } from './locales/am/leaseStep.ts';
import { ownerDocsStep as amOwnerDocsStep } from './locales/am/ownerDocsStep.ts';
import { parcelStep as amParcelStep } from './locales/am/parcelStep.ts';
import { parcelDocsStep as amParcleDocsStep } from './locales/am/parcelDocsStep.ts';

const resources = {
    // english 
  en: {
    navigation: enNavigation,
    requests: enRequests,
    common:enCommon,
    users:enUsers,
    rates:enRates,
    auth: enAuth,
    subcity:enSubcity,
    configs:enConfigs,
    ownership:enOwnership,
    sessions:enSessions,
    subcityHome:enSubcityHome,
    parcelSearch:enParcelSearch,
    parcelTable:enParcelTable,
    parcelDetail: enParcelDetail,
    subdivideModal:enSubdivideModal,
    editParcelModal:enEditParcelModal,
    parcelInfo:enParcelInfo,
    ownerCard:enOwnerCard,
     ownersSection:enOwnersSection,
     editOwnerModal:enEditOwnerModal,
     transferModal:enTransferModal,

     leaseSection:enLeaseSection,
     leaseCard:enLeaseCard,
     editLeaseModal:enEditLeaseModal,
     createLeaseModal:enCreateLeaseModal,

     encumbrancesSection:enEncumbrancesSection,
     encumbranceCard:enEncumbranceCard,
     encumbranceModal:enEncumbranceModal,

     transferHistoryCard :enTransferHistoryCard,
     transferHistorySection :enTrasferHistorySection,
     billingSection: enBillingSection,

     wizard:enWizard,
     validationStep:enValidationStep,
     ownerStep: enOwnerStep,
     leaseDocsStep:enLeaseDocsStep,
     leaseStep:enLeaseStep,
     ownerDocsStep:enOwnerDocsStep,
     parcelStep:enParcelStep,
     parcelDocsStep:enParcleDocsStep,

     


    // other namespaces...
  },

//   amharic
  am: {
    navigation: amNavigation,
     requests: amRequests,
     common:amCommon,
     users:amUsers,
     rates:amRates,
     auth: amAuth,
     subcity: amSubcity,
     configs: amConfigs,
     ownership: amOwnership,
     sessions: amSessions,
     subcityHome: amSubcityHome,
      parcelSearch:amParcelSearch,
    parcelTable:amParcelTable,
    parcelDetail:amParcelDetail,
       subdivideModal:amSubdivideModal,
    editParcelModal: amEditParcelInfo,
    parcelInfo:amParcelInfo,
     ownersSection:amOwnersSection,
     editOwnerModal:amEditOwnerModal,
     transferModal:amTransferModal,
     ownerCard:amOwnerCard,
      leaseSection:amLeaseSection,
     leaseCard:amLeaseCard,
     editLeaseModal:amEditLeaseModal,
     createLeaseModal:amCreateLeaaseModal,
        encumbrancesSection:amEncumbrancesSection,
     encumbranceCard:amEncumbranceCard,
     encumbranceModal:amEncumbranceModal,
          transferHistoryCard :amTransferHistoryCard,
     transferHistorySection :amTrasferHistorySection,
     billingSection: amBillingSection,
       wizard:amWizard,
     validationStep:amValidationStep,
        ownerStep: amOwnerStep,
     leaseDocsStep:amLeaseDocsStep,
     leaseStep:amLeaseStep,
     ownerDocsStep:amOwnerDocsStep,
     parcelStep:amParcelStep,
     parcelDocsStep:amParcleDocsStep,



     

    // other namespaces...
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['navigation','requests','rates','subcity','subcityHome'], // Add your namespaces
    defaultNS: 'navigation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;