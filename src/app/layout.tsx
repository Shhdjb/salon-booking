import type { Metadata, Viewport } from "next";
import { Marhey, Cairo } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const marhey = Marhey({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "صالون شهد | SALON SHAHD | صالون نسائي فاخر",
  description:
    "صالون شهد - وجهتك المميزة للعناية بالشعر والجمال. احجزي موعدك الآن واستمتعي بتجربة فاخرة.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${marhey.variable} ${cairo.variable}`}>
      <body className="font-body min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
