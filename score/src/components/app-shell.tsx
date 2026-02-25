"use client";

import { Logo } from "@/components/logo";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-center px-4 py-3">
          <Logo />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-primary">
            Playground HB Score
          </h1>
          <p className="text-muted-foreground text-sm">Foundation ready</p>
        </div>
      </main>
    </div>
  );
}
