import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-gray-500">
      <div>
        {startItem && endItem && totalItems ? (
          <span>
            Showing <span className="text-[#111111] font-semibold">{startItem}</span> to{' '}
            <span className="text-[#111111] font-semibold">{endItem}</span> of{' '}
            <span className="text-[#111111] font-semibold">{totalItems}</span> results
          </span>
        ) : (
          <span>
            Page <span className="text-[#111111] font-semibold">{currentPage}</span> of{' '}
            <span className="text-[#111111] font-semibold">{totalPages}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:text-black hover:border-gray-400 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((page, idx, array) => {
            const showEllipsisBefore = idx > 0 && page - array[idx - 1] > 1
            return (
              <React.Fragment key={page}>
                {showEllipsisBefore && <span className="px-1 text-gray-400">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-[#E50914] text-white shadow-sm'
                      : 'border border-gray-300 bg-white text-gray-700 hover:text-black hover:border-gray-400'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            )
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:text-black hover:border-gray-400 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
