"use client";

import { AuthForm } from "./AuthForm";
import Link from "next/link";
import Image from "next/image";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 bg-grid-green-100 flex flex-col items-center justify-center p-4">
      {/* 상단 로고 및 서비스 이름 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Image
            src="/icons/logo-192.png"
            alt="그리다 폼 로고"
            width={64}
            height={64}
            className="rounded-full shadow-md"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">그리다 폼</h1>
        <p className="text-sm text-gray-600">아름답고 직관적인 설문 만들기</p>
      </div>

      {/* 중앙 로그인 카드 */}
      <div className="w-full max-w-md">
        <AuthForm />
      </div>

      {/* 하단 저작권 정보 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} 그리다 폼 (Grida Form). All rights reserved.
        </p>
      </div>
    </div>
  );
}

