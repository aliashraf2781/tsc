"use client"

import * as React from "react"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { useSession } from "@/hooks/use-auth"

type FavoriteButtonProps = {
  jobId: number
  locale?: string
  initialIsFavorite?: boolean
}

export function FavoriteButton({ 
  jobId, 
  locale = "ar", 
  initialIsFavorite = false 
}: FavoriteButtonProps) {
  const router = useRouter()
  const session = useSession()
  const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite)
  const [loading, setLoading] = React.useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Use server session as the authoritative login state
    if (!session.isLoggedIn) {
      const message = locale === "ar" ? "يجب تسجيل الدخول أولاً" : "Please log in first"
      toast.error(message)
      setTimeout(() => router.push(`/sign-in`), 1000)
      return
    }

    if (loading) return
    setLoading(true)
    const toastId = toast.loading(locale === "ar" ? "جاري..." : "Loading...")

    try {
      const res = await fetch("/api/user/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ job_id: jobId }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.message || "Failed to update favorites")
      }

      setIsFavorite(result.is_favourite)
      toast.dismiss(toastId)
      
      if (result.is_favourite) {
        toast.success(locale === "ar" ? "تم الحفظ للمفضلة بنجاح" : "Saved to favorites successfully")
      } else {
        toast.success(locale === "ar" ? "تمت الإزالة من المفضلة بنجاح" : "Removed from favorites successfully")
      }
    } catch (err: any) {
      setLoading(false)
      toast.dismiss(toastId)
      const errMsg = err?.message || (locale === "ar" ? "حدث خطأ" : "Error occurred")
      toast.error(errMsg)
      console.error("Toggle favorite error:", err)
    } finally {
      setLoading(false)
    }
  }

  const userRole = session.user ? ((session.user as any).role || (session.user as any).roles?.[0]?.name || (session.user as any).roles?.[0]) : null
  const isExcludedRole = userRole && (
    String(userRole).toLowerCase().includes("company") || 
    String(userRole).toLowerCase().includes("admin") ||
    String(userRole).toLowerCase().includes("employer")
  )

  if (session.checked && isExcludedRole) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="rounded-full p-1 text-[#40A0CA] transition hover:bg-[#e8f2ff] disabled:opacity-60"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      title={isFavorite ? (locale === "ar" ? "إزالة من المفضلة" : "Remove from favorites") : (locale === "ar" ? "إضافة للمفضلة" : "Add to favorites")}
    >
      <Bookmark 
        className={`size-8 transition ${
          isFavorite 
            ? "fill-[#40A0CA] stroke-[#40A0CA]" 
            : "fill-[#40A0CA]/25 stroke-[#40A0CA]"
        }`} 
      />
    </button>
  )
}

