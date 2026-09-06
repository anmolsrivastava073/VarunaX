import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}° ${latDir}, ${Math.abs(lng).toFixed(3)}° ${lngDir}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC";
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date("2026-09-04T18:00:00Z");
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recent";
  }
}

export function getSeverityBadgeClass(severity: string) {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-[#e4f7f3] text-[#005bb5] border-[#007ceb] ring-[#007ceb]/20";
    case "high":
      return "bg-[#e4f7f3] text-[#0097a7] border-[#00bcd4] ring-[#00bcd4]/20";
    case "moderate":
      return "bg-[#e4f7f3] text-[#81ac19] border-[#7ee0cf] ring-[#7ee0cf]/20";
    default:
      return "bg-[#edf5f3] text-slate-700 border-[#7ee0cf]/50";
  }
}

export function getStatusBadgeClass(status: string) {
  switch (status?.toLowerCase()) {
    case "analyzing":
      return "bg-[#e4f7f3] text-[#007ceb] border-[#007ceb] animate-pulse";
    case "resolved":
      return "bg-[#e4f7f3] text-[#81ac19] border-[#a3d328]";
    case "flagged":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-[#edf5f3] text-slate-700 border-[#7ee0cf]/40";
  }
}
