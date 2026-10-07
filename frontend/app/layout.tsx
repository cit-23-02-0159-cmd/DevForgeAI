import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevForge AI · Engineering workspace",
  description: "The foundation for an autonomous software engineering platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
