import type { Metadata } from "next";
import "./globals.css";
import { Barlow_Condensed, JetBrains_Mono, Lexend } from "next/font/google";
import Providers from "@/providers/Providers";
import { AdminGuard } from "@/components/guard/AdminGuard";
import { AdminShell } from "@/components/layout/AdminShell";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PredCast Admin",
  description: "PredCast back-office",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${lexend.className} ${barlowCondensed.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <AdminGuard>
            <AdminShell>{children}</AdminShell>
          </AdminGuard>
        </Providers>
      </body>
    </html>
  );
}
