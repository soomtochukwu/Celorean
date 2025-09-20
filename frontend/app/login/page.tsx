"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Mail, Lock, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import ConnectWalletButton from "@/components/ConnectWalletButton"
import { useAccount, useChainId, useSignMessage } from "wagmi"
import { toast } from "sonner"
import { useGlobalLoading } from "@/app/providers"

const DASHBOARD_PAGE = "/dashboard"

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<"checking" | "active" | "none">("checking")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const { address, isConnected, connector, status } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const verifyingRef = useRef(false)
  const { withLoading } = useGlobalLoading()

  // Lightweight client-side session check (matches providers.tsx key)
  function readStoredSession(): { address?: string; expiresAt?: number } | null {
    try {
      const raw = localStorage.getItem("celorean.session")
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed.expiresAt !== "number") return null
      if (parsed.expiresAt <= Date.now()) return null
      return parsed
    } catch {
      return null
    }
  }

  // Quickly check if a valid session already exists and skip re-auth
  useEffect(() => {
    let mounted = true
    ;(async () => {
      // 1) Client-side quick check
      const local = readStoredSession()
      if (!mounted) return
      if (local) {
        setSessionStatus("active")
        router.replace(DASHBOARD_PAGE)
        return
      }
      // 2) Server-side session check (httpOnly cookie)
      try {
        const res = await fetch("/api/auth/session", { method: "GET" })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          if (data?.authenticated) {
            setSessionStatus("active")
            router.replace(DASHBOARD_PAGE)
            return
          }
        }
      } catch {
        // ignore errors and proceed to auth if needed
      }
      if (!mounted) return
      setSessionStatus("none")
    })()
    return () => {
      mounted = false
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    return false
  }

  async function startAuth() {
    if (!isConnected || !address || !chainId) return
    if (verifyingRef.current) return
    verifyingRef.current = true

    await withLoading(async () => {
      const walletType =
        connector?.id === "farcasterMiniApp" || (connector?.name?.toLowerCase?.() || "").includes("farcaster")
          ? "farcaster"
          : "standard"

      const dismiss = toast.loading("Verifying wallet…")
      try {
        // 1) Get a signed nonce token from server
        const nonceRes = await fetch("/api/auth/nonce", { method: "GET" })
        if (!nonceRes.ok) throw new Error("Failed to get nonce")
        const { token, nonce, issuedAt, domain, uri } = await nonceRes.json()

        // 2) Build SIWE-style message and sign
        const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nURI: ${uri}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}`
        const signature = await signMessageAsync({ message })

        // 3) Verify on server (sets httpOnly session cookie)
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, signature, token, chainId, walletType }),
        })
        if (!verifyRes.ok) {
          const err = await verifyRes.json().catch(() => ({}))
          throw new Error(err?.error || "Verification failed")
        }

        toast.success("Authenticated")
        router.replace(DASHBOARD_PAGE)
      } catch (err: any) {
        toast.error("Authentication failed", { description: err?.message || "Unknown error" })
      } finally {
        toast.dismiss(dismiss)
        verifyingRef.current = false
      }
    })
  }

  // Start wallet-based auth only after confirming no active session
  useEffect(() => {
    if (sessionStatus !== "none") return
    if (isConnected && address) {
      startAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, isConnected, address])

  const handleWalletConnect = (addr: string) => {
    // Deprecated: we now auto-verify on connect via effect
    // Kept for compatibility if needed elsewhere
    // No-op here; sessionStatus effect will handle auth/redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 glass border-b border-primary/10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-wider">CELOREAN</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="glass border-primary/10 glow-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Start your learning journey with Celorean</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Connect with wallet</span>
                  </div>
                </div>
                <div className="flex w-full justify-center">
                  <ConnectWalletButton />
                </div>
                {sessionStatus === "checking" && (
                  <p className="text-xs text-muted-foreground text-center">Checking existing session…</p>
                )}
                {status === "connecting" && (
                  <p className="text-xs text-muted-foreground text-center">Connecting wallet…</p>
                )}
                {isConnected && (
                  <p className="text-xs text-muted-foreground text-center">Verifying connection…</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Coming Soon
                  </Badge>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 opacity-50">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        className="pl-10 glass border-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 pointer-events-none opacity-50">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled
                        className="pl-10 glass border-primary/20"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled>
                    <>
                      Start Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  </Button>
                </form>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
