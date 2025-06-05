import type React from "react";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { AnimatedBackground } from "@/components/animated-background";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <AnimatedBackground />

      <SidebarNavigation />
      <div className="flex-1 md:ml-64">{children}</div>
    </div>
  );
}
