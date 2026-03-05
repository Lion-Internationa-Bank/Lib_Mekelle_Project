export const requests = {
  // Page Titles
  title: {
    approver: 'Pending Approval Requests',
    maker: 'My Requests',
  },
  
  // Count
  count: '{{count}} request found',
  count_plural: '{{count}} requests found',
  
  // View types
  view: {
    approver: 'Approver View',
    maker: 'Maker View',
  },
  
  // Loading
  loading: 'Loading requests...',
  loadingMessage: 'Please wait while we fetch your requests',
  
  // Filters
  filters: {
    status: 'Status',
    entityType: 'Entity Type',
    actionType: 'Action Type',
    sortBy: 'Sort By',
    allStatuses: 'All Statuses',
    allEntities: 'All Entities',
    allActions: 'All Actions',
    activeFilters: 'Active filters:',
  },
  
  // Clear
  clearFilters: 'Clear Filters',
  
  // Sort options
  sort: {
    created: 'Created Date',
    updated: 'Updated Date',
    asc: 'Ascending',
    desc: 'Descending',
  },
  
  // Status values
  status: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    RETURNED: 'Returned',
    CANCELLED: 'Cancelled',
    FAILED: 'Failed',
  },
  
  // Entity types
  entity: {
    USERS: 'User',
    RATE_CONFIGURATION: 'Rate Configuration',
    SUBCITY: 'Sub-city',
    CONFIGURATIONS: 'Configuration',
    LAND_PARCELS: 'Land Parcel',
    OWNERS: 'Owner',
    LEASE_AGREEMENTS: 'Lease Agreement',
    ENCUMBRANCES: 'Encumbrance',
    APPROVAL_REQUEST: 'Approval Request',
    WIZARD_SESSION: 'Wizard Session',
  },
  
  // Action types
  action: {
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
    SUSPEND: 'Suspend',
    ACTIVATE: 'Activate',
    TRANSFER: 'Transfer',
    SUBDIVIDE: 'Subdivide',
    MERGE: 'Merge',
    TERMINATE: 'Terminate',
    EXTEND: 'Extend',
    ADD_OWNER: 'Add Owner',
  },
  
  // Card fields
  card: {
    id: 'ID',
    requester: 'Requester',
    role: 'Role',
    subcity: 'Sub-city',
    noSubcity: 'No sub-city',
    created: 'Created',
    unknownUser: 'Unknown User',
  },
  
  // Empty states
  empty: {
    title: 'No requests found',
    approver: 'There are no pending approval requests at the moment.',
    maker: 'You have not submitted any requests yet.',
    filtered: 'No requests match your current filters. Try clearing some filters.',
  },
  
  // Errors
  errors: {
    fetchFailed: 'Failed to fetch pending requests',
    unexpected: 'An unexpected error occurred',
    invalidResponse: 'Invalid response format',
  },
};