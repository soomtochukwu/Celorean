"use client";

import { useAutoRedirect } from '@/hooks/redirect'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'

const ConnectWalletButton = () => {
  useAutoRedirect();
  return (
    <div><ConnectButton
      accountStatus={{
        smallScreen: "avatar",
        largeScreen: "full",
      }}
      chainStatus="icon"
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}></ConnectButton></div>
  )
}

export default ConnectWalletButton