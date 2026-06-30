"use client";

import { Button } from "@/components/motion/button/base";
import { TextReveal } from "@/components/motion/text-reveal";
import { Spotlight } from "@/components/ui/spotlight";
import { siteConfig } from "@/lib/content";

function GridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]"
      aria-hidden
    />
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        <span className="ml-3 text-xs text-muted-foreground">
          {siteConfig.name.toLowerCase()}.app/dashboard
        </span>
      </div>
      <div className="flex min-h-[280px] md:min-h-[320px]">
        <div className="hidden w-48 shrink-0 border-r border-border bg-muted/30 p-4 sm:block">
          <div className="mb-4 h-3 w-20 rounded bg-muted-foreground/20" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-8 rounded-lg ${i === 1 ? "bg-primary/15" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 flex-1 rounded-xl border border-border bg-muted/40"
              />
            ))}
          </div>
          <div className="flex flex-1 items-end gap-2 rounded-xl border border-border bg-muted/20 p-4">
            {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-primary/60"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 md:pb-32 md:pt-28">
      <GridBackground />
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="oklch(0.72 0.12 195)"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <TextReveal
          as="h1"
          text={siteConfig.tagline}
          className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl md:leading-[1.1]"
          split="word"
          stagger={0.06}
        />

        <TextReveal
          as="p"
          text={siteConfig.description}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          split="word"
          stagger={0.03}
          delay={0.4}
        />

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg">{siteConfig.cta.primary}</Button>
          <Button variant="outline" size="lg">
            {siteConfig.cta.secondary}
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required · 14-day free trial
        </p>

        <DashboardMockup />
      </div>
    </section>
  );
}
