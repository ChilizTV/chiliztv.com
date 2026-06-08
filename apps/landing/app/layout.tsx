import type { Metadata } from "next";
import "./globals.css";
import { Barlow_Condensed, JetBrains_Mono, Lexend } from "next/font/google";
import DynamicProviderWrapper from "@/components/providers/DynamicProviderWrapper";
import { Toaster } from "@chiliztv/ui";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

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
  title: "PredCast — Live Sports SocialFi Streaming Platform",
  description:
    "Watch live football matches and place on-chain predictions with PredCast. The first SocialFi streaming platform on Chiliz Chain.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.className} ${barlowCondensed.variable} ${jetbrainsMono.variable} antialiased bg-black`}
      >
        <DynamicProviderWrapper>
          {children}
          <Toaster richColors position="bottom-right" />
        </DynamicProviderWrapper>
      </body>
    </html>
  );
}
