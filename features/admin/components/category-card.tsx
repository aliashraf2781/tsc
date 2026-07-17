"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { PrimaryButton } from "@/components/ui/primary-button"
import { saveCategoryAction } from "@/features/admin/actions/admin-actions"
import type { Category } from "@/lib/api/types"
import { extractMediaUrl, resolveImageUrl } from "@/lib/utils"
import { Tag, ChevronDown, ChevronUp, Trash2, Layers } from "lucide-react"
import {
  LOCALES,
  createCategoryFormSchema,
  type CategoryFormValues,
  type LocaleKey,
} from "@/features/admin/lib/category-form-schema"
import { mapCategoryToFormDefaults, fillLocaleFallback, slugify } from "@/features/admin/lib/category-form-utils"
import { CategoryLocaleField } from "./category-locale-field"
import { CategoryIconUpload } from "./category-icon-upload"
import { CategorySubCategoriesField } from "./category-sub-categories-field"

export function CategoryCard({
  id,
  index,
  initial,
  locale,
  editLocale,
  defaultExpanded,
  onDeleteRequest,
  onSaved,
}: {
  id?: number
  index: number
  initial?: Category
  locale: string
  editLocale: LocaleKey
  defaultExpanded?: boolean
  onDeleteRequest: () => void
  onSaved?: () => void
}) {
  const t = useTranslations("Admin.categories")
  const [expanded, setExpanded] = useState(!!defaultExpanded)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const previewUrlRef = useRef<string | null>(null)

  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const existingIcon = extractMediaUrl((initial as unknown as { icon?: unknown })?.icon)

  const schema = createCategoryFormSchema({ nameRequired: t("errors.nameRequired") })

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mapCategoryToFormDefaults(initial),
  })

  useEffect(() => {
    if (defaultExpanded) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  const watchedName = watch("name")
  const watchedSubCategories = watch("subCategories")

  function handleIconChange(file: File) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const preview = URL.createObjectURL(file)
    previewUrlRef.current = preview
    setIconFile(file)
    setIconPreview(preview)
    setError(null)
  }

  function handleIconRemove() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setIconFile(null)
    setIconPreview(null)
  }

  const onSubmit = handleSubmit((values) => {
    setError(null)

    const formData = new FormData()
    if (id) formData.append("id", String(id))

    const filledName = fillLocaleFallback(values.name)
    for (const lang of LOCALES) {
      formData.append(`name[${lang}]`, filledName[lang])
    }

    const slug = slugify(filledName.en || filledName.de || filledName.ar || "")
    if (slug) formData.append("slug", slug)

    if (iconFile) {
      formData.append("icon", iconFile, iconFile.name || "category-icon.png")
    }

    const subs = values.subCategories.filter((s) => Object.values(s.name).some((v) => v.trim()))
    subs.forEach((sub, subIndex) => {
      if (sub.subCategoryId) formData.append(`sub_categories[${subIndex}][id]`, String(sub.subCategoryId))
      const filledSubName = fillLocaleFallback(sub.name)
      for (const lang of LOCALES) {
        formData.append(`sub_categories[${subIndex}][name][${lang}]`, filledSubName[lang])
      }
    })

    startTransition(async () => {
      const result = await saveCategoryAction(formData, locale, id)
      if (!result.ok) {
        setError(result.message ?? t("errors.save"))
        toast.error(result.message ?? t("errors.save"))
        return
      }
      toast.success(t("savedSuccessfully"))
      handleIconRemove()
      onSaved?.()
      router.refresh()
    })
  })

  const previewName =
    watchedName?.[editLocale] || watchedName?.ar || watchedName?.en || watchedName?.de || `${t("defaultName")} ${index + 1}`
  const resolvedExisting = existingIcon ? resolveImageUrl(existingIcon) : ""
  const iconSrc = iconPreview || resolvedExisting || null
  const subCount = watchedSubCategories?.length ?? 0

  return (
    <div ref={cardRef} className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#78A3BE] bg-[#F0F4F8]">
          {iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconSrc} alt="" className="h-5 w-5 object-contain" />
          ) : (
            <Tag className="h-4 w-4 text-[#78A3BE]" />
          )}
        </div>

        <button type="button" onClick={() => setExpanded((v) => !v)} className="flex flex-1 items-center gap-2 text-start">
          <span className="truncate text-sm font-semibold text-[#111827]">{previewName}</span>
          {subCount > 0 && (
            <span className="ms-1 flex items-center gap-1 rounded-full bg-[#006EA8]/10 px-2 py-0.5 text-xs font-medium text-[#006EA8]">
              <Layers className="h-3 w-3" />
              {subCount}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="ms-auto h-4 w-4 text-[#9CA3AF] shrink-0" />
          ) : (
            <ChevronDown className="ms-auto h-4 w-4 text-[#9CA3AF] shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={onDeleteRequest}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
          title={t("deleteCategoryTitle")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <form onSubmit={onSubmit} className="p-4 space-y-5">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
          )}
          {errors.name && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {errors.name.message}
            </p>
          )}

          <CategoryLocaleField
            label={t("categoryName")}
            locale={editLocale}
            register={register}
            fieldPath={`name.${editLocale}`}
          />

          <CategoryIconUpload
            iconSrc={iconSrc}
            hasNewFile={Boolean(iconFile)}
            labels={{
              icon: t("icon"),
              changeIcon: t("changeIcon"),
              uploadIcon: t("uploadIcon"),
              remove: t("remove"),
            }}
            onChange={handleIconChange}
            onRemove={handleIconRemove}
            onError={(message) => {
              setError(message)
              toast.error(message)
            }}
          />

          <CategorySubCategoriesField
            control={control}
            register={register}
            editLocale={editLocale}
            labels={{
              title: t("subCategories"),
              add: t("addSub"),
              empty: t("noSubCategories"),
              subCategory: t("subCategory"),
              newItem: t("newItem"),
              name: t("name"),
              remove: t("remove"),
            }}
          />

          <div className="flex gap-3 border-t border-[#E5E7EB] pt-3">
            <PrimaryButton type="submit" disabled={pending} className="h-10 rounded-lg px-6 text-sm">
              {pending ? t("saving") : t("saveCategory")}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  )
}
