"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import { deleteCategoryAction } from "@/features/admin/actions/admin-actions"
import type { Category } from "@/lib/api/types"
import { Tag, Plus } from "lucide-react"
import { AdminPageLayout } from "./admin-page-layout"
import { CategoryCard } from "./category-card"
import { EDIT_LOCALES, type LocaleKey } from "@/features/admin/lib/category-form-schema"
import { makeCategoryKey } from "@/features/admin/lib/category-form-utils"

type CategoryEntry = {
  key: string
  id?: number
  category?: Category
}

export function AdminCategoriesPanel({
  categories,
  locale,
}: {
  categories: Category[]
  locale: string
}) {
  const t = useTranslations("Admin.categories")
  const [entries, setEntries] = useState<CategoryEntry[]>(() =>
    categories.map((c) => ({ key: String(c.id), id: c.id, category: c }))
  )
  const [editLocale, setEditLocale] = useState<LocaleKey>(EDIT_LOCALES[0])
  const [deleteTarget, setDeleteTarget] = useState<CategoryEntry | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [newEntryKey, setNewEntryKey] = useState<string | null>(null)
  const router = useRouter()

  function addCategory() {
    const key = makeCategoryKey()
    setNewEntryKey(key)
    setEntries((prev) => [...prev, { key }])
  }

  function handleDeleteRequest(entry: CategoryEntry) {
    if (!entry.id) {
      setEntries((prev) => prev.filter((e) => e.key !== entry.key))
      return
    }
    setDeleteTarget(entry)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    if (!deleteTarget.id) {
      setEntries((prev) => prev.filter((e) => e.key !== deleteTarget.key))
      setDeleteTarget(null)
      return
    }
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteCategoryAction(deleteTarget.id!, locale)
      if (!result.ok) {
        setDeleteError(result.message ?? t("deleteFailed"))
        return
      }
      setEntries((prev) => prev.filter((e) => e.key !== deleteTarget.key))
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <AdminPageLayout
      title={t("manageCategories")}
      description={t("manageCategoriesDesc")}
      action={
        <PrimaryButton
          type="button"
          onClick={addCategory}
          className="w-auto sm:w-auto h-10 px-5 mx-0 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>{t("addCategory")}</span>
        </PrimaryButton>
      }
    >
      <div className="space-y-6">
        {/* Delete confirm modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[min(95vw,420px)] rounded-[16px] bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-[#111827]">{t("confirmDeleteTitle")}</h3>
              <p className="mt-2 text-sm text-[#6B7280]">{t("confirmDeleteBody")}</p>
              {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null)
                    setDeleteError(null)
                  }}
                  className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={confirmDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deletePending ? t("deleting") : t("delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#6B7280]">{t("language")}</label>
          {EDIT_LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setEditLocale(loc)}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${editLocale === loc ? "bg-[#006EA8] text-white" : "bg-[#EBF5FB] text-[#006EA8]"}`}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="rounded-[12px] border border-dashed border-[#78A3BE] bg-[#F8FBFF] py-16 text-center">
            <Tag className="mx-auto h-10 w-10 text-[#78A3BE]" />
            <p className="mt-3 text-sm text-[#9CA3AF]">{t("noCategories")}</p>
          </div>
        )}

        <div className="space-y-3">
          {entries.map((entry, index) => (
            <CategoryCard
              key={entry.key}
              id={entry.id}
              index={index}
              initial={entry.category}
              locale={locale}
              editLocale={editLocale}
              defaultExpanded={!entry.id && entry.key === newEntryKey}
              onDeleteRequest={() => handleDeleteRequest(entry)}
            />
          ))}
        </div>
      </div>
    </AdminPageLayout>
  )
}
