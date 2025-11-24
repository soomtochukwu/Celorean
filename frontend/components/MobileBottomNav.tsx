"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Home } from "lucide-react"

export function MobileBottomNav() {
    const router = useRouter()
    const pathname = usePathname()

    // Don't show on certain pages (like login, register)
    const hiddenPaths = ['/login', '/register', '/']
    if (hiddenPaths.includes(pathname)) {
        return null
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 p-3 z-50 lg:hidden safe-area-bottom">
            <div className="flex items-center justify-between max-w-screen-xl mx-auto gap-3">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex-1 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    size="sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </Button>

                {/* Home Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    size="sm"
                >
                    <Home className="w-5 h-5" />
                    <span className="text-sm font-medium">Home</span>
                </Button>

                {/* Forward Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.forward()}
                    className="flex-1 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    size="sm"
                >
                    <span className="text-sm font-medium">Forward</span>
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}
