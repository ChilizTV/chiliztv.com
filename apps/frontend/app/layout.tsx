import type { Metadata } from "next";
import "./globals.css";
import { Lexend, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import DynamicProviderWrapper from "@/components/providers/DynamicProviderWrapper";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { PoolStatusBanner } from "@/components/system/PoolStatusBanner";

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
  title: "ChilizTV - Live Sports SocialFi Streaming Platform",
  description: "Watch live sports matches and place predictions in real-time with ChilizTV. Experience the thrill of live sports streaming and betting all in one platform.",
  icons: {
    icon: "/Logo_FINAL.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.className} ${barlowCondensed.variable} ${jetbrainsMono.variable} antialiased bg-black`}
      >
        <DynamicProviderWrapper>
          <AuthProvider>
            <QueryProvider>
              <PoolStatusBanner />
              {children}
              <Toaster position="top-right" richColors />
            </QueryProvider>
          </AuthProvider>
        </DynamicProviderWrapper>
      </body>
    </html>
  );
}
