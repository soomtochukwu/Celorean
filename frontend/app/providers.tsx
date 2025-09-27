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
import { QueryClient, QueryClientProvider, useIsFetching, useIsMutating } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import { defineChain } from "viem";
import MiniAppSDK, { sdk } from '@farcaster/miniapp-sdk';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { NetworkProvider, useNetwork } from "@/contexts/NetworkContext";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAccount, useConnect } from "wagmi";
// Add useDisconnect for manual disconnect handling
import { useDisconnect } from "wagmi";
// Add missing imports for chain guard
import { useChainId, useSwitchChain } from "wagmi";
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

// Session management configuration
const SESSION_STORAGE_KEY = "celorean.session";
const SESSION_DURATION_MS = 3600 * 1000; // 1 hour

type StoredSession = {
  address: string;
  createdAt: number; // epoch ms
  expiresAt: number; // epoch ms
};

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function writeStoredSession(s: StoredSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
  } catch (_) {
    // ignore
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_) {
    // ignore
  }
}

function SessionManager() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const expiryRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const cancelTimer = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleExpiry = React.useCallback((expiresAt: number) => {
    cancelTimer();
    const now = Date.now();
    const delay = Math.max(0, expiresAt - now);
    timerRef.current = window.setTimeout(() => {
      // Auto-expire: clear session and disconnect wallet
      clearStoredSession();
      expiryRef.current = null;
      if (isConnected) {
        disconnect();
      }
    }, delay) as unknown as number;
  }, [cancelTimer, disconnect, isConnected]);

  // Create or resume session on successful wallet connection
  React.useEffect(() => {
    if (!isConnected || !address) {
      // On disconnect, ensure session is cleared and timers are cancelled
      cancelTimer();
      expiryRef.current = null;
      clearStoredSession();
      return;
    }

    const existing = readStoredSession();
    const validExisting = existing && existing.expiresAt > Date.now() && existing.address === address ? existing : null;

    if (validExisting) {
      // Resume existing session without redundant validation
      expiryRef.current = validExisting.expiresAt;
      scheduleExpiry(validExisting.expiresAt);
    } else {
      // Create a new session
      const now = Date.now();
      const expiresAt = now + SESSION_DURATION_MS;
      const session: StoredSession = { address, createdAt: now, expiresAt };
      writeStoredSession(session);
      expiryRef.current = expiresAt;
      scheduleExpiry(expiresAt);
    }
  }, [isConnected, address, scheduleExpiry, cancelTimer]);

  // Keep session alive without revalidation during its lifetime (no polling). When tab regains focus, just check expiry once.
  React.useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const s = readStoredSession();
        if (!s || s.expiresAt <= Date.now()) {
          // Expired in background – enforce logout
          cancelTimer();
          expiryRef.current = null;
          clearStoredSession();
          if (isConnected) disconnect();
        } else if (expiryRef.current !== s.expiresAt) {
          // If expiry changed (another tab), reschedule
          expiryRef.current = s.expiresAt;
          scheduleExpiry(s.expiresAt);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, [cancelTimer, disconnect, isConnected, scheduleExpiry]);

  // Cross-tab synchronization via storage events
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SESSION_STORAGE_KEY) return;
      const s = readStoredSession();
      if (!s || s.expiresAt <= Date.now()) {
        // Session removed/expired in another tab
        cancelTimer();
        expiryRef.current = null;
        clearStoredSession();
        if (isConnected) disconnect();
      } else {
        expiryRef.current = s.expiresAt;
        scheduleExpiry(s.expiresAt);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [cancelTimer, disconnect, isConnected, scheduleExpiry]);

  return null;
}

// Paths that represent authenticated sections where auto-connection is allowed
const AUTH_SECTIONS = [
  "/activity",
  "/admin",
  "/community",
  "/course",
  "/credentials",
  "/learning",
  "/profile",
  "/self-verification",
  "/settings",
];

function shouldAutoConnectForPath(pathname?: string) {
  if (!pathname) return false;
  // Explicitly block auto-connect on dashboard (and any nested routes)
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return false;
  // Allow auto-connect for the rest of authenticated sections
  return AUTH_SECTIONS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

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
          willChange: 'width, opacity',
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
  const holdTimeoutRef = React.useRef<number | null>(null);
  const minDurationRef = React.useRef<number>(300);

  const isFetching = useIsFetching();
  const isMutating = useIsMutating ? useIsMutating() : 0 as number;

  const tick = React.useCallback(() => {
    setProgress((p) => {
      if (p < 80) {
        // Ease out towards 80%
        const delta = Math.max(0.5, (80 - p) * 0.1);
        return Math.min(80, p + delta);
      }
      if (p < 95) {
        // Crawl towards 95% while work continues
        const delta = Math.max(0.1, (95 - p) * 0.03);
        return Math.min(95, p + delta);
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

  const clearHoldTimer = React.useCallback(() => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  const start = React.useCallback((opts?: { minDuration?: number }) => {
    counterRef.current += 1;
    // Cancel any pending hide from a previous cycle
    clearHoldTimer();
    if (!active) {
      // Initialize minimum display duration for this cycle
      minDurationRef.current = opts?.minDuration ?? 300;
      setActive(true);
      setProgress(10);
      startedAtRef.current = Date.now();
      clearTimer();
      intervalRef.current = window.setInterval(tick, 200) as unknown as number;
    } else if (opts?.minDuration) {
      // If already active, honor the greater requested min duration
      minDurationRef.current = Math.max(minDurationRef.current ?? 300, opts.minDuration);
    }
  }, [active, clearTimer, clearHoldTimer, tick]);

  const finalizeWithHold = React.useCallback(() => {
    // Immediately complete to 100%
    setProgress(100);
    // Stop background ticking while we display completion state
    clearTimer();
    // Hold at 100% momentarily so users see completion before fade out
    const holdDuration = 400;
    clearHoldTimer();
    holdTimeoutRef.current = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
      startedAtRef.current = null;
      minDurationRef.current = 300;
      clearHoldTimer();
    }, holdDuration) as unknown as number;
  }, [clearHoldTimer, clearTimer]);

  const stop = React.useCallback(() => {
    if (counterRef.current > 0) counterRef.current -= 1;
    if (counterRef.current > 0) return; // Still pending actions

    const startedAt = startedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const minDuration = Math.max(0, minDurationRef.current ?? 300);
    if (elapsed < minDuration) {
      window.setTimeout(finalizeWithHold, minDuration - elapsed);
    } else {
      finalizeWithHold();
    }
  }, [finalizeWithHold]);

  // Immediate completion path used when we know the page is fully loaded (network idle)
  const stopImmediate = React.useCallback(() => {
    counterRef.current = 0;
    finalizeWithHold();
  }, [finalizeWithHold]);

  const withLoading = React.useCallback(async <T,>(fn: () => Promise<T>, opts?: { minDuration?: number }) => {
    start(opts);
    try {
      const res = await fn();
      return res;
    } finally {
      stop();
    }
  }, [start, stop]);

  // Start on any click interaction (capture phase) and auto-stop shortly after for non-network actions
  React.useEffect(() => {
    const onClick = () => {
      start({ minDuration: 300 });
      // Auto stop if nothing else extended it
      window.setTimeout(() => stop(), 600);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true } as any);
  }, [start, stop]);

  // Route transitions: start when pathname changes and rely on network-idle to finish.
  const pathname = usePathname();
  React.useEffect(() => {
    if (!pathname) return;
    start({ minDuration: 300 });
    // Fallback: if something goes wrong, ensure it completes rather than hangs
    const fallback = window.setTimeout(() => {
      if (active) stopImmediate();
    }, 5000);
    return () => window.clearTimeout(fallback);
  }, [pathname, start, active, stopImmediate]);

  // React Query network idleness determines when the page is "fully loaded" for data
  React.useEffect(() => {
    const busy = (isFetching || 0) + (isMutating || 0) > 0;
    if (busy) {
      start({ minDuration: 300 });
    } else {
      if (active) {
        // Complete immediately to 100% when network is idle
        stopImmediate();
      }
    }
  }, [isFetching, isMutating, active, start, stopImmediate]);

  // Also complete immediately on full window load (initial mount)
  React.useEffect(() => {
    const onLoad = () => {
      if (active) stopImmediate();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [active, stopImmediate]);

  // Accessibility: reflect busy state at document level for AT
  React.useEffect(() => {
    try {
      document.body?.setAttribute('aria-busy', active ? 'true' : 'false');
    } catch {}
    return () => {
      try { document.body?.setAttribute('aria-busy', 'false'); } catch {}
    };
  }, [active]);

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
  const pathname = usePathname();
  const enableAutoConnect = React.useMemo(() => isMiniApp && shouldAutoConnectForPath(pathname || undefined), [isMiniApp, pathname]);

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
              {/* Session management: create on connect, auto-expire in 1 hour, clear on disconnect */}
              <SessionManager />
              <MiniAppAutoConnector enabled={enableAutoConnect} />
              <MiniAppChainGuard enabled={isMiniApp} />
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

function MiniAppChainGuard({ enabled }: { enabled: boolean }) {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  React.useEffect(() => {
    if (!enabled) return;
    // Allowed chains: Celo Alfajores (44787), Celo (42220), Localhost (1337)
    const allowed = new Set([44787, 42220, 1337]);
    if (!allowed.has(chainId)) {
      // Prefer Alfajores in miniapp
      try {
        switchChain({ chainId: 44787 });
      } catch (e) {
        // Swallow errors; user can switch manually via UI
      }
    }
  }, [enabled, chainId, switchChain]);

  return null;
}
