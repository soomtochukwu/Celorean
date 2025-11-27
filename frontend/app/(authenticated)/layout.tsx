import type React from "react";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { AnimatedBackground } from "@/components/animated-background";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { NetworkSwitcher } from "@/components/network-switcher";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* <AnimatedBackground /> */}

      <SidebarNavigation />
      <div className="flex-1 md:ml-64 pb-20 lg:pb-0">
        {/* Top-right controls for authenticated pages */}
        <div className="sticky top-0 z-40 flex items-center justify-between gap-2 p-2 px-4 md:px-2 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex-1" />
          <NetworkSwitcher variant="minimal" />
          <ConnectWalletButton />
        </div>
        {children}

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
