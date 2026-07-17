"use client"

import { useEffect, useState } from "react"
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
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"

type CategoryEntry = {
  key: string
  id?: number
  category?: Category
}

function mapCategoriesToEntries(categories: Category[]): CategoryEntry[] {
  return categories.map((c) => ({ key: String(c.id), id: c.id, category: c }))
}

export function AdminCategoriesPanel({
  categories,
  locale,
}: {
  categories: Category[]
  locale: string
}) {
  const t = useTranslations("Admin.categories")
  const [entries, setEntries] = useState<CategoryEntry[]>(() => mapCategoriesToEntries(categories))
  const [editLocale, setEditLocale] = useState<LocaleKey>(EDIT_LOCALES[0])
  const [deleteTarget, setDeleteTarget] = useState<CategoryEntry | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [newEntryKey, setNewEntryKey] = useState<string | null>(null)
  const router = useRouter()

  // Keep list in sync after create/update refresh (preserve unsaved drafts)
  useEffect(() => {
    setEntries((prev) => {
      const drafts = prev.filter((e) => !e.id)
      const serverEntries = mapCategoriesToEntries(categories)
      const draftToKeep =
        newEntryKey && drafts.some((d) => d.key === newEntryKey)
          ? drafts.filter((d) => d.key === newEntryKey)
          : []
      return [...serverEntries, ...draftToKeep]
    })
  }, [categories, newEntryKey])

  function addCategory() {
    const key = makeCategoryKey()
    setNewEntryKey(key)
    setEntries((prev) => [...prev, { key }])
  }

  function handleDeleteRequest(entry: CategoryEntry) {
    if (!entry.id) {
      setEntries((prev) => prev.filter((e) => e.key !== entry.key))
      if (entry.key === newEntryKey) setNewEntryKey(null)
      return
    }
    setDeleteError(null)
    setDeleteTarget(entry)
  }

  async function confirmDelete() {
    if (!deleteTarget?.id || deletePending) return
    setDeleteError(null)
    setDeletePending(true)
    try {
      const result = await deleteCategoryAction(deleteTarget.id, locale)
      if (!result.ok) {
        setDeleteError(result.message ?? t("deleteFailed"))
        return
      }
      setEntries((prev) => prev.filter((e) => e.key !== deleteTarget.key))
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setDeletePending(false)
    }
  }

  function handleCardSaved(entryKey: string) {
    // Drop local draft after successful create so refreshed server list takes over
    setEntries((prev) => prev.filter((e) => e.id || e.key !== entryKey))
    if (entryKey === newEntryKey) setNewEntryKey(null)
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
        <ConfirmActionDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open && !deletePending) {
              setDeleteTarget(null)
              setDeleteError(null)
            }
          }}
          title={t("confirmDeleteTitle")}
          description={t("confirmDeleteBody")}
          confirmLabel={t("delete")}
          cancelLabel={t("cancel")}
          pending={deletePending}
          pendingLabel={t("deleting")}
          tone="danger"
          error={deleteError}
          onConfirm={confirmDelete}
        />

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
              onSaved={() => handleCardSaved(entry.key)}
            />
          ))}
        </div>
      </div>
    </AdminPageLayout>
  )
}
