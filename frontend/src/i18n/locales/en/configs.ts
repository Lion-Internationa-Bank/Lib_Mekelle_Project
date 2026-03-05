export const configs = {
  pageTitle: 'System Configurations',
  pageDescription: {
    cityAdmin: 'Manage land and property-related configuration options',
    revenueAdmin: 'Manage payment configuration options',
  },
  
  // Sidebar
  sidebar: {
    title: 'Allowed Categories',
    noCategories: 'No categories available for your role',
  },
  
  // Categories
  categories: {
    LAND_TENURE: {
      label: 'Land Tenure Types',
      description: 'Ownership and tenure types (e.g., Freehold, Leasehold)',
    },
    LAND_USE: {
      label: 'Land Use Categories',
      description: 'Permitted uses of land (e.g., Residential, Commercial)',
    },
    ENCUMBRANCE_TYPE: {
      label: 'Encumbrance Types',
      description: 'Types of restrictions/liens (e.g., Mortgage, Court Freeze)',
    },
    TRANSFER_TYPE: {
      label: 'Transfer Types',
      description: 'Methods of property transfer (e.g., Sale, Gift, Inheritance)',
    },
  },
  
  // Options
  options: {
    title: 'Configuration Options',
    addButton: 'Add Option',
    remove: 'Remove option',
    valuePlaceholder: 'Option value (required)',
    descriptionPlaceholder: 'Description (optional)',
    empty: {
      title: 'No options configured yet',
      description: 'Add your first configuration option above',
    },
  },
  
  // Save button
  saveButton: 'Save Configuration',
  
  // Loading
  loading: 'Loading configuration...',
  
  // No category selected
  noCategory: {
    title: 'No Category Selected',
    description: 'Choose a configuration category from the list on the left',
    categoriesAvailable: '{{count}} category available for your role',
    categoriesAvailable_plural: '{{count}} categories available for your role',
  },
  
  // Messages
  messages: {
    saveSuccess: 'Configuration saved successfully!',
  },
  
  // Errors
  errors: {
    fetchFailed: 'Failed to load configuration',
    saveFailed: 'Failed to save configuration',
    networkError: 'Network error while saving',
  },
  
  // Validation
  validation: {
    valueRequired: 'All option values are required',
    valueUnique: 'Option values must be unique',
  },
  
  // Access denied
  accessDenied: {
    title: 'Access Denied',
    message: 'Only City Administrators and Revenue Administrators can manage system configurations.',
  },
};