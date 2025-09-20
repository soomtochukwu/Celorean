"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Shield, User, LogOut, Menu, X, Zap, BookOpen, Settings, Users, UserCog, Activity, BadgeCheck } from "lucide-react"
import { useDisconnect, useAccount } from "wagmi"
import ConnectWalletButton from "./ConnectWalletButton"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet"

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
  const [isMobile, setIsMobile] = useState(false)

  // Refs for gesture handling
  const edgeZoneRef = useRef<HTMLDivElement | null>(null)
  const sheetContentRef = useRef<HTMLDivElement | null>(null)

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(("matches" in e ? e.matches : (e as MediaQueryList).matches))
    // Initial
    handler(mq)
    // Subscribe
    mq.addEventListener?.("change", handler as (e: MediaQueryListEvent) => void)
    return () => mq.removeEventListener?.("change", handler as (e: MediaQueryListEvent) => void)
  }, [])

  // Close on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Scroll lock when open on mobile
  useEffect(() => {
    if (!isMobile) return
    const body = document.body
    if (isOpen) {
      const prevOverflow = body.style.overflow
      const prevTouch = body.style.touchAction
      body.style.overflow = "hidden"
      body.style.touchAction = "none"
      return () => {
        body.style.overflow = prevOverflow
        body.style.touchAction = prevTouch
      }
    }
  }, [isOpen, isMobile])

  // Edge swipe to open (left 16px zone)
  useEffect(() => {
    if (!isMobile) return
    const zone = edgeZoneRef.current
    if (!zone) return

    let startX = 0
    let startY = 0
    let tracking = false
    const threshold = 28 // px to open

    const onStart = (e: TouchEvent) => {
      if (isOpen) return
      const t = e.touches[0]
      startX = t.clientX
      startY = t.clientY
      tracking = true
    }
    const onMove = (e: TouchEvent) => {
      if (!tracking) return
      const t = e.touches[0]
      const dx = t.clientX - startX
      const dy = Math.abs(t.clientY - startY)
      // horizontal intent, ignore big vertical scrolls
      if (dx > threshold && dy < 30) {
        tracking = false
        setIsOpen(true)
      }
    }
    const onEnd = () => {
      tracking = false
    }

    zone.addEventListener("touchstart", onStart, { passive: true })
    zone.addEventListener("touchmove", onMove, { passive: true })
    zone.addEventListener("touchend", onEnd, { passive: true })

    return () => {
      zone.removeEventListener("touchstart", onStart)
      zone.removeEventListener("touchmove", onMove)
      zone.removeEventListener("touchend", onEnd)
    }
  }, [isMobile, isOpen])

  // Swipe left inside sheet to close
  useEffect(() => {
    if (!isMobile) return
    const el = sheetContentRef.current
    if (!el) return

    let startX = 0
    let startY = 0
    let tracking = false
    const threshold = 28

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      startX = t.clientX
      startY = t.clientY
      tracking = true
    }
    const onMove = (e: TouchEvent) => {
      if (!tracking) return
      const t = e.touches[0]
      const dx = t.clientX - startX
      const dy = Math.abs(t.clientY - startY)
      if (dx < -threshold && dy < 30) {
        tracking = false
        setIsOpen(false)
      }
    }
    const onEnd = () => {
      tracking = false
    }

    el.addEventListener("touchstart", onStart, { passive: true })
    el.addEventListener("touchmove", onMove, { passive: true })
    el.addEventListener("touchend", onEnd, { passive: true })

    return () => {
      el.removeEventListener("touchstart", onStart)
      el.removeEventListener("touchmove", onMove)
      el.removeEventListener("touchend", onEnd)
    }
  }, [isMobile])

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
      name: "My Credentials",
      href: "/credentials",
      icon: BadgeCheck,
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

  const MenuContent = (
    <div className="flex h-full w-full flex-col" role="navigation" aria-label="Primary" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex h-16 items-center px-6 border-b border-primary/10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-wider">CELOREAN</span>
        </Link>
      </div>

      <div className="flex flex-col justify-between h-[calc(100%-4rem)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]",
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

        <div className="p-4 border-t border-primary/10" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}>
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: Hamburger button + edge swipe zone */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-[60] rounded-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          style={{ top: "max(1rem, env(safe-area-inset-top))", right: "max(1rem, env(safe-area-inset-right))" }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        {/* Edge swipe zone (left edge) */}
        {!isOpen && (
          <div
            ref={edgeZoneRef}
            className="fixed left-0 top-0 bottom-0 w-4 z-[50] touch-none"
            aria-hidden="true"
          />
        )}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetOverlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <SheetContent
            id="mobile-menu"
            ref={sheetContentRef as any}
            side="left"
            className={cn(
              "w-[85vw] sm:w-64 p-0 bg-background text-foreground border-r border-primary/10 will-change-transform transform-gpu transition-transform duration-300 ease-out",
              "motion-reduce:transition-none motion-reduce:transform-none",
            )}
          >
            {MenuContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Persistent sidebar */}
      <div
        className={cn(
          "hidden md:block fixed inset-y-0 left-0 z-40 w-64 border-r border-primary/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className,
        )}
      >
        {MenuContent}
      </div>
    </>
  )
}
