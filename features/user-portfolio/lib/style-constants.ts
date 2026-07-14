import { cn } from "@/lib/utils"

export const labelClass = "text-[14px] font-bold text-[#032C44] text-start mb-1.5 block"
export const inputClass =
  "w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#525252] bg-transparent outline-none transition-colors focus:border-[#40A0CA] placeholder:text-[#A3A3A3] shadow-none rounded-none border-t-0 border-l-0 border-r-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0"
export const selectClass =
  "w-full border-b border-[#D4D4D4] py-2.5 pr-8 pl-0 text-sm text-[#525252] bg-transparent outline-none transition-colors focus:border-[#40A0CA] appearance-none cursor-pointer rounded-none border-t-0 border-l-0 border-r-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0"
export const textareaClass =
  "w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#525252] bg-transparent outline-none transition-colors focus:border-[#40A0CA] placeholder:text-[#A3A3A3] shadow-none rounded-none border-t-0 border-l-0 border-r-0 px-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0"

export function gradientTitleClasses(isAr: boolean) {
  return cn(
    "bg-clip-text text-transparent",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )
}

export function getFilenameFromUrl(url?: string | null) {
  if (!url) return ""
  return url.substring(url.lastIndexOf("/") + 1)
}
