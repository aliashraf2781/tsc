import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

type Column = { key: string; label: string; className?: string }

export function AdminTableShell({
  columns,
  children,
  emptyMessage,
  isEmpty,
  isRTL,
}: {
  columns: Column[]
  children: React.ReactNode
  emptyMessage: string
  isEmpty: boolean
  isRTL?: boolean
}) {
  const locale = useLocale()
  const resolvedIsRTL = isRTL !== undefined ? isRTL : (locale === "ar")

  return (
    <div className="rounded-[8px] bg-white shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)]">
      <div className="table-scrollbar overflow-x-auto overscroll-x-contain">
        <div className="min-w-[1100px]">
          <div className={cn(
            "flex items-center rounded-t-[8px] text-white",
            // Use RTL-aware gradient direction
            resolvedIsRTL ? "bg-gradient-to-r" : "bg-gradient-to-l",
            "from-[#032C44] to-[#41A0CA]"
          )}>
            {columns.map((col) => (
              <div
                key={col.key}
                className={cn("shrink-0 px-3 py-2.5 text-sm font-medium sm:text-base", col.className)}
              >
                {col.label}
              </div>
            ))}
          </div>
          {isEmpty ? (
            <p className="px-6 py-12 text-center text-sm text-[#525252]">{emptyMessage}</p>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminTableRow({
  children,
  striped,
  onClick,
  className,
}: {
  children: React.ReactNode
  striped?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex min-h-[52px] items-center border-b border-[#F0F4F8] last:border-0",
        striped && "bg-[#FAFBFC]",
        onClick && "cursor-pointer hover:bg-[#F2F8FC] transition-colors",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdminTableCell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("shrink-0 px-3 py-3 text-sm text-[#262626]", className)}>{children}</div>
}