import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description?: string
}

interface StepProgressTrackerProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepProgressTracker({ steps, currentStep, className }: StepProgressTrackerProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {steps.map((step, index) => {
        const status = index < currentStep ? "complete" : index === currentStep ? "current" : "upcoming"

        return (
          <div key={step.id} className="relative">
            {index !== 0 && (
              <div
                className={cn(
                  "absolute left-4 top-0 -ml-px h-full w-0.5 -translate-x-1/2",
                  status === "complete" ? "bg-primary" : "bg-muted",
                )}
                aria-hidden="true"
              />
            )}
            <div className="relative flex items-start group">
              <span className="flex h-9 items-center" aria-hidden="true">
                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                    status === "complete"
                      ? "bg-primary"
                      : status === "current"
                        ? "border-2 border-primary bg-background"
                        : "border-2 border-muted bg-background",
                  )}
                >
                  {status === "complete" ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : status === "current" ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                  )}
                </span>
              </span>
              <div className="ml-4 min-w-0">
                <h3
                  className={cn(
                    "text-sm font-medium",
                    status === "complete"
                      ? "text-foreground"
                      : status === "current"
                        ? "text-primary"
                        : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </h3>
                {step.description && <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
