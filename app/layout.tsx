import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Zalmi | Handmade Heritage Essentials";
const description = "Zalmi offers handmade Peshawari chappals, traditional footwear, Khaddar, men's shawls and other Pakistani men's fashion products.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: "Zalmi",
  title: { default: title, template: "%s | Zalmi" },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Zalmi", title, description, url: "/", images: ["/images/zalmi-logo.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/images/zalmi-logo.png"] },
  icons: { icon: "/zalmi-icon.png" },
};

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
