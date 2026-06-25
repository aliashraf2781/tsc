import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"

type AdminPageLayoutProps = {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  needsClientPersist?: boolean
  initialAuthTokens?: { access_token?: string; refresh_token?: string } | null
  locale?: string
}

export function AdminPageLayout({ title, description, action, children, needsClientPersist, initialAuthTokens, locale }: AdminPageLayoutProps) {
  const currentLocale = useLocale()
  const activeLocale = locale || currentLocale
  const isRTL = activeLocale === "ar"

  return (
    <div className="flex w-full flex-col gap-6 text-start">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <div className="min-w-0 flex-1">
          <h1 className={cn(
            "w-fit bg-clip-text text-[24px] font-bold leading-relaxed py-1 text-transparent",
            isRTL ? "bg-gradient-to-r" : "bg-gradient-to-l",
            "from-[#032C44] to-[#41A0CA]"
          )}>
            {title}
          </h1>
          {description && <p className="mt-2 text-sm text-[#525252]">{description}</p>}
        </div>
        {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
      </div>
      {children}
      {/* Session persistence removed; server handles HttpOnly cookies now */}
    </div>
  )
}
