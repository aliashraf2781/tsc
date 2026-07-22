"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { AuthFieldGroup } from "./auth-field-group"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { COUNTRIES as STATIC_COUNTRIES, getLocalizedCountries } from "@/lib/countries"
import { Check, MapPin, Search } from "lucide-react"

type FormValues = {
  name: string
  email: string
  phone: string
  phone_code: string
  password: string
  password_confirmation: string
  company_name?: string
  accept_terms: boolean
  country_id: string
}

type Props = {
  userTabLabel: string
  companyTabLabel: string
  tabListLabel: string
  fullNamePlaceholder: string
  emailPlaceholder: string
  passwordPlaceholder: string
  phonePlaceholder?: string
  confirmPasswordPlaceholder?: string
  companyNamePlaceholder?: string
  termsLabel?: string
  showPasswordLabel: string
  hidePasswordLabel: string
  submitLabel: string
  initialCountries?: CountryOption[]
}

type CountryOption = {
  id: number
  name: string
  code: string
  flag?: string
  phone_code?: string
}

const DEFAULT_DIAL_CODE = "+49"
const GERMANY_ISO = "DE"
const GERMANY_NAMES = new Set(["germany", "deutschland", "ألمانيا"])

function isGermanyCountry(c: CountryOption) {
  const code = c.code?.trim().toUpperCase()
  if (code === GERMANY_ISO || code === "+49" || code === "49") return true
  return GERMANY_NAMES.has(c.name?.trim().toLowerCase())
}

function findGermany(countries: CountryOption[]) {
  return countries.find(isGermanyCountry) ?? null
}

export function SignUpTabForm({
  userTabLabel,
  companyTabLabel,
  tabListLabel,
  fullNamePlaceholder,
  emailPlaceholder,
  passwordPlaceholder,
  phonePlaceholder = "Phone",
  confirmPasswordPlaceholder = "Confirm password",
  companyNamePlaceholder = "Company name",
  termsLabel,
  showPasswordLabel,
  hidePasswordLabel,
  submitLabel,
  initialCountries = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<"user" | "company">("company")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countries, setCountries] = useState<CountryOption[]>(initialCountries)
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [phoneSearch, setPhoneSearch] = useState("")
  const countryDropdownRef = useRef<HTMLDivElement>(null)
  const phoneDropdownRef = useRef<HTMLDivElement>(null)
  const previousCountryIdRef = useRef<string | null>(null)
  const { signUp, loading, error } = useAuth()
  const locale = useLocale()
  const t = useTranslations("Auth.signUp")
  const isRTL = locale === "ar"
  const localizedDialCountries = useMemo(() => getLocalizedCountries(locale), [locale])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      accept_terms: true,
      phone_code: DEFAULT_DIAL_CODE,
      country_id: (() => {
        const germany = findGermany(initialCountries)
        return germany ? String(germany.id) : ""
      })(),
    },
    mode: "onChange",
  })

  const acceptTerms = watch("accept_terms")
  const password = watch("password")
  const passwordConfirmation = watch("password_confirmation")
  const selectedCountryId = watch("country_id")
  const selectedDialCode = watch("phone_code") || DEFAULT_DIAL_CODE

  // Fetch countries if initialCountries is empty
  useEffect(() => {
    if (countries.length > 0) return
    async function loadCountries() {
      try {
        const res = await fetch(`/api/countries?locale=${locale}`)
        const json = await res.json()
        if (json && Array.isArray(json.data)) {
          setCountries(json.data)
        }
      } catch (err) {
        console.error("Error loading countries:", err)
      }
    }
    loadCountries()
  }, [locale, countries.length])

  // Default to Germany once the countries list is available (works in en/ar/de)
  useEffect(() => {
    if (countries.length === 0) return
    const germany = findGermany(countries)
    if (!germany) return
    if (!selectedCountryId || !countries.some((c) => String(c.id) === String(selectedCountryId))) {
      setValue("country_id", String(germany.id))
      setValue("phone_code", DEFAULT_DIAL_CODE)
    }
  }, [countries, selectedCountryId, setValue])

  // Update selected country object when country_id changes and sync phone dial code
  useEffect(() => {
    if (selectedCountryId && countries.length > 0) {
      const found = countries.find((c) => String(c.id) === String(selectedCountryId))
      setSelectedCountry(found || null)

      // Sync phone dial code
      if (found) {
        const sc = STATIC_COUNTRIES.find(
          s => s.dialCode === found.code || s.dialCode === `+${found.code}` || s.code.toLowerCase() === found.code.toLowerCase()
        )
        if (sc) {
          setValue("phone_code", sc.dialCode)
        } else if (found.phone_code) {
          setValue("phone_code", found.phone_code.startsWith("+") ? found.phone_code : `+${found.phone_code}`)
        } else if (found.code && found.code.startsWith("+")) {
          setValue("phone_code", found.code)
        }
      }
    }
  }, [selectedCountryId, countries, setValue])

  // Sync country selector when dial code changes
  const handleDialCodeChange = (newDialCode: string) => {
    setValue("phone_code", newDialCode)
    
    // Find matching country code from static countries
    const staticC = STATIC_COUNTRIES.find((c) => c.dialCode === newDialCode)
    if (staticC && countries.length > 0) {
      // API `code` may be dial (+49) or ISO (DE)
      const found = countries.find((c) => {
        const code = c.code?.trim().toLowerCase()
        return (
          code === staticC.code.toLowerCase() ||
          code === staticC.dialCode.toLowerCase() ||
          code === staticC.dialCode.replace("+", "").toLowerCase() ||
          c.phone_code === staticC.dialCode
        )
      })
      if (found) {
        setValue("country_id", String(found.id))
      }
    }
  }

  const handleTabChange = (tab: "user" | "company") => {
    if (tab === activeTab) return
    if (tab === "company") {
      previousCountryIdRef.current = selectedCountryId
      const germany = findGermany(countries)
      if (germany) {
        setValue("country_id", String(germany.id), { shouldDirty: true })
        setValue("phone_code", DEFAULT_DIAL_CODE, { shouldDirty: true })
      }
    } else if (previousCountryIdRef.current) {
      setValue("country_id", previousCountryIdRef.current, { shouldDirty: true })
    }
    setActiveTab(tab)
  }

  // If countries load after the company tab is already active, force the selection to Germany
  useEffect(() => {
    if (activeTab !== "company") return
    const germany = findGermany(countries)
    if (germany && String(selectedCountryId) !== String(germany.id)) {
      setValue("country_id", String(germany.id), { shouldDirty: true })
      setValue("phone_code", DEFAULT_DIAL_CODE, { shouldDirty: true })
    }
  }, [activeTab, countries, selectedCountryId, setValue])

  const passwordsMatch = !passwordConfirmation || password === passwordConfirmation

  // Close custom dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownOpen && countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false)
        setCountrySearch("")
      }
      if (phoneDropdownOpen && phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setPhoneDropdownOpen(false)
        setPhoneSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [countryDropdownOpen, phoneDropdownOpen])

  const toggleCountryDropdown = () => {
    setCountryDropdownOpen((open) => !open)
    setCountrySearch("")
    setPhoneDropdownOpen(false)
  }

  const togglePhoneDropdown = () => {
    setPhoneDropdownOpen((open) => !open)
    setPhoneSearch("")
    setCountryDropdownOpen(false)
  }

  const countryQuery = countrySearch.trim().toLowerCase()
  const availableCountries =
    activeTab === "company" ? countries.filter(isGermanyCountry) : countries
  const filteredCountries = countryQuery
    ? availableCountries.filter((c) => c.name.toLowerCase().includes(countryQuery))
    : availableCountries

  const phoneQuery = phoneSearch.trim().toLowerCase()
  const availableDialCountries =
    activeTab === "company"
      ? localizedDialCountries.filter(
          (c) =>
            c.code.toUpperCase() === GERMANY_ISO ||
            c.dialCode === DEFAULT_DIAL_CODE ||
            GERMANY_NAMES.has(c.name.trim().toLowerCase())
        )
      : localizedDialCountries
  const filteredDialCodes = phoneQuery
    ? availableDialCountries.filter(
        (c) => c.name.toLowerCase().includes(phoneQuery) || c.dialCode.includes(phoneQuery) || c.code.toLowerCase().includes(phoneQuery)
      )
    : availableDialCountries

  const baseTabClassName =
    "inline-flex h-[52px] min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 sm:h-[52px] sm:px-4 sm:text-base"
  const activeTabClassName =
    "border-[#9fc9e6] bg-gradient-to-b from-[#006ea8] to-[#005685] text-white shadow-[0_8px_24px_rgba(0,110,168,0.35)]"
  const inactiveTabClassName =
    "border-[#6b87a2] bg-[#02223b]/65 text-[#d9eef9] hover:bg-[#033a62]/70"

  async function onSubmit(values: FormValues) {
    if (!passwordsMatch) return
    if (!values.accept_terms) return

    const displayName =
      activeTab === "company" && values.company_name
        ? values.company_name
        : values.name
    // Combine phone with selected country dial code when available
    const fullPhone = `${values.phone_code}${values.phone}`

    try {
      await signUp({
        name: displayName,
        email: values.email,
        phone: fullPhone,
        password: values.password,
        password_confirmation: values.password_confirmation,
        type: activeTab,
        company_name: activeTab === "company" ? values.company_name : undefined,
        country_id: values.country_id
          ? Number(values.country_id)
          : findGermany(countries)?.id,
        accept_terms_and_privacy: values.accept_terms,
      })
    } catch {
      // Error is displayed via the hook's error state
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6" noValidate>
      {/* Tab switcher – same max-width as fields so edges align */}
      <div className="w-full max-w-[470px] md:max-w-[680px] mx-auto px-2 sm:px-0">
        <div role="tablist" aria-label={tabListLabel} className="flex w-full justify-center gap-3 sm:gap-4">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "user" ? "true" : "false"}
            onClick={() => handleTabChange("user")}
            className={`${baseTabClassName} ${activeTab === "user" ? activeTabClassName : inactiveTabClassName}`}
          >
            <Image src="/auth/user.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            <span>{userTabLabel}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "company" ? "true" : "false"}
            onClick={() => handleTabChange("company")}
            className={`${baseTabClassName} ${activeTab === "company" ? activeTabClassName : inactiveTabClassName}`}
          >
            <Image src="/auth/company.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            <span>{companyTabLabel}</span>
          </button>
        </div>
      </div>

      <AuthFieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Company name (company tab only) */}
          {activeTab === "company" && (
            <div className="space-y-1">
              <label className="auth-field block">
                <div className="auth-input-underline-wrap">
                  <Image src="/auth/company.svg" alt="" width={20} height={20} aria-hidden />
                  <input
                    {...register("company_name", { required: activeTab === "company" })}
                    placeholder={companyNamePlaceholder}
                    className="auth-input w-full"
                    autoComplete="organization"
                  />
                </div>
              </label>
              {errors.company_name && (
                <span className="text-xs text-red-300">
                  {isRTL ? "اسم الشركة مطلوب" : "Company name is required"}
                </span>
              )}
            </div>
          )}

          {/* Full name */}
          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-underline-wrap">
                <Image src="/auth/user.svg" alt="" width={20} height={20} aria-hidden />
                <input
                  {...register("name", { required: true, minLength: 2 })}
                  placeholder={fullNamePlaceholder}
                  className="auth-input w-full"
                  autoComplete="name"
                />
              </div>
            </label>
            {errors.name && (
              <span className="text-xs text-red-300">
                {isRTL ? "الاسم مطلوب (حرفان على الأقل)" : "Name is required (min 2 characters)"}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-underline-wrap">
                <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
                <input
                  {...register("email", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  })}
                  type="email"
                  placeholder={emailPlaceholder}
                  className="auth-input w-full"
                  autoComplete="email"
                />
              </div>
            </label>
            {errors.email && (
              <span className="text-xs text-red-300">
                {isRTL ? "البريد الإلكتروني غير صالح" : "Invalid email address"}
              </span>
            )}
          </div>

          {/* Country Selector */}
          <div className="space-y-1" ref={countryDropdownRef}>
            <div className="relative">
              <input type="hidden" {...register("country_id", { required: true })} />
              <button
                type="button"
                onClick={toggleCountryDropdown}
                className={cn(
                  "flex items-center gap-2.5 w-full h-[50px] bg-transparent border-b transition-colors cursor-pointer text-start outline-none",
                  countryDropdownOpen ? "border-[#40A0CA]" : "border-white/20 hover:border-white/40"
                )}
              >
                <MapPin className="h-5 w-5 text-white/60 shrink-0" aria-hidden />
                <span className={cn("text-[15px] text-white truncate flex-1", isRTL ? "text-right" : "text-left")}>
                  {selectedCountry?.name || (isRTL ? "الدولة" : "Country")}
                </span>
                <Image 
                  src="/portfolio/arrow-down.svg" 
                  alt="" 
                  width={16} 
                  height={16} 
                  className={cn("h-4 w-4 shrink-0 brightness-0 invert transition-transform", countryDropdownOpen && "rotate-180")} 
                />
              </button>
              {countryDropdownOpen && (
                <div 
                  className="absolute top-full mt-1.5 w-[240px] max-h-[240px] overflow-y-auto rounded-xl bg-[#041d33]/95 backdrop-blur-md border border-white/10 shadow-2xl z-50 py-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ltr:left-0 rtl:right-0" 
                  dir={isRTL ? "rtl" : "ltr"}
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                  }}
                >
                  <div className="sticky top-0 z-10 bg-[#041d33]/95 backdrop-blur-md px-2.5 pb-1.5 pt-1">
                    <div className="relative flex items-center">
                      <Search className="absolute start-2.5 h-3.5 w-3.5 text-white/40 pointer-events-none" aria-hidden />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={isRTL ? "بحث..." : "Search..."}
                        autoFocus
                        className="w-full rounded-lg border border-white/10 bg-white/[0.06] py-1.5 ps-8 pe-2.5 text-[13px] text-white placeholder:text-white/40 outline-none focus:border-[#40A0CA]/60"
                      />
                    </div>
                  </div>
                  {filteredCountries.length === 0 && (
                    <p className="px-3.5 py-3 text-center text-[13px] text-white/40">
                      {isRTL ? "لا توجد نتائج" : "No results found"}
                    </p>
                  )}
                  {filteredCountries.map((c) => {
                    const isSelected = String(c.id) === String(selectedCountryId)

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setValue("country_id", String(c.id), { shouldDirty: true })
                          const sc = STATIC_COUNTRIES.find(
                            s => s.dialCode === c.code || s.dialCode === `+${c.code}` || s.code.toLowerCase() === c.code.toLowerCase()
                          )
                          if (sc) {
                            setValue("phone_code", sc.dialCode)
                          } else if (c.code && c.code.startsWith("+")) {
                            setValue("phone_code", c.code)
                          }
                          setCountryDropdownOpen(false)
                          setCountrySearch("")
                        }}
                        className={cn(
                          "flex items-center gap-3 w-full px-3.5 py-2.5 text-white text-[13.5px] hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-150 text-start cursor-pointer border-s-2 border-transparent",
                          isSelected && (isRTL
                            ? "bg-gradient-to-l from-[#006EA8]/35 to-transparent border-s-[#40A0CA] font-medium"
                            : "bg-gradient-to-r from-[#006EA8]/35 to-transparent border-s-[#40A0CA] font-medium")
                        )}
                      >
                        <span className={cn("truncate flex-1 font-medium text-white/90", isRTL ? "text-right" : "text-left")}>{c.name}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-[#40A0CA] shrink-0 ms-2" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {errors.country_id && (
              <span className="text-xs text-red-300">
                {isRTL ? "اختر الدولة" : "Select country"}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className={cn("space-y-1", activeTab === "company" && "md:col-span-2")}>
            <label className="auth-field block">
              <div className="flex items-center gap-3 w-full h-[50px] bg-transparent border-b border-white/20 px-0 transition-colors focus-within:border-[#006ea8]">
                <div className="relative shrink-0 pe-2 me-2 border-e border-white/10" ref={phoneDropdownRef}>
                  <input type="hidden" {...register("phone_code")} />
                  <button
                    type="button"
                    onClick={togglePhoneDropdown}
                    className="flex items-center gap-1 h-6 cursor-pointer"
                  >
                    <Image 
                      src="/portfolio/arrow-down.svg" 
                      alt="" 
                      width={16} 
                      height={16} 
                      className={cn("h-3.5 w-3.5 brightness-0 invert transition-transform me-1", phoneDropdownOpen && "rotate-180")} 
                    />
                    <span 
                      className={`fi fi-${(STATIC_COUNTRIES.find((c) => c.dialCode === selectedDialCode)?.code || "de").toLowerCase()} fis shrink-0`}
                      style={{ fontSize: '14px', borderRadius: '2px' }}
                      aria-hidden="true" 
                    />
                    <span className="text-sm text-white font-medium ms-1.5">{selectedDialCode}</span>
                  </button>
                  {phoneDropdownOpen && (
                    <div 
                      className="absolute top-full mt-1.5 w-[260px] max-h-[240px] overflow-y-auto rounded-xl bg-[#041d33]/95 backdrop-blur-md border border-white/10 shadow-2xl z-50 py-1.5 ltr:left-0 rtl:right-0" 
                      dir={isRTL ? "rtl" : "ltr"}
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                      }}
                    >
                      <div className="sticky top-0 z-10 bg-[#041d33]/95 backdrop-blur-md px-2.5 pb-1.5 pt-1">
                        <div className="relative flex items-center">
                          <Search className="absolute start-2.5 h-3.5 w-3.5 text-white/40 pointer-events-none" aria-hidden />
                          <input
                            type="text"
                            value={phoneSearch}
                            onChange={(e) => setPhoneSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={isRTL ? "بحث..." : "Search..."}
                            autoFocus
                            className="w-full rounded-lg border border-white/10 bg-white/[0.06] py-1.5 ps-8 pe-2.5 text-[13px] text-white placeholder:text-white/40 outline-none focus:border-[#40A0CA]/60"
                          />
                        </div>
                      </div>
                      {filteredDialCodes.length === 0 && (
                        <p className="px-4 py-3 text-center text-[13px] text-white/40">
                          {isRTL ? "لا توجد نتائج" : "No results found"}
                        </p>
                      )}
                      {filteredDialCodes.map((c) => {
                        const isSelected = c.dialCode === selectedDialCode
                        return (
                          <button
                            key={`dial-${c.id}`}
                            type="button"
                            onClick={() => {
                              handleDialCodeChange(c.dialCode)
                              setPhoneDropdownOpen(false)
                              setPhoneSearch("")
                            }}
                            className={cn(
                              "flex items-center gap-3 w-full px-4 py-3 text-white text-sm hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-150 text-start cursor-pointer border-s-2 border-transparent",
                              isSelected && (isRTL 
                                ? "bg-gradient-to-l from-[#006EA8]/35 to-transparent border-s-[#40A0CA] font-medium"
                                : "bg-gradient-to-r from-[#006EA8]/35 to-transparent border-s-[#40A0CA] font-medium")
                            )}
                          >
                            <span 
                              className={`fi fi-${c.code.toLowerCase()} fis shrink-0`} 
                              style={{ fontSize: '16px', borderRadius: '3px', boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }} 
                            />
                            <span className="truncate flex-1 text-start font-medium text-white/90">{c.name}</span>
                            <span className="text-[11px] text-white/40 font-mono select-none px-1.5 py-0.5 rounded bg-white/[0.04]">{c.dialCode}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-[#40A0CA] shrink-0 ms-2" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                 <input
                  {...register("phone", {
                    required: isRTL ? "رقم الهاتف مطلوب" : "Phone is required",
                    pattern: {
                      value: /^\d+$/,
                      message: isRTL ? "رقم الهاتف يجب أن يحتوي على أرقام فقط" : "Phone number must contain digits only",
                    },
                    minLength: {
                      value: 7,
                      message: isRTL ? "رقم الهاتف يجب ألا يقل عن 7 أرقام" : "Phone number must be at least 7 digits",
                    },
                    maxLength: {
                      value: 15,
                      message: isRTL ? "رقم الهاتف يجب ألا يزيد عن 15 رقمًا" : "Phone number cannot exceed 15 digits",
                    },
                  })}
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  placeholder={phonePlaceholder}
                  className={cn("auth-input w-full text-sm", isRTL ? "text-end" : "text-start")}
                  autoComplete="tel"
                />
              </div>
            </label>
            {errors.phone && (
              <span className="text-xs text-red-300">
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-underline-wrap">
                <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
                <input
                  {...register("password", { required: true, minLength: 8 })}
                  type={showPassword ? "text" : "password"}
                  placeholder={passwordPlaceholder}
                  className="auth-input w-full"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="shrink-0 cursor-pointer p-2 rounded-md hover:bg-white/10 transition focus:outline-none"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
                >
                  <Image src={showPassword ? "/auth/eye.svg" : "/auth/eye-off.svg"} alt="" width={20} height={20} aria-hidden />
                </button>
              </div>
            </label>
            {errors.password && (
              <span className="text-xs text-red-300">
                {isRTL
                  ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
                  : "Password must be at least 8 characters"}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-underline-wrap">
                <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
                <input
                  {...register("password_confirmation", { required: true })}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={confirmPasswordPlaceholder}
                  className="auth-input w-full"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="shrink-0 cursor-pointer p-2 rounded-md hover:bg-white/10 transition focus:outline-none"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label={showConfirmPassword ? hidePasswordLabel : showPasswordLabel}
                >
                  <Image src={showConfirmPassword ? "/auth/eye.svg" : "/auth/eye-off.svg"} alt="" width={20} height={20} aria-hidden />
                </button>
              </div>
            </label>
            {passwordConfirmation && !passwordsMatch && (
              <span className="text-xs text-red-300">
                {isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
              </span>
            )}
          </div>
        </div>
      </AuthFieldGroup>

      {/* Bottom section – same max-width as fields */}
      <div className="flex w-full max-w-[470px] md:max-w-[680px] mx-auto flex-col gap-5 px-2 sm:px-0">
        {/* Terms checkbox – centered */}
        <div className="flex justify-center">
          <label className="inline-flex items-start gap-2 text-sm text-white/90 cursor-pointer">
            <input
              type="checkbox"
              {...register("accept_terms", { required: true })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#006ea8] cursor-pointer"
            />
            <span>
              {t.rich("fields.termsLabel", {
                termsLink: (chunks) => (
                  <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="text-[#40A0CA] underline hover:text-[#9fc9e6] mx-0.5 transition-colors">
                    {chunks}
                  </a>
                ),
                privacyLink: (chunks) => (
                  <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="text-[#40A0CA] underline hover:text-[#9fc9e6] mx-0.5 transition-colors">
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </label>
        </div>

        {/* Server error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !acceptTerms || !passwordsMatch}
          className="h-[52px] w-full rounded-xl bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-[length:120px_120px,auto] bg-blend-[plus-lighter,normal] text-white shadow-[0px_42px_107px_rgba(123,190,255,0.34),0px_24.7206px_32.2574px_rgba(0,86,133,0.19),0px_10.2677px_13.3981px_rgba(0,86,133,0.22),0px_3.7136px_4.8458px_rgba(0,86,133,0.15),inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF] text-base font-semibold hover:brightness-105 transition-all active:translate-y-px disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{isRTL ? "جاري إنشاء الحساب..." : "Creating account..."}</span>
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
