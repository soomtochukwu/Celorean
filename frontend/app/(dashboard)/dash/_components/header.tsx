"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  BookIcon,
  CircleUserIcon,
  GiftIcon,
  HomeIcon,
  LineChart,
  Menu,
  Package,
  Package2Icon,
  PersonStanding,
  Search,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";

function Header() {
  const pathname = usePathname(),
    { address } = useAccount(),
    router = useRouter();

  // useEffect(() => {
  //   status !== "connected" ? router.push("/") : null;
  // }, [status]);
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dash/courses"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <BookIcon className="h-4 w-4" />
              Courses
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                7
              </Badge>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <User className="h-4 w-4" />
              Other Students
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                732
              </Badge>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <Package className="h-4 w-4" />
              Ask AI
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <Package className="h-4 w-4" />
              AI Evaluations
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <GiftIcon className="h-4 w-4" />
              Your Progress
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <LineChart className="h-4 w-4" />
              Latest Activity
            </Link>
            {"0x49f2451AbEe35B261bB01f9d0CDC49f8f8df6E3f,0xE122199bB9617d8B0e814aC903042990155015b4,0x3207D4728c32391405C7122E59CCb115A4af31eA,0x4d5fea37e8a7597fE57e6dd967B483056A488eFB".includes(
              String(address)
            ) ? (
              <Link
                href={"/admin"}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <PersonStanding></PersonStanding>
                Admin
              </Link>
            ) : null}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "avatar",
        }}
        chainStatus="icon"
        showBalance={{
          smallScreen: false,
          largeScreen: true,
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUserIcon className="h-5 w-5" />
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

export default Header;
