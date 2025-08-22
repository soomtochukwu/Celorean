

import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers";
import Body from "@/components/Body";

export const metadata: Metadata = {
  title: "Celorean | Web3 Education Platform",
  description: "Revolutionizing Education Through Personalized Learning with Blockchain and AI",
  generator: 'v0.dev'
}

const miniapp = {
  "frame": {
    "name": "Celorean",
    "version": "1",
    "iconUrl": "https://https://www.celorean.school/farcaster/celorean.png",
    "homeUrl": "https://https://www.celorean.school/",
    "imageUrl": "https://https://www.celorean.school//image.png",
    "buttonTitle": "Start Learning",
    "splashImageUrl": "https://https://www.celorean.school/farcaster/celorean.png",
    "splashBackgroundColor": "#006600",
    "webhookUrl": "https://https://www.celorean.school//api/webhook",
    "subtitle": "Revolutionizing Education with Blockchain & AI",
    "description": "Celorean leverages the power of blockchain and AI to create a dynamic, secure, and rewarding learning experience for all.",
    "primaryCategory": "education",
    "heroImageUrl": "https://https://www.celorean.school/farcaster/landingEmbed1.png",
    "tags": [
      "education",
      "defi"
    ],
    "tagline": "grow, learn"
  }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="fc:miniapp" content={String(miniapp)} />
      <meta name="fc:frame" content={String(miniapp)} />

      <Body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Providers>
      </Body>
    </html>
  )
}
