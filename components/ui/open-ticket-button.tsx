"use client"

import React from "react"
import { PrimaryButton } from "./primary-button"
import { useTranslations } from "next-intl"

export default function OpenTicketButton({ locale }: { locale: string }) {
  const t = useTranslations("Ui.common")

  const handleClick = () => {
    // Dispatch a simple event the TicketsClient listens to
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-new-ticket"))
    }
  }

  return (
    <div>
      <PrimaryButton onClick={handleClick} className="px-4 py-2 max-w-[180px]">
        <span className="text-[16px] font-bold">+</span>
        <span className="mr-2">{t ? t("newTicket") : (locale === "ar" ? "تذكرة جديدة" : "New Ticket")}</span>
      </PrimaryButton>
    </div>
  )
}
