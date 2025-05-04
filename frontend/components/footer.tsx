import React from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";

export function FooterText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "px-2 text-center text-xs leading-normal text-muted-foreground",
        className
      )}
      {...props}
    >
      Open source AI chatbot built with{" "}
      <Link href="https://nextjs.org">Next.js</Link> and{" "}
      <Link href="https://github.com/vercel/ai">Vercel AI SDK</Link>.
    </p>
  );
}
