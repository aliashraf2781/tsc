import { getAttachmentFilename } from "@/features/company-jobs/lib/company-application-format"

export function DocumentAttachmentLink({ url }: { url?: string | null }) {
  if (!url) return null

  return (
    <div className="mt-3 flex items-center gap-1.5 text-sm text-[#006EA8]">
      <img src="/portfolio/pdf.svg" alt="attachment" className="h-5 w-5 shrink-0" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-[280px] truncate font-semibold hover:underline"
      >
        {getAttachmentFilename(url)}
      </a>
    </div>
  )
}
