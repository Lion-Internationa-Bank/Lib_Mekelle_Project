export const encumbranceModal = {
  title: {
    edit: 'እንቅፋት አርትዕ',
    create: 'አዲስ እንቅፋት ጨምር',
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
    updateSuccess: 'እንቅፋት በተሳካ ሁኔታ ተዘምኗል',
    createSuccess: 'እንቅፋት በተሳካ ሁኔታ ተፈጥሯል',
    submitted: 'የእንቅፋት መፍጠር ጥያቄ ለማፅደቅ ቀርቧል',
  },
  
  // Errors
  errors: {
    loadTypes: 'የእንቅፋት አይነቶችን ማምጣት አልተሳካም',
    updateFailed: 'እንቅፋት ማዘመን አልተሳካም',
    createFailed: 'እንቅፋት መፍጠር አልተሳካም',
    validation: 'ማረጋገጫ አልተሳካም',
    operationFailed: 'ክዋኔው አልተሳካም',
    unexpected: 'ያልተጠበቀ ስህተት ተከስቷል',
    noTypes: 'ምንም አይነቶች የሉም',
  },
};