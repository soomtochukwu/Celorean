"use client";

import { useAutoRedirect } from "@/hooks/redirect";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

import { useAccount, useConnect } from "wagmi";

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
