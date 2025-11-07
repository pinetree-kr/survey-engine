'use client';

import { Plus, X } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Question, Option } from '@/schema/question.types';

interface QuestionPreviewProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionPreview({ question, onUpdate }: QuestionPreviewProps) {
  const handleAddOption = () => {
    const newOptions = [...(question.options || []), { label: `옵션 ${(question.options?.length || 0) + 1}` }] as Option[];
    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])] as Option[];
    newOptions[index] = { label: value } as Option;
    onUpdate({ options: newOptions });
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  switch (question.type) {
    case 'short_text':
      return (
        <div className="pt-2">
          <Input placeholder="단답형 텍스트" disabled className="bg-gray-50" />
        </div>
      );

    case 'long_text':
      return (
        <div className="pt-2">
          <Textarea placeholder="장문형 텍스트" disabled className="bg-gray-50 min-h-24" />
        </div>
      );

    case 'single_choice':
    case 'multiple_choice':
      return (
        <div className="space-y-3 pt-2">
          {(question.options || [{ label: '응답 1' }] as Option[]).map((option, index) => (
            <div key={index} className="flex items-center gap-3 group/option">
              <div className={`w-4 h-4 border-2 ${question.type === 'single_choice' ? 'rounded-full' : 'rounded'} border-gray-300`} />
              <input
                type="text"
                value={option.label || ''}
                placeholder={option.freeText?.placeholder || '응답 1'}
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

        </div>
      );

    case 'dropdown':
      return (
        <div className="pt-2 space-y-3">
          <div className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            옵션을 선택하세요...
          </div>

          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            {(question.options || [{ label: '응답 1' }] as Option[]).map((option, index) => (
              <div key={index} className="flex items-center gap-3 group/option">
                <input
                  type="text"
                  value={option.label || ''}
                  placeholder={option.freeText?.placeholder || ''}
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

    case 'composite_single':
    case 'composite_multiple':
      if (!question.compositeItems || question.compositeItems.length === 0) {
        return (
          <div className="pt-2 text-gray-500 text-sm">
            복합 필드를 추가하려면 설정 패널에서 항목을 추가하세요
          </div>
        );
      }
      return (
        <div className="space-y-3 pt-2">
          {question.compositeItems.map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="text-sm text-gray-700 font-medium">
                {item.label}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type={item.input_type === 'number' ? 'number' : 'text'}
                  placeholder={item.placeholder || ''}
                  disabled
                  className="bg-gray-50"
                />
                {item.unit && (
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {item.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
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
