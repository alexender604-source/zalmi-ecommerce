import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    applicationName: settings.storeName,
    title: { default: `${settings.storeName} | Handmade Heritage Essentials`, template: `%s | ${settings.storeName}` },
    description: settings.description,
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: settings.storeName, title: `${settings.storeName} | Handmade Heritage Essentials`, description: settings.description, url: "/", images: [settings.logo] },
    twitter: { card: "summary_large_image", title: `${settings.storeName} | Handmade Heritage Essentials`, description: settings.description, images: [settings.logo] },
    icons: { icon: settings.favicon || "/favicon.ico" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
