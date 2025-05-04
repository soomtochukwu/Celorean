import { Analytics } from "@vercel/analytics/react";

//

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Celorean",
  icons: { icon: "/favicon.ico" },
  keywords: ["Celorean", "EduChain", "Blockchain", "AI", "Web3"],
  description: "EduChain: Personalized Learning with Blockchain and AI (MVP)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " " + ""}>
        <Providers>
          {/*Removed the padding here: */}
          <div className="p-0 ">{children}</div>
        </Providers>
        <Analytics></Analytics>
      </body>
    </html>
  );
}
