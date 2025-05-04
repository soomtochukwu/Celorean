"use client";
import { Package2Icon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { paths } from "./sidebar";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function DashHeader() {
  const pathname = usePathname(),
    { status } = useAccount(),
    router = useRouter();

  // useEffect(() => {
  //   status !== "connected" ? router.push("/") : null;
  // }, [status]);

  console.log(pathname);
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
      <Link className="lg:hidden" href="#">
        <Package2Icon className="h-6 w-6" />
        <span className="sr-only">
          {" "}
          {paths.find((path) => path.href === pathname)?.name}
        </span>
      </Link>
      <div className="flex-1">
        <h1 className="font-semibold text-lg capitalize">
          {" "}
          {paths.find((path) => path.href === pathname)?.name}
        </h1>
      </div>
      <Button
        className="rounded-full border-gray-200 w-8 h-8 dark:border-gray-800"
        size="icon"
      >
        <SearchIcon className="w-4 h-4" />
        <span className="sr-only">Search</span>
      </Button>
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "avatar",
        }}
        chainStatus="icon"
        showBalance={{
          smallScreen: true,
          largeScreen: true,
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Image
              alt="Avatar"
              className="rounded-full"
              height="32"
              src="/images/user1.png"
              style={{
                aspectRatio: "32/32",
                objectFit: "cover",
                objectPosition: "top",
              }}
              width={32}
            />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default DashHeader;
