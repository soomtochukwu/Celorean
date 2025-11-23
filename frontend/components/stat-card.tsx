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
    <Card className={cn("glass border border-primary/10", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {loading ? <Skeleton className="h-4 w-24" /> : title}
        </CardTitle>
        <div className="text-muted-foreground">
          {loading ? <Skeleton className="h-5 w-5 rounded-full" /> : icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <Skeleton className="h-7 w-28" /> : value}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {loading ? <Skeleton className="h-3 w-40" /> : description}
        </div>
        {trendValue && !loading && (
          <div className={cn(
            "mt-3 inline-flex items-center rounded-full px-2 py-1 text-xs",
            trend === "up" && "bg-emerald-500/10 text-emerald-500",
            trend === "down" && "bg-red-500/10 text-red-500",
            trend === "neutral" && "bg-muted text-muted-foreground"
          )}>
            {trend === "up" && <span className="mr-1">▲</span>}
            {trend === "down" && <span className="mr-1">▼</span>}
            {trendValue}
          </div>
        )}
        {loading && (
          <div className="mt-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
