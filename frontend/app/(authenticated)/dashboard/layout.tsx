import type React from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <SidebarNavigation />
      <div className="flex-1">{children}</div>
    </div>
  )
}
