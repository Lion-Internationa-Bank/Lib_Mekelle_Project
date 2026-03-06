import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingRequests, getMakerPendingRequests, type PendingRequest } from '../../services/makerCheckerService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslate } from '../../i18n/useTranslate';
import { 
  type EntityType,
  type ActionType,
  type RequestStatus,
  type UserRole,
  type PaginationMetadata,
  ENTITY_TYPES,
  ACTION_TYPES,
  REQUEST_STATUSES,
  APPROVER_ROLES,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER
} from '../../types/makerChecker';
import { toast } from 'sonner';
import DateDisplay from '../../components/common/DateDisplay';

// Pagination constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_VISIBLE_PAGES = 5;

const PendingRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | ''>('');
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionType | ''>('');
  const [sortBy, setSortBy] = useState<string>(DEFAULT_SORT_FIELD);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_SORT_ORDER);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslate('requests');
  const { t: tCommon } = useTranslate('common');
  const { t: tAuth } = useTranslate('auth');

  // Determine if user is approver or maker
  const isApprover = user?.role ? APPROVER_ROLES.includes(user.role as UserRole) : false;

  // Fetch requests with pagination and filters
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
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

      console.log("Response from pending requests:", response);

      if (response.success && response.data) {
        // response.data is already the array
        if (Array.isArray(response.data)) {
          setRequests(response.data);
        } else {
          console.error('Response data is not an array:', response.data);
          setRequests([]);
          toast.error(tCommon('error'));
        }
        
        // Update pagination info if available
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || t('errors.fetchFailed'));
        toast.error(response.error || t('errors.fetchFailed'));
        setRequests([]);
      }
    } catch (err) {
      const errorMessage = t('errors.unexpected');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch error:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, statusFilter, entityTypeFilter, actionTypeFilter, sortBy, sortOrder, isApprover, user?.user_id, t, tCommon]);

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
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(DEFAULT_PAGE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLastPage = () => {
    setCurrentPage(pagination.totalPages);
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
    
    if (pagination.totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
      let endPage = Math.min(pagination.totalPages, startPage + MAX_VISIBLE_PAGES - 1);
      
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
  const getEntityIcon = (entityType: string): string => {
    const icons: Record<string, string> = {
      'WIZARD_SESSION': '🪄',
      'LAND_PARCELS': '🏞️',
      'OWNERS': '👤',
      'LEASE_AGREEMENTS': '📄',
      'ENCUMBRANCES': '🔒',
      'APPROVAL_REQUEST': '✅',
      'USERS': '👥',
      'CONFIGURATIONS': '⚙️',
      'RATE_CONFIGURATION': '📊',
      'SUBCITY': '🏛️',
      'REVENUE': '💰'
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
      'ADD_OWNER': 'bg-green-100 text-green-800',
      'SUSPEND': 'bg-orange-100 text-orange-800',
      'ACTIVATE': 'bg-green-100 text-green-800',
      'DEACTIVATE': 'bg-gray-100 text-gray-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl text-[#2a2718]">{t('loading')}</div>
          <div className="text-sm text-[#2a2718]/70 mt-2">
            {t('loadingMessage')}
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
            {isApprover ? t('title.approver') : t('title.maker')}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[#2a2718]/70 m-0">
              {t('count', { count: pagination.totalCount })}
            </p>
            {(statusFilter || entityTypeFilter || actionTypeFilter) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-[#f0cd6e]/20 hover:bg-[#f0cd6e]/40 rounded text-sm text-[#2a2718] flex items-center gap-1 transition-colors"
              >
                ✕ {t('clearFilters')}
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
          <span>{isApprover ? t('view.approver') : t('view.maker')}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl mb-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              {t('filters.status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
            >
              <option value="">{t('filters.allStatuses')}</option>
              {REQUEST_STATUSES.map(status => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              {t('filters.entityType')}
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => handleEntityTypeFilterChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
            >
              <option value="">{t('filters.allEntities')}</option>
              {ENTITY_TYPES.map(type => (
                <option key={type} value={type}>
                  {getEntityIcon(type)} {t(`entity.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              {t('filters.actionType')}
            </label>
            <select
              value={actionTypeFilter}
              onChange={(e) => handleActionTypeFilterChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
            >
              <option value="">{t('filters.allActions')}</option>
              {ACTION_TYPES.map(type => (
                <option key={type} value={type}>
                  {t(`action.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-xs font-semibold text-[#2a2718] mb-2">
              {t('filters.sortBy')}
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                className="flex-1 px-4 py-3 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
              >
                <option value="created_at">{t('sort.created')}</option>
                <option value="updated_at">{t('sort.updated')}</option>
              </select>
              <button
                onClick={() => handleSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 rounded-lg border border-[#f0cd6e] bg-white hover:bg-[#f0cd6e]/20 transition-colors text-[#2a2718]"
                title={sortOrder === 'asc' ? t('sort.asc') : t('sort.desc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter || entityTypeFilter || actionTypeFilter) && (
          <div className="flex items-center gap-2 pt-4 border-t border-[#f0cd6e]">
            <span className="text-sm text-[#2a2718]/70">{t('filters.activeFilters')}</span>
            {statusFilter && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(statusFilter as RequestStatus)}`}>
                {t('filters.status')}: {t(`status.${statusFilter}`)}
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
                {getEntityIcon(entityTypeFilter as EntityType)} {t(`entity.${entityTypeFilter}`)}
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
                {t('filters.actionType')}: {t(`action.${actionTypeFilter}`)}
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
            {tCommon('retry')}
          </button>
        </div>
      )}

      {/* Requests Grid */}
      {(!requests || requests.length === 0) && !loading ? (
        <div className="text-center py-16 bg-[#f0cd6e]/10 rounded-xl">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[#2a2718] mb-2">{t('empty.title')}</h3>
          <p className="text-[#2a2718]/70 max-w-md mx-auto">
            {statusFilter || entityTypeFilter || actionTypeFilter
              ? t('empty.filtered')
              : isApprover 
                ? t('empty.approver')
                : t('empty.maker')}
          </p>
          {(statusFilter || entityTypeFilter || actionTypeFilter) && (
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-3 bg-[#f0cd6e] text-[#2a2718] rounded-lg hover:bg-[#2a2718] hover:text-white transition-colors"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-[#2a2718]/70">
              {tCommon('pagination.showing')} <strong className="text-[#2a2718]">{pagination.totalCount > 0 ? ((currentPage - 1) * limit) + 1 : 0}</strong> {tCommon('pagination.to')}{' '}
              <strong className="text-[#2a2718]">{Math.min(currentPage * limit, pagination.totalCount)}</strong> {tCommon('pagination.of')}{' '}
              <strong className="text-[#2a2718]">{pagination.totalCount.toLocaleString()}</strong> {tCommon('pagination.results')}
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#2a2718]/70">{tCommon('pagination.show')}:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-[#f0cd6e] text-sm bg-white focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
              >
                {DEFAULT_PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size} {tCommon('pagination.perPage')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Request Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {requests.map((req) => {
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
                        {t(`entity.${req.entity_type}`)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                          {t(`status.${req.status}`)}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getActionColor(req.action_type)}`}>
                          {t(`action.${req.action_type}`)}
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
                          {req.maker.full_name || t('card.unknownUser')}
                        </div>
                        <div className="text-xs text-[#2a2718]/70">
                          {tAuth(`roles.${req.maker.role}`)} • {req.maker.username}
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
                      {t('card.id')}: {req.request_id?.slice(0, 8)}...
                    </span>
                    <span className="font-medium">
                      <DateDisplay 
                        date={req.created_at} 
                        format="medium"
                        showCalendarIndicator={true}
                        showTooltip={true}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-8 p-6 bg-white rounded-xl shadow-md">
              {/* Pagination Info */}
              <div className="text-sm text-[#2a2718]/70">
                {tCommon('pagination.page')} {currentPage} {tCommon('pagination.of')} {pagination.totalPages}
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
                  ⏮️ {tCommon('pagination.first')}
                </button>

                {/* Previous Page */}
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors
                    ${!pagination.hasPreviousPage 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                    }`}
                >
                  ◀️ {tCommon('pagination.previous')}
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
                  disabled={!pagination.hasNextPage}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors
                    ${!pagination.hasNextPage 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                    }`}
                >
                  {tCommon('pagination.next')} ▶️
                </button>

                {/* Last Page */}
                <button
                  onClick={handleLastPage}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors
                    ${currentPage === pagination.totalPages 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-[#2a2718] border-[#f0cd6e] hover:bg-[#f0cd6e]/20'
                    }`}
                >
                  {tCommon('pagination.last')} ⏭️
                </button>
              </div>

              {/* Jump to Page */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[#2a2718]/70">{tCommon('pagination.jumpTo')}:</span>
                <input
                  type="number"
                  min={1}
                  max={pagination.totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= pagination.totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 px-3 py-2 rounded-lg border border-[#f0cd6e] text-sm text-center focus:ring-2 focus:ring-[#f0cd6e] focus:border-[#2a2718] transition-colors"
                />
                <span className="text-sm text-[#2a2718]/70">{tCommon('pagination.of')} {pagination.totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingRequestsPage;