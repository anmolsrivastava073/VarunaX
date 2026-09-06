import React, { Suspense } from "react";
import Link from "next/link";
import { MOCK_CASES } from "@/data/mockCases";
import DashboardClient from "@/components/dashboard/DashboardClient";
import FloatingNavbar from "@/components/common/FloatingNavbar";
import Footer from "@/components/common/Footer";
import { Activity, ArrowLeft, Waves } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Floating Navbar */}
      <FloatingNavbar />

      <div className="pt-28 pb-16 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumb strip */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-teal-700 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Home</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Operations Dashboard</span>
          </div>

          <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Surveillance Dashboard...</div>}>
            <DashboardClient initialCases={MOCK_CASES} />
          </Suspense>
        </div>
      </div>

      <Footer />
    </main>
  );
}
