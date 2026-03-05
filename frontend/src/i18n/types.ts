export interface Translations {
  // Common
  appName: string;
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  view: string;
  actions: string;
  status: {
    active: string;
    inactive: string;
    pending: string;
    approved: string;
    rejected: string;
    returned: string;
    cancelled: string;
    failed: string;
  };
  
  // Landing Page
  landing: {
    title: string;
    subtitle: string;
    description: string;
    features: {
      secure: { title: string; desc: string };
      valuation: { title: string; desc: string };
      services: { title: string; desc: string };
    };
    stats: {
      properties: string;
      satisfaction: string;
      support: string;
    };
  };
  
  // Auth
  auth: {
    welcome: string;
    signin: string;
    username: string;
    usernamePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    signinBtn: string;
    signingIn: string;
    error: string;
    views: {
      maker: string;
      approver: string;
    };
    roles: {
      SUPER_ADMIN: string;
      ADMIN: string;
      REVENUE_USER: string;
      REVENUE_APPROVER: string;
      SUBCITY_ADMIN: string;
      SUBCITY_NORMAL: string;
      SUBCITY_AUDITOR: string;
      SUBCITY_APPROVER: string;
    };
  };
  
  // Pending Requests
  requests: {
    title: {
      approver: string;
      maker: string;
    };
    found: string;
    found_plural: string;
    clearFilters: string;
    filter: {
      status: string;
      entity: string;
      action: string;
      sortBy: string;
    };
    sort: {
      created: string;
      updated: string;
    };
    status: Record<string, string>;
    entity: Record<string, string>;
    action: Record<string, string>;
    empty: {
      title: string;
      approver: string;
      maker: string;
      filtered: string;
    };
    id: string;
    requester: string;
    role: string;
    subcity: string;
    created: string;
    perPage: string;
    showing: string;
    to: string;
    of: string;
    page: string;
    first: string;
    last: string;
    previous: string;
    next: string;
  };
  
  // Users
  users: {
    title: string;
    fields: {
      username: string;
      fullName: string;
      email: string;
      role: string;
      subcity: string;
      status: string;
      createdAt: string;
    };
    actions: {
      create: string;
      suspend: string;
      activate: string;
      delete: string;
    };
  };
  
  // Rate Configuration
  rates: {
    title: string;
    fields: {
      type: string;
      value: string;
      source: string;
      effectiveFrom: string;
      effectiveUntil: string;
      status: string;
    };
    types: {
      TAX: string;
      FEE: string;
      PENALTY: string;
    };
  };
  
  // Sub-city
  subcity: {
    title: string;
    fields: {
      name: string;
      description: string;
      code: string;
    };
    dependencies: {
      users: string;
      parcels: string;
      approvals: string;
      warning: string;
    };
  };
  
  // Configurations
  configs: {
    title: string;
    fields: {
      category: string;
      key: string;
      options: string;
      description: string;
      status: string;
    };
    current: string;
    proposed: string;
    summary: string;
    changes: {
      modified: string;
    };
  };
}


export interface NavigationTranslations {
  parcels: string;
  sessions: string;
  pendingRequests: string;
  ownership: string;
  users: string;
  subcities: string;
  rateConfigs: string;
  configurations: string;
  bulkUpload: string;
  report: string;
  reports: {
    bills: string;
    encumbrances: string;
    parcels: string;
    ownersMultiple: string;
    leaseInstallments: string;
    payments: string;
    revenue: string;
    descriptions: {
      bills: string;
      encumbrances: string;
      parcels: string;
      ownersMultiple: string;
      leaseInstallments: string;
      payments: string;
      revenue: string;
    };
  };
  header: {
    appName: string;
    subText: string;
    searchPlaceholder: string;
    userStatus: string;
    logout: string;
    myAccount: string;
    settings: string;
    help: string;
  };
  calendar: {
    today: string;
    month: string;
    week: string;
    day: string;
  };
}