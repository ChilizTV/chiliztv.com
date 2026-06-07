import type { Metadata } from "next";
import "./globals.css";
import { Lexend, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import DynamicProviderWrapper from "@/components/providers/DynamicProviderWrapper";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { UsernameSetupGuard } from "@/components/providers/UsernameSetupGuard";
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
  title: "Betcast — Live Sports SocialFi Streaming Platform",
  description:
    "Watch live sports matches and place predictions in real-time with Betcast. Live streams + on-chain pari-mutuel pools — the bet is the broadcast.",
  icons: {
    icon: "/favicon.svg",
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
              <UsernameSetupGuard />
              {children}
              <Toaster position="top-right" richColors />
            </QueryProvider>
          </AuthProvider>
        </DynamicProviderWrapper>
      </body>
    </html>
  );
}
