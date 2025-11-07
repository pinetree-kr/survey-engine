'use client';

import { Plus } from 'lucide-react';

interface AddQuestionBarProps {
  onClick: () => void;
}

export function AddQuestionBar({ onClick }: AddQuestionBarProps) {
  return (
    <div className="sticky bottom-0 border-t border-gray-200 bg-white/80 backdrop-blur-sm px-6 py-4">
      <button
        onClick={onClick}
        className="w-full max-w-2xl mx-auto flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
      >
        <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-gray-700 group-hover:text-indigo-700 transition-colors">
          새 질문 추가
        </span>
      </button>
    </div>
  );
}
