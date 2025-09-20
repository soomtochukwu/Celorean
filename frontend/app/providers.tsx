"use client";
import "@rainbow-me/rainbowkit/styles.css";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  lightTheme,
  darkTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet, okxWallet, trustWallet, frameWallet, walletConnectWallet, valoraWallet, injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { celo, celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import { defineChain } from "viem";
import MiniAppSDK, { sdk } from '@farcaster/miniapp-sdk';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { NetworkProvider, useNetwork } from "@/contexts/NetworkContext";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAccount, useConnect } from "wagmi";
import { toast } from "sonner";

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
  if (process.env.NODE_ENV === 'development') {
    return localhost;
  }
  // Default to Alfajores (can be changed to celo for mainnet)
  return celoAlfajores;
};

const { wallets: defaultWallets } = getDefaultWallets();

// Prioritize Valora and WalletConnect for Celo users
const wallets = [
  {
    groupName: "Celo Preferred",
    wallets: [valoraWallet, walletConnectWallet],
  },
  {
    groupName: "Browser",
    wallets: [injectedWallet, metaMaskWallet, trustWallet, okxWallet, frameWallet],
  },
  ...defaultWallets,
];

const chains = [celoAlfajores, celo, localhost] as const satisfies readonly [import("viem").Chain, ...import("viem").Chain[]];

const transports = {
  [celoAlfajores.id]: http(),
  [celo.id]: http(),
  [localhost.id]: http('http://127.0.0.1:8545'),
} as const;

const WALLETCONNECT_PROJECT_ID = "b7cfcf662095cd0ee1e06aa9eebd146a";

function createWagmiConfig(isMiniApp: boolean) {
  // Build RainbowKit connectors for browser wallets
  const rkConnectors = connectorsForWallets(
    wallets,
    {
      appName: "Celorean",
      projectId: WALLETCONNECT_PROJECT_ID,
    }
  );

  // Optionally prepend Farcaster MiniApp connector when inside miniapp
  const connectors = isMiniApp
    ? [miniAppConnector(), ...rkConnectors]
    : rkConnectors;

  return createConfig({
    chains,
    transports,
    connectors,
    ssr: true,
  });
}

const queryClient = new QueryClient();

function NetworkSync() {
  const { refreshAddresses } = useNetwork();

  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAddresses();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [refreshAddresses]);

  return null;
}

function MiniAppAutoConnector({ enabled }: { enabled: boolean }) {
  const { isConnected } = useAccount();
  const { connect, connectors, error, status } = useConnect();

  React.useEffect(() => {
    if (!enabled || isConnected) return;
    const far = connectors.find((c) => c.id === 'farcasterMiniApp' || c.name.toLowerCase().includes('farcaster'));
    if (far) {
      connect({ connector: far });
    }
  }, [enabled, isConnected, connectors, connect]);

  React.useEffect(() => {
    if (error) {
      toast.error('Wallet connection failed', { description: error.message });
    }
  }, [error]);

  return null;
}

// Enhanced Providers component with network management
export function Providers({ children }: { children: React.ReactNode }) {
  // Determine preferred environment based on build mode
  const getPreferredEnvironment = (): 'localhost' | 'testnet' | 'mainnet' => {
    if (process.env.NODE_ENV === 'development') {
      return 'localhost';
    }
    return process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  };

  const [isMiniApp, setIsMiniApp] = React.useState(false);
  const [wagmiConfig, setWagmiConfig] = React.useState(() => createWagmiConfig(false));

  // Detect Farcaster MiniApp environment on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Ensure SDK is ready to resolve context properly
        await sdk.actions.ready();
        const inMiniApp = await MiniAppSDK.isInMiniApp();
        if (mounted) {
          setIsMiniApp(inMiniApp);
          if (inMiniApp) {
            setWagmiConfig(createWagmiConfig(true));
          }
        }
      } catch (_) {
        // Swallow detection errors and keep browser config
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
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
          <ErrorBoundary>
            <NetworkProvider
              enableAutoSwitching={false}
              preferredEnvironment={getPreferredEnvironment()}
              showNetworkToasts={true}
            >
              {children}
              <MiniAppAutoConnector enabled={isMiniApp} />
              <NetworkSync />
              <Toaster
                position="top-right"
                expand={false}
                richColors
                closeButton
                duration={4000}
              />
            </NetworkProvider>
          </ErrorBoundary>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
