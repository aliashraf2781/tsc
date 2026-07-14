"use client"

import { cn } from "@/lib/utils"

export function FileDropzoneField({
  id,
  accept,
  onFileChange,
  large,
  children,
}: {
  id: string
  accept: string
  onFileChange: (file: File) => void
  large?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      onClick={() => document.getElementById(id)?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) onFileChange(file)
      }}
      className={cn(
        "border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] hover:bg-[#EBF7FF] transition rounded-[12px] px-4 flex flex-col items-center justify-center cursor-pointer text-center",
        large ? "py-10" : "py-6"
      )}
    >
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileChange(file)
          e.target.value = ""
        }}
        className="hidden"
      />
      <img
        src="/portfolio/drop.svg"
        alt="Upload"
        className={cn(large ? "w-[50px] h-[50px] mb-3" : "w-[36px] h-[36px] mb-2")}
      />
      {children}
    </div>
  )
}
