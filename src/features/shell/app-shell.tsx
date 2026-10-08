"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaskSheetProvider } from "@/features/tasks/task-sheet-context";
import { AppSidebar } from "./app-sidebar";
import { CommandPalette } from "./command-palette";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { SidebarContent } from "./sidebar-content";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const togglePalette = useCallback(() => setPaletteOpen((open) => !open), []);

  return (
    <TooltipProvider delayDuration={300}>
      <TaskSheetProvider>
        <div className="flex min-h-svh bg-background text-foreground">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar onOpenPalette={openPalette} onOpenMobileNav={() => setMobileNavOpen(true)} />
            <main className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-1 flex-col px-4 pt-4 pb-10 sm:px-6 lg:px-10">
              {children}
            </main>
          </div>
        </div>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Move between Orbit sections.</SheetDescription>
            </SheetHeader>
            <SidebarContent collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <KeyboardShortcuts onTogglePalette={togglePalette} />
      </TaskSheetProvider>
    </TooltipProvider>
  );
}
