"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves, Satellite, Compass, ShieldCheck, ArrowRight, Activity } from "lucide-react";

export default function FloatingNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-4 md:gap-8 px-4 py-2.5 rounded-full transition-all duration-300 ${
          scrolled
            ? "glass-panel-marine shadow-lg border-[#6BA7A0] shadow-[#0D2B45]/10 backdrop-blur-md"
            : "bg-white/95 shadow-md border border-[#B7D4E6] backdrop-blur-md"
        }`}
      >
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group pr-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0D2B45] via-[#1E5A6E] to-[#6BA7A0] flex items-center justify-center text-white shadow-sm shadow-[#0D2B45]/30 group-hover:scale-105 transition-transform">
            <Waves className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-[#0D2B45] flex items-center gap-1.5">
              OceanSentinel
            </span>
          </div>
        </Link>

        {/* 3 Section Navigation Buttons - Reordered to match page scroll */}
        <div className="hidden md:flex items-center gap-1 bg-[#f5f9fb] p-1 rounded-full border border-[#B7D4E6]/60 text-xs font-medium text-slate-700">
          
          <Link
            href={isHome ? "#interactive-demo" : "/#interactive-demo"}
            className="px-3.5 py-1.5 rounded-full hover:text-[#1E5A6E] hover:bg-white transition-all flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#6BA7A0]" />
            <span>Drift Simulator</span>
          </Link>

          <Link
            href={isHome ? "#pipeline" : "/#pipeline"}
            className="px-3.5 py-1.5 rounded-full hover:text-[#0D2B45] hover:bg-white transition-all flex items-center gap-1.5"
          >
            <Satellite className="w-3.5 h-3.5 text-[#1E5A6E]" />
            <span>3-Stage Pipeline</span>
          </Link>

          <Link
            href={isHome ? "#marine-impact" : "/#marine-impact"}
            className="px-3.5 py-1.5 rounded-full hover:text-[#0D2B45] hover:bg-white transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E5A6E]" />
            <span>Marine Impact</span>
          </Link>
        </div>

        {/* 4th Action Button to Open Dashboard */}
        <div className="flex items-center gap-2 pl-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#0D2B45] via-[#1E5A6E] to-[#6BA7A0] hover:opacity-95 shadow-sm shadow-[#0D2B45]/25 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse text-white" />
            <span>Operations Hub</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}