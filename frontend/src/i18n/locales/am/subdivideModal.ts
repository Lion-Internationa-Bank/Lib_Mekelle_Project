export const subdivideModal = {
  title: 'የመሬት ቦታ ከፍል',
  parentUpin: 'የወላጅ ዩፒን',
  parentParcel: 'የወላጅ መሬት ቦታ',
  totalArea: 'ጠቅላላ ስፋት',
  areaBalance: 'የስፋት ሚዛን',
  difference: '{{diff}} ሜ² ልዩነት',
  enterAreas: 'የልጅ ቦታዎችን ስፋት ያስገቡ',
  ownersToCopy: 'ሊገለበጡ የሚገቡ ባለቤቶች',
  
  // Child parcel
  childParcel: 'ልጅ መሬት ቦታ {{letter}}',
  addChild: 'ሌላ ልጅ መሬት ቦታ ጨምር',
  hideBoundaries: 'የድንበር ዝርዝሮችን ደብቅ',
  addBoundaries: 'የድንበር ዝርዝሮችን ጨምር/አርትዕ',
  
  // Fields
  fields: {
    upin: 'ዩፒን',
    fileNumber: 'የፋይል ቁጥር',
    totalArea: 'ጠቅላላ ስፋት (ሜ²)',
    boundaryCoords: 'የድንበር መጋጠሚያዎች (ጄሶን)',
    north: 'ሰሜን ድንበር',
    east: 'ምስራቅ ድንበር',
    south: 'ደቡብ ድንበር',
    west: 'ምዕራብ ድንበር',
  },
  
  // Placeholders
  placeholders: {
    boundaryCoords: '{"type":"Polygon","coordinates":[[[...]]]}',
  },
  
  // Messages
  messages: {
    submitted: 'የመሬት ቦታ መከፋፈል ጥያቄ ለማፅደቅ ቀርቧል',
    success: 'የመሬት ቦታ በተሳካ ሁኔታ ተከፋፍሏል',
  },
  
  // Errors
  errors: {
    minChildren: 'ለመከፋፈል ቢያንስ 2 ልጅ መሬት ቦታዎች ያስፈልጋሉ',
    areaExceeds: 'ጠቅላላ የልጅ ቦታ ስፋት ({{total}} ሜ²) ከወላጅ ቦታ ስፋት ({{parent}} ሜ²) ይበልጣል',
    areaMismatch: 'ጠቅላላ የልጅ ቦታ ስፋት ({{total}} ሜ²) ከወላጅ ቦታ ስፋት ({{parent}} ሜ²) ጋር እኩል መሆን አለበት',
    areaPositive: 'ሁሉም ልጅ መሬት ቦታዎች አዎንታዊ ስፋት ሊኖራቸው ይገባል',
    duplicateUpin: 'ተደጋጋሚ ዩፒንዎች ተገኝተዋል። እያንዳንዱ ልጅ የተለየ ዩፒን ሊኖረው ይገባል።',
    duplicateFileNumber: 'ተደጋጋሚ የፋይል ቁጥሮች ተገኝተዋል። እያንዳንዱ ልጅ የተለየ የፋይል ቁጥር ሊኖረው ይገባል።',
    failed: 'የመሬት ቦታ መከፋፈል አልተሳካም',
  },
  
  submitForApproval: 'ለማፅደቅ አስገባ',
};