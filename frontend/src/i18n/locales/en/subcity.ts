export const subcity = {
  pageTitle: 'Sub-cities Management',
  pageDescription: 'Manage all sub-cities within the city administration',
  
  // Stats
  stats: {
    total: '{{count}} sub-city',
    total_plural: '{{count}} sub-cities',
  },
  
  // Actions
  actions: {
    add: 'Add Sub-city',
    edit: 'Edit sub-city',
    delete: 'Delete sub-city',
  },
  
  // Form
  form: {
    createTitle: 'Add New Sub-city',
    editTitle: 'Edit Sub-city',
    name: 'Sub-city Name',
    namePlaceholder: 'e.g., Bole, Kirkos, Lideta',
    nameHint: 'Enter the official name of the sub-city',
    description: 'Description',
    descriptionPlaceholder: 'Brief description about this sub-city...',
    descriptionHint: 'Add any relevant details about this sub-city',
    create: 'Create Sub-city',
    update: 'Update Sub-city',
  },
  
  // Search
  search: {
    placeholder: 'Search sub-cities by name or description...',
    showing: 'Showing {{filtered}} of {{total}}',
    resultsFor: 'Showing results for: "{{term}}"',
  },
  
  // Table
  table: {
    title: 'All Sub-cities',
    name: 'Name',
    description: 'Description',
    created: 'Created',
    actions: 'Actions',
    noDescription: 'No description',
    total: '{{count}} sub-city',
    total_plural: '{{count}} sub-cities',
    footer: 'Total sub-cities: {{count}}',
  },
  
  // Empty states
  empty: {
    noData: 'No sub-cities yet',
    noDataDescription: 'Get started by adding your first sub-city using the "Add Sub-city" button above.',
    search: 'No matching sub-cities found',
    searchDescription: 'Try adjusting your search terms or filters',
    addFirst: 'Add Your First Sub-city',
  },
  
  // Loading
  loading: 'Loading sub-cities...',
  
  // Messages
  messages: {
    createSuccess: 'Sub-city created successfully!',
    updateSuccess: 'Sub-city updated successfully!',
    deleteSuccess: 'Sub-city deleted successfully!',
  },
  
  // Errors
  errors: {
    fetchFailed: 'Failed to load sub-cities',
    operationFailed: 'Operation failed',
    deleteFailed: 'Failed to delete sub-city',
    networkError: 'Network error occurred',
  },
  
  // Validation
  validation: {
    nameRequired: 'Sub-city name is required',
  },
  
  // Confirmations
  confirm: {
    delete: 'Are you sure you want to delete this sub-city? This action cannot be undone.',
  },
  
  // Access denied
  accessDenied: {
    title: 'Access Denied',
    message: 'This page is only accessible to City Administrators.',
    currentRole: 'Your current role:',
    notAuthenticated: 'Not authenticated',
  },
};