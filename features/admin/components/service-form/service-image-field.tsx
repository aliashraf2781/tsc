"use client"

import Image from "next/image"
import { ImageIcon, Pencil } from "lucide-react"

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024

export function ServiceImageField({
  isRTL,
  imagePreview,
  existingImage,
  onFileChange,
  onRemove,
  onError,
}: {
  isRTL: boolean
  imagePreview?: string | null
  existingImage?: string
  onFileChange: (file: File, preview: string) => void
  onRemove: () => void
  onError: (message: string) => void
}) {
  const imageSrc = imagePreview || existingImage

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      onError(isRTL ? "نوع الملف غير مدعوم. استخدم PNG أو JPG أو WEBP" : "Unsupported file type. Use PNG, JPG or WEBP")
      return
    }
    if (file.size > MAX_SIZE) {
      onError(isRTL ? "حجم الملف أكبر من 5MB" : "File is larger than 5MB")
      return
    }

    onFileChange(file, URL.createObjectURL(file))
  }

  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <ImageIcon className="h-4 w-4 text-[#006EA8]" />
        <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
          {isRTL ? "صورة الخدمة" : "Service Image"}
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        {imageSrc ? (
          <div className="relative w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-gray-50 h-56 sm:h-48 md:h-56">
            <Image src={imageSrc} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex w-full h-56 sm:h-48 md:h-56 items-center justify-center rounded-xl border-dashed border-[#78A3BE] bg-[#F8FBFF]">
            <ImageIcon className="h-10 w-10 text-[#78A3BE]" />
          </div>
        )}

        <div className="flex flex-col items-center gap-2 w-full">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#006EA8] px-4 py-2 text-sm font-medium text-[#006EA8] hover:bg-[#006EA8]/10 transition-colors mx-auto">
              <Pencil className="h-4 w-4" />
              {imageSrc ? (isRTL ? "تغيير الصورة" : "Change Image") : (isRTL ? "رفع صورة" : "Upload Image")}
            </span>
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleChange} />
          </label>

          {imagePreview && (
            <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:underline">
              {isRTL ? "إزالة" : "Remove"}
            </button>
          )}

          <p className="text-xs text-[#9CA3AF]">
            {isRTL ? "PNG أو JPG أو WEBP · حجم أقصى 5MB" : "PNG, JPG or WEBP · Max size 5MB"}
          </p>
        </div>
      </div>
    </div>
  )
}
