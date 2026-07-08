"use client"

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/** Keeps the visible page-number buttons short even when there are many pages, e.g. 1 … 4 5 6 … 20. */
export function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  const delta = 1
  const pages: (number | "ellipsis")[] = []
  const rangeStart = Math.max(2, current - delta)
  const rangeEnd = Math.min(total - 1, current + delta)

  pages.push(1)
  if (rangeStart > 2) pages.push("ellipsis")
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)
  if (rangeEnd < total - 1) pages.push("ellipsis")
  if (total > 1) pages.push(total)

  return pages
}

export function AdminPagination({
  currentPage,
  lastPage,
  onPageChange,
  isAr,
  summary,
}: {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  isAr: boolean
  summary?: string
}) {
  if (lastPage <= 1) return null

  function goToPage(page: number) {
    if (page < 1 || page > lastPage || page === currentPage) return
    onPageChange(page)
  }

  return (
    <nav
      aria-label={isAr ? "التنقل بين الصفحات" : "Pagination"}
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      {summary ? <p className="text-xs text-[#6B7280]">{summary}</p> : <span />}

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label={isAr ? "الصفحة السابقة" : "Previous page"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#374151] transition-colors hover:bg-[#F2F8FC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAr ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {getPageNumbers(currentPage, lastPage).map((entry, i) =>
            entry === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-8 items-center justify-center text-[#9CA3AF]"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => goToPage(entry)}
                aria-current={entry === currentPage ? "page" : undefined}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors",
                  entry === currentPage
                    ? "bg-[#006EA8] text-white"
                    : "text-[#374151] hover:bg-[#F2F8FC]"
                )}
              >
                {entry}
              </button>
            )
          )}
        </div>

        <span className="text-xs font-medium text-[#374151] sm:hidden">
          {currentPage} / {lastPage}
        </span>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= lastPage}
          aria-label={isAr ? "الصفحة التالية" : "Next page"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#374151] transition-colors hover:bg-[#F2F8FC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAr ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </button>
      </div>
    </nav>
  )
}
