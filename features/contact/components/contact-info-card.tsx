import type { ReactNode } from "react"

type ContactInfoCardProps = {
  icon: ReactNode
  label: string
  value: string
}

export function ContactInfoCard({ icon, label, value }: ContactInfoCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-8 text-center text-[#f5f5f5] md:border-r md:border-[#40A0CA] md:last:border-r-0">
      {icon}
      <div className="space-y-2">
        <p className="text-sm leading-[1.16] text-[#d4d4d4]">{label}</p>
        <p className="text-xl leading-normal">{value}</p>
      </div>
    </div>
  )
}
