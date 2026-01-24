// Seed data for configurations
const orderNumberConfig = {
  config_id: crypto.randomUUID(),
  key: 'ORDER_NUMBER_FORMAT',
  category: 'ORDER_NUMBER_FORMAT',
  value: {
    format: 'ORD-{YYYY}-{SEQ:6}',
    prefix: 'ORD',
    include_date: true,
    sequence_length: 6,
    reset_frequency: 'YEARLY', // or MONTHLY, DAILY, NEVER
    separator: '-'
  },
  description: 'Format for generating payment order numbers',
  is_active: true
};