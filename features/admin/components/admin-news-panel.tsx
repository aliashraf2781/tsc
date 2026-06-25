"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import Image from "next/image"
import type { News } from "@/lib/api/types"
import { deleteNewsAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { Plus, Trash2, AlertTriangle, Pencil } from "lucide-react"
import { AdminPageLayout } from "./admin-page-layout"
import { PrimaryButton } from "@/components/ui/primary-button"

export function AdminNewsPanel({ news, locale }: { news: News[]; locale: string }) {
  const isRTL = locale === "ar"
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Delete confirm modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  function handleDelete(id: number) {
    setError(null)
    startTransition(async () => {
      const result = await deleteNewsAction(id, locale)
      if (!result.ok) {
        setError(result.message ?? (isRTL ? "فشل الحذف" : "Delete failed"))
      } else {
        setDeleteConfirmId(null)
        router.refresh()
      }
    })
  }

  const columns = [
    { key: "image", label: isRTL ? "الصورة" : "Image", className: "w-[15%]" },
    { key: "title", label: isRTL ? "العنوان" : "Title", className: "w-[50%]" },
    { key: "date", label: isRTL ? "التاريخ" : "Date", className: "w-[20%]" },
    { key: "actions", label: isRTL ? "الإجراءات" : "Actions", className: "w-[15%] text-center" },
  ]

  return (
    <AdminPageLayout
      title={isRTL ? "الأخبار والمقالات" : "News & Articles"}
      description={
        isRTL 
          ? `إجمالي الأخبار: ${news.length} · إضافة وتعديل وحذف الأخبار والمقالات` 
          : `Total news items: ${news.length} · Manage, create, and delete news articles`
      }
      action={
        <PrimaryButton
          type="button"
          onClick={() => router.push(`/dashboard/admin/news/new`)}
          className="w-auto h-10 px-5 mx-0 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>{isRTL ? "خبر جديد" : "New News"}</span>
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Delete Confirmation Modal */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[min(90vw,420px)] overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isRTL ? "تأكيد الحذف" : "Confirm Deletion"}
                </h3>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {isRTL 
                  ? "هل أنت متأكد من حذف هذا الخبر نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
                  : "Are you sure you want to delete this news item permanently? This action cannot be undone."}
              </p>
              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {error}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmId(null)
                    setError(null)
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-55 transition-colors"
                >
                  {pending ? (isRTL ? "جاري الحذف..." : "Deleting...") : (isRTL ? "حذف" : "Delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        {/* News Table */}
        <AdminTableShell
          columns={columns}
          isEmpty={news.length === 0}
          emptyMessage={isRTL ? "لا توجد أخبار مضافة حالياً." : "No news items available."}
          isRTL={isRTL}
        >
          {news.map((item, index) => (
            <AdminTableRow 
              key={item.id} 
              striped={index % 2 === 1}
              onClick={() => router.push(`/dashboard/admin/news/${item.id}/edit`)}
            >
              <AdminTableCell className="w-[15%]">
                {item.image ? (
                  <div className="relative h-10 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-50">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={item.image.startsWith("http")}
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-400">
                    {isRTL ? "لا يوجد" : "None"}
                  </div>
                )}
              </AdminTableCell>
              <AdminTableCell className="w-[50%] font-semibold text-[#111827]">
                {item.title}
              </AdminTableCell>
              <AdminTableCell className="w-[20%] text-sm text-[#4B5563]">
                {new Date(item.published_at).toLocaleDateString(locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[15%] text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/admin/news/${item.id}/edit`)
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF4FB] text-[#006EA8] hover:bg-[#006EA8] hover:text-white transition-colors"
                    title={isRTL ? "تعديل" : "Edit"}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={(e) => {
                      e.stopPropagation() // Stop triggering row click edit page redirection
                      setDeleteConfirmId(item.id)
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title={isRTL ? "حذف" : "Delete"}
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
