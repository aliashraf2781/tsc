"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import Image from "next/image"
import parse from "html-react-parser"
import { Link } from "@/i18n/navigation"
import { deleteServiceAction } from "@/features/admin/actions/admin-actions"
import type { Service } from "@/lib/api/services/services.service"
import {
  Globe,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Layers,
} from "lucide-react"
import { AdminTableShell, AdminTableRow, AdminTableCell } from "./admin-table-shell"
import { AdminPageLayout } from "./admin-page-layout"
import { PrimaryButton } from "@/components/ui/primary-button"

export function AdminServicesPanel({
  services,
  locale,
}: {
  services: Service[]
  locale: string
}) {
  const isRTL = locale === "ar"
  const isDe = locale === "de"
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function confirmDelete() {
    if (deleteConfirm === null) return
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteServiceAction(deleteConfirm, locale)
      if (!result.ok) {
        setDeleteError(result.message ?? (isRTL ? "فشل الحذف" : (isDe ? "Löschen fehlgeschlagen" : "Delete failed")))
        return
      }
      setDeleteConfirm(null)
      router.refresh()
    })
  }

  const tableColumns = [
    { key: "num", label: "#", className: "w-12 text-center" },
    { key: "service", label: isRTL ? "الخدمة" : (isDe ? "Dienstleistung" : "Service"), className: "flex-1 min-w-[200px]" },
    { key: "features", label: isRTL ? "المزايا" : (isDe ? "Merkmale" : "Features"), className: "w-24 text-center" },
    { key: "actions", label: isRTL ? "الإجراءات" : (isDe ? "Aktionen" : "Actions"), className: "w-36 text-center" },
  ]

  return (
    <AdminPageLayout
      title={isRTL ? "إدارة الخدمات" : (isDe ? "Dienstleistungen verwalten" : "Manage Services")}
      description={
        isRTL
          ? `إجمالي الخدمات: ${services.length} · أضف وعدّل خدمات الموقع ومزاياها المعروضة في صفحة الخدمات`
          : isDe
            ? `Dienstleistungen insgesamt: ${services.length} · Dienste der Website hinzufügen und bearbeiten`
            : `Total services: ${services.length} · Add and edit the services shown on the services page`
      }
      action={
        <PrimaryButton
          type="button"
          onClick={() => router.push(`/dashboard/admin/services/new`)}
          className="w-auto h-10 px-5 mx-0 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>{isRTL ? "إضافة خدمة" : (isDe ? "Dienstleistung hinzufügen" : "Add Service")}</span>
        </PrimaryButton>
      }
    >
      <div className="space-y-6">
        {/* Delete confirm modal */}
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[min(95vw,420px)] rounded-[16px] bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {isRTL ? "تأكيد الحذف" : (isDe ? "Löschen bestätigen" : "Confirm Delete")}
                </h3>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                {isRTL
                  ? "هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء."
                  : isDe
                    ? "Sind Sie sicher, dass Sie diese Dienstleistung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
                    : "Are you sure you want to delete this service? This action cannot be undone."}
              </p>
              {deleteError && (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {deleteError}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirm(null); setDeleteError(null) }}
                  className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  {isRTL ? "إلغاء" : (isDe ? "Abbrechen" : "Cancel")}
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={confirmDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {deletePending ? (isRTL ? "جاري الحذف..." : (isDe ? "Löschen..." : "Deleting...")) : (isRTL ? "حذف" : (isDe ? "Löschen" : "Delete"))}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Table */}
        <AdminTableShell
          columns={tableColumns}
          isEmpty={services.length === 0}
          isRTL={isRTL}
          emptyMessage={isRTL ? "لا توجد خدمات. اضغط \"إضافة خدمة\" للبدء." : (isDe ? "Noch keine Dienstleistungen. Klicken Sie auf \"Dienstleistung hinzufügen\", um zu beginnen." : "No services yet. Click \"Add Service\" to get started.")}
        >
          {services.map((service, index) => (
            <AdminTableRow 
              key={service.id} 
              striped={index % 2 === 1}
              onClick={() => router.push(`/dashboard/admin/services/${service.id}/edit`)}
            >
              {/* # */}
              <AdminTableCell className="w-12 text-center text-[#9CA3AF] font-mono text-xs">
                {index + 1}
              </AdminTableCell>

              {/* Service info */}
              <AdminTableCell className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3">
                  {/* Icon / Image */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#78A3BE] bg-[#F0F4F8]">
                    {service.icon ? (
                      <Image
                        src={service.icon}
                        alt=""
                        width={24}
                        height={24}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <Globe className="h-5 w-5 text-[#78A3BE]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827] text-sm">
                      {service.title || (isRTL ? "بدون عنوان" : (isDe ? "Unbenannt" : "Untitled"))}
                    </p>
                    <div className="mt-0.5 max-w-[280px] truncate text-xs text-[#6B7280] [&_br]:hidden [&_p]:m-0 [&_p]:inline [&_p+p]:before:content-['_|_']">
                      {service.description ? parse(service.description) : "—"}
                    </div>
                  </div>
                </div>
              </AdminTableCell>

              {/* Features count */}
              <AdminTableCell className="w-24 text-center">
                <div className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FB] px-2.5 py-1 text-xs font-semibold text-[#006EA8]">
                  <Layers className="h-3 w-3" />
                  <span>{service.features?.length ?? 0}</span>
                </div>
              </AdminTableCell>

              {/* Actions */}
              <AdminTableCell className="w-36">
                <div className="flex items-center justify-center gap-2">
                  {/* View on site */}
                  <Link
                    locale={locale}
                    href={`/services/${service.id}`}
                    target="_blank"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F4F8] text-[#6B7280] hover:bg-[#EAF4FB] hover:text-[#006EA8] transition-colors"
                    title={isRTL ? "عرض في الموقع" : (isDe ? "Auf Website anzeigen" : "View on site")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/admin/services/${service.id}/edit`)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF4FB] text-[#006EA8] hover:bg-[#006EA8] hover:text-white transition-colors"
                    title={isRTL ? "تعديل" : (isDe ? "Bearbeiten" : "Edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(service.id)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title={isRTL ? "حذف" : (isDe ? "Löschen" : "Delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableShell>
      </div>
    </AdminPageLayout>
  )
}
