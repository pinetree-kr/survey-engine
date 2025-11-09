import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image"

export const metadata: Metadata = {
  title: "약관 및 정책 - 그리다, 폼",
  description: "그리다, 폼 서비스 이용약관 및 개인정보처리방침",
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icons/logo-192.png"
              alt="그리다, 폼"
              width={32}
              height={32}
              className="w-8 h-8 object-contain rounded-2xl shadow-lg bg-white p-2"
            />
            <span className="text-xl font-bold text-gray-900">그리다, 폼</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="shadow-xl border border-gray-200 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-sm text-gray-500">
          © 2025 히즈트리. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
