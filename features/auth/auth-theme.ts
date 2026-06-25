export type AuthGlowShape = {
  id: string
  size: number
  top?: string
  bottom?: string
  left?: string
  right?: string
  blur?: number
  opacity?: number
  color: string
}

export const authGlowShapes: AuthGlowShape[] = [
  {
    id: "top-right-cyan",
    size: 500.74,
    top: "-242px",
    right: "-389px",
    blur: 500,
    opacity: 1,
    color: "#7fd4ff",
  },
  {
    id: "bottom-left-cyan",
    size: 500.74,
    bottom: "-238px",
    left: "-112px",
    blur: 500,
    opacity: 1,
    color: "#4fa5e6",
  },
]

export const authGridPattern =
  "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)"
