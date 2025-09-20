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
    if (!isConnected) return;
    if (path !== "/login") return;
    // Only redirect if we detect an active client session to prevent duplicate auth
    try {
      const raw = localStorage.getItem("celorean.session");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now()) {
        router.push("/dashboard");
      }
    } catch {
      // ignore JSON/storage errors
    }
  }, [isConnected, path, router]);

  useEffect(() => {
    // Reserved for future: optionally redirect on disconnect
  }, [isDisconnected]);
}
