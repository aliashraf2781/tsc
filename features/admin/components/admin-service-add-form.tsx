"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "@/i18n/navigation"
import { saveServiceAction } from "@/features/admin/actions/admin-actions"
import { ServiceFormShell } from "./service-form/service-form-shell"
import { serviceFormSchema } from "./service-form/schema"
import { emptyServiceForm, type ServiceFormValues } from "./service-form/types"
import { serviceFormToFormData } from "./service-form/to-form-data"

export function AdminServiceAddForm({ locale }: { locale: string }) {
  const isRTL = locale === "ar"
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: emptyServiceForm(),
  })

  function onSubmit(data: ServiceFormValues) {
    setSubmitError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await saveServiceAction(serviceFormToFormData(data), locale)
      if (!result.ok) {
        setSubmitError(result.message ?? (isRTL ? "فشل الحفظ" : "Failed to save"))
        return
      }
      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        router.push(`/dashboard/admin/services`)
      }, 1200)
    })
  }

  return (
    <ServiceFormShell
      locale={locale}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
      submitError={submitError}
      success={success}
      submitLabel={isRTL ? "إنشاء الخدمة" : "Create Service"}
      pendingLabel={isRTL ? "جاري الحفظ..." : "Saving..."}
      successMessage={isRTL ? "✓ تم الحفظ بنجاح، جاري التوجيه..." : "✓ Saved successfully, redirecting..."}
      backHref="/dashboard/admin/services"
    />
  )
}
