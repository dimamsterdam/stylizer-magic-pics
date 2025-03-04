
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        primary: "bg-[#2C6ECB] text-white hover:bg-[#1F5199]",
        monochrome: "bg-[#2A2C2E] text-white hover:bg-[#1A1C1E]",
        'monochrome-plain': "bg-white border border-[#BABEC3] text-[#2A2C2E] hover:bg-[#F6F6F7]",
        'plain': "bg-white border border-[#E3E5E7] text-[#2A2C2E] hover:bg-[#F6F6F7]",
        success: "bg-[#007F5F] text-white hover:bg-[#005C44]",
        critical: "bg-[#D72C0D] text-white hover:bg-[#BC2200]",
        warning: "bg-[#FFC453] text-[#4D3B00] hover:bg-[#FFB21D]",
        'success-plain': "bg-white border border-[#B3DFD3] text-[#007F5F] hover:bg-[#F1F8F5]",
        'critical-plain': "bg-white border border-[#FADBD7] text-[#D72C0D] hover:bg-[#FDF4F4]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        auto: "px-4 py-2"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
