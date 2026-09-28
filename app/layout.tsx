import "./globals.css";
import type { ReactNode } from "react";

// <html> and <body> live in app/[locale]/layout.tsx so `lang` can follow the
// locale; this root layout only exists because Next requires one.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
