"use client";

import { useAutoRedirect } from "@/hooks/redirect";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

import { useAccount, useConnect } from "wagmi";
import { usePathname } from "next/navigation";
import MiniAppSDK, { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";

/* 
function ConnectWalletButton() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()

  if (isConnected) {
    return (
      <>
        <div>You're connected!</div>
        <div>Address: {address}</div>
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect
    </button>
  )
} */

const ConnectWalletButton = () => {
  useAutoRedirect();

  // Miniapp-aware auto-connect (scoped to /login to avoid duplicating provider-level logic)
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const [isMiniApp, setIsMiniApp] = React.useState<boolean | null>(null);
  const autoTriedRef = React.useRef(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await sdk.actions.ready();
        const inMini = await MiniAppSDK.isInMiniApp();
        if (mounted) setIsMiniApp(inMini);
      } catch {
        if (mounted) setIsMiniApp(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!isMiniApp) return;
    if (isConnected) return;
    if (autoTriedRef.current) return;
    // Only auto-connect here on the login route to avoid conflicts with Providers' auto-connector
    if (!(pathname === "/login" || pathname?.startsWith("/login/"))) return;

    const far = connectors.find(
      (c) => c.id === "farcasterMiniApp" || c.name?.toLowerCase?.().includes("farcaster")
    );
    if (far) {
      autoTriedRef.current = true;
      connect({ connector: far });
    }
  }, [isMiniApp, isConnected, pathname, connectors, connect]);

  React.useEffect(() => {
    if (connectError) {
      toast.error("Wallet connection failed", { description: connectError.message });
    }
  }, [connectError]);

  return (
    <div className="fixed bottom-4 left-4 z-50 md:static md:bottom-auto md:left-auto">
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        chainStatus="none"
        showBalance={{
          smallScreen: false,
          largeScreen: false,
        }}
      ></ConnectButton>
    </div>
  );
};

export default ConnectWalletButton;
