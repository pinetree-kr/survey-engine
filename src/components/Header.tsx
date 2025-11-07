'use client';

import { Eye, Save, Rocket } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  surveyTitle: string;
  onTitleChange: (title: string) => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function Header({
  surveyTitle,
  onTitleChange,
  onPreview,
  onSaveDraft,
  onPublish,
}: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-indigo-600">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 4L4 10v12l12 6 12-6V10L16 4zm0 2.5l9 4.5v9l-9 4.5-9-4.5v-9l9-4.5z"/>
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
        </div>
      </div>
    </header>
  );
}
