"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Send } from "lucide-react"
import { getCountryByCode } from "@/lib/countries"
import { sendContactAction } from "../actions"
import { createContactFormSchema, type ContactFormValues } from "../lib/contact-form-schema"
import { ContactTextField } from "./contact-text-field"
import { ContactPhoneField } from "./contact-phone-field"
import { ContactFormStatus, type ContactFormState } from "./contact-form-status"

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  countryCode: "",
  phone: "",
  subject: "",
  message: "",
}

export function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("Landing.contact")
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<ContactFormState | null>(null)

  const schema = createContactFormSchema({
    nameRequired: t("form.errors.nameRequired"),
    emailRequired: t("form.errors.emailRequired"),
    emailInvalid: t("form.errors.emailInvalid"),
    subjectRequired: t("form.errors.subjectRequired"),
    messageRequired: t("form.errors.messageRequired"),
    phoneInvalid: t("form.errors.phoneInvalid"),
    countryRequired: t("form.errors.countryRequired"),
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = (values: ContactFormValues) => {
    setState(null)
    const dialCode = values.countryCode ? getCountryByCode(values.countryCode)?.dialCode ?? "" : ""
    const phone = values.phone ? `${dialCode}${values.phone.replace(/\s+/g, "")}` : ""

    const fd = new FormData()
    fd.append("name", values.name)
    fd.append("email", values.email)
    fd.append("phone", phone)
    fd.append("subject", values.subject)
    fd.append("message", values.message)
    fd.append("locale", locale)

    startTransition(async () => {
      const result = await sendContactAction(null, fd)
      setState(result)
      if (result.ok) {
        reset(defaultValues)
      }
    })
  }

  return (
    <div className="space-y-6">
      <ContactFormStatus state={state} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <ContactTextField
            id="name"
            label={t("form.nameLabel")}
            placeholder={t("form.namePlaceholder")}
            required
            registration={register("name")}
            error={errors.name}
          />
          <ContactTextField
            id="email"
            label={t("form.emailLabel")}
            placeholder={t("form.emailPlaceholder")}
            type="email"
            required
            registration={register("email")}
            error={errors.email}
          />
          <ContactPhoneField
            control={control}
            register={register}
            errors={errors}
            label={t("form.phoneLabel")}
            countryPlaceholder={t("form.countryPlaceholder")}
            phonePlaceholder={t("form.phonePlaceholder")}
          />
          <ContactTextField
            id="subject"
            label={t("form.subjectLabel")}
            placeholder={t("form.subjectPlaceholder")}
            required
            registration={register("subject")}
            error={errors.subject}
          />
        </div>

        <ContactTextField
          id="message"
          label={t("form.messageLabel")}
          placeholder={t("form.messagePlaceholder")}
          required
          multiline
          registration={register("message")}
          error={errors.message}
        />

        <PrimaryButton type="submit" disabled={isPending} className="h-12 px-6">
          <Send className="h-4 w-4 shrink-0" />
          <span>{isPending ? t("form.sending") : t("form.send")}</span>
        </PrimaryButton>
      </form>
    </div>
  )
}
