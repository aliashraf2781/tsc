type FilterChipGridProps = {
  options: string[]
  activeIndices: number[]
  onToggle: (index: number) => void
}

export function FilterChipGrid({ options, activeIndices, onToggle }: FilterChipGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, index) => {
        const isActive = activeIndices.includes(index)

        return (
          <button
            key={`${option}-${index}`}
            type="button"
            onClick={() => onToggle(index)}
            className={`min-w-[76px] rounded-[64px] border px-4 py-2 text-[16px] leading-[1.16] ${
              isActive ? "border-[#40A0CA] text-[#40A0CA]" : "border-[#a3a3a3] text-[#a3a3a3]"
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
