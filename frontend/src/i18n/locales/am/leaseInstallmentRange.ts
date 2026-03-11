export const leaseInstallmentRange = {
  title: "ዓመታዊ ክፍያ ኪራይ ክልል",
  description: "በተወሰነ ዓመታዊ ክፍያ ክልል ውስጥ ያሉ የመሬት ቦታዎችን ይመልከቱ",

  columns: {
    parcel: "ቦታ",
    location: "አካባቢ",
    annualInstallment: "ዓመታዊ ክፍያ",
    leaseStatus: "የኪራይ ሁኔታ",
    owners: "ባለቤቶች",
  },

  filters: {
    annualInstallmentRange: {
      label: "ዓመታዊ ክፍያ ክልል (ብር)",
      min: "ዝቅተኛ መጠን",
      max: "ከፍተኛ መጠን",
    },
  },

  validation: {
    minGreaterThanMax: "ዝቅተኛ እሴት ከፍተኛ እሴት መብለጥ አይችልም",
  },

  status: {
    active: "ንቁ",
    expired: "ጊዜው ያለፈበት",
    pending: "በመጠባበቅ ላይ",
  },

  expanded: {
    parcelDetails: "የቦታ ዝርዝሮች",
    leaseDetails: "የኪራይ ዝርዝሮች",
    area: "ስፋት",
    landUse: "የመሬት አጠቃቀም",
    tenure: "የባለቤትነት አይነት",
    leaseId: "የኪራይ መለያ",
    annualInstallment: "ዓመታዊ ክፍያ",
    status: "ሁኔታ",
    startDate: "የመጀመሪያ ቀን",
    expiryDate: "የማብቂያ ቀን",
    owners: "ባለቤቶች ({{count}})",
    phone: "ስልክ",
    acquired: "የተገኘበት",
  },

  empty: "በዚህ ክፍያ ክልል ውስጥ ምንም ቦታ አልተገኘም",

  errors: {
    fetchFailed: "የኪራይ ክፍያ ውሂብ መጫን አልተሳካም",
    subCitiesFailed: "ንዑስ ከተሞችን መጫን አልተሳካም",
  },

  common: {
    notSet: "አልተወሰነም",
    currency: {
      etb: "ብር",
    },
  },
};