"use client"

import Image from "next/image"
import { Tag, Pencil } from "lucide-react"

export function CategoryIconUpload({
  iconSrc,
  hasNewFile,
  labels,
  onChange,
  onRemove,
}: {
  iconSrc: string | null
  hasNewFile: boolean
  labels: { icon: string; changeIcon: string; uploadIcon: string; remove: string }
  onChange: (file: File) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-[#006EA8]">{labels.icon}</p>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#78A3BE] bg-white">
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={28} height={28} className="h-7 w-7 object-contain" unoptimized />
          ) : (
            <Tag className="h-6 w-6 text-[#78A3BE]" />
          )}
        </div>
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 rounded-lg border border-[#006EA8] px-3 py-1.5 text-sm font-medium text-[#006EA8] hover:bg-[#006EA8]/10 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
            {iconSrc ? labels.changeIcon : labels.uploadIcon}
          </span>
          <input
            type="file"
            accept="image/*,.svg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onChange(file)
            }}
          />
        </label>
        {hasNewFile && (
          <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:underline">
            {labels.remove}
          </button>
        )}
      </div>
    </div>
  )
}
