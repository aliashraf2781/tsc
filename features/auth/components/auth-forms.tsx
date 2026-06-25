import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Field = {
  id: string
  type?: string
  label: string
  placeholder: string
}

type Props = {
  fields: Field[]
  submitLabel: string
}

export function AuthForm({ fields, submitLabel }: Props) {
  return (
    <form className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2 text-start">
          <label htmlFor={field.id} className="text-sm font-medium text-[#123854]">
            {field.label}
          </label>
          <Input
            id={field.id}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            className="h-12 rounded-2xl border-[#c4d9e8] bg-white text-[#17334a] placeholder:text-[#89a1b3] focus-visible:border-[#40a0ca] focus-visible:ring-[#40a0ca]/20"
          />
        </div>
      ))}

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl bg-[#0f7abd] text-base font-semibold text-white shadow-[0_14px_28px_-14px_rgba(15,122,189,0.9)] hover:bg-[#0a6298]"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
