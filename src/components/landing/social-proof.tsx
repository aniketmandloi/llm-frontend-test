import { Marquee } from "@/components/motion/marquee";
import { siteConfig } from "@/lib/content";

export function SocialProof() {
  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trusted by teams at
        </p>
        <Marquee speed={35} pauseOnHover gap="3rem">
          {siteConfig.logos.map((logo) => (
            <span
              key={logo}
              className="whitespace-nowrap text-lg font-semibold text-muted-foreground/70"
            >
              {logo}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
