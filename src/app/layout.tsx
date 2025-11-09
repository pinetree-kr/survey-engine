import type { Metadata, Viewport } from "next";
import "./global.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "그리다, 폼 (Grida, Form) - 아름답고 직관적인 설문 만들기",
  description: "Typeform처럼 세련된 설문 경험을 제공하세요. 드래그 앤 드롭으로 쉽게 만들고, 실시간으로 결과를 확인하고 분석하세요.",
  keywords: ["설문", "폼", "survey", "form", "그리다폼", "Grida, Form"],
  authors: [{ name: "그리다, 폼" }],
  creator: "그리다, 폼",
  publisher: "그리다, 폼",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "그리다, 폼 (Grida, Form)",
    description: "아름답고 직관적인 설문 만들기",
    type: "website",
    locale: "ko_KR",
    siteName: "그리다, 폼",
  },
  twitter: {
    card: "summary_large_image",
    title: "그리다, 폼 (Grida, Form)",
    description: "아름답고 직관적인 설문 만들기",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

