import {
  BarChart3,
  Layers,
  Plug,
  Shield,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { siteConfig } from "@/lib/content";

const iconMap: Record<string, LucideIcon> = {
  layers: Layers,
  users: Users,
  zap: Zap,
  chart: BarChart3,
  shield: Shield,
  plug: Plug,
};

const spanClasses = [
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to ship
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features that help your team move faster, together.
          </p>
        </div>

        <BentoGrid className="max-w-6xl">
          {siteConfig.features.map((feature, index) => {
            const Icon = iconMap[feature.icon] ?? Layers;

            return (
              <TiltCard
                key={feature.title}
                className={spanClasses[index]}
                max={8}
              >
                <BentoGridItem
                  className="h-full border-border bg-card dark:border-border dark:bg-card dark:shadow-none"
                  title={feature.title}
                  description={feature.description}
                  icon={
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  }
                  header={
                    <div className="flex h-28 items-center justify-center rounded-lg bg-muted/50">
                      <Icon className="h-12 w-12 text-primary/20" />
                    </div>
                  }
                />
              </TiltCard>
            );
          })}
        </BentoGrid>
      </div>
    </section>
  );
}
