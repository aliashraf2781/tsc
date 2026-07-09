"use client"

import { useTranslations } from "next-intl"
import { PrimaryButton } from "@/components/ui/primary-button"

export function PortfolioSubmitBar({ saving, onSubmit }: { saving: boolean; onSubmit: () => void }) {
  const t = useTranslations("UserPortfolio")

  return (
    <div className="sticky bottom-0 -mx-6 sm:mx-0 bg-white/95 backdrop-blur border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-end gap-3 rounded-b-[16px] shadow-[0_-4px_14px_rgba(0,0,0,0.04)]">
      <PrimaryButton
        onClick={onSubmit}
        disabled={saving}
        className="w-auto h-[44px] px-8 rounded-[12px] flex items-center justify-center text-[15px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? t("submit.saving") : t("submit.submit")}
      </PrimaryButton>
    </div>
  )
}
