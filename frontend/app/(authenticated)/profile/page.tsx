"use client"

import type React from "react"
import Link from "next/link"
import { Shield, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Profile() {
  return (
    <div className="p-6 md:p-8 min-h-[80vh] flex items-center justify-center relative">
      {/* Disabled overlay effect */}
      <div className="absolute inset-0 bg-terminal-black/60 backdrop-blur-sm z-10 pointer-events-none" />

      {/* Verification Required Message */}
      <Card className="terminal-box max-w-2xl w-full z-20 border-terminal-orange">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-terminal-orange/10 border-2 border-terminal-orange flex items-center justify-center">
            <Lock className="h-10 w-10 text-terminal-orange" />
          </div>
          <CardTitle className="text-2xl font-mono font-bold uppercase tracking-tight text-white mb-2">
            VERIFICATION_REQUIRED
          </CardTitle>
          <CardDescription className="text-base font-mono text-muted-foreground">
            Access to profile settings is restricted
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="terminal-box p-4 bg-terminal-orange/5 border-terminal-orange">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-terminal-orange mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-mono text-white font-bold uppercase tracking-wider">
                  SECURITY PROTOCOL REQUIRED
                </p>
                <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                  Before accessing your profile settings, you must complete identity verification using the SELF protocol. This ensures the security and authenticity of your account.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              NEXT STEPS:
            </p>
            <ol className="space-y-2 font-mono text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-terminal-green font-bold min-w-[1.5rem]">01.</span>
                <span>Navigate to the Verification page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terminal-green font-bold min-w-[1.5rem]">02.</span>
                <span>Complete SELF protocol verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terminal-green font-bold min-w-[1.5rem]">03.</span>
                <span>Return to access full profile features</span>
              </li>
            </ol>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="flex-1">
              <Link href="/self-verification">
                <Shield className="mr-2 h-4 w-4" />
                GO TO VERIFICATION
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1">
              <Link href="/dashboard">
                RETURN TO DASHBOARD
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-terminal-border">
            <p className="text-xs font-mono text-muted-foreground text-center">
              <span className="text-terminal-green">[INFO]</span> Your data is secure. Verification typically takes 2-3 minutes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Background blurred content for context */}
      <div className="absolute inset-0 p-6 md:p-8 opacity-20 pointer-events-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold uppercase">PROFILE</h1>
            <p className="text-muted-foreground font-mono">Manage your personal information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="terminal-box">
              <CardHeader className="text-center">
                <div className="w-24 h-24 border border-terminal-border flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-muted-foreground">LOCKED</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="terminal-box">
              <CardHeader>
                <CardTitle className="text-muted-foreground">PROFILE INFORMATION</CardTitle>
                <CardDescription className="text-muted-foreground/60">Verification required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-terminal-border/20 border border-terminal-border" />
                  <div className="h-10 bg-terminal-border/20 border border-terminal-border" />
                  <div className="h-10 bg-terminal-border/20 border border-terminal-border" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
