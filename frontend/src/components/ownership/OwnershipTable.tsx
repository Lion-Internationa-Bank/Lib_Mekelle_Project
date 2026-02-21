// src/components/parcelDetail/OwnershipTable.tsx
import { useState, useRef, useEffect } from "react";
import type {
  OwnerWithParcels,
  OwnersPagination,
} from "../../services/ownersApi";
import { useAuth } from "../../contexts/AuthContext";


type Props = {
  owners: OwnerWithParcels[];
  loading: boolean;
  error: string;
  pagination: OwnersPagination | null;
  expandedOwnerId: string | null;
  onToggleExpand: (id: string) => void;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (owner: OwnerWithParcels) => void;
  onDelete: (owner: OwnerWithParcels) => void;
  onPageChange: (page: number) => void;
};

const OwnershipTable = ({
  owners,
  loading,
  error,
  pagination,
  expandedOwnerId,
  onToggleExpand,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  onPageChange,
}: Props) => {

  const {user } = useAuth();
    
  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[#f0cd6e]/50 shadow-2xl overflow-visible">
        {loading && <LoadingOwnersBlock />}
        {error && !loading && <ErrorBlock error={error} onRetry={onRetry} />}
        {!loading && !error && owners.length === 0 && (
          <EmptyOwnersBlock onCreate={onCreate} />
        )}
        {!loading && !error && owners.length > 0 && (
          <OwnersTableInner
            owners={owners}
            expandedOwnerId={expandedOwnerId}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Pagination Bar - Always visible when there are results */}
      {pagination && owners.length > 0 && (
        <PaginationBar
          pagination={pagination}
          loading={loading}
          onPrev={() => onPageChange(Math.max(1, pagination.page - 1))}
          onNext={() => onPageChange(pagination.page + 1)}
        />
      )}
    </>
  );
};

const LoadingOwnersBlock = () => (
  <div className="p-16 text-center">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0cd6e] mx-auto mb-6"></div>
    <p className="text-xl font-semibold text-[#2a2718]">Loading owners...</p>
    <p className="text-[#2a2718]/70 mt-2">Connecting to backend API</p>
  </div>
);

const ErrorBlock = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="p-16 text-center border-t border-[#f0cd6e]/30 bg-[#2a2718]/5">
    <div className="text-6xl mb-6">⚠️</div>
    <h3 className="text-2xl font-bold text-[#2a2718] mb-4">{error}</h3>
    <button
      onClick={onRetry}
      className="bg-[#f0cd6e] hover:bg-[#2a2718] text-[#2a2718] hover:text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
    >
      Retry
    </button>
  </div>
);

const EmptyOwnersBlock = ({ onCreate }: { onCreate: () => void }) => (
  <div className="p-16 text-center border-t border-[#f0cd6e]/30 bg-gradient-to-br from-[#f0cd6e]/10 to-[#2a2718]/10">
    <span className="text-6xl mb-4 block">👥</span>
    <h3 className="text-2xl font-bold text-[#2a2718] mb-3">No owners found</h3>
    <p className="text-[#2a2718]/70 mb-6">
      Try adjusting your search or add the first owner.
    </p>
    <button
      onClick={onCreate}
      className="bg-gradient-to-r from-[#f0cd6e] to-[#2a2718] hover:from-[#2a2718] hover:to-[#f0cd6e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
    >
      Add Owner
    </button>
  </div>
);

const OwnersTableInner = ({
  owners,
  expandedOwnerId,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  owners: OwnerWithParcels[];
  expandedOwnerId: string | null;
  onToggleExpand: (id: string) => void;
  onEdit: (owner: OwnerWithParcels) => void;
  onDelete: (owner: OwnerWithParcels) => void;
}) => (
  <div>
    {/* Table Header */}
    <div className="grid grid-cols-[auto_2fr_2fr_1.5fr_1.5fr_2fr_auto] gap-4 px-4 py-3 text-xs font-semibold text-[#2a2718] uppercase tracking-wider bg-[#f0cd6e]/20 border-b border-[#f0cd6e]">
      <div></div> {/* Empty for chevron */}
      <div>Owner</div>
      <div>National ID</div>
      <div>TIN</div>
      <div>Phone</div>
      <div>Parcels (count)</div>
      <div className="text-right">Actions</div>
    </div>

    {/* Rows */}
    <div className="divide-y divide-[#f0cd6e]/30">
      {owners.map((owner) => (
        <OwnerRow
          key={owner.owner_id}
          owner={owner}
          isExpanded={expandedOwnerId === owner.owner_id}
          onToggle={() => onToggleExpand(owner.owner_id)}
          onEdit={() => onEdit(owner)}
          onDelete={() => onDelete(owner)}
        />
      ))}
    </div>
  </div>
);

const PaginationBar = ({
  pagination,
  loading,
  onPrev,
  onNext,
}: {
  pagination: OwnersPagination;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border border-[#f0cd6e]/50 rounded-2xl shadow-sm">
    {/* Info */}
    <div className="text-sm text-[#2a2718]/70 mb-3 sm:mb-0">
      Showing{" "}
      <span className="font-semibold text-[#2a2718]">
        {pagination.page * pagination.limit - pagination.limit + 1}–
        {Math.min(pagination.page * pagination.limit, pagination.total)}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-[#2a2718]">
        {pagination.total.toLocaleString()}
      </span>{" "}
      owners • Page{" "}
      <span className="font-semibold text-[#2a2718]">{pagination.page}</span> of{" "}
      <span className="font-semibold text-[#2a2718]">{pagination.totalPages}</span>
    </div>

    {/* Buttons */}
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        disabled={!pagination.hasPrev || loading}
        className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#f0cd6e]/20 text-[#2a2718] hover:bg-[#f0cd6e]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
      >
        Previous
      </button>

      <button
        onClick={onNext}
        disabled={!pagination.hasNext || loading}
        className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#f0cd6e]/20 text-[#2a2718] hover:bg-[#f0cd6e]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
      >
        Next
      </button>
    </div>
  </div>
);

interface OwnerRowProps {
  owner: OwnerWithParcels;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const OwnerRow = ({
  owner,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: OwnerRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuFlipUp, setMenuFlipUp] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const parcelCount = owner.parcels.length;

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const willOpen = !menuOpen;

    if (willOpen && rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 160;
      setMenuFlipUp(spaceBelow < menuHeight + 16);
    }

    setMenuOpen(willOpen);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="border-b border-[#f0cd6e]/30">
      {/* Main Row - Clickable only on chevron */}
      <div
        ref={rowRef}
        className="grid grid-cols-[auto_2fr_2fr_1.5fr_1.5fr_2fr_auto] gap-4 px-4 py-3 text-sm items-center hover:bg-[#f0cd6e]/10 transition-colors"
      >
        {/* Chevron - Only this toggles */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggle();
          }}
          className="flex items-center justify-center w-6 h-6 rounded-full border border-[#f0cd6e] text-[#2a2718] hover:bg-[#f0cd6e]/20 transition-transform focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
          aria-expanded={isExpanded}
          aria-label="Toggle owner details"
        >
          <svg
            className={`w-3 h-3 transform transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <div className="font-semibold text-[#2a2718] truncate">
          {owner.full_name}
        </div>

        <div className="font-mono text-xs text-[#2a2718]/80 truncate">
          {owner.national_id}
        </div>

        <div className="text-[#2a2718]/70 truncate">
          {owner.tin_number || "-"}
        </div>

        <div className="text-[#2a2718]/70 truncate">
          {owner.phone_number || "-"}
        </div>

        <div className="text-[#2a2718]/70">
          {parcelCount === 0
            ? "No parcels"
            : `${parcelCount} parcel${parcelCount > 1 ? "s" : ""}`}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <div className="relative" ref={menuRef}>
            <button
              ref={menuButtonRef}
              onClick={handleMenuToggle}
              className="p-2 rounded-lg hover:bg-[#f0cd6e]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f0cd6e]"
              aria-label="Owner actions menu"
            >
              <svg
                className="w-4 h-4 text-[#2a2718]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {menuOpen && (
              <div
                className={`absolute right-0 w-48 bg-white rounded-xl shadow-2xl border border-[#f0cd6e] py-2 z-50 ${
                  menuFlipUp ? "bottom-full mb-2" : "top-full mt-2"
                }`}
              >
                <button
                  className="w-full text-left px-5 py-3 text-sm hover:bg-[#f0cd6e]/20 transition-colors text-[#2a2718]"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    onEdit();
                  }}
                >
                  Edit owner
                </button>
                <button
                  className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  Delete owner
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-6 bg-[#f0cd6e]/10">
          {parcelCount === 0 ? (
            <div className="border border-dashed border-[#f0cd6e] rounded-xl p-4 text-xs text-[#2a2718]/70 text-center">
              No parcels registered for this owner.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {owner.parcels.map((ownership, index) => {
                const parcel = ownership.parcel;
                return (
                  <div
                    key={parcel.upin || index}
                    className="bg-white border border-[#f0cd6e] rounded-xl p-4 shadow-sm text-xs"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-[#2a2718]">
                        UPIN: {parcel.upin}
                      </div>
                      <div className="text-[#2a2718]/70">
                        {new Date(ownership.acquired_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[#2a2718]/70">
                      <div>
                        <div className="font-medium text-[#2a2718]">Sub City</div>
                        <div>{parcel.sub_city.name || "-"}</div>
                      </div>
                      <div>
                        <div className="font-medium text-[#2a2718]">Ketena</div>
                        <div>{parcel.ketena || "-"}</div>
                      </div>
                      <div>
                        <div className="font-medium text-[#2a2718]">Area (m²)</div>
                        <div>{Number(parcel.total_area_m2).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="font-medium text-[#2a2718]">Land Use</div>
                        <div>{parcel.land_use || "-"}</div>
                      </div>
                    </div>
                   
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnershipTable;