"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ConnectWalletButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  onConnect?: (address: string) => void
}

export function ConnectWalletButton({
  className,
  variant = "default",
  size = "default",
  onConnect,
}: ConnectWalletButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const handleConnect = (walletType: string) => {
    setIsConnecting(true)

    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress =
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")

      setWalletAddress(mockAddress)
      setIsConnected(true)
      setIsConnecting(false)

      if (onConnect) {
        onConnect(mockAddress)
      }
    }, 1500)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("font-mono border-primary/30 hover:border-primary/50", className)}
      >
        <Wallet className="mr-2 h-4 w-4 text-primary" />
        {formatAddress(walletAddress)}
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={cn("relative overflow-hidden group", className)}>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></span>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => handleConnect("metamask")}
            disabled={isConnecting}
            className="flex justify-between items-center"
          >
            <span>MetaMask</span>
            {isConnecting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            ) : (
              <img src="/placeholder.svg?height=20&width=20" alt="MetaMask" className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={() => handleConnect("walletconnect")}
            variant="outline"
            disabled={isConnecting}
            className="flex justify-between items-center"
          >
            <span>WalletConnect</span>
            {isConnecting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            ) : (
              <img src="/placeholder.svg?height=20&width=20" alt="WalletConnect" className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={() => handleConnect("coinbase")}
            variant="outline"
            disabled={isConnecting}
            className="flex justify-between items-center"
          >
            <span>Coinbase Wallet</span>
            {isConnecting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            ) : (
              <img src="/placeholder.svg?height=20&width=20" alt="Coinbase" className="h-5 w-5" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
