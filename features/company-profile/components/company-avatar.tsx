import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCompanyInitials } from "@/features/company-profile/lib/profile-logo"
import { cn } from "@/lib/utils"

type CompanyAvatarProps = {
  logo?: string | null
  name?: string
  size?: "sm" | "default" | "lg"
  /** When true, fills parent container (e.g. 88px hero circle). */
  fill?: boolean
  className?: string
  imageClassName?: string
  fallbackClassName?: string
}

export function CompanyAvatar({
  logo,
  name,
  size = "sm",
  fill = false,
  className,
  imageClassName,
  fallbackClassName,
}: CompanyAvatarProps) {
  const initials = getCompanyInitials(name)

  return (
    <Avatar
      {...(fill ? {} : { size })}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-[#E8F2FF]",
        fill && "size-full",
        className
      )}
    >
      {logo ? (
        <AvatarImage
          src={logo}
          alt={name ?? ""}
          className={cn("h-full w-full object-cover object-center", imageClassName)}
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "grid size-full place-items-center rounded-full bg-[#E8F2FF] text-[12px] font-bold text-[#006EA8]",
          size === "lg" && "text-[18px]",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
