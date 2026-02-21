// src/pages/PendingRequestsPage.tsx - Updated with Tailwind CSS and fixed map error
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingRequests, getMakerPendingRequests } from '../../services/makerCheckerService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  type PendingRequestData,
  type ApiResponse,
  type EntityType,
  type ActionType,
  type RequestStatus,
  type UserRole,
  ENTITY_TYPES,
  ACTION_TYPES,
  REQUEST_STATUSES,
  APPROVER_ROLES,
  getStatusDisplayName,
  getEntityDisplayName,
  getActionDisplayName,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER
} from '../../types/makerChecker';
import { toast } from 'sonner';

// Pagination constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_VISIBLE_PAGES = 5;

const PendingRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PendingRequestData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | ''>('');
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionType | ''>('');
  const [sortBy, setSortBy] = useState<string>(DEFAULT_SORT_FIELD);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_SORT_ORDER);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine if user is approver or maker
  const isApprover = user?.role ? APPROVER_ROLES.includes(user.role as UserRole) : false;

  // Fetch requests with pagination and filters
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response: ApiResponse<PendingRequestData[]>;
      
      if (isApprover) {
        response = await getPendingRequests(currentPage, limit, {
          status: statusFilter || undefined,
          entity_type: entityTypeFilter || undefined,
          action_type: actionTypeFilter || undefined,
          sortBy,
          sortOrder
        });
      } else {
        response = await getMakerPendingRequests(
          user?.user_id || '',
          currentPage,
          limit,
          {
            status: statusFilter || undefined,
            entity_type: entityTypeFilter || undefined,
            action_type: actionTypeFilter || undefined,
            sortBy,
            sortOrder
          }
        );
      }

      if (response.success && response.data) {
        // Ensure response.data is an array
      console.log("response from pending request",response)
        console.log("response data  from pending request",response.data)
        if (Array.isArray(response.data.data)) {
          setRequests(response.data.data);
        } else {
          console.error('Response data is not an array:', response.data);
          setRequests([]);
          toast.error('Invalid response format');
        }
        
        // Update pagination info
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalCount(response.data.pagination.totalCount);
          setHasNextPage(response.data.pagination.hasNextPage);
          setHasPreviousPage(response.data.pagination.hasPreviousPage);
        }
      } else {
        setError(response.error || 'Failed to fetch pending requests');
        toast.error(response.error || 'Failed to fetch pending requests');
        setRequests([]);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch error:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, statusFilter, entityTypeFilter, actionTypeFilter, sortBy, sortOrder, isApprover, user?.user_id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(DEFAULT_PAGE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter handlers
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as RequestStatus);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleEntityTypeFilterChange = (entityType: string) => {
    setEntityTypeFilter(entityType as EntityType);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleActionTypeFilterChange = (actionType: string) => {
    setActionTypeFilter(actionType as ActionType);
    setCurrentPage(DEFAULT_PAGE);
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(DEFAULT_PAGE);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setEntityTypeFilter('');
    setActionTypeFilter('');
    setCurrentPage(DEFAULT_PAGE);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
      let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);
      
      if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
        startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // UI Helper functions
  const getEntityIcon = (entityType: EntityType): string => {
    const icons: Record<EntityType, string> = {
      'WIZARD_SESSION': '🪄',
      'LAND_PARCELS': '🏞️',
      'OWNERS': '👤',
      'LEASE_AGREEMENTS': '📄',
      'ENCUMBRANCES': '🔒',
      'APPROVAL_REQUEST': '✅'
    };
    return icons[entityType] || '📋';
  };

  const getStatusColor = (status: RequestStatus): string => {
    const colors: Record<RequestStatus, string> = {
      'PENDING': 'bg-[#f0cd6e]/20 text-[#2a2718]',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'RETURNED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'FAILED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (actionType: ActionType): string => {
    const colors: Record<ActionType, string> = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'TRANSFER': 'bg-green-100 text-green-800',
      'SUBDIVIDE': 'bg-gray-100 text-gray-800',
      'MERGE': 'bg-gray-100 text-gray-800',
      'TERMINATE': 'bg-red-100 text-red-800',
      'EXTEND': 'bg-green-100 text-green-800',
      'ADD_OWNER': 'bg-green-100 text-green-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl text-[#2a2718]">Loading requests...</div>
          <div className="text-sm text-[#2a2718]/70 mt-2">
            Please wait while we fetch your requests
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2a2718] m-0">
            {isApprover ? 'Pending Approval Requests' : 'My Requests'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[#2a2718]/70 m-0">
              {totalCount.toLocaleString()} request{totalCount !== 1 ? 's' : ''} found
            </p>
            {(statusFilter || entityTypeFilter || actionTypeFilter) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-[#f0cd6e]/20 hover:bg-[#f0cd6e]/40 rounded text-sm text-[#2a2718] flex items-center gap-1 transition-colors"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Role indicator */}
        <div className={`
          px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm
          ${isApprover ? 'bg-[#2a2718] text-white' : 'bg-[#f0cd6e] text-[#2a2718]'}
        `}>
          <span className="text-lg">{isApprover ? '👤' : '✍️'}</span>
          <span>{isApprover ? 'Approver View' : 'Maker View'}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl mb-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
            >
              <option value="">All Statuses</option>
              {REQUEST_STATUSES.map(status => (
                <option key={status} value={status}>
                  {getStatusDisplayName(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => handleEntityTypeFilterChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
            >
              <option value="">All Entities</option>
              {ENTITY_TYPES.map(type => (
                <option key={type} value={type}>
                  {getEntityIcon(type)} {getEntityDisplayName(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              Action Type
            </label>
            <select
              value={actionTypeFilter}
              onChange={(e) => handleActionTypeFilterChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
            >
              <option value="">All Actions</option>
              {ACTION_TYPES.map(type => (
                <option key={type} value={type}>
                  {getActionDisplayName(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                className="flex-1 px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
              >
                <option value="created_at">Created Date</option>
                <option value="updated_at">Updated Date</option>
              
              </select>
              <button
                onClick={() => handleSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 rounded-lg border border-[#f0cd6e] bg-white hover:bg-[#f0cd6e]/20 transition-colors text-[#2a2718]"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter || entityTypeFilter || actionTypeFilter) && (
          <div className="flex items-center gap-2 pt-4 border-t border-[#f0cd6e]">
            <span className="text-sm text-[#2a2718]/70">Active filters:</span>
            {statusFilter && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(statusFilter as RequestStatus)}`}>
                Status: {getStatusDisplayName(statusFilter as RequestStatus)}
                <button 
                  className="ml-1 hover:opacity-70"
                  onClick={() => handleStatusFilterChange('')}
                >
                  ✕
                </button>
              </span>
            )}
            {entityTypeFilter && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f0cd6e]/20 text-[#2a2718] flex items-center gap-1">
                {getEntityIcon(entityTypeFilter as EntityType)} {getEntityDisplayName(entityTypeFilter as EntityType)}
                <button 
                  className="ml-1 hover:opacity-70"
                  onClick={() => handleEntityTypeFilterChange('')}
                >
                  ✕
                </button>
              </span>
            )}
            {actionTypeFilter && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${getActionColor(actionTypeFilter as ActionType)}`}>
                Action: {getActionDisplayName(actionTypeFilter as ActionType)}
                <button 
                  className="ml-1 hover:opacity-70"
                  onClick={() => handleActionTypeFilterChange('')}
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 mb-8 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => fetchRequests()}
            className="ml-auto px-3 py-1 bg-transparent border border-red-800 rounded text-red-800 hover:bg-red-50 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Requests Grid */}
      {(!requests || requests.length === 0) && !loading ? (
        <div className="text-center py-16 bg-[#f0cd6e]/10 rounded-xl">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[#2a2718] mb-2">No requests found</h3>
          <p className="text-[#2a2718]/70 max-w-md mx-auto">
            {statusFilter || entityTypeFilter || actionTypeFilter
              ? 'No requests match your current filters. Try clearing some filters.'
              : isApprover 
                ? 'There are no pending approval requests at the moment.'
                : 'You have not submitted any requests yet.'}
          </p>
          {(statusFilter || entityTypeFilter || actionTypeFilter) && (
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-3 bg-[#f0cd6e] text-[#2a2718] rounded-lg hover:bg-[#2a2718] hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-[#2a2718]/70">
              Showing <strong className="text-[#2a2718]">{totalCount > 0 ? ((currentPage - 1) * limit) + 1 : 0}</strong> to{' '}
              <strong className="text-[#2a2718]">{Math.min(currentPage * limit, totalCount)}</strong> of{' '}
              <strong className="text-[#2a2718]">{totalCount.toLocaleString()}</strong> requests
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#2a2718]/70">Show:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
              >
                {DEFAULT_PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
            </div>
          </div>

          {/* Request Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {requests && requests.map((req) => {
              if (!req) return null;
              
              return (
                <div
                  key={req.request_id}
                  onClick={() => navigate(`/pending-requests/${req.request_id}`)}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-[#f0cd6e] cursor-pointer flex flex-col gap-4 hover:-translate-y-1"
                >
                  {/* Header with Icon and Status */}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl bg-[#f0cd6e]/20 w-14 h-14 flex items-center justify-center rounded-xl border border-[#f0cd6e]">
                      {getEntityIcon(req.entity_type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-[#2a2718] mb-2">
                        {getEntityDisplayName(req.entity_type)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                          {getStatusDisplayName(req.status)}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getActionColor(req.action_type)}`}>
                          {getActionDisplayName(req.action_type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Maker/Requester Info */}
                  {req.maker && (
                    <div className="flex items-center gap-3 p-3 bg-[#f0cd6e]/10 rounded-lg">
                      <div className="w-9 h-9 bg-[#2a2718] text-white rounded-full flex items-center justify-center text-base font-semibold uppercase">
                        {req.maker.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[#2a2718]">
                          {req.maker.full_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-[#2a2718]/70">
                          {req.maker.role?.replace('_', ' ')} • {req.maker.username}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-city Info */}
                  {req.sub_city && (
                    <div className="flex items-center gap-2 text-sm text-[#2a2718]/70 p-2 bg-[#f0cd6e]/10 rounded-lg">
                      <span>📍</span>
                      <span>{req.sub_city.name}</span>
                    </div>
                  )}

                  {/* Footer with ID and Date */}
                  <div className="flex justify-between items-center text-xs text-[#2a2718]/70 border-t border-[#f0cd6e] pt-3 mt-1">
                    <span className="font-mono">
                      ID: {req.request_id?.slice(0, 8)}...
                    </span>
                    <span>
                      {new Date(req.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-8 p-6 bg-white rounded-xl shadow-md">
              {/* Pagination Info */}
              <div className="text-sm text-[#2a2718]/70">
                Page {currentPage} of {totalPages}
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {/* First Page */}
                <button
                  onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors
                    ${currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                    }`}
                >
                  ⏮️ First
                </button>

                {/* Previous Page */}
                <button
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors
                    ${!hasPreviousPage 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                    }`}
                >
                  ◀️ Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                        ${currentPage === pageNum 
                          ? 'bg-[#f0cd6e] text-[#2a2718] border-[#f0cd6e]' 
                          : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Page */}
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors
                    ${!hasNextPage 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                    }`}
                >
                  Next ▶️
                </button>

                {/* Last Page */}
                <button
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors
                    ${currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                    }`}
                >
                  Last ⏭️
                </button>
              </div>

              {/* Jump to Page */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[#2a2718]/70">Jump to page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 px-3 py-2 rounded-lg border border-[#f0cd6e] text-sm text-center focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
                />
                <span className="text-sm text-[#2a2718]/70">of {totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingRequestsPage;