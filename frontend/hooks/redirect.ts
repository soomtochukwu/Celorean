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
    isConnected
      ? path == "/login"
        ? router.push("/dashboard")
        : router.push("#")
      : null;
  }, [isConnected]);
  useEffect(() => {}, [isDisconnected]);
}
