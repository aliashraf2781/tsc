"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Send, CheckCircle2, AlertCircle } from "lucide-react"
import { sendContactAction } from "../actions"

export function ContactForm() {
  const t = useTranslations("Landing.contact")
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ ok?: boolean; message?: string } | null>(null)
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState(null)
    const fd = new FormData()
    fd.append("name", inputs.name)
    fd.append("email", inputs.email)
    fd.append("phone", inputs.phone)
    fd.append("subject", inputs.subject)
    fd.append("message", inputs.message)

    startTransition(async () => {
      const result = await sendContactAction(null, fd)
      setState(result)
      if (result.ok) {
        setInputs({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      {state && (
        <div
          className={`flex items-center gap-3 rounded-lg p-4 text-sm border ${
            state.ok
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <label htmlFor="name" className="text-base font-medium text-[#262626]">
              {t("form.nameLabel")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              required
              placeholder={t("form.namePlaceholder")}
              className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0 bg-transparent text-[#262626]"
            />
          </div>
          <div className="space-y-4">
            <label htmlFor="email" className="text-base font-medium text-[#262626]">
              {t("form.emailLabel")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={inputs.email}
              onChange={handleChange}
              required
              placeholder={t("form.emailPlaceholder")}
              className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0 bg-transparent text-[#262626]"
            />
          </div>
          <div className="space-y-4">
            <label htmlFor="phone" className="text-base font-medium text-[#262626]">
              {t("form.phoneLabel")}
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={inputs.phone}
              onChange={handleChange}
              placeholder={t("form.phonePlaceholder")}
              className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0 bg-transparent text-[#262626]"
            />
          </div>
          <div className="space-y-4">
            <label htmlFor="subject" className="text-base font-medium text-[#262626]">
              {t("form.subjectLabel")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="subject"
              name="subject"
              value={inputs.subject}
              onChange={handleChange}
              required
              placeholder={t("form.subjectPlaceholder")}
              className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0 bg-transparent text-[#262626]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label htmlFor="message" className="text-base font-medium text-[#262626]">
            {t("form.messageLabel")} <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="message"
            name="message"
            value={inputs.message}
            onChange={handleChange}
            required
            placeholder={t("form.messagePlaceholder")}
            className="min-h-[88px] resize-none rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0 bg-transparent text-[#262626]"
          />
        </div>

        <PrimaryButton type="submit" disabled={isPending} className="h-12 px-6">
          <Send className="h-4 w-4 shrink-0" />
          <span>{isPending ? t("form.sending") || "Sending..." : t("form.send")}</span>
        </PrimaryButton>
      </form>
    </div>
  )
}
