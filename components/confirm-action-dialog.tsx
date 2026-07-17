"use client"

import { AlertTriangle, ShieldAlert } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConfirmActionTone = "danger" | "warning"

type ConfirmActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  subject?: string
  confirmLabel: string
  cancelLabel: string
  pending?: boolean
  pendingLabel?: string
  tone?: ConfirmActionTone
  error?: string | null
  onConfirm: () => void
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  subject,
  confirmLabel,
  cancelLabel,
  pending = false,
  pendingLabel,
  tone = "danger",
  error,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && pending) return
        onOpenChange(next)
      }}
    >
      <AlertDialogContent className="max-w-[420px] sm:max-w-[420px]">
        <AlertDialogHeader className="sm:place-items-start sm:text-start">
          <AlertDialogMedia
            className={cn(
              tone === "danger" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
            )}
          >
            {tone === "danger" ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {subject ? (
              <>
                <span className="mb-1 block font-medium text-foreground">{subject}</span>
                {description}
              </>
            ) : (
              description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <Button
            type="button"
            variant={tone === "danger" ? "destructive" : "default"}
            disabled={pending}
            className={cn(
              tone === "danger" && "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/30",
              tone === "warning" && "bg-amber-600 text-white hover:bg-amber-700"
            )}
            onClick={() => {
              void onConfirm()
            }}
          >
            {pending ? pendingLabel || confirmLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
