import { cn } from "@/lib/utils";
import Link from "next/link";

export function NavLink({ path }: { path: any }) {
  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      )}
      href={path.href}
    >
      <path.Icon />

      {path.name}
    </Link>
  );
}
