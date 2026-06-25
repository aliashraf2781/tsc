"use client"

import * as React from "react"
import { useRouter } from "@/i18n/navigation"
import { useSession } from "@/hooks/use-auth"
import { PrimaryButton } from "@/components/ui/primary-button"

type ApplyButtonProps = {
  jobId: number
  locale?: string
  label?: string
}

export default function ApplyButton({ jobId, locale = "ar", label = "Apply" }: ApplyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [shouldHide, setShouldHide] = React.useState(false)
  const session = useSession()

  React.useEffect(() => {
    if (session.checked && session.user) {
      const u = session.user as any
      if (u && (u.role === "company" || u.role === "admin")) setShouldHide(true)
    }
  }, [session.checked, session.user])

  const handleApply = () => {
    if (loading) return
    setLoading(true)
    router.push(`/jobs/${jobId}/apply`)
  }

  if (shouldHide) return null

  return (
    <PrimaryButton
      type="button"
      onClick={handleApply}
      disabled={loading}
      className="mt-8"
    >
      {loading ? (locale === "ar" ? "جاري..." : "Loading...") : label}
    </PrimaryButton>
  )
}


