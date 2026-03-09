export const encumbranceModal = {
  title: {
    edit: 'እግድ አርትዕ',
    create: 'አዲስ እግድ ጨምር',
  },
  
  // Fields
  fields: {
    type: 'አይነት',
    issuingEntity: 'አውጪ አካል',
    referenceNumber: 'የማጣቀሻ ቁጥር',
    status: 'ሁኔታ',
    registrationDate: 'የምዝገባ ቀን',
  },
  
  // Status
  status: {
    active: 'ንቁ',
    released: 'ተለቋል',
  },
  
  // Placeholders
  placeholders: {
    selectType: 'አይነት ይምረጡ',
  },
  
  // Buttons
  buttons: {
    update: 'ለውጦችን አስቀምጥ',
    create: 'ፍጠር',
  },
  
  // Messages
  messages: {
    updateSuccess: 'እግድ በተሳካ ሁኔታ ተዘምኗል',
    createSuccess: 'እግድ በተሳካ ሁኔታ ተፈጥሯል',
    submitted: 'የእግድ መፍጠር ጥያቄ ለማፅደቅ ቀርቧል',
  },
  
  // Errors
  errors: {
    loadTypes: 'የእግድ አይነቶችን ማምጣት አልተሳካም',
    updateFailed: 'እግድ ማዘመን አልተሳካም',
    createFailed: 'እግድ መፍጠር አልተሳካም',
    validation: 'ማረጋገጫ አልተሳካም',
    operationFailed: 'ክዋኔው አልተሳካም',
    unexpected: 'ያልተጠበቀ ስህተት ተከስቷል',
    noTypes: 'ምንም አይነቶች የሉም',
  },
};