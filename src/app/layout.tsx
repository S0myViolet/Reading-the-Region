import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Reading the Region",
    template: "%s · Reading the Region",
  },
  description:
    "A strategic foresight intelligence system for detecting, interpreting, and translating regional change across MENA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning covers attributes that browser extensions
    // (Bitdefender's bis_skin_checked, Grammarly, dark-mode injectors)
    // stamp onto the document before React hydrates. It silences attribute
    // mismatches on these two elements only — real content mismatches
    // deeper in the tree still surface.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
