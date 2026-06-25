export function ImagePlaceholder({
  className,
  tone = "blue",
}: {
  className?: string
  tone?: "blue" | "warm" | "neutral"
}) {
  const backgroundTone =
    tone === "blue"
      ? "bg-[linear-gradient(135deg,#0f2940_0%,#1f6f9e_45%,#b7d6e9_100%)]"
      : tone === "warm"
        ? "bg-[linear-gradient(135deg,#6f4d36_0%,#9f6f4e_50%,#d2b59a_100%)]"
        : "bg-[linear-gradient(135deg,#3d4a58_0%,#7f94a8_50%,#d5dde6_100%)]"

  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-[#dce9f4] shadow-[0_8px_24px_rgba(0,25,45,0.08)] ${backgroundTone} ${className ?? ""}`}
    >
      <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.36)_0%,transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.28)_0%,transparent_36%),linear-gradient(180deg,transparent_30%,rgba(0,18,34,0.2)_100%)]" />
    </div>
  )
}
