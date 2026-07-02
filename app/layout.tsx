import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { APP } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP.name,
  description: `${APP.subtitle} — Personal golf performance operating system`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP.name,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0E1111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <AppProviders>{children}</AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
