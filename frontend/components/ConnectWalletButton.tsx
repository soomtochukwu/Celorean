"use client";

import { useAutoRedirect } from '@/hooks/redirect'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'

const ConnectWalletButton = () => {
  useAutoRedirect();
  return (
    <div><ConnectButton></ConnectButton></div>
  )
}

export default ConnectWalletButton