"use client"

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { CountryPhoneSelect } from "@/components/ui/country-select"
import type { ContactFormValues } from "../lib/contact-form-schema"
import { contactFieldClassName } from "./contact-text-field"

interface ContactPhoneFieldProps {
  control: Control<ContactFormValues>
  register: UseFormRegister<ContactFormValues>
  errors: FieldErrors<ContactFormValues>
  label: string
  countryPlaceholder: string
  phonePlaceholder: string
}

export function ContactPhoneField({
  control,
  register,
  errors,
  label,
  countryPlaceholder,
  phonePlaceholder,
}: ContactPhoneFieldProps) {
  const error = errors.phone || errors.countryCode

  return (
    <div className="space-y-4">
      <label htmlFor="phone" className="text-base font-medium text-[#262626]">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <Controller
          control={control}
          name="countryCode"
          render={({ field }) => (
            <CountryPhoneSelect
              value={field.value}
              onValueChange={field.onChange}
              placeholder={countryPlaceholder}
              className={`w-[92px] ${contactFieldClassName}`}
            />
          )}
        />
        <Input
          id="phone"
          type="tel"
          dir="ltr"
          placeholder={phonePlaceholder}
          className={`min-w-0 flex-1 ${contactFieldClassName}`}
          {...register("phone")}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  )
}
