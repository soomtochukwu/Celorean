
import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Space_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers";
import Body from "@/components/Body";
import { NetworkSwitcher } from "@/components/network-switcher";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Celorean | Web3 Education Platform",
  description: "Revolutionizing Education Through Personalized Learning with Blockchain and AI",
  generator: 'v0.dev'
}

const
  miniappMeta = {
    version: "1",
    imageUrl: "https://www.celorean.school/farcaster/landingEmbed1.png",
    button: {
      title: "Start Learning",
      action: {
        type: "launch_miniapp",
        url: "https://www.celorean.school/",
        name: "Celorean",
        splashImageUrl: "https://www.celorean.school/farcaster/celorean.png",
        splashBackgroundColor: "#002200"
      }
    }
  };


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jetbrainsMono.variable} ${spaceMono.variable}`}>
      <meta
        name="fc:miniapp"
        content={JSON.stringify(miniappMeta)}
      />
      <meta
        name="fc:frame"
        content={JSON.stringify(miniappMeta)}
      />

      <Body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {/* Global network badge (compact) */}
            <div className="fixed bottom-4 right-4 z-50">
              <NetworkSwitcher variant="compact" />
            </div>
            {children}
          </ThemeProvider>
        </Providers>
      </Body>
    </html>
  )
}
