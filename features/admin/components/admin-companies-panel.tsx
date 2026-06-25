"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { User } from "@/lib/api/types"
import { deleteUserAction, suspendUserAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AdminCompaniesPanel({ companies, locale }: { companies: User[]; locale: string }) {
  const t = useTranslations("Admin.companies")
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isAr = locale === "ar"

  // Sort companies descending (latest registered first)
  const sortedCompanies = [...companies].sort((a, b) => {
    const idA = Number(a.id) || 0
    const idB = Number(b.id) || 0
    if (idB !== idA) return idB - idA
    const dateA = new Date((a as any).createdAt || 0).getTime()
    const dateB = new Date((b as any).createdAt || 0).getTime()
    return dateB - dateA
  })

  // Calculate company-specific statistics
  const totalCompanies = sortedCompanies.length
  const verifiedCompanies = sortedCompanies.filter((c) => c.emailVerified).length
  const unverifiedCompanies = totalCompanies - verifiedCompanies

  const columns = [
    { key: "name", label: t("columns.name"), className: "w-[20%]" },
    { key: "email", label: t("columns.email"), className: "w-[20%]" },
    { key: "phone", label: t("columns.phone"), className: "w-[12%]" },
    { key: "country", label: t("columns.country"), className: "w-[12%]" },
    { key: "createdAt", label: isAr ? "تاريخ التسجيل" : "Registration Date", className: "w-[12%]" },
    { key: "verification", label: isAr ? "التحقق" : "Verification", className: "w-[12%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[12%]" },
  ]

  function handleDelete(company: User) {
    toast(isAr ? "حذف هذه الشركة؟" : "Delete this company?", {
      action: {
        label: isAr ? "حذف" : "Delete",
        onClick: () => {
          setError(null)
          startTransition(async () => {
            const result = await deleteUserAction({ id: company.id, uuid: company.uuid }, locale)
            if (!result.ok) {
              setError(result.message ?? t("error"))
              toast.error(result.message ?? t("error"))
              return
            }
            toast.success(isAr ? "تم حذف الشركة" : "Company deleted")
            router.refresh()
          })
        },
      },
      cancel: {
        label: isAr ? "إلغاء" : "Cancel",
        onClick: () => {},
      },
    })
  }

  function handleToggleSuspend(company: User) {
    const currentStatus = company.status || "active"
    const isSuspended = currentStatus === "suspended"
    const confirmMsg = isAr
      ? (isSuspended ? "هل تريد تفعيل حساب هذه الشركة؟" : "هل تريد تعليق حساب هذه الشركة؟")
      : (isSuspended ? "Do you want to activate this company account?" : "Do you want to suspend this company account?")

    toast(confirmMsg, {
      action: {
        label: isAr ? "تأكيد" : "Confirm",
        onClick: () => {
          setError(null)
          startTransition(async () => {
            const result = await suspendUserAction({ id: company.id, uuid: company.uuid }, !isSuspended, locale)
            if (!result.ok) {
              setError(result.message ?? (isAr ? "فشل تغيير حالة الشركة" : "Failed to change company status"))
              toast.error(result.message ?? (isAr ? "فشل تغيير حالة الشركة" : "Failed to change company status"))
              return
            }
            toast.success(isAr ? "تم تحديث حالة الشركة" : "Company status updated")
            router.refresh()
          })
        },
      },
      cancel: {
        label: isAr ? "إلغاء" : "Cancel",
        onClick: () => {},
      },
    })
  }

  return (
    <div className="flex flex-col gap-6 text-start">
      {/* Statistics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "إجمالي الشركات" : "Total Companies"}
          </div>
          <div className="text-2xl font-bold text-[#111827]">{totalCompanies}</div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "الحسابات المؤكدة" : "Verified Accounts"}
          </div>
          <div className="text-2xl font-bold text-[#059669]">{verifiedCompanies}</div>
          <div className="text-xs text-[#6B7280]">
            {locale === "ar" ? "مؤكد" : "Verified"}
          </div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "الحسابات غير المؤكدة" : "Unverified Accounts"}
          </div>
          <div className="text-2xl font-bold text-[#D97706]">{unverifiedCompanies}</div>
          <div className="text-xs text-[#6B7280]">
            {locale === "ar" ? "غير مؤكد" : "Not Verified"}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      {/* Companies Table */}
      <AdminTableShell columns={columns} isEmpty={sortedCompanies.length === 0} emptyMessage={t("empty")} isRTL={locale === "ar"}>
        {sortedCompanies.map((company, index) => {
          const companyProfile = company.companyProfile || {}
          const formattedDate = (() => {
            const dateVal = (company as any).createdAt || (company as any).created_at
            if (!dateVal) return "—"
            try {
              return new Date(dateVal).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            } catch {
              return "—"
            }
          })()

          return (
            <AdminTableRow key={company.id} striped={index % 2 === 1}>
              <AdminTableCell className="w-[20%]">
                <div className="flex items-center gap-3">
                  {company.avatar ? (
                    <Image
                      src={company.avatar}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF5FB] text-sm font-bold text-[#006EA8] shrink-0">
                      {(companyProfile.companyName || company.name)?.charAt(0) ?? "C"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      locale={locale}
                      href={`/dashboard/admin/companies/${company.id}`}
                      className="font-medium hover:underline text-[#006EA8] block truncate"
                    >
                      {companyProfile.companyName || company.name}
                    </Link>
                    {companyProfile.ceoName && (
                      <div className="text-xs text-[#6B7280] truncate">{companyProfile.ceoName}</div>
                    )}
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell className="w-[20%] text-xs truncate">{company.email}</AdminTableCell>
              <AdminTableCell className="w-[12%] text-xs">{company.phone || "—"}</AdminTableCell>
              <AdminTableCell className="w-[12%] text-xs">
                {company.country?.name || "—"}
              </AdminTableCell>
              <AdminTableCell className="w-[12%] text-xs">
                {formattedDate}
              </AdminTableCell>
              <AdminTableCell className="w-[12%]">
                <span className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                  company.emailVerified ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {company.emailVerified ? (isAr ? "مؤكد" : "Verified") : (isAr ? "غير مؤكد" : "Not Verified")}
                </span>
              </AdminTableCell>
              <AdminTableCell className="w-[12%] flex items-center gap-2">
                <Link
                  locale={locale}
                  href={`/dashboard/admin/companies/${company.id}`}
                  className="text-xs font-semibold text-[#006EA8] hover:underline"
                >
                  {isAr ? "تعديل" : "Edit"}
                </Link>
                <span className="text-[#E5E7EB]">|</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleToggleSuspend(company)}
                  className="text-xs font-semibold text-amber-600 hover:underline disabled:opacity-50"
                >
                  {company.status === "suspended" ? (isAr ? "تفعيل" : "Activate") : (isAr ? "تعليق الحساب" : "Suspend")}
                </button>
                <span className="text-[#E5E7EB]">|</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(company)}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  {t("delete")}
                </button>
              </AdminTableCell>
            </AdminTableRow>
          )
        })}
      </AdminTableShell>
    </div>
  )
}
