import { AlertCircle, CheckCircle2 } from "lucide-react"

export interface ContactFormState {
  ok: boolean
  message: string
}

export function ContactFormStatus({ state }: { state: ContactFormState | null }) {
  if (!state) return null

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${
        state.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {state.ok ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
      )}
      <span>{state.message}</span>
    </div>
  )
}
