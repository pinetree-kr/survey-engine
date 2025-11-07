'use client';

import { Question } from '../types/survey';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { ImagePlus, Palette } from 'lucide-react';

interface InspectorPanelProps {
  question: Question | null;
  onUpdate: (updates: Partial<Question>) => void;
}

export function InspectorPanel({ question, onUpdate }: InspectorPanelProps) {
  if (!question) {
    return (
      <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <p>질문을 선택하면</p>
            <p className="mt-2">설정을 확인할 수 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

  const showChoiceOptions = ['single-choice', 'multiple-choice', 'dropdown'].includes(question.type);

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Question Settings */}
        <div>
          <h3 className="mb-4 text-gray-900">질문 설정</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="required" className="cursor-pointer">필수 항목</Label>
              <Switch
                id="required"
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>

            {showChoiceOptions && (
              <div className="flex items-center justify-between">
                <Label htmlFor="hasOther" className="cursor-pointer">"기타" 옵션 추가</Label>
                <Switch
                  id="hasOther"
                  checked={question.hasOther || false}
                  onCheckedChange={(checked) => onUpdate({ hasOther: checked })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="validation">유효성 검사</Label>
              <Input
                id="validation"
                value={question.validation || ''}
                onChange={(e) => onUpdate({ validation: e.target.value })}
                placeholder="예: 이메일, 숫자, 최소 길이"
                className="mt-2 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="showConditions">표시 조건</Label>
              <Input
                id="showConditions"
                value={question.showConditions || ''}
                onChange={(e) => onUpdate({ showConditions: e.target.value })}
                placeholder="이 질문을 표시할 조건"
                className="mt-2 bg-white"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Design Settings */}
        <div>
          <h3 className="mb-4 text-gray-900">디자인</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">배경 이미지</Label>
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-colors bg-white">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <ImagePlus className="w-6 h-6" />
                  <span>이미지 업로드</span>
                </div>
              </button>
            </div>

            <div>
              <Label htmlFor="themeColor">테마 색상</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="themeColor"
                  type="color"
                  value={question.design?.themeColor || '#6366f1'}
                  onChange={(e) => onUpdate({ 
                    design: { ...question.design, themeColor: e.target.value }
                  })}
                  className="w-16 h-10 p-1 cursor-pointer bg-white"
                />
                <Input
                  value={question.design?.themeColor || '#6366f1'}
                  onChange={(e) => onUpdate({ 
                    design: { ...question.design, themeColor: e.target.value }
                  })}
                  placeholder="#6366f1"
                  className="flex-1 bg-white"
                />
              </div>
            </div>

            <div>
              <Label>배경 스타일</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { key: 'none', label: '없음' },
                  { key: 'gradient', label: '그라데이션' },
                  { key: 'pattern', label: '패턴' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => onUpdate({ 
                      design: { ...question.design, backgroundStyle: key }
                    })}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${question.design?.backgroundStyle === key 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Branching Logic */}
        <div>
          <h3 className="mb-4 text-gray-900">분기 로직</h3>
          
          <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-colors bg-white text-gray-600">
            + 로직 점프 추가
          </button>
          
          <p className="mt-2 text-gray-500">
            답변에 따라 조건부 경로를 생성합니다
          </p>
        </div>
      </div>
    </div>
  );
}
