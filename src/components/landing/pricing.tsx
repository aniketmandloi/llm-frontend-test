import { Check } from "lucide-react";
import { Button } from "@/components/motion/button/base";
import { TiltCard } from "@/components/motion/tilt-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {siteConfig.pricing.map((plan) => (
            <TiltCard key={plan.name} max={6} className="h-full">
              <Card
                className={cn(
                  "flex h-full flex-col",
                  plan.highlighted &&
                    "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5",
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.highlighted && (
                      <Badge variant="default">Most popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period !== "contact us" && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.highlighted ? "primary" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
