import * as React from "react"
import Image from "next/image"

type AuthFieldRowProps = {
  iconSrc: string
  placeholder: string
  type?: string
  endIconSrc?: string
  endIconButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export function AuthFieldRow({
  iconSrc,
  placeholder,
  type = "text",
  endIconSrc,
  endIconButtonProps,
}: AuthFieldRowProps) {
  return (
    <label className="flex h-[52px] items-center justify-between gap-2 border-b border-white py-4">
      <div className="flex min-w-0 items-center gap-2">
        <Image src={iconSrc} alt="" width={20} height={20} aria-hidden />
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent text-base leading-6 text-white placeholder:text-white focus:outline-none"
        />
      </div>
      {endIconSrc ? (
        <button type="button" className="cursor-pointer" {...endIconButtonProps}>
          <Image src={endIconSrc} alt="" width={20} height={20} aria-hidden />
        </button>
      ) : null}
    </label>
  )
}
