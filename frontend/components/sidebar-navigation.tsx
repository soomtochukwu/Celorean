"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Shield, User, LogOut, Menu, X, Zap, BookOpen, Award, Settings, Users, UserCog, Activity } from "lucide-react"
import { useDisconnect, useAccount } from "wagmi"
import ConnectWalletButton from "./ConnectWalletButton"
import useCeloreanContract from "@/hooks/useCeloreanContract"

interface SidebarNavigationProps {
  className?: string
}

export function SidebarNavigation({ className }: SidebarNavigationProps) {
  const pathname = usePathname()
  const { disconnect } = useDisconnect()
  const { address } = useAccount()
  const { owner } = useCeloreanContract()

  // Call isLecturer hook at the top level with proper fallback
  const { data: isLecturerData } = useCeloreanContract().isLecturer(address || "0x0000000000000000000000000000000000000000")

  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if current user is admin
  useEffect(() => {
    if (address && owner) {
      setIsAdmin(address.toLowerCase() === String(owner).toLowerCase())
    } else {
      setIsAdmin(false)
    }
  }, [address, owner])

  // Check if current user is lecturer
  const isUserLecturer = Boolean(isLecturerData && address)

  const baseRoutes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Learning",
      href: "/learning",
      icon: BookOpen,
    },
    {
      name: "Activity",
      href: "/activity",
      icon: Activity,
    },
    {
      name: "Community",
      href: "/community",
      icon: Users,
    },
    {
      name: "Verification",
      href: "/self-verification",
      icon: Shield,
    },
    {
      name: "Achievements",
      href: "/achievements",
      icon: Award,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  // Create routes array with conditional admin route
  const routes = [...baseRoutes]

  // Add admin route if user is admin or lecturer (insert before Profile and Settings)
  if ((isAdmin || isUserLecturer) && address) {
    routes.splice(-2, 0, {
      name: "Admin",
      href: "/admin",
      icon: UserCog,
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 glass border-r border-primary/10",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-primary/10">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-wider">CELOREAN</span>
          </Link>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="flex-1 space-y-1 px-4 py-6">
            {routes.map((route) => {
              const isActive = pathname === route.href
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary glow-text"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <route.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {route.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </>
  )
}
