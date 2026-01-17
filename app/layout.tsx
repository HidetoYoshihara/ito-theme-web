import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Responsive viewport settings
// export const viewport = {
//   width: 1400,        // ←ここがミソ（PC幅を指定）
//   initialScale: 0.27, // ←ざっくり縮小率（後で調整）
// };

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "☆ito-お題",
  description: "ito-お題ピッカーWeb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        {/* <link rel="apple-touch-icon" href="/icon.png" /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="mx-auto max-w-[1400px]">
          {children}
        </main>
      </body>
    </html>
  );
}
