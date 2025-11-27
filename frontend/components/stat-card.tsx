import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  loading?: boolean
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend = "neutral",
  trendValue,
  className,
  loading = false,
}: StatCardProps) {
  return (
    <Card className={cn("terminal-box transition-colors hover:border-terminal-green/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          {loading ? <Skeleton className="h-4 w-24" /> : title}
        </CardTitle>
        <div className="text-terminal-green">
          {loading ? <Skeleton className="h-5 w-5" /> : icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-mono font-bold text-white">
          {loading ? <Skeleton className="h-7 w-28" /> : value}
        </div>
        <div className="text-xs text-muted-foreground mt-1 font-mono">
          {loading ? <Skeleton className="h-3 w-40" /> : description}
        </div>
        {trendValue && !loading && (
          <div className={cn(
            "mt-3 inline-flex items-center border px-2 py-1 text-xs font-mono font-bold tracking-wider uppercase",
            trend === "up" && "bg-terminal-green/10 text-terminal-green border-terminal-green",
            trend === "down" && "bg-terminal-orange/10 text-terminal-orange border-terminal-orange",
            trend === "neutral" && "bg-muted/10 text-muted-foreground border-terminal-border"
          )}>
            {trend === "up" && <span className="mr-1">▲</span>}
            {trend === "down" && <span className="mr-1">▼</span>}
            {trendValue}
          </div>
        )}
        {loading && (
          <div className="mt-3">
            <Skeleton className="h-6 w-24" />
          </div>
        )}

        {/* Status indicator dot */}
        {!loading && trend === "up" && (
          <div className="absolute top-4 right-4">
            <div className="status-dot status-dot-active" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
