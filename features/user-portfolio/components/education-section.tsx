"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "@/components/ui/primary-button"
import { PortfolioSectionCard } from "./portfolio-section-card"
import { getFilenameFromUrl } from "../lib/style-constants"
import type { EducationItem } from "../types/portfolio.types"

export function EducationSection({
  locale,
  educations,
  onAdd,
  onEdit,
  onDelete,
}: {
  locale: string
  educations: EducationItem[]
  onAdd: () => void
  onEdit: (item: EducationItem) => void
  onDelete: (index: number) => void
}) {
  const t = useTranslations("UserPortfolio")
  const isAr = locale === "ar"

  return (
    <PortfolioSectionCard
      locale={locale}
      title={t("education.heading")}
      action={
        <PrimaryButton
          onClick={onAdd}
          className="w-auto h-[40px] px-4 rounded-[8px] flex items-center justify-center gap-1 text-[14px] font-semibold cursor-pointer"
        >
          <span className="text-[16px] font-bold">+</span>
          <span>{t("common.addNew")}</span>
        </PrimaryButton>
      }
    >
      {educations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {educations.map((edu, idx) => (
            <div
              key={idx}
              className="border border-[#E5E7EB] bg-white rounded-[12px] p-4 relative flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition"
            >
              <div className={cn("absolute top-3 flex gap-1", isAr ? "left-3" : "right-3")}>
                <button
                  onClick={() => onEdit(edu)}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                  title={t("common.edit")}
                >
                  <img src="/portfolio/edit.svg" alt="Edit" className="w-[16px] h-[16px]" />
                </button>
                <button
                  onClick={() => onDelete(idx)}
                  className="p-1 hover:bg-red-50 rounded-full transition"
                  title={t("common.delete")}
                >
                  <img src="/portfolio/remove.svg" alt="Remove" className="w-[16px] h-[16px]" />
                </button>
              </div>

              <div className="pe-12 ps-2">
                <h3 className="text-[16px] font-bold text-[#032C44] line-clamp-1 mb-1 leading-snug">
                  {t(`eduLevelLabels.${edu.levelOfEducation}`)}
                </h3>
                <p className="text-[13px] text-[#525252] font-semibold line-clamp-1">{edu.university}</p>
                <p className="text-[12px] text-[#6B7280] mt-1 font-medium">{edu.graduationYear}</p>
                <p className="text-[12px] text-[#525252] mt-1 font-semibold">
                  {t.rich(`grades.${edu.finalGrade}`, { ltr: (chunks) => <span dir="ltr">{chunks}</span> })}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-[#006EA8] truncate">
                <img src="/portfolio/pdf.svg" alt="PDF Icon" className="w-5 h-5 flex-shrink-0" />
                {edu.attachment ? (
                  <a
                    href={edu.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate font-semibold text-[11px] max-w-[130px] text-[#006EA8]"
                  >
                    {getFilenameFromUrl(edu.attachment)}
                  </a>
                ) : (
                  <span className="truncate text-gray-400 text-[11px] max-w-[130px]">
                    {edu.attachmentFile ? edu.attachmentFile.name : t("education.noAttachment")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">{t("education.empty")}</p>
      )}
    </PortfolioSectionCard>
  )
}
