// src/i18n/locales/en/requestDetail.ts
export const requestDetail = {
  // Loading states
  loading: 'Loading request details...',
  notFound: 'Request not found',
  backButton: 'Back to Pending Requests',
  
  // Request header
  header: {
    title: '{{entity}} - {{action}}',
    created: '📅 Created:',
    by: '👤 By:',
    subcity: '📍 Sub-city:',
    unknown: 'Unknown',
    na: 'N/A'
  },
  
  // Request ID accordion
  requestId: {
    show: 'Show Request ID',
    hide: 'Hide Request ID',
    value: '{{id}}'
  },
  
  // Action section
  action: {
    title: 'Take Action',
    approve: 'Approve Request',
    reject: 'Reject Request',
    approveIcon: '✓',
    rejectIcon: '✗'
  },
  
  // View only mode
  viewOnly: {
    title: 'View Only Mode',
    description: 'You are viewing this request in read-only mode. Only approvers can take action on this request.',
    icon: '👁️'
  },
  
  // Status messages
  status: {
    rejected: {
      title: 'Rejection Reason',
      rejectedOn: 'Rejected on:'
    },
    approved: {
      title: 'Approved',
      approvedOn: '{{date}}'
    },
    returned: {
      title: 'Returned for Revision',
      description: 'This request has been returned for modifications.'
    }
  },
  
  // Entity detail fallback
  entityDetail: {
    title: 'Request Data',
    notSpecified: 'Entity type not specified'
  },
  
  // Action Dialog
  actionDialog: {
    approve: {
      title: 'Approve Request',
      confirm: 'Confirm Approval',
      processing: 'Approving...'
    },
    reject: {
      title: 'Reject Request',
      reason: {
        label: 'Reason for Rejection',
        required: 'Please provide a rejection reason',
        placeholder: 'Please provide a detailed reason for rejection...'
      },
      confirm: 'Confirm Rejection',
      processing: 'Rejecting...'
    },
    comments: {
      label: 'Comments',
      optional: '(Optional)',
      approvePlaceholder: 'Add any comments for this approval...',
      rejectPlaceholder: 'Add any additional comments...'
    },
    cancel: 'Cancel'
  },
  
  // Errors
  errors: {
    requestIdRequired: 'Request ID is required',
    fetchFailed: 'Failed to fetch request details',
    unexpectedError: 'An unexpected error occurred',
    approveFailed: 'Failed to approve request',
    rejectFailed: 'Failed to reject request',
    rejectReasonRequired: 'Please provide a rejection reason'
  },
  
  // Success messages
  success: {
    approved: 'Request approved successfully',
    rejected: 'Request rejected successfully'
  }
};