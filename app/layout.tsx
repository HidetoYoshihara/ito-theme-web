import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Hachi_Maru_Pop,
  Kaisei_Decol,
  Yusei_Magic,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ---------------------------
// 黒板用のフォント。
const hachiMaruPop = Hachi_Maru_Pop({
  variable: "--font-hachi-maru-pop",
  subsets: ["latin"],
  weight: "400",
});

const kaiseiDecol = Kaisei_Decol({
  variable: "--font-kaisei-decol",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const yuseiMagic = Yusei_Magic({
  variable: "--font-yusei-magic",
  subsets: ["latin"],
  weight: ["400"], // 400のみ
});
// ---------------------------

// Responsive viewport settings
// export const viewport = {
//   width: 1400,        // ←ここがミソ（PC幅を指定）
//   initialScale: 0.27, // ←ざっくり縮小率（後で調整）
// };
// export const viewport = {
//   width: "device-width",
//   initialScale: 1,
// };

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
        className={`${geistSans.variable} ${geistMono.variable} ${hachiMaruPop.variable} ${kaiseiDecol.variable} ${yuseiMagic.variable} antialiased`}
      >
        <main className="scale-root">{children}</main>
      </body>
    </html>
  );
}
