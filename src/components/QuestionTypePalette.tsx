'use client';

import { Type, AlignLeft, CheckSquare, ListChecks, ChevronDown, LayoutGrid, FileText } from 'lucide-react';
import { QuestionType } from '../types/survey';

interface QuestionTypePaletteProps {
  onAddQuestion: (type: QuestionType) => void;
}

const questionTypes = [
  { type: 'short_text' as QuestionType, icon: Type, label: '단답형', description: '한 줄 텍스트' },
  { type: 'long_text' as QuestionType, icon: AlignLeft, label: '장문형', description: '여러 줄 텍스트' },
  { type: 'single_choice' as QuestionType, icon: CheckSquare, label: '단일 선택', description: '라디오 버튼' },
  { type: 'multiple_choice' as QuestionType, icon: ListChecks, label: '다중 선택', description: '체크박스' },
  { type: 'dropdown' as QuestionType, icon: ChevronDown, label: '드롭다운', description: '선택 메뉴' },
  { type: 'composite-input' as QuestionType, icon: LayoutGrid, label: '복합 입력', description: '여러 필드' },
  { type: 'description' as QuestionType, icon: FileText, label: '설명', description: '텍스트 블록만' },
];

export function QuestionTypePalette({ onAddQuestion }: QuestionTypePaletteProps) {
  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto">
      <h2 className="mb-6 text-gray-900">질문 유형</h2>
      
      <div className="space-y-2">
        {questionTypes.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            onClick={() => onAddQuestion(type)}
            className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900">{label}</div>
                <div className="text-gray-500 mt-0.5">{description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
