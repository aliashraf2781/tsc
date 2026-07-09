"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { PortfolioSectionCard } from "./portfolio-section-card"
import { FileDropzoneField } from "./file-dropzone-field"
import { getFilenameFromUrl } from "../lib/style-constants"

export function CvUploadSection({
  locale,
  cv,
  cvFile,
  onFileSelected,
  onClear,
  onRemove,
}: {
  locale: string
  cv: string | null
  cvFile: File | null
  onFileSelected: (file: File) => void
  onClear: () => void
  onRemove: () => void
}) {
  const t = useTranslations("UserPortfolio")

  function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error(t("cv.pdfOnlyError"))
      return
    }
    onFileSelected(file)
  }

  return (
    <PortfolioSectionCard locale={locale} title={t("cv.title")}>
      <FileDropzoneField id="cvFile" accept=".pdf" onFileChange={handleFile} large>
        <p className="text-[#032C44] text-[15px] font-medium">
          {t.rich("cv.dropText", {
            browse: (chunks) => <span className="text-[#006EA8] underline">{chunks}</span>,
          })}
        </p>
        <p className="text-[#6B7280] text-[12px] mt-1">{t("cv.supportsPdf")}</p>
      </FileDropzoneField>

      {cvFile ? (
        <div className="mt-4 flex items-center justify-between p-3 bg-[#FFF9EB] border border-[#F5D98B] rounded-[8px]">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/portfolio/pdf.svg" alt="PDF" className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] sm:max-w-md">
              {cvFile.name}
            </span>
            <span className="text-[11px] font-semibold text-[#92650B] bg-[#FEF3C7] px-2 py-0.5 rounded-full flex-shrink-0">
              {t("cv.pendingSave")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-red-600 hover:underline flex-shrink-0"
          >
            {t("common.remove")}
          </button>
        </div>
      ) : cv && (
        <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-[8px]">
          <div className="flex items-center gap-2">
            <img src="/portfolio/pdf.svg" alt="PDF" className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] sm:max-w-md">
              {getFilenameFromUrl(cv)}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={cv}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#006EA8] hover:underline"
            >
              {t("cv.viewFile")}
            </a>
            <button
              type="button"
              onClick={onRemove}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              {t("common.remove")}
            </button>
          </div>
        </div>
      )}
    </PortfolioSectionCard>
  )
}
