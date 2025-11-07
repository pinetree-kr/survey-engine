'use client';

import { Plus, X } from 'lucide-react';
import { Question } from '../types/survey';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface QuestionPreviewProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionPreview({ question, onUpdate }: QuestionPreviewProps) {
  const handleAddOption = () => {
    const newOptions = [...(question.options || []), `옵션 ${(question.options?.length || 0) + 1}`];
    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  switch (question.type) {
    case 'short-text':
      return (
        <div className="pt-2">
          <Input placeholder="단답형 텍스트" disabled className="bg-gray-50" />
        </div>
      );

    case 'long-text':
      return (
        <div className="pt-2">
          <Textarea placeholder="장문형 텍스트" disabled className="bg-gray-50 min-h-24" />
        </div>
      );

    case 'single-choice':
    case 'multiple-choice':
      return (
        <div className="space-y-3 pt-2">
          {(question.options || ['옵션 1']).map((option, index) => (
            <div key={index} className="flex items-center gap-3 group/option">
              <div className={`w-4 h-4 border-2 ${question.type === 'single-choice' ? 'rounded-full' : 'rounded'} border-gray-300`} />
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  e.stopPropagation();
                  handleUpdateOption(index, e.target.value);
                }}
                className="flex-1 bg-transparent border-none outline-none text-gray-700"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteOption(index);
                }}
                className="opacity-0 group-hover/option:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddOption();
            }}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>옵션 추가</span>
          </button>

          {question.hasOther && (
            <div className="flex items-center gap-3 text-gray-500">
              <div className={`w-4 h-4 border-2 ${question.type === 'single-choice' ? 'rounded-full' : 'rounded'} border-gray-300`} />
              <span>기타</span>
            </div>
          )}
        </div>
      );

    case 'dropdown':
      return (
        <div className="pt-2 space-y-3">
          <div className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            옵션을 선택하세요...
          </div>
          
          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            {(question.options || ['옵션 1']).map((option, index) => (
              <div key={index} className="flex items-center gap-3 group/option">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdateOption(index, e.target.value);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-gray-700"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOption(index);
                  }}
                  className="opacity-0 group-hover/option:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddOption();
              }}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add option</span>
            </button>
          </div>
        </div>
      );

    case 'composite-input':
      return (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Input placeholder="첫 번째 필드" disabled className="bg-gray-50" />
          <Input placeholder="두 번째 필드" disabled className="bg-gray-50" />
        </div>
      );

    case 'description':
      return (
        <div className="pt-2">
          <Textarea
            value={question.description || ''}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate({ description: e.target.value });
            }}
            placeholder="설명 텍스트나 안내사항을 추가하세요..."
            className="bg-transparent border-none resize-none min-h-20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      );

    default:
      return null;
  }
}
