import { getFilenameFromUrl } from "../lib/format"

export function DocumentAttachmentLink({ url }: { url?: string }) {
  if (!url) return null

  return (
    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#006EA8]">
      <img src="/portfolio/pdf.svg" alt="PDF" className="w-5 h-5 shrink-0" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold hover:underline truncate max-w-[250px]"
      >
        {getFilenameFromUrl(url)}
      </a>
    </div>
  )
}
