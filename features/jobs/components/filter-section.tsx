"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type FilterSectionProps = {
  title: string
  children: ReactNode
}

export function FilterSection({ title, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <section className="space-y-4">
      <div 
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <h4 className="text-[20px] leading-[1.2] font-medium text-[#262626] sm:text-[24px]">
          {title}
        </h4>
        <Image
          src="/jobs/icon-chevron-down.svg"
          alt=""
          width={16}
          height={16}
          className={cn("shrink-0 transition-transform duration-200", !isOpen && "rotate-180")}
          aria-hidden
        />
      </div>
      <div className={cn("transition-all duration-300 overflow-hidden origin-top", isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none")}>
        {children}
      </div>
    </section>
  )
}
