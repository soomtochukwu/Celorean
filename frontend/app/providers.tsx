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
import { usePathname } from "next/navigation";

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

// Global Loading Context and Provider
type LoadingContextValue = {
  active: boolean;
  start: (opts?: { minDuration?: number }) => void;
  stop: () => void;
  withLoading: <T>(fn: () => Promise<T>, opts?: { minDuration?: number }) => Promise<T>;
};

const LoadingContext = React.createContext<LoadingContextValue | null>(null);

export function useGlobalLoading() {
  const ctx = React.useContext(LoadingContext);
  if (!ctx) throw new Error("useGlobalLoading must be used within Providers");
  return ctx;
}

function TopProgressBar({ active, progress }: { active: boolean; progress: number }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100]"
    >
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={active ? Math.round(progress) : undefined}
        aria-busy={active}
        className={`h-0.5 bg-primary transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: `${Math.max(0, Math.min(100, progress))}%`,
          boxShadow: '0 0 8px rgba(0, 255, 120, 0.5)',
          transitionProperty: 'width, opacity',
          transitionDuration: '200ms',
        }}
      />
    </div>
  );
}

function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const counterRef = React.useRef(0);
  const startedAtRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<number | null>(null);

  const tick = React.useCallback(() => {
    setProgress((p) => {
      if (p < 80) {
        // Ease out towards 80%
        const delta = Math.max(0.5, (80 - p) * 0.1);
        return Math.min(80, p + delta);
      }
      return p;
    });
  }, []);

  const clearTimer = React.useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = React.useCallback((opts?: { minDuration?: number }) => {
    counterRef.current += 1;
    if (!active) {
      setActive(true);
      setProgress(10);
      startedAtRef.current = Date.now();
      clearTimer();
      intervalRef.current = window.setInterval(tick, 200) as unknown as number;
    }
  }, [active, clearTimer, tick]);

  const stop = React.useCallback(() => {
    if (counterRef.current > 0) counterRef.current -= 1;
    if (counterRef.current > 0) return; // Still pending actions

    const finalize = () => {
      setProgress(100);
      window.setTimeout(() => {
        setActive(false);
        setProgress(0);
        clearTimer();
        startedAtRef.current = null;
      }, 200);
    };

    const startedAt = startedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const minDuration = 300;
    if (elapsed < minDuration) {
      window.setTimeout(finalize, minDuration - elapsed);
    } else {
      finalize();
    }
  }, [clearTimer]);

  const withLoading = React.useCallback(async <T,>(fn: () => Promise<T>, opts?: { minDuration?: number }) => {
    start(opts);
    try {
      const res = await fn();
      return res;
    } finally {
      stop();
    }
  }, [start, stop]);

  // Start on any click interaction (capture phase) and auto-stop shortly after
  React.useEffect(() => {
    const onClick = () => {
      start({ minDuration: 300 });
      // Auto stop if nothing else extended it
      window.setTimeout(() => stop(), 500);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true } as any);
  }, [start, stop]);

  // Route transitions: start when pathname changes, stop after a short delay
  const pathname = usePathname();
  React.useEffect(() => {
    if (!pathname) return;
    start({ minDuration: 400 });
    const t = window.setTimeout(() => stop(), 800);
    return () => window.clearTimeout(t);
  }, [pathname, start, stop]);

  const value = React.useMemo<LoadingContextValue>(() => ({ active, start, stop, withLoading }), [active, start, stop, withLoading]);

  return (
    <LoadingContext.Provider value={value}>
      <TopProgressBar active={active} progress={progress} />
      {/* Screen reader announcement */}
      <span className="sr-only" aria-live="polite">{active ? 'Loading' : 'Idle'}</span>
      {children}
    </LoadingContext.Provider>
  );
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
              <GlobalLoadingProvider>
                {children}
              </GlobalLoadingProvider>
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
