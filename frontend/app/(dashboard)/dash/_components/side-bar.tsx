"use client";

import { Button } from "@/components/ui/button";

import {
  Bell,
  PersonStanding,
  BookIcon,
  GiftIcon,
  Home,
  LineChart,
  Package,
  Package2,
  User,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { paths } from "./sidebar";
import { useAccount } from "wagmi";

export function Sidebar() {
  const { address } = useAccount();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Celorean</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {paths.map((path) => {
              return (
                <Link
                  key={path.name}
                  href={path.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <path.Icon className="h-4 w-4" />
                  {path.name}
                </Link>
              );
            })}

            {"0x8a371e00cd51E2BE005B86EF73C5Ee9Ef6d23FeB".includes(
              String(address)
            ) ? (
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                href={"/admin"}
              >
                <PersonStanding></PersonStanding>
                Admin
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
