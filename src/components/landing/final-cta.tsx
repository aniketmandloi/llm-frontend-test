import { Button } from "@/components/motion/button/base";
import { siteConfig } from "@/lib/content";

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center md:px-16 md:py-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent)_0%,transparent_70%)] opacity-60"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Ready to ship with clarity?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Join thousands of teams using {siteConfig.name} to build better
              products, faster.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg">{siteConfig.cta.primary}</Button>
              <Button variant="ghost" size="lg">
                {siteConfig.cta.secondary}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
