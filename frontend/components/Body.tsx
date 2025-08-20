"use client"

import type React from "react"
import { sdk } from '@farcaster/miniapp-sdk'
import { useEffect } from "react";



export default function Body({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    useEffect(() => {
        const readyApp = async () => {
            await sdk.actions.ready()
            console.log("App is ready")
        }
        readyApp()
    }, [])
    return (
        <body className={`font-sans antialiased`}>
            {children}
        </body>
    )
}
