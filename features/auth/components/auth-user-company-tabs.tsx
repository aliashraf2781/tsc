 "use client"

import { useState } from "react"
import Image from "next/image"

type TabsProps = {
  userLabel: string
  companyLabel: string
  tabListLabel: string
  activeTab?: "user" | "company" | "admin"
  onTabChange?: (value: "user" | "company" | "admin") => void
}

const baseTabClassName =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-base font-medium transition-all duration-200 sm:w-[213px]"

const activeTabClassName =
  "border-[#9fc9e6] bg-linear-to-b from-[#006ea8] to-[#005685] text-white shadow-[0_42px_107px_rgba(123,190,255,0.34),0_24.7206px_32.2574px_rgba(0,86,133,0.1867),0_10.2677px_13.3981px_rgba(0,86,133,0.22),0_3.71362px_4.84582px_rgba(0,86,133,0.1533),inset_0_1px_18px_2px_#E8F2FF,inset_0_1px_4px_2px_#C2DDFF]"

const inactiveTabClassName =
  "border-[#6b87a2] bg-[#02223b]/65 text-[#d9eef9] hover:bg-[#033a62]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fc9e6]/60"

export function AuthUserCompanyTabs({
  userLabel,
  companyLabel,
  tabListLabel,
  activeTab: activeTabProp,
  onTabChange,
}: TabsProps) {
  const [internalTab, setInternalTab] = useState<"user" | "company" | "admin">("user")
  const activeTab = activeTabProp ?? internalTab

  const handleChange = (value: "user" | "company" | "admin") => {
    if (onTabChange) onTabChange(value)
    if (activeTabProp === undefined) setInternalTab(value)
  }

  return (
    <div role="tablist" aria-label={tabListLabel} className="flex w-full items-center justify-center gap-4">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "user"}
        onClick={() => handleChange("user")}
        className={`${baseTabClassName} ${activeTab === "user" ? activeTabClassName : inactiveTabClassName}`}
      >
        <Image src="/auth/user.svg" alt="" width={24} height={24} className="h-6 w-6" aria-hidden />
        <span>{userLabel}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "company"}
        onClick={() => handleChange("company")}
        className={`${baseTabClassName} ${activeTab === "company" ? activeTabClassName : inactiveTabClassName}`}
      >
        <Image src="/auth/company.svg" alt="" width={24} height={24} className="h-6 w-6" aria-hidden />
        <span>{companyLabel}</span>
      </button>
    </div>
  )
}
