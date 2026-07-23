"use client"

import { useTranslations } from "next-intl"
import type { Category } from "@/lib/api/types"
import { extractMediaUrl, resolveImageUrl } from "@/lib/utils"
import { Tag, Layers, Pencil, Trash2 } from "lucide-react"

function getDisplayName(category: Category | undefined, locale: string, fallback: string) {
  if (!category) return fallback
  const name = (category as unknown as { name?: unknown }).name
  if (!name) return fallback
  if (typeof name === "string") return name || fallback
  const obj = name as Record<string, string>
  return obj[locale] || obj.en || obj.ar || obj.de || fallback
}

export function CategoryCard({
  index,
  category,
  locale,
  onEdit,
  onDelete,
}: {
  index: number
  category: Category
  locale: string
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useTranslations("Admin.categories")
  const existingIcon = extractMediaUrl((category as unknown as { icon?: unknown })?.icon)
  const iconSrc = existingIcon ? resolveImageUrl(existingIcon) : null
  const displayName = getDisplayName(category, locale, `${t("defaultName")} ${index + 1}`)
  const subCategories =
    ((category as unknown as { sub_categories?: unknown[] }).sub_categories ?? []) as unknown[]
  const subCount = subCategories.length

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5EEF5] bg-white shadow-[0_8px_24px_-12px_rgba(3,44,68,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#78A3BE]/50 hover:shadow-[0_20px_40px_-16px_rgba(0,110,168,0.28)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#032C44] via-[#006EA8] to-[#41A0CA] opacity-90" />

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D7E8F4] bg-linear-to-br from-[#F0F7FC] to-[#E5F3FD] shadow-inner">
            {iconSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconSrc} alt="" className="h-8 w-8 object-contain" />
            ) : (
              <Tag className="h-6 w-6 text-[#78A3BE]" />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onDelete}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
              title={t("deleteCategoryTitle")}
              aria-label={t("deleteCategoryTitle")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#032C44]">{displayName}</h3>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FB] px-2.5 py-1 text-xs font-semibold text-[#006EA8]">
            <Layers className="h-3.5 w-3.5" />
            {subCount} {subCount === 1 ? t("subCategory") : t("subCategories")}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center justify-center gap-2 border-t border-[#EBF2F7] bg-[#F8FBFF] px-4 py-3 text-sm font-semibold text-[#006EA8] transition-colors hover:bg-[#EBF5FB]"
      >
        <Pencil className="h-3.5 w-3.5" />
        {t("editCategory")}
      </button>
    </article>
  )
}
