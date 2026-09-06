"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "all";
  const currentSeverity = searchParams.get("severity") || "all";
  const currentRegion = searchParams.get("region") || "all";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = currentQuery || currentStatus !== "all" || currentSeverity !== "all" || currentRegion !== "all";

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#B7D4E6]/60 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Query Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#1E5A6E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID, vessel name, IMO, MMSI, or region..."
            defaultValue={currentQuery}
            onChange={(e) => updateParam("q", e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#e9f2f7] hover:bg-[#B7D4E6]/20 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-[#B7D4E6]/50 focus:outline-none focus:ring-2 focus:ring-[#1E5A6E] focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            className="px-3 py-2 bg-[#e9f2f7] hover:bg-[#B7D4E6]/20 text-xs font-medium text-slate-700 rounded-xl border border-[#B7D4E6]/50 focus:outline-none focus:ring-2 focus:ring-[#1E5A6E]"
          >
            <option value="all">All Statuses</option>
            <option value="analyzing">Live Analyzing</option>
            <option value="resolved">Resolved &amp; Attributed</option>
            <option value="flagged">Flagged for Coast Guard</option>
          </select>

          {/* Severity Filter */}
          <select
            value={currentSeverity}
            onChange={(e) => updateParam("severity", e.target.value)}
            className="px-3 py-2 bg-[#e9f2f7] hover:bg-[#B7D4E6]/20 text-xs font-medium text-slate-700 rounded-xl border border-[#B7D4E6]/50 focus:outline-none focus:ring-2 focus:ring-[#1E5A6E]"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (&gt;25 km²)</option>
            <option value="high">High (15–25 km²)</option>
            <option value="moderate">Moderate (&lt;15 km²)</option>
          </select>

          {/* Region Filter */}
          <select
            value={currentRegion}
            onChange={(e) => updateParam("region", e.target.value)}
            className="px-3 py-2 bg-[#e9f2f7] hover:bg-[#B7D4E6]/20 text-xs font-medium text-slate-700 rounded-xl border border-[#B7D4E6]/50 focus:outline-none focus:ring-2 focus:ring-[#1E5A6E]"
          >
            <option value="all">All Regions</option>
            <option value="Arabian Sea">Arabian Sea</option>
            <option value="Malacca">Strait of Malacca</option>
            <option value="North Sea">North Sea</option>
            <option value="Hormuz">Strait of Hormuz</option>
            <option value="Gulf of Mexico">Gulf of Mexico</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
