'use client';

import { Eye, Save, Rocket, GitBranch, LogOut, Home } from 'lucide-react';
import { Button } from './ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeaderProps {
  surveyTitle: string;
  onTitleChange: (title: string) => void;
  onPreview: () => void;
  onFlow?: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function Header({
  surveyTitle,
  onTitleChange,
  onPreview,
  onFlow,
  onSaveDraft,
  onPublish,
}: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    } else {
      toast.success('로그아웃되었습니다.');
      router.push('/');
      router.refresh();
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <Home className="w-5 h-5" />
          </Button>
          <div className="text-indigo-600">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 4L4 10v12l12 6 12-6V10L16 4zm0 2.5l9 4.5v9l-9 4.5-9-4.5v-9l9-4.5z" />
            </svg>
          </div>
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="제목 없는 설문조사"
            className="flex-1 max-w-md bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          {onFlow && (
            <Button
              variant="outline"
              onClick={onFlow}
              className="gap-2"
            >
              <GitBranch className="w-4 h-4" />
              흐름도
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onPreview}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </Button>

          <Button
            variant="outline"
            onClick={onSaveDraft}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            임시저장
          </Button>

          <Button
            onClick={onPublish}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Rocket className="w-4 h-4" />
            배포하기
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
