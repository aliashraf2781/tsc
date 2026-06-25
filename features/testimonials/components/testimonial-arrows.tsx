import { cn } from "@/lib/utils"

type ArrowProps = {
  className?: string
  rotate?: boolean
}

/** Light arrow — previous (Figma #C2DDFF) */
export function TestimonialArrowPrev({ className, rotate }: ArrowProps) {
  return (
    <svg
      width="101"
      height="15"
      viewBox="0 0 101 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[15px] w-[101px] max-w-[101px] shrink-0", className, rotate && "rotate-180")}
      aria-hidden
    >
      <path
        d="M0.292892 8.07088C-0.0976334 7.68035 -0.0976334 7.04719 0.292892 6.65666L6.65685 0.292702C7.04738 -0.0978227 7.68054 -0.0978227 8.07107 0.292702C8.46159 0.683226 8.46159 1.31639 8.07107 1.70692L2.41422 7.36377L8.07107 13.0206C8.46159 13.4111 8.46159 14.0443 8.07107 14.4348C7.68054 14.8254 7.04738 14.8254 6.65685 14.4348L0.292892 8.07088ZM101 7.36377V8.36377H1V7.36377V6.36377H101V7.36377Z"
        fill="#C2DDFF"
      />
    </svg>
  )
}

/** Dark arrow — next (Figma #002B46) */
export function TestimonialArrowNext({ className, rotate }: ArrowProps) {
  return (
    <svg
      width="101"
      height="15"
      viewBox="0 0 101 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[15px] w-[101px] max-w-[101px] shrink-0", className, rotate && "rotate-180")}
      aria-hidden
    >
      <g transform="translate(101 0) scale(-1 1)">
        <path
          d="M0.292892 8.07088C-0.0976334 7.68035 -0.0976334 7.04719 0.292892 6.65666L6.65685 0.292702C7.04738 -0.0978227 7.68054 -0.0978227 8.07107 0.292702C8.46159 0.683226 8.46159 1.31639 8.07107 1.70692L2.41422 7.36377L8.07107 13.0206C8.46159 13.4111 8.46159 14.0443 8.07107 14.4348C7.68054 14.8254 7.04738 14.8254 6.65685 14.4348L0.292892 8.07088ZM101 7.36377V8.36377H1V7.36377V6.36377H101V7.36377Z"
          fill="#002B46"
        />
      </g>
    </svg>
  )
}
