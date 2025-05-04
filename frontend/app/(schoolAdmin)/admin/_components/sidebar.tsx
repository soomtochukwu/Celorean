import { Button } from "@/components/ui/button";

import {
  Badge,
  Bell,
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
const paths = [
  {
    href: "/admin",
    name: "dashboard",
  },
];

export function AdminDashboardSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">EduChain</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/students"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <User className="h-4 w-4" />
              Students
            </Link>
            <Link
              href="/admin/teachers"
              className="flex items-center gap-3 rounded-lg bg-mutedd px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <Package className="h-4 w-4" />
              Teachers
            </Link>
            <Link
              href="/admin/courses"
              className="flex items-center gap-3 rounded-lg bg-mutedd px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <BookIcon className="h-4 w-4" />
              Courses
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <GiftIcon className="h-4 w-4" />
              Rewards
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <LineChart className="h-4 w-4" />
              Latest Activity
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardSidebar;
