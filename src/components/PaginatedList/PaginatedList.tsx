import {
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { useLiveRegion } from "../SkipLink/SkipLink";
import "./PaginatedList.css";

export interface PaginatedListItem {
  id: string;
  content: ReactNode;
}

interface PaginatedListProps {
  items: PaginatedListItem[];
  pageSize?: number;
  label: string;
  renderItem?: (item: PaginatedListItem, index: number) => ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

export function PaginatedList({
  items,
  pageSize = 10,
  label,
  renderItem,
  emptyMessage = "No items found.",
  loading = false,
}: PaginatedListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { announce, liveRegion } = useLiveRegion();

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
      announce(
        `Page ${clamped} of ${totalPages}, showing items ${(clamped - 1) * pageSize + 1} to ${Math.min(clamped * pageSize, items.length)} of ${items.length}`
      );
    },
    [totalPages, pageSize, items.length, announce]
  );

  const handlePageKeyDown = useCallback(
    (e: KeyboardEvent, page: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToPage(page);
      }
    },
    [goToPage]
  );

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [1];
    if (safeCurrentPage > 3) pages.push("ellipsis");
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safeCurrentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  if (loading) {
    return (
      <div className="paginated-list" aria-busy="true" aria-label={label}>
        <div className="paginated-list__loading" role="status">
          <div className="paginated-list__spinner" aria-hidden="true" />
          <span>Loading items...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="paginated-list" aria-label={label}>
        {liveRegion}
        <p className="paginated-list__empty" role="status">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="paginated-list" aria-label={label}>
      {liveRegion}
      <div className="paginated-list__info" aria-live="polite">
        <span>
          Showing {(safeCurrentPage - 1) * pageSize + 1}&ndash;
          {Math.min(safeCurrentPage * pageSize, items.length)} of {items.length} items
        </span>
      </div>
      <ul className="paginated-list__items" role="list">
        {pageItems.map((item, index) => (
          <li key={item.id} className="paginated-list__item">
            {renderItem ? renderItem(item, index) : item.content}
          </li>
        ))}
      </ul>
      <nav className="paginated-list__nav" aria-label={`Pagination for ${label}`}>
        <button
          className="paginated-list__nav-btn"
          onClick={() => goToPage(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Go to previous page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Previous</span>
        </button>
        <div className="paginated-list__pages" role="group">
          {getPageNumbers().map((page, idx) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${idx}`} className="paginated-list__ellipsis" aria-hidden="true">...</span>
            ) : (
              <button
                key={page}
                className={`paginated-list__page-btn ${page === safeCurrentPage ? "paginated-list__page-btn--active" : ""}`}
                onClick={() => goToPage(page)}
                onKeyDown={(e) => handlePageKeyDown(e, page)}
                aria-label={`Page ${page}`}
                aria-current={page === safeCurrentPage ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>
        <button
          className="paginated-list__nav-btn"
          onClick={() => goToPage(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
