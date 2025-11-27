"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ConnectWalletButton from "@/components/ConnectWalletButton"

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const handleWalletConnect = (address: string) => {
    // Redirect to dashboard after wallet connection
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 border-b border-terminal-border bg-terminal-black">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Celorean Logo" className="h-8 w-8" style={{ filter: 'brightness(0) saturate(100%) invert(84%) sepia(23%) saturate(2578%) hue-rotate(91deg) brightness(101%) contrast(101%)' }} />
            <span className="text-xl font-mono font-bold tracking-widest text-terminal-green">CELOREAN</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="glass border-primary/10 glow-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>Sign up for Celorean to start your learning journey</CardDescription>
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
                <ConnectWalletButton />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-200 text-center">
                  Registration is currently disabled. Only the admin can admit students for now.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 opacity-60">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe (Coming Soon)"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="pl-10 glass border-primary/20 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com (Coming Soon)"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="pl-10 glass border-primary/20 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="•••••••• (Coming Soon)"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="pl-10 glass border-primary/20 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="•••••••• (Coming Soon)"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="pl-10 glass border-primary/20 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                  .
                </div>
                <Button type="submit" className="w-full" disabled>
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  ) : (
                    <>
                      Create Account (Disabled)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
