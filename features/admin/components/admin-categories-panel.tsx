"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { PrimaryButton } from "@/components/ui/primary-button"
import {
  saveCategoryAction,
  deleteCategoryAction,
} from "@/features/admin/actions/admin-actions"
import type { Category } from "@/lib/api/types"
import { resolveImageUrl } from "@/lib/utils"
import { Tag, Plus, Trash2, ChevronDown, ChevronUp, X, Pencil, Layers } from "lucide-react"

const LOCALES = ["ar", "en", "de"] as const
type LocaleKey = (typeof LOCALES)[number]


type SubCategoryForm = {
  id?: number
  name: Record<LocaleKey, string>
}

type CategoryForm = {
  id?: number
  name: Record<LocaleKey, string>
  slug: string
  iconFile?: File | null
  iconPreview?: string | null
  existingIcon?: string
  subCategories?: SubCategoryForm[]
}

function emptyLocale(): Record<LocaleKey, string> {
  return { ar: "", en: "", de: "" }
}

function emptyCategory(): CategoryForm {
  return { name: emptyLocale(), slug: "", subCategories: [] }
}

function mapCategoryToForm(cat: Category): CategoryForm {
  // Normalize `name` which may be a string or a per-locale object
  const toLocales = (val: any) => {
    if (!val) return emptyLocale()
    if (typeof val === "string") return { ar: val, en: val, de: val }
    // handle objects like { ar, en, de } or { name: '...' }
    return {
      ar: (val.ar ?? val.name ?? val.en ?? val.de ?? "") as string,
      en: (val.en ?? val.name ?? val.ar ?? val.de ?? "") as string,
      de: (val.de ?? val.name ?? val.ar ?? val.en ?? "") as string,
    }
  }

  return {
    id: cat.id,
    name: toLocales(cat.name),
    slug: cat.slug ?? "",
    existingIcon: cat.icon,
    subCategories: (cat.sub_categories ?? []).map((s) => ({
      id: s.id,
      name: toLocales(s.name),
    })),
  }
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]/g, "")
}

function LocaleInput({
  label,
  values,
  onChange,
  onlyLocale,
}: {
  label: string
  values: Record<LocaleKey, string>
  onChange: (lang: LocaleKey, val: string) => void
  onlyLocale?: LocaleKey
}) {
  if (onlyLocale) {
    const lang = onlyLocale
    return (
      <label className="block text-sm text-[#374151]">
        <span className="mb-1 flex items-center gap-1.5 font-medium">
          <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
            {lang.toUpperCase()}
          </span>
          {label}
        </span>
        <input
          type="text"
          value={values[lang] || ""}
          onChange={(e) => onChange(lang, e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
        />
      </label>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {LOCALES.map((lang) => (
        <label key={lang} className="block text-sm text-[#374151]">
          <span className="mb-1 flex items-center gap-1.5 font-medium">
            <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
              {lang.toUpperCase()}
            </span>
            {label}
          </span>
          <input
            type="text"
            value={values[lang] || ""}
            onChange={(e) => onChange(lang, e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
          />
        </label>
      ))}
    </div>
  )
}

function CategoryCard({
  category,
  index,
  locale,
  onlyLocale,
  onUpdate,
  onDelete,
}: {
  category: CategoryForm
  index: number
  locale: string
  onlyLocale?: LocaleKey
  onUpdate: (updated: CategoryForm) => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const isRTL = locale === "ar"

  function updateName(lang: LocaleKey, val: string) {
    const updated = { ...category, name: { ...category.name, [lang]: val } }
    if (lang === "ar" && !category.slug) {
      updated.slug = slugify(val)
    }
    onUpdate(updated)
  }

  async function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    onUpdate({ ...category, iconFile: file, iconPreview: preview })
  }

  function addSubCategory() {
    onUpdate({
      ...category,
      subCategories: [...(category.subCategories || []), { name: emptyLocale() }],
    })
  }

  function updateSubCategory(idx: number, lang: LocaleKey, val: string) {
    const subs = [...(category.subCategories || [])]
    subs[idx] = { ...subs[idx], name: { ...subs[idx].name, [lang]: val } }
    onUpdate({ ...category, subCategories: subs })
  }

  function removeSubCategory(idx: number) {
    const subs = (category.subCategories || []).filter((_, i) => i !== idx)
    onUpdate({ ...category, subCategories: subs })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    if (category.id) formData.append("id", String(category.id))

    for (const lang of LOCALES) {
      const n = category.name[lang]?.trim()
      if (n) formData.append(`name[${lang}]`, n)
    }

    const slug = category.slug?.trim() || slugify(category.name.ar || category.name.en || "")
    if (slug) formData.append("slug", slug)

    if (category.iconFile) formData.append("icon", category.iconFile)

    // Add sub_categories translatable names
    const subs = (category.subCategories || []).filter((s) =>
      Object.values(s.name).some((v) => v.trim())
    )
    subs.forEach((sub, idx) => {
      if (sub.id) formData.append(`sub_categories[${idx}][id]`, String(sub.id))
      for (const lang of LOCALES) {
        const val = sub.name[lang]?.trim()
        if (val) {
          formData.append(`sub_categories[${idx}][name][${lang}]`, val)
        }
      }
    })

    startTransition(async () => {
      const result = await saveCategoryAction(formData, locale, category.id)
      if (!result.ok) {
        setError(result.message ?? "فشل الحفظ")
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  const previewName = category.name.ar || category.name.en || `فئة ${index + 1}`
  const iconSrc = category.iconPreview || resolveImageUrl(category.existingIcon)
  const subCount = category.subCategories?.length ?? 0

  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
        {/* Icon thumbnail */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#78A3BE] bg-[#F0F4F8]">
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={20} height={20} className="h-5 w-5 object-contain" unoptimized />
          ) : (
            <Tag className="h-4 w-4 text-[#78A3BE]" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-start"
        >
          <span className="truncate text-sm font-semibold text-[#111827]">{previewName}</span>
          {category.slug && (
            <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs text-[#6B7280]">
              /{category.slug}
            </span>
          )}
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
          onClick={onDelete}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
          title="حذف الفئة"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
          )}
          {success && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
              ✓ {isRTL ? "تم الحفظ بنجاح" : "Saved successfully"}
            </p>
          )}

          {/* Names */}
          <LocaleInput label={isRTL ? "اسم الفئة" : "Category Name"} values={category.name} onChange={updateName} onlyLocale={onlyLocale} />

          {/* Slug */}
          <label className="block text-sm text-[#374151]">
            <span className="mb-1 block font-medium">{isRTL ? "الـ Slug (مسار URL)" : "Slug (URL path)"}</span>
            <input
              type="text"
              value={category.slug}
              onChange={(e) => onUpdate({ ...category, slug: e.target.value })}
              placeholder="مثال: software-engineering"
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-mono focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
            />
          </label>

          {/* Icon upload */}
          <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#006EA8]">
              {isRTL ? "الأيقونة" : "Icon"}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#78A3BE] bg-white">
                {iconSrc ? (
                  <Image src={iconSrc} alt="" width={28} height={28} className="h-7 w-7 object-contain" unoptimized />
                ) : (
                  <Tag className="h-6 w-6 text-[#78A3BE]" />
                )}
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-lg border border-[#006EA8] px-3 py-1.5 text-sm font-medium text-[#006EA8] hover:bg-[#006EA8]/10 transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                  {iconSrc ? (isRTL ? "تغيير الأيقونة" : "Change Icon") : (isRTL ? "رفع أيقونة" : "Upload Icon")}
                </span>
                <input type="file" accept="image/*,.svg" className="hidden" onChange={handleIconChange} />
              </label>
              {category.iconPreview && (
                <button
                  type="button"
                  onClick={() => onUpdate({ ...category, iconFile: null, iconPreview: null })}
                  className="text-xs text-red-500 hover:underline"
                >
                  {isRTL ? "إزالة" : "Remove"}
                </button>
              )}
            </div>
          </div>

          {/* Sub-Categories */}
          <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-[#006EA8]">
                {isRTL ? "الفئات الفرعية" : "Sub-Categories"}
              </p>
              <button
                type="button"
                onClick={addSubCategory}
                className="flex items-center gap-1.5 rounded-lg bg-[#006EA8]/10 px-3 py-1 text-xs font-semibold text-[#006EA8] hover:bg-[#006EA8]/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {isRTL ? "إضافة فرعية" : "Add Sub"}
              </button>
            </div>

            {(category.subCategories || []).length === 0 ? (
              <p className="text-xs text-[#9CA3AF] text-center py-2">
                {isRTL ? "لا توجد فئات فرعية" : "No sub-categories"}
              </p>
            ) : (
              <div className="space-y-3">
                {(category.subCategories || []).map((sub, idx) => (
                  <div key={sub.id ?? `new-${idx}`} className="rounded-lg border border-[#E5E7EB] bg-white p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-1.5">
                      <span className="text-xs font-bold text-[#006EA8]">
                        {isRTL ? "فئة فرعية" : "Sub-Category"} {sub.id ? `#${sub.id}` : `(${isRTL ? "جديدة" : "New"})`}
                      </span>
                      <button
                        type="button"
                        title={isRTL ? "حذف" : "Remove"}
                        onClick={() => removeSubCategory(idx)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <LocaleInput label={isRTL ? "الاسم" : "Name"} values={sub.name} onChange={(l, v) => updateSubCategory(idx, l, v)} onlyLocale={onlyLocale} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t border-[#E5E7EB] pt-3">
            <PrimaryButton type="submit" disabled={pending} className="h-10 rounded-lg px-6 text-sm">
              {pending ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ الفئة" : "Save Category")}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  )
}

import { AdminPageLayout } from "./admin-page-layout"

export function AdminCategoriesPanel({
  categories,
  locale,
}: {
  categories: Category[]
  locale: string
}) {
  const [forms, setForms] = useState<CategoryForm[]>(() =>
    categories.length > 0 ? categories.map(mapCategoryToForm) : []
  )
  const [editLocale, setEditLocale] = useState<LocaleKey>("ar")
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deletePending, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()
  const isRTL = locale === "ar"

  function addCategory() {
    setForms((prev) => [...prev, emptyCategory()])
  }

  function handleDelete(index: number) {
    const form = forms[index]
    if (!form.id) {
      setForms((prev) => prev.filter((_, i) => i !== index))
      return
    }
    setDeleteConfirm(index)
  }

  function confirmDelete() {
    if (deleteConfirm === null) return
    const form = forms[deleteConfirm]
    if (!form.id) {
      setForms((prev) => prev.filter((_, i) => i !== deleteConfirm))
      setDeleteConfirm(null)
      return
    }
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteCategoryAction(form.id!, locale)
      if (!result.ok) {
        setDeleteError(result.message ?? "فشل الحذف")
        return
      }
      setForms((prev) => prev.filter((_, i) => i !== deleteConfirm))
      setDeleteConfirm(null)
      router.refresh()
    })
  }

  return (
    <AdminPageLayout
      title={isRTL ? "إدارة الفئات" : "Manage Categories"}
      description={
        isRTL
          ? "أضف وعدّل فئات الوظائف المعروضة في صفحة الوظائف والرئيسية"
          : "Add and edit job categories shown on the jobs and home pages"
      }
      action={
        <PrimaryButton
          type="button"
          onClick={addCategory}
          className="w-auto sm:w-auto h-10 px-5 mx-0 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>{isRTL ? "إضافة فئة" : "Add Category"}</span>
        </PrimaryButton>
      }
    >
      <div className="space-y-6">
        {/* Delete confirm modal */}
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[min(95vw,420px)] rounded-[16px] bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-[#111827]">
                {isRTL ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>
              <p className="mt-2 text-sm text-[#6B7280]">
                {isRTL
                  ? "هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this category? This action cannot be undone."}
              </p>
              {deleteError && (
                <p className="mt-2 text-sm text-red-600">{deleteError}</p>
              )}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirm(null); setDeleteError(null) }}
                  className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={deletePending}
                  onClick={confirmDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deletePending ? (isRTL ? "جاري الحذف..." : "Deleting...") : (isRTL ? "حذف" : "Delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#6B7280]">{isRTL ? "اللغة:" : "Language:"}</label>
          {LOCALES.map((loc) => (
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

        {forms.length === 0 && (
          <div className="rounded-[12px] border border-dashed border-[#78A3BE] bg-[#F8FBFF] py-16 text-center">
            <Tag className="mx-auto h-10 w-10 text-[#78A3BE]" />
            <p className="mt-3 text-sm text-[#9CA3AF]">
              {isRTL ? "لا توجد فئات. اضغط \"إضافة فئة\" للبدء." : "No categories. Click \"Add Category\" to start."}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {forms.map((category, realIndex) => {
            const formIndex = forms.indexOf(category)
            return (
              <CategoryCard
                key={category.id ?? `new-${realIndex}`}
                category={category}
                index={formIndex}
                  locale={locale}
                  onlyLocale={editLocale}
                onUpdate={(updated) =>
                  setForms((prev) => prev.map((c, i) => (i === formIndex ? updated : c)))
                }
                onDelete={() => handleDelete(formIndex)}
              />
            )
          })}
        </div>
      </div>
    </AdminPageLayout>
  )
}
