export const validation = {
  required: '{{field}} is required',
  minLength: '{{field}} must be at least {{count}} characters',
  maxLength: '{{field}} must be at most {{count}} characters',
  email: 'Please enter a valid email address',
  password: {
    requirements: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
    mismatch: 'Passwords do not match',
  },
  number: {
    min: '{{field}} must be at least {{min}}',
    max: '{{field}} must be at most {{max}}',
    between: '{{field}} must be between {{min}} and {{max}}',
    integer: '{{field}} must be a whole number',
  },
  date: {
    future: '{{field}} must be a future date',
    past: '{{field}} must be a past date',
    after: '{{field}} must be after {{date}}',
    before: '{{field}} must be before {{date}}',
  },
  unique: '{{field}} already exists',
  notFound: '{{entity}} not found',
  unauthorized: 'You are not authorized to perform this action',
};