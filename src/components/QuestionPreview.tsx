'use client';

import { Plus, X } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Question, Option } from '@/schema/question.types';
import { getOptionLabel } from '@/utils/label';

interface QuestionPreviewProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionPreview({ question, onUpdate }: QuestionPreviewProps) {

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const otherOptionIndex = currentOptions.findIndex(opt => opt.isOther);

    // 새 옵션 생성
    const newOption: Option = {
      label: "",
      key: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    let newOptions: Option[];
    if (otherOptionIndex !== -1) {
      // 기타 옵션이 있는 경우: 기타 옵션을 제외한 나머지 + 새 옵션 + 기타 옵션
      const optionsWithoutOther = currentOptions.filter(opt => !opt.isOther);
      const otherOption = currentOptions[otherOptionIndex];
      newOptions = [...optionsWithoutOther, newOption, otherOption];
    } else {
      // 기타 옵션이 없는 경우: 기존처럼 맨 끝에 추가
      newOptions = [...currentOptions, newOption];
    }

    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])] as Option[];
    newOptions[index] = { ...newOptions[index], label: value };
    onUpdate({ options: newOptions });
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = question.options || [];
    // 마지막 남은 옵션은 삭제하지 못하게 함
    if (currentOptions.length <= 1) {
      return;
    }
    const newOptions = currentOptions.filter((_, i) => i !== index);
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

    case 'choice': {
      const isDropdown = question.isDropdown;

      if (isDropdown) {
        return (
          <div className="pt-2 space-y-3">
            <div className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              옵션을 선택하세요...
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-gray-200">
              {(question.options || [{ label: '' }] as Option[]).map((option, index) => {
                const optionsCount = question.options?.length || 0;
                const canDelete = optionsCount > 1;
                return (
                  <div key={index} className="flex items-center gap-3 group/option pb-2 border-b border-gray-200 last:border-b-0">
                    <input
                      type="text"
                      value={option.label || ''}
                      placeholder={option.freeText?.placeholder || `옵션 ${getOptionLabel(index)}`}
                      onChange={(e) => {
                        // e.stopPropagation();
                        handleUpdateOption(index, e.target.value);
                      }}
                      className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 outline-none text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      onClick={(e) => {
                        // e.stopPropagation()
                      }}
                    />
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          // e.stopPropagation();
                          handleDeleteOption(index);
                        }}
                        className="opacity-0 group-hover/option:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                onClick={(e) => {
                  // e.stopPropagation();
                  handleAddOption();
                }}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>옵션 추가</span>
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-3 pt-2">
          {(question.options || [{ label: '' }] as Option[]).map((option, index) => {
            const optionsCount = question.options?.length || 0;
            const canDelete = optionsCount > 1;
            return (
              <div key={index} className="flex items-center gap-3 group/option p-2 border border-gray-200 rounded-lg bg-gray-50">
                <div className={`flex items-center justify-center w-8 h-8 border-2 border-indigo-500 bg-white text-indigo-600 font-semibold text-sm ${question.isMultiple ? 'rounded' : 'rounded-full'}`}>
                  {getOptionLabel(index)}
                </div>
                {/* <div className={`w-4 h-4 border-2 ${question.type === 'single_choice' ? 'rounded-full' : 'rounded'} border-gray-300`} /> */}
                <input
                  type="text"
                  value={option.label || ''}
                  placeholder={option.freeText?.placeholder || `옵션 ${getOptionLabel(index)}`}
                  onChange={(e) => {
                    // e.stopPropagation();
                    handleUpdateOption(index, e.target.value);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-gray-700"
                  onClick={(e) => {
                    // e.stopPropagation()
                  }}
                />
                {canDelete && (
                  <button
                    onClick={(e) => {
                      // e.stopPropagation();
                      handleDeleteOption(index);
                    }}
                    className="opacity-0 group-hover/option:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={(e) => {
              // e.stopPropagation();
              handleAddOption();
            }}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>옵션 추가</span>
          </button>

        </div>
      );
    }

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
              // e.stopPropagation();
              onUpdate({ description: e.target.value });
            }}
            placeholder="설명 텍스트나 안내사항을 추가하세요..."
            className="bg-transparent border-none resize-none min-h-20"
            onClick={(e) => {
              // e.stopPropagation()
            }}
          />
        </div>
      );

    default:
      return null;
  }
}
