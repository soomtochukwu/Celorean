"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export function useAutoRedirect() {
  const //
    path = usePathname(),
    router = useRouter(),
    { isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    isConnected ? router.push("/dashboard") : null;
  }, [isConnected]);
  useEffect(() => {
    isDisconnected && path == "/login"
      ? null
      : isDisconnected
      ? router.push("/")
      : null;
  }, [isDisconnected]);
}

export function useRedirect() {
  const //
    router = useRouter(),
    { isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    isConnected ? router.push("/dashboard") : null;
  }, [isConnected]);
  useEffect(() => {
    isDisconnected ? router.push("/") : null;
  }, [isDisconnected]);
}
