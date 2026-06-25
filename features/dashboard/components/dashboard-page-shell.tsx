import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"

type DashboardPageShellProps = {
  title: string
  description?: string
  isRTL?: boolean
  action?: React.ReactNode
  children?: React.ReactNode
}

export function DashboardPageShell({ title, description, isRTL, action, children }: DashboardPageShellProps) {
  const currentLocale = useLocale()
  const activeIsRTL = isRTL ?? (currentLocale === "ar")

  return (
    <div className="flex w-full flex-col gap-6 text-start">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <div className="min-w-0 flex-1">
          <h1 className={cn(
            "w-fit bg-clip-text text-[24px] font-bold leading-relaxed py-1 text-transparent",
            activeIsRTL ? "bg-gradient-to-r" : "bg-gradient-to-l",
            "from-[#032C44] to-[#41A0CA]"
          )}>
            {title}
          </h1>
          {description && <p className="mt-2 text-sm text-[#525252]">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
