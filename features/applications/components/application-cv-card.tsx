import { Card } from "@/components/ui/card"
import { getFilenameFromUrl } from "../lib/format"
import type { ApplicationDetailLabels } from "../lib/labels"

export function ApplicationCvCard({
  cvUrl,
  labels,
}: {
  cvUrl?: string
  labels: ApplicationDetailLabels
}) {
  return (
    <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
      <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">{labels.cv}</h2>
      {cvUrl ? (
        <div className="flex items-center gap-3 border border-[#E5E7EB] rounded-[12px] p-4 bg-[#F4FAFF]">
          <img src="/portfolio/pdf.svg" alt="PDF" className="w-10 h-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#032C44] truncate">{getFilenameFromUrl(cvUrl)}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{labels.pdfDocument}</p>
          </div>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#006EA8] hover:underline"
          >
            {labels.view}
          </a>
        </div>
      ) : (
        <div className="text-center py-2 text-gray-400 text-sm font-medium">{labels.noCv}</div>
      )}
    </Card>
  )
}
