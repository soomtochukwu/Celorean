import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-mono font-bold tracking-wider uppercase ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border",
  {
    variants: {
      variant: {
        default: "bg-terminal-green text-terminal-black border-terminal-green hover:bg-terminal-green/90 hover:border-terminal-green/90",
        destructive:
          "bg-terminal-orange text-white border-terminal-orange hover:bg-terminal-orange/90 hover:border-terminal-orange/90",
        outline:
          "border-terminal-border bg-transparent hover:bg-terminal-border hover:text-white",
        secondary:
          "bg-terminal-orange text-white border-terminal-orange hover:bg-terminal-orange/80 hover:border-terminal-orange/80",
        ghost: "border-transparent hover:bg-terminal-border hover:text-white hover:border-terminal-border",
        link: "text-terminal-green underline-offset-4 hover:underline border-transparent normal-case",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
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
