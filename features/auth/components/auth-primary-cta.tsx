type AuthPrimaryCtaProps = {
  label: string
}

export function AuthPrimaryCta({ label }: AuthPrimaryCtaProps) {
  return (
    <button
      type="submit"
      className="inline-flex h-[52px] w-full items-center justify-center rounded-xl border border-[#9fc9e6] bg-linear-to-b from-[#006ea8] to-[#005685] px-4 py-2 text-base font-medium text-white shadow-[0_42px_107px_rgba(123,190,255,0.34),0_24.7206px_32.2574px_rgba(0,86,133,0.1867),0_10.2677px_13.3981px_rgba(0,86,133,0.22),0_3.71362px_4.84582px_rgba(0,86,133,0.1533),inset_0_1px_18px_2px_#E8F2FF,inset_0_1px_4px_2px_#C2DDFF]"
    >
      {label}
    </button>
  )
}
