import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-1 text-xs font-mono font-bold tracking-wider uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-terminal-green bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20",
        secondary:
          "border-terminal-orange bg-terminal-orange/10 text-terminal-orange hover:bg-terminal-orange/20",
        destructive:
          "border-terminal-orange bg-terminal-orange/10 text-terminal-orange hover:bg-terminal-orange/20",
        outline: "text-foreground border-terminal-border bg-transparent hover:bg-terminal-border/20",
        active: "border-terminal-green bg-terminal-green/20 text-terminal-green",
        paused: "border-terminal-orange bg-terminal-orange/20 text-terminal-orange",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
