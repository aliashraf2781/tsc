"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { PrimaryButton } from "@/components/ui/primary-button"
import { saveCountryAction } from "@/features/admin/actions/admin-actions"
import { Globe, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import {
  LOCALES,
  createCountryFormSchema,
  type AdminCountry,
  type CountryFormValues,
  type LocaleKey,
} from "@/features/admin/lib/country-form-schema"
import {
  fillLocaleFallback,
  formatCountryCodeForDisplay,
  mapCountryToFormDefaults,
} from "@/features/admin/lib/country-form-utils"
import { normalizeCountryCode } from "@/lib/api/services/countries.service"

export function CountryCard({
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
  initial?: AdminCountry
  locale: string
  editLocale: LocaleKey
  defaultExpanded?: boolean
  onDeleteRequest: () => void
  onSaved?: () => void
}) {
  const t = useTranslations("Admin.countries")
  const [expanded, setExpanded] = useState(!!defaultExpanded)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  const schema = createCountryFormSchema({
    nameRequired: t("errors.nameRequired"),
    codeRequired: t("errors.codeRequired"),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mapCountryToFormDefaults(initial),
  })

  useEffect(() => {
    if (defaultExpanded) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const watchedName = watch("name")
  const watchedCode = watch("code")

  const onSubmit = handleSubmit((values) => {
    setError(null)

    const formData = new FormData()
    if (id) formData.append("id", String(id))

    const filledName = fillLocaleFallback(values.name)
    for (const lang of LOCALES) {
      formData.append(`name[${lang}]`, filledName[lang])
    }

    // Match signup/login phone_code: dial digits get a leading "+"
    formData.append("code", normalizeCountryCode(values.code))

    startTransition(async () => {
      const result = await saveCountryAction(formData, locale, id)
      if (!result.ok) {
        setError(result.message ?? t("errors.save"))
        toast.error(result.message ?? t("errors.save"))
        return
      }
      toast.success(t("savedSuccessfully"))
      onSaved?.()
      router.refresh()
    })
  })

  const previewName =
    watchedName?.[editLocale] ||
    watchedName?.ar ||
    watchedName?.en ||
    watchedName?.de ||
    `${t("defaultName")} ${index + 1}`
  const previewCode = watchedCode ? formatCountryCodeForDisplay(watchedCode) : ""

  return (
    <div ref={cardRef} className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#78A3BE] bg-[#F0F4F8]">
          <Globe className="h-4 w-4 text-[#78A3BE]" />
        </div>

        <button type="button" onClick={() => setExpanded((v) => !v)} className="flex flex-1 items-center gap-2 text-start min-w-0">
          <span className="truncate text-sm font-semibold text-[#111827]">{previewName}</span>
          {previewCode && (
            <span className="ms-1 shrink-0 rounded-full bg-[#006EA8]/10 px-2 py-0.5 text-xs font-mono font-medium text-[#006EA8]" dir="ltr">
              {previewCode}
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
          title={t("deleteCountryTitle")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <form onSubmit={onSubmit} className="p-4 space-y-5">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
          )}
          {(errors.name || errors.code) && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {errors.name?.message || errors.code?.message}
            </p>
          )}

          <label className="block text-sm text-[#374151]">
            <span className="mb-1 flex items-center gap-1.5 font-medium">
              <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
                {editLocale.toUpperCase()}
              </span>
              {t("countryName")}
            </span>
            <input
              type="text"
              {...register(`name.${editLocale}`)}
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
            />
          </label>

          <label className="block text-sm text-[#374151]">
            <span className="mb-1 block font-medium">{t("code")}</span>
            <span className="mb-2 block text-xs text-[#6B7280]">{t("codeHint")}</span>
            <input
              type="text"
              dir="ltr"
              placeholder="+49"
              {...register("code", {
                onBlur: (e) => {
                  const normalized = normalizeCountryCode(e.target.value)
                  if (normalized !== e.target.value) {
                    setValue("code", normalized, { shouldDirty: true, shouldValidate: true })
                  }
                },
              })}
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-mono focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
            />
          </label>

          <div className="flex gap-3 border-t border-[#E5E7EB] pt-3">
            <PrimaryButton type="submit" disabled={pending} className="h-10 rounded-lg px-6 text-sm">
              {pending ? t("saving") : t("saveCountry")}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  )
}
