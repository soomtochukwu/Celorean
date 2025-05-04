import {
  ActivityIcon,
  BotIcon,
  HomeIcon,
  LineChartIcon,
  Package2Icon,
  PackageIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BellIcon,
  DashboardIcon,
  PersonIcon,
  LaptopIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import { NavLink } from "./NavLink";
import Link from "next/link";
import {
  Badge,
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAccount } from "wagmi";

export const paths = [
  {
    href: "/dash",
    name: "overview",
    Icon: HomeIcon,
  },
  {
    href: "/dash/courses",
    name: "Courses",
    Icon: DashboardIcon,
  },
  {
    href: "/dash/students",
    name: "Other students",
    Icon: PersonIcon,
  },
  {
    href: "/dash/chat",
    name: "Ask AI",
    Icon: LaptopIcon,
  },
  {
    href: "/dash/ai-evaluations",
    name: "AI Evaluations",
    Icon: ActivityIcon,
  },
  {
    href: "/dash/analytics",
    name: "Your progress",
    Icon: LineChartIcon,
  },
];
function Sidebar() {
  const //
    { address } = useAccount();
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Acme Inc</span>
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
            {/* {address == "0x49f2451AbEe35B261bB01f9d0CDC49f8f8df6E3f" ? (
              <Link href={"/admin"}>Admin</Link>
            ) : null} */}
          </nav>
        </div>
        {/* <div className="mt-auto p-4">
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
        </div> */}
      </div>
    </div>
  );
}

export default Sidebar;
