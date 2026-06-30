import { FAQ } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { SocialProof } from "@/components/landing/social-proof";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
