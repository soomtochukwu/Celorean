

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
  version: "1",
  imageUrl: "https://www.celorean.school/farcaster/landingEmbed1.png",
  button: {
    title: "Start Learning",
    action: {
      type: "launch_miniapp",
      url: "https://www.celorean.school/",
      name: "Celorean!",
      splashImageUrl: "https://www.celorean.school/farcaster/celorean.png",
      splashBackgroundColor: "#006600"
    }
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
