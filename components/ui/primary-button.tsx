import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/hooks/lib/utils"

const PrimaryButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "h-[52px] w-full rounded-[12px] bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-[length:120px_120px,auto] bg-blend-[plus-lighter,normal] text-white shadow-[0px_42px_107px_rgba(123,190,255,0.34),0px_24.7206px_32.2574px_rgba(0,86,133,0.19),0px_10.2677px_13.3981px_rgba(0,86,133,0.22),0px_3.7136px_4.8458px_rgba(0,86,133,0.15),inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF] hover:brightness-105 text-base font-semibold",
          className
        )}
        {...props}
      />
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"

export { PrimaryButton }
