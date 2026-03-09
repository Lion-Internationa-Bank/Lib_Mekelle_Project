export const validation = {
  required: '{{field}} ይድልየካ እዩ',
  minLength: '{{field}} ብዙሕ ብዙሕ {{count}} ፊደላት ክህልዎ ኣለዎ',
  maxLength: '{{field}} ብዙሕ ብዙሕ {{count}} ፊደላት ጥራይ ክህልዎ ኣለዎ',
  email: 'ቅኑዕ ኢመይል ኣድራሻ ኣተኣኻኽብ',
  password: {
    requirements: "መልእኽቲ ይለፍ ብዙሕ ብዙሕ 8 ፊደላት፣ ሓንቲ ዓባይ ፊደል፣ ሓንቲ ንእሽቶ ፊደል፣ ከምኡ'ውን ሓንቲ ቁጽሪ ክህልዎ ኣለዎ",
    mismatch: 'መልእኽቲ ይለፍ ኣይተማሳሰለን',
  },
  number: {
    min: '{{field}} ብዙሕ ብዙሕ {{min}} ክኸውን ኣለዎ',
    max: '{{field}} ብዙሕ ብዙሕ {{max}} ጥራይ ክኸውን ኣለዎ',
    between: '{{field}} ኣብ መንጎ {{min}}ን {{max}}ን ክኸውን ኣለዎ',
    integer: '{{field}} ሙሉእ ቁጽሪ ክኸውን ኣለዎ',
  },
  date: {
    future: '{{field}} ናይ መጻኢ ዕለት ክኸውን ኣለዎ',
    past: '{{field}} ናይ ሕሉፍ ዕለት ክኸውን ኣለዎ',
    after: '{{field}} ድሕሪ {{date}} ክኸውን ኣለዎ',
    before: '{{field}} ቅድሚ {{date}} ክኸውን ኣለዎ',
  },
  unique: '{{field}} ድሮ ኣሎ',
  notFound: '{{entity}} ኣይተረኸበን',
  unauthorized: 'እዚ ስራሕ ክትገብሮ ፍቓድ የብልካን',
};