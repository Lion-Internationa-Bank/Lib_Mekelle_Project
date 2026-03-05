import { useTranslation } from 'react-i18next';

type Namespace = 
  | 'common'
  | 'landing'
  | 'auth'
  | 'requests'
  | 'users'
  | 'rates'
  | 'subcity'
  | 'configs'
  | 'validation'
  | 'navigation'
  | 'configs'
  | 'editOwnerModal'
  | 'ownerCard'
  | 'ownership'
   | 'ownersSection'
   | 'parcleDetail'
   | 'parcleInfo'
   | 'parcelSearch'
   | 'parcleTable'
   | 'rates'
   | 'requests'
   | 'sessions'
   | 'subcity'
   | 'subcityHome'
   | 'subdivideModal'
   | 'transferModal'
   | 'users'
   | 'leaseCard'
   | 'leaseSection'
   | 'editLeaseModal'
   | 'createLeaseModal'
   | 'parcelDetail'
   ;

export const useTranslate = (namespace?: Namespace) => {
  const { t, i18n } = useTranslation(namespace);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng); // This should work
  };
  
  return { 
    t, 
    changeLanguage, 
    language: i18n.language,
    i18n // Optional: expose full i18n instance if needed
  };
};