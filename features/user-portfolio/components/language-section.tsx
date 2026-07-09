"use client"

import { useTranslations } from "next-intl"
import { PrimaryButton } from "@/components/ui/primary-button"
import { PortfolioSectionCard } from "./portfolio-section-card"
import type { LanguageItem } from "../types/portfolio.types"

export function LanguageSection({
  locale,
  languages,
  onEdit,
}: {
  locale: string
  languages: LanguageItem[]
  onEdit: () => void
}) {
  const t = useTranslations("UserPortfolio")

  return (
    <PortfolioSectionCard
      locale={locale}
      title={t("language.heading")}
      action={
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E7EB] hover:bg-gray-50 rounded-[8px] text-[14px] font-semibold text-[#032C44] transition"
          >
            <img src="/portfolio/edit.svg" alt="Edit" className="w-[16px] h-[16px]" />
            <span>{t("common.edit")}</span>
          </button>
          <PrimaryButton
            onClick={onEdit}
            className="w-auto h-[40px] px-4 rounded-[8px] flex items-center justify-center gap-1 text-[14px] font-semibold cursor-pointer"
          >
            <span className="text-[16px] font-bold">+</span>
            <span>{t("common.addNew")}</span>
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-3">
        {languages.length > 0 ? (
          languages.map((lang, idx) => (
            <div key={idx} className="text-[#525252] text-[15px] font-medium flex items-center gap-1.5">
              <span className="font-bold text-[#032C44]">{lang.language}:</span>
              <span className="text-gray-600">{t(`levels.${lang.level}`)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic">{t("language.empty")}</p>
        )}
      </div>
    </PortfolioSectionCard>
  )
}
