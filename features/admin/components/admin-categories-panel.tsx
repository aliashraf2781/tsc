"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import { deleteCategoryAction } from "@/features/admin/actions/admin-actions"
import type { Category } from "@/lib/api/types"
import { Tag, Plus } from "lucide-react"
import { AdminPageLayout } from "./admin-page-layout"
import { CategoryCard } from "./category-card"
import { CategoryFormModal } from "./category-form-modal"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"

type EditingTarget = {
  id?: number
  category?: Category
} | null

export function AdminCategoriesPanel({
  categories,
  locale,
}: {
  categories: Category[]
  locale: string
}) {
  const t = useTranslations("Admin.categories")
  const [editing, setEditing] = useState<EditingTarget>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function openCreate() {
    setEditing({ id: undefined, category: undefined })
  }

  function openEdit(category: Category) {
    setEditing({ id: category.id, category })
  }

  function handleDeleteRequest(category: Category) {
    setDeleteError(null)
    setDeleteTarget(category)
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
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <AdminPageLayout
      title={t("manageCategories")}
      description={t("manageCategoriesDesc")}
      action={
        <PrimaryButton
          type="button"
          onClick={openCreate}
          className="mx-0 flex h-10 w-auto items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold sm:w-auto"
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

        <CategoryFormModal
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          id={editing?.id}
          initial={editing?.category}
          locale={locale}
          onSaved={() => setEditing(null)}
        />

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#78A3BE] bg-linear-to-b from-[#F8FBFF] to-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF5FB]">
              <Tag className="h-7 w-7 text-[#78A3BE]" />
            </div>
            <p className="mt-4 text-sm font-medium text-[#6B7280]">{t("noCategories")}</p>
            <PrimaryButton
              type="button"
              onClick={openCreate}
              className="mx-auto mt-5 flex h-10 w-auto items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>{t("addCategory")}</span>
            </PrimaryButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                index={index}
                category={category}
                locale={locale}
                onEdit={() => openEdit(category)}
                onDelete={() => handleDeleteRequest(category)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminPageLayout>
  )
}
