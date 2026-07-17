// lib/countries.ts
// قائمة الدول مع رموزها وأعلامها (Emojis)

export interface CountryData {
  id: number
  name: string
  code: string
  flag: string
  dialCode: string
}

export const COUNTRIES: CountryData[] = [
  // Middle East & North Africa
  { id: 1, name: "مصر", code: "EG", flag: "🇪🇬", dialCode: "+20" },
  { id: 2, name: "المملكة العربية السعودية", code: "SA", flag: "🇸🇦", dialCode: "+966" },
  { id: 3, name: "الإمارات العربية المتحدة", code: "AE", flag: "🇦🇪", dialCode: "+971" },
  { id: 4, name: "المغرب", code: "MA", flag: "🇲🇦", dialCode: "+212" },
  { id: 5, name: "الجزائر", code: "DZ", flag: "🇩🇿", dialCode: "+213" },
  { id: 6, name: "تونس", code: "TN", flag: "🇹🇳", dialCode: "+216" },
  { id: 7, name: "الأردن", code: "JO", flag: "🇯🇴", dialCode: "+962" },
  { id: 8, name: "لبنان", code: "LB", flag: "🇱🇧", dialCode: "+961" },
  { id: 9, name: "فلسطين", code: "PS", flag: "🇵🇸", dialCode: "+970" },
  { id: 10, name: "سوريا", code: "SY", flag: "🇸🇾", dialCode: "+963" },
  { id: 11, name: "العراق", code: "IQ", flag: "🇮🇶", dialCode: "+964" },
  { id: 12, name: "اليمن", code: "YE", flag: "🇾🇪", dialCode: "+967" },
  { id: 13, name: "عمان", code: "OM", flag: "🇴🇲", dialCode: "+968" },
  { id: 14, name: "الكويت", code: "KW", flag: "🇰🇼", dialCode: "+965" },
  { id: 15, name: "قطر", code: "QA", flag: "🇶🇦", dialCode: "+974" },
  { id: 16, name: "البحرين", code: "BH", flag: "🇧🇭", dialCode: "+973" },

  // Europe
  { id: 17, name: "ألمانيا", code: "DE", flag: "🇩🇪", dialCode: "+49" },
  { id: 18, name: "فرنسا", code: "FR", flag: "🇫🇷", dialCode: "+33" },
  { id: 19, name: "إيطاليا", code: "IT", flag: "🇮🇹", dialCode: "+39" },
  { id: 20, name: "إسبانيا", code: "ES", flag: "🇪🇸", dialCode: "+34" },
  { id: 21, name: "البرتغال", code: "PT", flag: "🇵🇹", dialCode: "+351" },
  { id: 22, name: "هولندا", code: "NL", flag: "🇳🇱", dialCode: "+31" },
  { id: 23, name: "بلجيكا", code: "BE", flag: "🇧🇪", dialCode: "+32" },
  { id: 24, name: "سويسرا", code: "CH", flag: "🇨🇭", dialCode: "+41" },
  { id: 25, name: "النمسا", code: "AT", flag: "🇦🇹", dialCode: "+43" },
  { id: 26, name: "السويد", code: "SE", flag: "🇸🇪", dialCode: "+46" },
  { id: 27, name: "النرويج", code: "NO", flag: "🇳🇴", dialCode: "+47" },
  { id: 28, name: "الدنمارك", code: "DK", flag: "🇩🇰", dialCode: "+45" },
  { id: 29, name: "فنلندا", code: "FI", flag: "🇫🇮", dialCode: "+358" },
  { id: 30, name: "بولندا", code: "PL", flag: "🇵🇱", dialCode: "+48" },
  { id: 31, name: "التشيك", code: "CZ", flag: "🇨🇿", dialCode: "+420" },
  { id: 32, name: "اليونان", code: "GR", flag: "🇬🇷", dialCode: "+30" },
  { id: 33, name: "تركيا", code: "TR", flag: "🇹🇷", dialCode: "+90" },
  { id: 34, name: "المملكة المتحدة", code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { id: 35, name: "أيرلندا", code: "IE", flag: "🇮🇪", dialCode: "+353" },

  // Americas
  { id: 36, name: "الولايات المتحدة", code: "US", flag: "🇺🇸", dialCode: "+1" },
  { id: 37, name: "كندا", code: "CA", flag: "🇨🇦", dialCode: "+1" },
  { id: 38, name: "المكسيك", code: "MX", flag: "🇲🇽", dialCode: "+52" },
  { id: 39, name: "البرازيل", code: "BR", flag: "🇧🇷", dialCode: "+55" },

  // Asia & Pacific
  { id: 40, name: "الصين", code: "CN", flag: "🇨🇳", dialCode: "+86" },
  { id: 41, name: "الهند", code: "IN", flag: "🇮🇳", dialCode: "+91" },
  { id: 42, name: "اليابان", code: "JP", flag: "🇯🇵", dialCode: "+81" },
  { id: 43, name: "كوريا الجنوبية", code: "KR", flag: "🇰🇷", dialCode: "+82" },
  { id: 44, name: "تايلاند", code: "TH", flag: "🇹🇭", dialCode: "+66" },
  { id: 45, name: "ماليزيا", code: "MY", flag: "🇲🇾", dialCode: "+60" },
  { id: 46, name: "سنغافورة", code: "SG", flag: "🇸🇬", dialCode: "+65" },
  { id: 47, name: "أستراليا", code: "AU", flag: "🇦🇺", dialCode: "+61" },

  // Africa
  { id: 48, name: "ليبيا", code: "LY", flag: "🇱🇾", dialCode: "+218" },
  { id: 49, name: "السودان", code: "SD", flag: "🇸🇩", dialCode: "+249" },
  { id: 50, name: "موريتانيا", code: "MR", flag: "🇲🇷", dialCode: "+222" },
  { id: 51, name: "الصومال", code: "SO", flag: "🇸🇴", dialCode: "+252" },
  { id: 52, name: "جنوب أفريقيا", code: "ZA", flag: "🇿🇦", dialCode: "+27" },
  { id: 53, name: "نيجيريا", code: "NG", flag: "🇳🇬", dialCode: "+234" },
  { id: 54, name: "كينيا", code: "KE", flag: "🇰🇪", dialCode: "+254" },
  { id: 55, name: "غانا", code: "GH", flag: "🇬🇭", dialCode: "+233" },
  { id: 56, name: "إثيوبيا", code: "ET", flag: "🇪🇹", dialCode: "+251" },
  { id: 57, name: "تنزانيا", code: "TZ", flag: "🇹🇿", dialCode: "+255" },
  { id: 58, name: "جيبوتي", code: "DJ", flag: "🇩🇯", dialCode: "+253" },
  { id: 59, name: "جزر القمر", code: "KM", flag: "🇰🇲", dialCode: "+269" },

  // Europe (additional)
  { id: 60, name: "روسيا", code: "RU", flag: "🇷🇺", dialCode: "+7" },
  { id: 61, name: "أوكرانيا", code: "UA", flag: "🇺🇦", dialCode: "+380" },
  { id: 62, name: "رومانيا", code: "RO", flag: "🇷🇴", dialCode: "+40" },
  { id: 63, name: "المجر", code: "HU", flag: "🇭🇺", dialCode: "+36" },
  { id: 64, name: "كرواتيا", code: "HR", flag: "🇭🇷", dialCode: "+385" },
  { id: 65, name: "صربيا", code: "RS", flag: "🇷🇸", dialCode: "+381" },

  // Americas (additional)
  { id: 66, name: "الأرجنتين", code: "AR", flag: "🇦🇷", dialCode: "+54" },
  { id: 67, name: "كولومبيا", code: "CO", flag: "🇨🇴", dialCode: "+57" },
  { id: 68, name: "تشيلي", code: "CL", flag: "🇨🇱", dialCode: "+56" },
  { id: 69, name: "بيرو", code: "PE", flag: "🇵🇪", dialCode: "+51" },

  // Asia (additional)
  { id: 70, name: "باكستان", code: "PK", flag: "🇵🇰", dialCode: "+92" },
  { id: 71, name: "بنجلاديش", code: "BD", flag: "🇧🇩", dialCode: "+880" },
  { id: 72, name: "إندونيسيا", code: "ID", flag: "🇮🇩", dialCode: "+62" },
  { id: 73, name: "الفلبين", code: "PH", flag: "🇵🇭", dialCode: "+63" },
  { id: 74, name: "فيتنام", code: "VN", flag: "🇻🇳", dialCode: "+84" },
  { id: 75, name: "نيوزيلندا", code: "NZ", flag: "🇳🇿", dialCode: "+64" },
  { id: 76, name: "سريلانكا", code: "LK", flag: "🇱🇰", dialCode: "+94" },
]

export function getCountryByCode(code: string): CountryData | undefined {
  return COUNTRIES.find((c) => c.code === code)
}

export function getCountryById(id: number): CountryData | undefined {
  return COUNTRIES.find((c) => c.id === id)
}

/** Localized country name from ISO 3166-1 alpha-2 (en / ar / de). */
export function getLocalizedCountryName(
  isoCode: string,
  locale: string,
  fallback?: string
): string {
  const code = isoCode?.trim().toUpperCase()
  if (!code) return fallback || isoCode
  try {
    const name = new Intl.DisplayNames([locale], { type: "region" }).of(code)
    if (name) return name
  } catch {
    // Intl may be unavailable for some runtimes/locales
  }
  return fallback || getCountryByCode(code)?.name || code
}

export function getLocalizedCountries(locale: string): CountryData[] {
  return COUNTRIES.map((c) => ({
    ...c,
    name: getLocalizedCountryName(c.code, locale, c.name),
  }))
}

export function getCountriesByRegion(region: "mena" | "europe" | "americas" | "asia"): CountryData[] {
  const ranges: Record<string, [number, number]> = {
    mena: [1, 16],
    europe: [17, 35],
    americas: [36, 39],
    asia: [40, 47],
  }
  const [start, end] = ranges[region] || [1, 47]
  return COUNTRIES.filter((c) => c.id >= start && c.id <= end)
}

export function countryToFlag(code: string): string {
  const country = getCountryByCode(code)
  return country?.flag || "🌍"
}

export function countryToName(code: string): string {
  const country = getCountryByCode(code)
  return country?.name || code
}
