import React from "react";
import Link from "next/link";
import { Waves, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#0D2B45] text-[#B7D4E6] pt-24 pb-8 overflow-hidden mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between gap-16 mb-24">
        
        {/* Brand & Mission (Clean, typographic, no cramped boxes) */}
        <div className="max-w-sm space-y-6">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-full bg-[#1E5A6E] flex items-center justify-center text-[#6BA7A0] group-hover:bg-[#6BA7A0] group-hover:text-[#0D2B45] transition-colors duration-300">
              <Waves className="w-5 h-5" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">VarunaX</span>
          </Link>
          <p className="text-sm leading-relaxed text-[#B7D4E6]/80 font-light">
            Defending marine ecosystems through satellite radar, drift hindcasting, and historical AIS attribution.
          </p>
          
        </div>

        {/* Minimalist Navigation with clean hover states */}
        <div className="flex gap-16 md:gap-24 text-sm">
          <div className="space-y-6">
            <h4 className="font-semibold text-white tracking-wider uppercase text-xs">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="group flex items-center gap-1 hover:text-white transition-colors">
                  Interactive Demo 
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="group flex items-center gap-1 hover:text-white transition-colors">
                  Operational Dashboard 
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-white tracking-wider uppercase text-xs">Simulations</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/live?caseId=case-northsea-live-2026" className="group flex items-center gap-1 hover:text-white transition-colors">
                  Live Pipeline 
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link href="/cases/case-mumbai-high-2026" className="group flex items-center gap-1 hover:text-white transition-colors">
                  Mumbai High Dossier 
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Subtle Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#B7D4E6]/50">
        <p>© {new Date().getFullYear()} VarunaX Maritime Intelligence.</p>
        <p>Open GIS & Copernicus Sentinel-1 Aligned.</p>
      </div>

      {/* Giant Bottom-Touching Watermark CTA */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-[28%] pointer-events-none select-none">
        <span className="text-[12vw] font-black text-white/[0.05] leading-none tracking-tighter whitespace-nowrap">
          DEFEND THE OCEANS
        </span>
      </div>
    </footer>
  );
}