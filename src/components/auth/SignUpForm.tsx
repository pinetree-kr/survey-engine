"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface SignUpFormProps {
  onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success("회원가입이 완료되었습니다! 이메일을 확인해주세요.");
      setEmail("");
      setPassword("");
      if (onSuccess) {
        onSuccess();
      }
      // 로그인 화면으로 리다이렉트
      router.push("/auth/sign-in");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
      {/* 제목 및 환영 메시지 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h2>
        <p className="text-sm text-gray-600">그리다, 폼에 오신 것을 환영합니다</p>
      </div>

      {/* 회원가입 폼 */}
      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">최소 6자 이상 입력해주세요.</p>
        </div>

        {/* 회원가입 버튼 */}
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md"
          disabled={loading}
        >
          {loading ? "처리 중..." : "회원가입"}
        </Button>
      </form>

      {/* 약관 링크 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          회원가입 시{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            이용약관
          </Link>
          {" 및 "}
          <Link
            href="/terms/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </div>

      {/* 구분선 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">또는</span>
        </div>
      </div>

      {/* 소셜 로그인 버튼들 */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-gray-300 hover:bg-gray-50"
          onClick={() => toast.info("소셜 로그인 기능은 준비 중입니다.")}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-gray-300 hover:bg-gray-50 bg-yellow-50 hover:bg-yellow-100"
          onClick={() => toast.info("카카오 로그인 기능은 준비 중입니다.")}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.48 2 11c0 2.84 1.55 5.4 4 6.73V21l3.5-1.92c.5.07 1 .11 1.5.11 5.52 0 10-3.48 10-8s-4.48-8-10-8z" fill="#3C1E1E"/>
          </svg>
          카카오로 계속하기
        </Button>
      </div>

      {/* 로그인 링크 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/auth/sign-in"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

