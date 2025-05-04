"use client";

import Sidebar from "./_components/sidebar";

import DashHeader from "./_components/dash-header";
import Header from "./_components/header";
import SSidebar from "./_components/side-bar";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useAccount(),
    router = useRouter();

  useEffect(() => {
    status !== "connected" ? router.push("/") : null;
  }, [status]);
  return (
    <>
      {/* <div key="1" className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <DashHeader />
        {children}
      </div>
    </div> */}

      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1">
              <SSidebar />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <Header />
          {children}
        </div>
      </div>
    </>
  );
}
