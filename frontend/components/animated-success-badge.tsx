"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedSuccessBadgeProps {
  message?: string
  className?: string
  onComplete?: () => void
  autoHide?: boolean
  hideDelay?: number
}

export function AnimatedSuccessBadge({
  message = "Success!",
  className,
  onComplete,
  autoHide = false,
  hideDelay = 3000,
}: AnimatedSuccessBadgeProps) {
  const [show, setShow] = useState(true)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Start animation after component mounts
    const animationTimeout = setTimeout(() => {
      setAnimate(true)
    }, 100)

    // Auto hide if enabled
    let hideTimeout: NodeJS.Timeout
    if (autoHide) {
      hideTimeout = setTimeout(() => {
        setShow(false)
        if (onComplete) {
          onComplete()
        }
      }, hideDelay)
    }

    return () => {
      clearTimeout(animationTimeout)
      if (autoHide) {
        clearTimeout(hideTimeout)
      }
    }
  }, [autoHide, hideDelay, onComplete])

  if (!show) return null

  return (
    <div
      className={cn(
        "flex items-center justify-center p-4 rounded-lg glass border border-primary/20 transition-all duration-500 ease-out",
        animate ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className,
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <CheckCircle className="h-8 w-8 text-primary animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>
        <p className="font-medium text-foreground">{message}</p>
      </div>
    </div>
  )
}
