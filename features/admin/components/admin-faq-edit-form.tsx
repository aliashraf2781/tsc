"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { PrimaryButton } from "@/components/ui/primary-button"
import { saveFaqAction } from "@/features/admin/actions/admin-actions"
import { ArrowLeft, Save, X } from "lucide-react"

const LOCALES = ["ar", "en", "de"] as const
type LocaleKey = (typeof LOCALES)[number]

function emptyLocale(): Record<LocaleKey, string> {
  return { ar: "", en: "", de: "" }
}

function parseLocalizedField(value: unknown, locale: LocaleKey): Record<LocaleKey, string> {
  const out = emptyLocale()
  if (!value) return out

  if (typeof value === "string") {
    out[locale] = value
    return out
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (typeof obj.ar === "string" || typeof obj.en === "string" || typeof obj.de === "string") {
      out.ar = typeof obj.ar === "string" ? obj.ar : ""
      out.en = typeof obj.en === "string" ? obj.en : ""
      out.de = typeof obj.de === "string" ? obj.de : ""
      return out
    }

    for (const k of Object.keys(obj)) {
      const m = k.match(/_?(ar|en|de)$/)
      if (m) {
        const l = m[1] as LocaleKey
        const v = obj[k]
        if (typeof v === "string") out[l] = v
      }
    }

    for (const l of LOCALES) {
      const v = (obj as Record<string, unknown>)[l]
      if (typeof v === "string") out[l] = v
    }

    return out
  }

  return out
}

function LocaleInput({
  label,
  values,
  onChange,
  multiline = false,
  required = false,
  onlyLocale,
}: {
  label: string
  values: Record<LocaleKey, string>
  onChange: (lang: LocaleKey, val: string) => void
  multiline?: boolean
  required?: boolean
  onlyLocale?: LocaleKey
}) {
  return (
    <div>
      {(() => {
        const lang = onlyLocale ?? ("ar" as LocaleKey)
        return (
          <label className="block text-sm text-[#374151]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium">
              <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">{lang.toUpperCase()}</span>
              <span>{label}</span>
              {required && lang === "ar" && <span className="text-red-500">*</span>}
            </span>
            {multiline ? (
              <textarea
                rows={3}
                value={values[lang] || ""}
                onChange={(e) => onChange(lang, e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
              />
            ) : (
              <input
                type="text"
                value={values[lang] || ""}
                onChange={(e) => onChange(lang, e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
              />
            )}
          </label>
        )
      })()}
    </div>
  )
}

export function AdminFaqEditForm({ faq, locale, isNew = false }: { faq?: any; locale: string; isNew?: boolean }) {
  const t = useTranslations("Admin.faqs")
  const isRTL = locale === "ar"
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editLocale, setEditLocale] = useState<LocaleKey>((locale as LocaleKey) || "ar")

  const [form, setForm] = useState(() => {
    if (!faq || isNew) {
      return {
        question: emptyLocale(),
        answer: emptyLocale(),
      }
    }

    const allLocales = (faq as any).__allLocales as Record<string, any> | undefined
    if (allLocales) {
      const q = emptyLocale()
      const a = emptyLocale()

      for (const loc of LOCALES) {
        const item = allLocales[loc] ?? {}
        const parsedQ = parseLocalizedField((item as any).question ?? item, loc as LocaleKey)
        const parsedA = parseLocalizedField((item as any).answer ?? item, loc as LocaleKey)
        q[loc] = parsedQ[loc] || ""
        a[loc] = parsedA[loc] || ""
      }

      return {
        id: faq.id,
        question: q,
        answer: a,
      }
    }

    const q = emptyLocale()
    const a = emptyLocale()

    if (typeof (faq as any).question_ar === "string") q.ar = (faq as any).question_ar
    if (typeof (faq as any).question_en === "string") q.en = (faq as any).question_en
    if (typeof (faq as any).question_de === "string") q.de = (faq as any).question_de
    if (!q.ar && !q.en && !q.de && typeof (faq as any).question === "string") {
      ;(q as any)[locale as LocaleKey] = (faq as any).question
    }

    if (typeof (faq as any).answer_ar === "string") a.ar = (faq as any).answer_ar
    if (typeof (faq as any).answer_en === "string") a.en = (faq as any).answer_en
    if (typeof (faq as any).answer_de === "string") a.de = (faq as any).answer_de
    if (!a.ar && !a.en && !a.de && typeof (faq as any).answer === "string") {
      ;(a as any)[locale as LocaleKey] = (faq as any).answer
    }

    return {
      id: faq.id,
      question: q,
      answer: a,
    }
  })

  function updateField(field: "question" | "answer", lang: LocaleKey, val: string) {
    setForm((prev: any) => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: val } }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    if ((form as any).id) formData.append("id", String((form as any).id))

    let hasQuestion = false
    for (const lang of LOCALES) {
      const q = (form as any).question[lang]?.trim()
      const a = (form as any).answer[lang]?.trim()
      if (q) {
        formData.append(`question[${lang}]`, q)
        hasQuestion = true
      }
      if (a) formData.append(`answer[${lang}]`, a)
    }

    if (!hasQuestion) {
      setError(t("errors.atLeastOneQuestion"))
      return
    }

    startTransition(async () => {
      const result = await saveFaqAction(formData, locale, (form as any).id)
      if (!result.ok) {
        setError(result.message ?? t("errors.save"))
        return
      }
      setSuccess(true)
      router.refresh()
      setTimeout(() => router.push(`/dashboard/admin/faqs`), 900)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <X className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <Save className="h-4 w-4 shrink-0" />
          <span>{t("messages.saved")}</span>
        </div>
      )}

      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">{t("titles.details")}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#6B7280]">{t("labels.language")}</label>
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

        <LocaleInput label={t("fields.question")} values={(form as any).question} onChange={(l, v) => updateField("question", l, v)} required onlyLocale={editLocale} />
        <LocaleInput label={t("fields.answer")} values={(form as any).answer} onChange={(l, v) => updateField("answer", l, v)} multiline onlyLocale={editLocale} />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <PrimaryButton type="submit" disabled={pending || success} className="h-11 rounded-lg px-8 text-sm font-semibold">
          <Save className="h-4 w-4 me-2 shrink-0" />
          <span>{pending ? t("actions.saving") : isNew ? t("actions.create") : t("actions.saveChanges")}</span>
        </PrimaryButton>
        <Link locale={locale} href="/dashboard/admin/faqs" className="h-11 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
          {t("actions.back")}
        </Link>
      </div>
    </form>
  )
}
