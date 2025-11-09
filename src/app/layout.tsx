import type { Metadata } from "next";
import "./global.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "그리다 폼 (Grida Form) - 아름답고 직관적인 설문 만들기",
  description: "Typeform처럼 세련된 설문 경험을 제공하세요. 드래그 앤 드롭으로 쉽게 만들고, 실시간으로 결과를 확인하고 분석하세요.",
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

