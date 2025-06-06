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
import { metaMaskWallet, okxWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { celo, celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
    appName: "Celorean",
    projectId: "b7cfcf662095cd0ee1e06aa9eebd146a",
    wallets: [
        {
            groupName: "Other",
            wallets: [metaMaskWallet, okxWallet, trustWallet],
        },
        ...wallets,
        // 
    ],
    chains: [
        celoAlfajores,
        celo,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
            ? [celoAlfajores]
            : []),
    ],
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
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
                    initialChain={celoAlfajores}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
