"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/motion/button/base";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            )}
            iconClassName="h-4 w-4"
          />

          <Button variant="primary" size="sm" className="hidden sm:inline-flex">
            {siteConfig.cta.primary}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {siteConfig.nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button className="mt-4 w-full">{siteConfig.cta.primary}</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
