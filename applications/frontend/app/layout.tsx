import type { Metadata } from "next";
import "./globals.css";
import { Lexend } from "next/font/google";
import DynamicProviderWrapper from "@/components/providers/DynamicProviderWrapper";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
// import { WaitlistGuard } from "@/components/providers/WaitlistGuard";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
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
        className={`${lexend.className} antialiased bg-black`}
      >
        <DynamicProviderWrapper>
          <AuthProvider>
            <QueryProvider>
              {/* <WaitlistGuard> */}
              {children}
              {/* </WaitlistGuard> */}
            </QueryProvider>
          </AuthProvider>
        </DynamicProviderWrapper>
      </body>
    </html>
  );
}
