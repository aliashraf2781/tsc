"use client"

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { PrimaryButton } from "@/components/ui/primary-button"
import { FilterPanel, type FilterPanelProps } from "@/features/jobs/components/filter-panel"

type JobsFilterDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  closeLabel: string
  panelProps: FilterPanelProps
}

export function JobsFilterDrawer({
  open,
  onOpenChange,
  title,
  closeLabel,
  panelProps,
}: JobsFilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-[#525252]/55 backdrop-blur-[2px]"
        className="flex w-[min(92vw,420px)] max-w-[420px] flex-col gap-0 overflow-hidden border-[#78a3be] bg-white p-0 shadow-[-8px_0_32px_rgba(0,43,70,0.18)] sm:w-[420px]"
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <FilterPanel {...panelProps} variant="drawer" />
        </div>
        <div className="shrink-0 border-t border-[#c4d9e8] bg-white p-4 sm:p-6">
          <PrimaryButton
            type="button"
            className="h-[44px] w-full rounded-[12px]"
            onClick={() => onOpenChange(false)}
          >
            {closeLabel}
          </PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
