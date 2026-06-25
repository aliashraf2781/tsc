import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"

type SideLinkProps = {
  href: string
  label: string
}

export function AuthSideLink({ href, label }: SideLinkProps) {
  const locale = useLocale()
  return (
    <div className="text-right">
      <Link locale={locale} className="text-sm leading-[21px] font-medium text-[#40a0ca]" href={href}>
        {label}
      </Link>
    </div>
  )
}
