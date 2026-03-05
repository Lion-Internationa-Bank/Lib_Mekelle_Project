export const users = {
  // Page Titles by role
  pageTitle: {
    CITY_ADMIN: 'Manage Sub-city Admins',
    CITY_APPROVER: 'Approve User Requests',
    SUBCITY_ADMIN: 'Manage Sub-city Users',
    SUBCITY_APPROVER: 'Approve Sub-city User Requests',
    REVENUE_ADMIN: 'Manage Revenue Users',
    REVENUE_APPROVER: 'Approve Revenue User Requests',
    default: 'User Management',
  },
  
  // Page description
  description: 'Manage user accounts and permissions in your scope',
  
  // Actions
  actions: {
    refresh: 'Refresh',
    addUser: 'Add User',
    edit: 'Edit',
    suspend: 'Suspend',
    activate: 'Activate',
    delete: 'Delete',
    view: 'View',
  },
  
  // Stats
  stats: {
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    suspendedUsers: 'Suspended Users',
  },
  
  // Filters
  filters: {
    search: 'Search',
    searchPlaceholder: 'Search by name or username...',
    role: 'Role',
    status: 'Status',
    allRoles: 'All Roles',
    allStatuses: 'All Statuses',
    active: 'Active',
    suspended: 'Suspended',
  },
  
  // Status
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
  },
  
  // Table headers
  table: {
    user: 'User',
    role: 'Role',
    subcity: 'Sub-city',
    status: 'Status',
    actions: 'Actions',
    createdAt: 'Created At',
    lastLogin: 'Last Login',
  },
  
  // User fields
  fields: {
    username: 'Username',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    role: 'Role',
    subcity: 'Sub-city',
    status: 'Status',
    createdAt: 'Created At',
    lastLogin: 'Last Login',
  },
  
  // Placeholders
  placeholders: {
    username: 'Enter username',
    fullName: 'Enter full name',
    email: 'Enter email address',
    password: 'Enter password',
    confirmPassword: 'Confirm password',
    search: 'Search by name or username...',
    selectRole: 'Select a role',
    selectSubcity: 'Select a sub-city',
  },
  
  // Messages
  messages: {
    noUsers: 'No users found',
    noUsersDescription: 'Try adjusting your filters or add a new user.',
    loading: 'Loading users...',
    userCreated: 'User created successfully',
    userSuspended: 'User suspended successfully',
    userActivated: 'User activated successfully',
    userDeleted: 'User deleted successfully',
    approvalSubmitted: 'Approval request submitted',
    deleteConfirmation: 'Are you sure you want to delete this user?',
    suspendConfirmation: 'Are you sure you want to suspend this user?',
    activateConfirmation: 'Are you sure you want to activate this user?',
    cannotDeleteSelf: 'You cannot delete your own account',
    cannotSuspendSelf: 'You cannot suspend your own account',
  },
  
  // Errors
  errors: {
    fetchFailed: 'Failed to load users',
    createFailed: 'Failed to create user',
    updateFailed: 'Failed to update user',
    suspendFailed: 'Failed to suspend user',
    activateFailed: 'Failed to activate user',
    deleteFailed: 'Failed to delete user',
    usernameExists: 'Username already exists',
    passwordMismatch: 'Passwords do not match',
    invalidRole: 'Invalid role selected',
    required: '{{field}} is required',
    minLength: '{{field}} must be at least {{count}} characters',
  },
  

  // Role display names
  roles: {
    CITY_ADMIN: 'City Admin',
    CITY_APPROVER: 'City Approver',
    SUBCITY_ADMIN: 'Sub-city Admin',
    SUBCITY_APPROVER: 'Sub-city Approver',
    SUBCITY_NORMAL: 'Sub-city Normal',
    SUBCITY_AUDITOR: 'Sub-city Auditor',
    REVENUE_ADMIN: 'Revenue Admin',
    REVENUE_APPROVER: 'Revenue Approver',
    REVENUE_USER: 'Revenue User',
  },
  

  subcity: {
    none: 'N/A',
    yourSubcity: '(Your sub-city)',
    adminRestriction: 'As a Sub-city Admin, you can only create users in your own sub-city',
    select: 'Select a sub-city',
    selectDescription: 'Select the sub-city this user will manage',
    enterDescription: 'Enter the sub-city ID for this user',
  },
  
  addUser: {
    title: 'Add New User',
    subtitle: 'Create a new user account',
    requiresApproval: 'This user creation requires approval',
    approvalMessage: 'Your request will be sent for review by an approver. The user will be created after approval.',
    passwordHint: 'Minimum 6 characters',
    submitForApproval: 'Submit for Approval',
    submitting: 'Creating...',
    submit: 'Create User',
    cancel: 'Cancel',
  },
  
  suspendModal: {
    title_suspend: 'Suspend User',
    title_activate: 'Activate User',
    confirmMessage_suspend: 'Are you sure you want to suspend {{name}}?',
    confirmMessage_activate: 'Are you sure you want to activate {{name}}?',
    reasonRequired: 'Reason for this action (required)',
    reasonOptional: 'Reason for this action (optional)',
    reasonPlaceholder: 'Please provide a reason for this action...',
    reasonOptionalPlaceholder: 'Optional reason for this action...',
    requiresApproval: 'This action requires approval',
    approvalMessage: 'Your request will be sent for review by an approver. You\'ll be notified once it\'s processed.',
    requestAction: 'Request {{action}}',
  },
  
  deleteModal: {
    title: 'Delete User',
    confirmMessage: 'Are you sure you want to delete {{name}}?',
    reasonLabel: 'Reason for deletion (optional)',
    reasonPlaceholder: 'Please provide a reason for this deletion...',
    requiresApproval: 'This action requires approval',
    approvalMessage: 'Your request will be sent for review by an approver. You\'ll be notified once it\'s processed.',
    confirmButton: 'Request Deletion',
  },
  
  approvalModal: {
    title: 'Approval Request Submitted',
    message: 'Your {{entity}} {{action}} request has been submitted for approval.',
    requestId: 'Request ID',
    status: 'Status',
    pending: 'Pending Approval',
    action: 'Action',
    notification: 'You will be notified when an approver reviews your request.',
    close: 'Got it',
  },
  
  accessDenied: {
    title: 'Access Denied',
    message: "You don't have permission to access this page.",
  },

};

