"use client";

import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { siteConfig } from "@/lib/content";

export function FAQ() {
  const items = siteConfig.faq.map((item) => ({
    id: item.id,
    title: item.question,
    description: item.answer,
  }));

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about {siteConfig.name}.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <BouncyAccordion items={items} defaultValue={items[0]?.id ?? null} />
        </div>
      </div>
    </section>
  );
}
