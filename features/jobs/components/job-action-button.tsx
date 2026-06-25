"use client"

import * as React from "react"
import { useRouter } from "@/i18n/navigation"
import { useSession } from "@/hooks/use-auth"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Link } from "@/i18n/navigation"

type JobActionButtonProps = {
  jobId: number
  companyId?: number
  locale: string
  applyLabel: string
}

export function JobActionButton({
  jobId,
  companyId,
  locale,
  applyLabel,
}: JobActionButtonProps) {
  const router = useRouter()
  const session = useSession()
  const [loading, setLoading] = React.useState(false)

  const user = session.user as any
  const userRole = user ? (user.role || user.roles?.[0]?.name || user.roles?.[0]) : null
  const role = userRole ? String(userRole).toLowerCase() : null

  const viewApplicationsLabel =
    locale === "ar"
      ? "عرض الطلبات"
      : locale === "de"
        ? "Bewerbungen anzeigen"
        : "View Applications"

  const handleApply = () => {
    if (loading) return
    setLoading(true)
    router.push(`/jobs/${jobId}/apply`)
  }

  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <PrimaryButton type="button" onClick={handleApply} className="mt-8">
        {applyLabel}
      </PrimaryButton>
    )
  }

  if (role === "admin") {
    return (
      <PrimaryButton asChild className="mt-8">
        <Link locale={locale} href={`/dashboard/admin/jobs/${jobId}/applications`}>
          {viewApplicationsLabel}
        </Link>
      </PrimaryButton>
    )
  }

  if (role === "company" || role === "employer") {
    const isOwner = companyId && user?.id && Number(companyId) === Number(user.id)
    if (isOwner) {
      return (
        <PrimaryButton asChild className="mt-8">
          <Link locale={locale} href={`/dashboard/company/jobs/${jobId}/applications`}>
            {viewApplicationsLabel}
          </Link>
        </PrimaryButton>
      )
    }
    return null
  }

  return (
    <PrimaryButton
      type="button"
      onClick={handleApply}
      disabled={loading}
      className="mt-8"
    >
      {loading ? (locale === "ar" ? "جاري..." : "Loading...") : applyLabel}
    </PrimaryButton>
  )
}
