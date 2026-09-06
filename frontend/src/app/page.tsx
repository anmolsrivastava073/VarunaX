import React from "react";
import FloatingNavbar from "@/components/common/FloatingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import PipelineDemoSection from "@/components/landing/PipelineDemoSection";
import EcoImpactSection from "@/components/landing/EcoImpactSection";
import WatchzonesSection from "@/components/landing/WatchzonesSection";
import Footer from "@/components/common/Footer";
import ScrollToTop from "@/components/common/ScrollToTop"; // <-- 1. Imported here

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      {/* 2. Added here to force scroll to top on page refresh */}
      <ScrollToTop />

      {/* Floating 4-button Navbar */}
      <FloatingNavbar />

      {/* Hero Section with Live Badges & 3-Step Teaser */}
      <HeroSection />

      {/* Interactive 3-Stage Pipeline Simulation Demo */}
      <PipelineDemoSection />

      {/* Active Incidents & Monitored Corridors */}
      <WatchzonesSection />

      {/* Marine Ecological Conservation Impact */}
      <EcoImpactSection />

      {/* Comprehensive Eco & SIH Footer */}
      <Footer />
    </main>
  );
}