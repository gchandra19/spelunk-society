import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ViewerProvider } from "@/components/providers/ViewerProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
  ),
  title: { default: "The Spelunkers Society", template: "%s | The Spelunkers Society" },
  description: "Find, host and review caving expeditions with your local grotto.",
  openGraph: { title: "The Spelunkers Society", description: "Find and RSVP to caving expeditions.", images: ["/images/hero-squeeze.jpg"] },
};

export const viewport: Viewport = { themeColor: "#020617" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        <ViewerProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ViewerProvider>
      </body>
    </html>
  );
}
