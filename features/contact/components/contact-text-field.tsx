"use client"

import type { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export const contactFieldClassName =
  "h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0 bg-transparent text-[#262626]"

interface ContactTextFieldProps {
  id: string
  label: string
  placeholder: string
  registration: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  multiline?: boolean
  type?: string
}

export function ContactTextField({
  id,
  label,
  placeholder,
  registration,
  error,
  required,
  multiline,
  type = "text",
}: ContactTextFieldProps) {
  return (
    <div className="space-y-4">
      <label htmlFor={id} className="text-base font-medium text-[#262626]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          className={`min-h-[88px] resize-none ${contactFieldClassName}`}
          {...registration}
        />
      ) : (
        <Input id={id} type={type} placeholder={placeholder} className={contactFieldClassName} {...registration} />
      )}
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  )
}
