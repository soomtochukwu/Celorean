"use client";

import Link from "next/link";
import Header from "./_components/header";
import AdminDashboardSidebar from "./_components/sidebar";

import { GiftIcon, HomeIcon, LineChart, Package, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function SchoolAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status, address } = useAccount(),
    router = useRouter();

  useEffect(() => {
    // status !== "connected" ? router.push("/") : null;
    // status == "connected" ? router.push("/admin") : null;
    "0x8a371e00cd51E2BE005B86EF73C5Ee9Ef6d23FeB".includes(
      String(address)
    )
      ? null
      : router.back();
  }, [status]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex-1 ">
            <AdminDashboardSidebar />
          </div>
          <div className="mt-auto p-4">
            <Card x-chunk="dashboard-02-chunk-0">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}
