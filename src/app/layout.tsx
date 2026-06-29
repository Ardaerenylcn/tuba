import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Atölye Biz",
    template: "%s | Atölye Biz",
  },
  description: "Butik takı yapım atölyeleri ve sertifika programları.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Atölye Biz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
