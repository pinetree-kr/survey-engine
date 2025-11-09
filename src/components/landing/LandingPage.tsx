"use client";

/**
 * 그리다 폼 (Grida Form) Landing Page
 * 
 * Figma 디자인 기반 랜딩 페이지
 * 베이스: https://linter-set-72355018.figma.site/
 * LandingPage.mhtml 파일 분석 기반 구현
 */

import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth/AuthForm";
import { ArrowRight, CheckCircle2, GitBranch, Layers, Grip, BarChart3, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // 로그인된 사용자용 화면
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            환영합니다!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            그리다 폼 빌더로 이동하여 첫 번째 설문을 만들어보세요.
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push("/builder")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            설문 만들기 시작하기
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Figma 디자인 기반 랜딩 페이지
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-xl font-medium">그리다 폼</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              기능
            </Link>
            <Link href="#workflow" className="text-gray-600 hover:text-gray-900 transition-colors">
              워크플로우
            </Link>
            <Link href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              문서
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              문의
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="hidden sm:inline-flex h-9"
              onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              로그인
            </Button>
            <Button 
              className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              회원가입
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                    더 똑똑한 설문을{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      손쉽게
                    </span>
                    {" "}만들어보세요
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                    모든 답변에 반응하는 적응형 인터랙티브 폼을 만드세요.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg"
                    onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-10 px-6"
                  >
                    무료로 시작하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-10 px-6 border"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    데모 보기
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-600 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>신용카드 불필요</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>무료 플랜 제공</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                {/* Placeholder for dashboard image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gradient-to-br from-blue-100 to-purple-100 aspect-video flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-600">그리다 폼 대시보드</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent pointer-events-none"></div>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -z-10 -top-4 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                <div className="absolute -z-10 -bottom-8 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                더 나은 폼을 만들기 위한{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  모든 기능
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                폼 제작을 직관적으로 만들고 응답을 더 의미 있게 만드는 강력한 기능들
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <GitBranch className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">분기 로직</h3>
                    <p className="text-gray-600">
                      조건 기반 질문 흐름으로 사용자 응답에 따라 적응하는 지능형 폼을 만드세요.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">복합 질문</h3>
                    <p className="text-gray-600">
                      복잡한 데이터 수집을 위해 여러 입력 유형을 그룹화된 질문으로 결합하세요.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Grip className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">드래그 앤 드롭 빌더</h3>
                    <p className="text-gray-600">
                      직관적인 비주얼 에디터로 폼 제작을 손쉽게 만드세요. 코딩이 필요 없습니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 opacity-75">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">실시간 분석</h3>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">곧 출시 예정</span>
                    </div>
                    <p className="text-gray-600">
                      응답을 즉시 미리보고 포괄적인 분석 대시보드로 인사이트를 얻으세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-20 md:py-32 bg-gradient-to-b from-white to-blue-50/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                시각적{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  분기 로직
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                직관적인 시각적 도구로 복잡한 설문 흐름을 설계하세요. 폼이 실시간으로 적응하는 모습을 확인하세요.
              </p>
            </div>
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
              <div className="relative overflow-x-auto">
                <svg className="w-full" viewBox="0 0 800 300" style={{ minHeight: '300px' }}>
                  <g className="connections">
                    <g>
                      <path d="M 180 175 C 200 175, 200 175, 300 175" fill="none" stroke="#cbd5e1" strokeWidth="2" className="transition-all duration-300"></path>
                      <circle cx="300" cy="175" r="4" fill="#cbd5e1"></circle>
                    </g>
                    <g>
                      <path d="M 380 175 C 400 175, 400 105, 500 105" fill="none" stroke="#cbd5e1" strokeWidth="2" className="transition-all duration-300"></path>
                      <circle cx="500" cy="105" r="4" fill="#cbd5e1"></circle>
                      <text x="400" y="110" textAnchor="middle" className="text-xs fill-gray-500" style={{ fontSize: '11px' }}>개발자</text>
                    </g>
                    <g>
                      <path d="M 380 175 C 400 175, 400 245, 500 245" fill="none" stroke="#cbd5e1" strokeWidth="2" className="transition-all duration-300"></path>
                      <circle cx="500" cy="245" r="4" fill="#cbd5e1"></circle>
                      <text x="400" y="180" textAnchor="middle" className="text-xs fill-gray-500" style={{ fontSize: '11px' }}>디자이너</text>
                    </g>
                    <g>
                      <path d="M 580 105 C 600 105, 600 105, 700 105" fill="none" stroke="#cbd5e1" strokeWidth="2" className="transition-all duration-300"></path>
                      <circle cx="700" cy="105" r="4" fill="#cbd5e1"></circle>
                    </g>
                    <g>
                      <path d="M 580 245 C 600 245, 600 245, 700 245" fill="none" stroke="#cbd5e1" strokeWidth="2" className="transition-all duration-300"></path>
                      <circle cx="700" cy="245" r="4" fill="#cbd5e1"></circle>
                    </g>
                  </g>
                  <g className="nodes">
                    <g className="cursor-pointer transition-transform duration-200" style={{ transform: 'scale(1)', transformOrigin: '140px 175px' }}>
                      <rect x="100" y="150" width="160" height="50" rx="8" fill="#60a5fa" className="transition-colors duration-200"></rect>
                      <text x="180" y="180" textAnchor="middle" className="fill-white text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>설문 시작</text>
                    </g>
                    <g className="cursor-pointer transition-transform duration-200" style={{ transform: 'scale(1)', transformOrigin: '340px 175px' }}>
                      <rect x="300" y="150" width="160" height="50" rx="8" fill="#818cf8" className="transition-colors duration-200"></rect>
                      <text x="380" y="180" textAnchor="middle" className="fill-white text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>역할은 무엇인가요?</text>
                    </g>
                    <g className="cursor-pointer transition-transform duration-200" style={{ transform: 'scale(1)', transformOrigin: '540px 105px' }}>
                      <rect x="500" y="80" width="160" height="50" rx="8" fill="#818cf8" className="transition-colors duration-200"></rect>
                      <text x="580" y="110" textAnchor="middle" className="fill-white text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>개발 도구는?</text>
                    </g>
                    <g className="cursor-pointer transition-transform duration-200" style={{ transform: 'scale(1)', transformOrigin: '540px 245px' }}>
                      <rect x="500" y="220" width="160" height="50" rx="8" fill="#818cf8" className="transition-colors duration-200"></rect>
                      <text x="580" y="250" textAnchor="middle" className="fill-white text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>디자인 경험은?</text>
                    </g>
                    <g className="cursor-pointer transition-transform duration-200" style={{ transform: 'scale(1)', transformOrigin: '740px 105px' }}>
                      <rect x="700" y="80" width="160" height="50" rx="8" fill="#a855f7" className="transition-colors duration-200"></rect>
                      <text x="780" y="110" textAnchor="middle" className="fill-white text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>감사합니다!</text>
                    </g>
                    <g className="cursor-pointer transition-transform duration-200" style={{ transform: 'scale(1)', transformOrigin: '740px 245px' }}>
                      <rect x="700" y="220" width="160" height="50" rx="8" fill="#a855f7" className="transition-colors duration-200"></rect>
                      <text x="780" y="250" textAnchor="middle" className="fill-white text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>감사합니다!</text>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-400"></div>
                  <span>시작</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-indigo-400"></div>
                  <span>질문</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-400"></div>
                  <span>종료</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Auth Section */}
        <section id="auth-form" className="py-20 md:py-32 bg-gradient-to-b from-white to-blue-50/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left: Description */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900">
                    오늘 바로 첫 번째 폼을 만들어보세요!
                  </h2>
                  <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                    그리다 폼으로 더 똑똑하고 매력적인 설문을 만드는 수천 명의 전문가들과 함께하세요.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">무료 플랜 제공</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">신용카드 불필요</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">언제든지 취소 가능</span>
                    </div>
                  </div>
                </div>

                {/* Right: Auth Form */}
                <div className="lg:sticky lg:top-8">
                  <AuthForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-bold">
                오늘 바로 첫 번째 폼을 만들어보세요!
              </h2>
              <p className="text-xl text-blue-100">
                그리다 폼으로 더 똑똑하고 매력적인 설문을 만드는 수천 명의 전문가들과 함께하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-600 hover:bg-gray-100 h-10 px-6"
                >
                  무료로 회원가입
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-white text-white hover:bg-white/10 h-10 px-6"
                >
                  로그인
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-blue-100 justify-center pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>무료 플랜 제공</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>신용카드 불필요</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>언제든지 취소 가능</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <span className="text-white text-xl font-medium">그리다 폼</span>
              </div>
              <p className="text-sm">
                손쉬운 분기 로직과 적응형 폼으로 더 똑똑한 설문을 만드세요.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4 font-medium">제품</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">기능</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">가격</Link></li>
                <li><Link href="#docs" className="hover:text-white transition-colors">문서</Link></li>
                <li><Link href="#api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4 font-medium">회사</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-white transition-colors">소개</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">문의</Link></li>
                <li><Link href="#careers" className="hover:text-white transition-colors">채용</Link></li>
                <li><Link href="#blog" className="hover:text-white transition-colors">블로그</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4 font-medium">법적 고지</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#terms" className="hover:text-white transition-colors">서비스 약관</Link></li>
                <li><Link href="#privacy" className="hover:text-white transition-colors">개인정보 처리방침</Link></li>
                <li><Link href="#cookies" className="hover:text-white transition-colors">쿠키 정책</Link></li>
                <li><Link href="#security" className="hover:text-white transition-colors">보안</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2025 그리다 폼 (Grida Form). All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#twitter" className="hover:text-white transition-colors">트위터</Link>
              <Link href="#linkedin" className="hover:text-white transition-colors">링크드인</Link>
              <Link href="#github" className="hover:text-white transition-colors">깃허브</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
