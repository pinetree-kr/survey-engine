import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Survey Engine Demo",
  description: "Typeform-like 설문 엔진 데모",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

