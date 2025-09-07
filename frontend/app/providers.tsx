"use client";
import "@rainbow-me/rainbowkit/styles.css";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet, okxWallet, trustWallet, frameWallet } from "@rainbow-me/rainbowkit/wallets";
import { celo, celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { NetworkProvider } from "@/contexts/NetworkContext";
import { Toaster } from "sonner";

// Define localhost hardhat chain
const localhost = defineChain({
  id: 1337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'http://localhost:8545' },
  },
})

// Determine initial chain based on environment
const getInitialChain = () => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    return localhost;
  }
  // For production, use celoAlfajores (testnet) or celo (mainnet)
  // You can customize this logic based on your deployment strategy
  return celoAlfajores; // or celo for mainnet
};

const { wallets } = getDefaultWallets();


const config = getDefaultConfig({
  appName: "Celorean",
  projectId: "b7cfcf662095cd0ee1e06aa9eebd146a",
  wallets: [
    {
      groupName: "Other",
      wallets: [frameWallet],
    },
    ...wallets
  ],
  chains: [
    celoAlfajores,
    celo,
    localhost, // Add localhost chain
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [celoAlfajores]
      : []),
  ],
  ssr: true,
});
/* const config = createConfig({
  chains: [celoAlfajores, celo],
  transports: {
    [celoAlfajores.id]: http(),
    [celo.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
}) */

const queryClient = new QueryClient();

// Enhanced Providers component with network management
export function Providers({ children }: { children: React.ReactNode }) {
  // Determine preferred environment based on build mode
  const getPreferredEnvironment = (): 'localhost' | 'testnet' | 'mainnet' => {
    if (process.env.NODE_ENV === 'development') {
      return 'localhost';
    }
    // For production builds, prefer testnet unless explicitly set to mainnet
    return process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#005500",
            accentColorForeground: "white",
            fontStack: "system",
            overlayBlur: "small",
            borderRadius: "large",
          })}
          modalSize="compact"
          initialChain={getInitialChain()}
        >
          <NetworkProvider
            enableAutoSwitching={false} // Disable auto-switching to let users choose
            preferredEnvironment={getPreferredEnvironment()}
            showNetworkToasts={true}
          >
            {children}
            <Toaster
              position="top-right"
              expand={false}
              richColors
              closeButton
              duration={4000}
            />
          </NetworkProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
