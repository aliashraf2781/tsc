"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const FALLBACK_SRC = "/home/hero/hero-bg-image.png"

type JobCoverImageProps = {
  src: string
  alt?: string
  className?: string
  priority?: boolean
  sizes?: string
}

/** Remote job covers often 502 via the image optimizer — fall back quickly to a local asset. */
export function JobCoverImage({
  src,
  alt = "",
  className,
  priority,
  sizes = "(max-width: 1312px) 100vw, 1312px",
}: JobCoverImageProps) {
  const [activeSrc, setActiveSrc] = React.useState(src || FALLBACK_SRC)
  const isRemote = activeSrc.startsWith("http://") || activeSrc.startsWith("https://")

  React.useEffect(() => {
    setActiveSrc(src || FALLBACK_SRC)
  }, [src])

  if (isRemote) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={activeSrc}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => {
          if (activeSrc !== FALLBACK_SRC) setActiveSrc(FALLBACK_SRC)
        }}
      />
    )
  }

  return (
    <Image
      src={activeSrc}
      alt={alt}
      fill
      className={className}
      priority={priority}
      sizes={sizes}
      onError={() => {
        if (activeSrc !== FALLBACK_SRC) setActiveSrc(FALLBACK_SRC)
      }}
    />
  )
}
