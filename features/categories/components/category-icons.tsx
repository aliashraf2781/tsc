import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

type IconProps = { className?: string }

const ICON_BOX = "h-6 w-6 shrink-0"

export function CategoryEyebrowGlobe({ className }: IconProps) {
  return (
    <svg className={cn("h-4 w-4 shrink-0", className)} viewBox="0 0 17 17" fill="none" aria-hidden>
      <circle cx="8.25" cy="8.25" r="8" stroke="#40A0CA" strokeWidth="0.5" />
      <path
        d="M5.61811 6.58223C5.50977 6.59723 5.32239 6.60323 5.16804 6.58411L5.06641 6.33363C5.34079 6.26089 5.50308 6.31226 5.61811 6.5826V6.58223Z"
        fill="#40A0CA"
      />
      <path
        opacity="0.4"
        d="M17.65 8.70256H2.35996C2.05996 8.70256 1.74996 8.69256 1.45996 8.62256L2.71996 16.3026C2.99996 18.0226 3.74996 20.0026 7.07996 20.0026H12.69C16.06 20.0026 16.66 18.3126 17.02 16.4226L18.53 8.62256C18.25 8.68256 17.95 8.70256 17.65 8.70256Z"
        fill="#40A0CA"
      />
    </svg>
  )
}

export function CategoryIconGraduation({ className }: IconProps) {
  return (
    <svg className={cn(ICON_BOX, className)} viewBox="0 0 40 41" fill="none" aria-hidden>
      <path
        d="M38.1742 10.42C36.4742 8.54 33.6342 7.6 29.5142 7.6H29.0342V7.52C29.0342 4.16 29.0342 0 21.5142 0H18.4742C10.9542 0 10.9542 4.18 10.9542 7.52V7.62H10.4742C6.33421 7.62 3.51422 8.56 1.81422 10.44C-0.165784 12.64 -0.105785 15.6 0.0942154 17.62L0.114215 17.76L0.314216 19.86C0.334216 19.88 0.374216 19.92 0.414216 19.94C1.07422 20.38 1.75422 20.82 2.47422 21.22C2.75422 21.4 3.05422 21.56 3.35422 21.72C6.77422 23.6 10.5342 24.86 14.3542 25.48C14.5342 27.36 15.3542 29.56 19.7342 29.56C24.1142 29.56 24.9742 27.38 25.1142 25.44C29.1942 24.78 33.1342 23.36 36.6942 21.28C36.8142 21.22 36.8942 21.16 36.9942 21.1C37.9142 20.58 38.7742 20.02 39.6142 19.4C39.6568 19.3775 39.6917 19.3426 39.7142 19.3L39.7942 18.58L39.8942 17.64C39.9142 17.52 39.9142 17.42 39.9342 17.28C40.0942 15.26 40.0542 12.5 38.1742 10.42Z"
        fill="currentColor"
      />
      <path
        opacity="0.4"
        d="M36.9942 21.0598L36.6942 21.2398C33.1186 23.3177 29.1947 24.7273 25.1142 25.3998C24.9542 27.3198 24.1142 29.5198 19.7342 29.5198C15.3542 29.5198 14.5142 27.3398 14.3542 25.4398C10.5342 24.8398 6.77421 23.5798 3.35421 21.6798C3.05421 21.5198 2.75421 21.3598 2.47421 21.1798C1.75421 20.7798 1.07421 20.3398 0.414209 19.8998C0.374209 19.8798 0.334209 19.8398 0.314209 19.8198L1.53421 32.8398C1.95421 36.8198 3.59421 40.9198 12.3942 40.9198H27.6342C36.4342 40.9198 38.0742 36.8198 38.4942 32.8198L39.7542 19.2598C39.7317 19.3024 39.6968 19.3372 39.6542 19.3598C38.7942 19.9798 37.9142 20.5598 36.9942 21.0598Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CategoryIconUser({ className }: IconProps) {
  return (
    <svg className={cn(ICON_BOX, className)} viewBox="0 0 43 43" fill="none" aria-hidden>
      <path opacity="0.4" d="M0 21.5C0 9.62588 9.62588 0 21.5 0C33.3742 0 43 9.62588 43 21.5C43 33.3742 33.3742 43 21.5 43C9.62588 43 0 33.3742 0 21.5Z" fill="currentColor" />
      <path
        d="M21.4714 8C17.8798 8 14.9644 10.9081 14.9644 14.5C14.9644 18.0918 17.8798 21 21.4714 21C25.0632 21 27.9786 18.0918 27.9786 14.5C27.9786 10.9081 25.0632 8 21.4714 8Z"
        fill="currentColor"
      />
      <path
        d="M31.57 28.4605C26.2352 22.7005 16.6377 22.9975 11.4159 28.4513L11.0409 28.8263C10.7504 29.1169 10.5917 29.5139 10.602 29.9247C10.6124 30.3355 10.7907 30.7241 11.0955 30.9997C13.8437 33.4847 17.4909 35.0001 21.4884 35.0001C25.486 35.0001 29.1332 33.4847 31.8814 30.9997C32.1862 30.7241 32.3646 30.3355 32.3748 29.9247C32.3852 29.5139 32.2266 29.1169 31.936 28.8263L31.57 28.4605Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CategoryIconFrame({ className }: IconProps) {
  return (
    <svg className={cn(ICON_BOX, className)} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        opacity="0.4"
        d="M28.38 0H11.62C4.34 0 0 4.34 0 11.62V28.36C0 35.66 4.34 40 11.62 40H28.36C35.64 40 39.98 35.66 39.98 28.38V11.62C40 4.34 35.66 0 28.38 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

const CATEGORY_ICON_MAP: Record<string, ComponentType<IconProps>> = {
  medical: CategoryIconGraduation,
  development: CategoryIconUser,
  hr: CategoryIconUser,
  design: CategoryIconFrame,
  business: CategoryIconFrame,
  sales: CategoryIconFrame,
  finance: CategoryIconFrame,
}

export function CategoryIconFor({ categoryKey, className }: { categoryKey: string; className?: string }) {
  const Icon = CATEGORY_ICON_MAP[categoryKey] ?? CategoryIconFrame
  return <Icon className={className} />
}
