import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function MetricCard({
  label,
  value,
  subtext,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-[#1E5A6E]",
  iconBg = "bg-[#e9f2f7]",
}: MetricCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#B7D4E6]/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} border border-[#B7D4E6]/50 flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${
              changeType === "positive"
                ? "bg-[#e9f2f7] text-[#6BA7A0] border-[#B7D4E6]"
                : changeType === "negative"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-[#e9f2f7] text-slate-600 border-[#B7D4E6]/40"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{subtext}</p>}
    </div>
  );
}
