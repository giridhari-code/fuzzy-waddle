// app/page.tsx  (Next.js 13+ App Router)
"use client";

import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <Footer />
      </>
  );
}
