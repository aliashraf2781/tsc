"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

const HIGHLIGHT_WORDS = ["Germany", "ألمانيا", "Deutschland"]

const TYPE_SPEED_MS = 90
const DELETE_SPEED_MS = 55
const PAUSE_FULL_MS = 2200
const PAUSE_EMPTY_MS = 600

type HeroTitleProps = {
  title: string
  className?: string
}

function highlightText(text: string) {
  for (const word of HIGHLIGHT_WORDS) {
    if (text.includes(word)) {
      const [before, after] = text.split(word)
      return (
        <>
          {before}
          <span className="relative inline-block px-4 py-1">
            <span className="relative z-10">{word}</span>
            <Image
              src="/home/splash.png"
              alt=""
              fill
              className="absolute inset-0 z-0 h-full w-full scale-150 object-contain opacity-90"
              aria-hidden
            />
          </span>
          {after}
        </>
      )
    }
  }
  return text
}

export function HeroTitle({ title, className }: HeroTitleProps) {
  const { staticText, loopText } = useMemo(() => {
    const words = title.trim().split(/\s+/).filter(Boolean)
    if (words.length <= 2) {
      return { staticText: "", loopText: title }
    }
    return {
      staticText: words.slice(0, -2).join(" "),
      loopText: words.slice(-2).join(" "),
    }
  }, [title])

  const fullTitle = staticText ? `${staticText} ${loopText}` : loopText

  const [staticTyped, setStaticTyped] = useState(0)
  const [loopTyped, setLoopTyped] = useState(0)
  const [loopPhase, setLoopPhase] = useState<"typing" | "pausedFull" | "deleting" | "pausedEmpty">("typing")

  useEffect(() => {
    setStaticTyped(0)
    setLoopTyped(0)
    setLoopPhase("typing")
  }, [title, staticText, loopText])

  const staticDone = staticTyped >= staticText.length

  useEffect(() => {
    if (staticDone) return

    const timeoutId = setTimeout(() => {
      setStaticTyped((prev) => Math.min(prev + 1, staticText.length))
    }, TYPE_SPEED_MS)

    return () => clearTimeout(timeoutId)
  }, [staticTyped, staticDone, staticText])

  useEffect(() => {
    if (!staticDone || !loopText) return

    let timeoutId: ReturnType<typeof setTimeout>

    if (loopPhase === "typing") {
      timeoutId = setTimeout(() => {
        setLoopTyped((prev) => {
          const next = prev + 1
          if (next >= loopText.length) {
            setLoopPhase("pausedFull")
            return loopText.length
          }
          return next
        })
      }, TYPE_SPEED_MS)
    } else if (loopPhase === "pausedFull") {
      timeoutId = setTimeout(() => setLoopPhase("deleting"), PAUSE_FULL_MS)
    } else if (loopPhase === "deleting") {
      timeoutId = setTimeout(() => {
        setLoopTyped((prev) => {
          const next = prev - 1
          if (next <= 0) {
            setLoopPhase("pausedEmpty")
            return 0
          }
          return next
        })
      }, DELETE_SPEED_MS)
    } else if (loopPhase === "pausedEmpty") {
      timeoutId = setTimeout(() => setLoopPhase("typing"), PAUSE_EMPTY_MS)
    }

    return () => clearTimeout(timeoutId)
  }, [loopPhase, loopTyped, loopText, staticDone])

  const isLoopFull = staticDone && loopPhase === "pausedFull"
  const showCursor = !isLoopFull

  return (
    <h1 className={cn("relative", className)}>
      {/* Invisible full title reserves stable height while typing/deleting */}
      <span className="invisible block" aria-hidden>
        {staticText ? (
          <>
            {staticText} {highlightText(loopText)}
          </>
        ) : (
          highlightText(loopText)
        )}
      </span>
      <span className="absolute inset-0" aria-label={fullTitle}>
        {!staticDone ? (
          staticText.slice(0, staticTyped)
        ) : (
          <>
            {staticText && `${staticText} `}
            {isLoopFull ? highlightText(loopText) : loopText.slice(0, loopTyped)}
          </>
        )}
        {showCursor && (
          <span className="ml-1 inline-block h-[0.9em] w-[2px] animate-pulse bg-current align-middle" aria-hidden />
        )}
      </span>
    </h1>
  )
}
