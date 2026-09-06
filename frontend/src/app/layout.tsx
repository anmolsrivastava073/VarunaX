import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Configure the font
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VarunaX - The Sea Sentinel",
  description: "Autonomous Satellite Oil Spill Detection & AIS Vessel Attribution",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Inject the CSS variable into your HTML tag
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
