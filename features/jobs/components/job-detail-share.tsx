"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type JobDetailShareProps = {
  label: string
  className?: string
}

export function JobDetailShare({ label, className }: JobDetailShareProps) {
  const [shareUrl, setShareUrl] = React.useState("")

  React.useEffect(() => {
    setShareUrl(encodeURIComponent(window.location.href))
  }, [])

  const twitterUrl = `https://twitter.com/intent/tweet?url=${shareUrl}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <span className="text-[16px] font-medium text-[#40A0CA]">{label}</span>
      <div className="flex items-center gap-3">
        {/* Twitter / X */}
        <a
          href={shareUrl ? twitterUrl : "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="transition-all duration-200 hover:scale-110"
        >
          <img
            src="/Linked_accounts/X.svg"
            alt="X"
            className="size-9 object-contain"
          />
        </a>

        {/* Facebook */}
        <a
          href={shareUrl ? facebookUrl : "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="transition-all duration-200 hover:scale-110"
        >
          <img
            src="/Linked_accounts/Facebook.svg"
            alt="Facebook"
            className="size-9 object-contain"
          />
        </a>

        {/* LinkedIn */}
        <a
          href={shareUrl ? linkedinUrl : "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="transition-all duration-200 hover:scale-110"
        >
          <img
            src="/Linked_accounts/LinkedIn.svg"
            alt="LinkedIn"
            className="size-9 object-contain"
          />
        </a>
      </div>
    </div>
  )
}

