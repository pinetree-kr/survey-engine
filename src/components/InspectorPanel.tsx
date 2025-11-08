'use client';

import { useState } from 'react';
import { Question } from '../types/survey';
import { Condition, BranchRule, Option, Operator, SelectLimit } from '@/types/survey';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';

interface InspectorPanelProps {
  question: Question | null;
  allQuestions?: Question[];
  onUpdate: (updates: Partial<Question>) => void;
}

const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'eq', label: '같음 (=)' },
  { value: 'neq', label: '같지 않음 (≠)' },
  { value: 'contains', label: '포함' },
  { value: 'contains_any', label: '하나라도 포함' },
  { value: 'contains_all', label: '모두 포함' },
  { value: 'gt', label: '보다 큼 (>)' },
  { value: 'lt', label: '보다 작음 (<)' },
  { value: 'gte', label: '이상 (≥)' },
  { value: 'lte', label: '이하 (≤)' },
  { value: 'regex', label: '정규식 일치' },
  { value: 'is_empty', label: '비어있음' },
  { value: 'not_empty', label: '비어있지 않음' },
];

export function InspectorPanel({ question, allQuestions = [], onUpdate }: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'branching' | 'visibility'>('settings');

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

  // 타입 매핑: UI 타입 -> 스키마 타입
  const questionType = question.type as string;
  const showChoiceOptions = ['choice', 'dropdown'].includes(questionType);
  const isComposite = ['composite-input', 'composite_single', 'composite_multiple'].includes(questionType);

  // 새로운 스키마로 변환 (임시 호환성)
  const branchLogic = (question as any).branchLogic as BranchRule[] | undefined;
  const showConditions = (question as any).showConditions as Condition | undefined;

  const handleAddBranchRule = () => {
    const newRule: BranchRule = {
      next_question_id: '',
    };
    const updated = [...(branchLogic || []), newRule];
    onUpdate({ branchLogic: updated as any });
  };

  const handleUpdateBranchRule = (index: number, updates: Partial<BranchRule>) => {
    const updated = [...(branchLogic || [])];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ branchLogic: updated as any });
  };

  const handleDeleteBranchRule = (index: number) => {
    const updated = (branchLogic || []).filter((_, i) => i !== index);
    onUpdate({ branchLogic: updated as any });
  };

  const handleUpdateShowCondition = (condition: Condition | undefined) => {
    onUpdate({ showConditions: condition as any });
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="settings">설정</TabsTrigger>
          <TabsTrigger value="branching">분기</TabsTrigger>
          <TabsTrigger value="visibility">표시</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
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

              {questionType === 'choice' && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="isMultiple" className="cursor-pointer">다중선택 허용</Label>
                  <Switch
                    id="isMultiple"
                    checked={question.isMultiple || false}
                    onCheckedChange={(checked) => {
                      onUpdate({ isMultiple: checked });
                      // 다중선택을 끄면 selectLimit 제거
                      if (!checked) {
                        onUpdate({ selectLimit: undefined });
                      } else if (!question.selectLimit) {
                        // 다중선택을 켤 때 기본값으로 무제한 설정
                        onUpdate({ selectLimit: { type: 'unlimited' } });
                      }
                    }}
                  />
                </div>
              )}

              {questionType === 'choice' && question.isMultiple && (
                <div className="flex items-center gap-3">
                  <Select
                    value={question.selectLimit?.type || 'unlimited'}
                    onValueChange={(value) => {
                      if (value === 'unlimited') {
                        onUpdate({ selectLimit: { type: 'unlimited' } });
                      } else if (value === 'exact') {
                        const optionsCount = question.options?.length || 1;
                        onUpdate({ selectLimit: { type: 'exact', value: Math.min(1, optionsCount) } });
                      } else if (value === 'range') {
                        const optionsCount = question.options?.length || 1;
                        onUpdate({ selectLimit: { type: 'range', min: 0, max: Math.min(1, optionsCount) } });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[100] border-gray-200 shadow-lg min-w-[200px]">
                      <SelectItem value="unlimited">무제한</SelectItem>
                      <SelectItem value="exact">정확한 수</SelectItem>
                      <SelectItem value="range">범위</SelectItem>
                    </SelectContent>
                  </Select>

                  {question.selectLimit?.type === 'exact' && (() => {
                    const optionsCount = question.options?.length || 1;
                    return (
                      <Input
                        type="number"
                        min="1"
                        max={optionsCount}
                        value={question.selectLimit.type === 'exact' ? question.selectLimit.value : 1}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value > 0 && value <= optionsCount) {
                            onUpdate({ selectLimit: { type: 'exact', value } });
                          }
                        }}
                        className="bg-white w-20"
                      />
                    );
                  })()}

                  {question.selectLimit?.type === 'range' && (() => {
                    const optionsCount = question.options?.length || 1;
                    return (
                      <>
                        <Input
                          type="number"
                          min="0"
                          max={optionsCount}
                          value={question.selectLimit.type === 'range' ? question.selectLimit.min : 0}
                          onChange={(e) => {
                            const min = parseInt(e.target.value, 10);
                            const max = question.selectLimit?.type === 'range' ? question.selectLimit.max : 1;
                            if (!isNaN(min) && min >= 0 && min <= max && min <= optionsCount) {
                              onUpdate({ selectLimit: { type: 'range', min, max } });
                            }
                          }}
                          className="bg-white w-20"
                        />
                        <Input
                          type="number"
                          min="1"
                          max={optionsCount}
                          value={question.selectLimit.type === 'range' ? question.selectLimit.max : 1}
                          onChange={(e) => {
                            const max = parseInt(e.target.value, 10);
                            const min = question.selectLimit?.type === 'range' ? question.selectLimit.min : 0;
                            if (!isNaN(max) && max > 0 && max >= min && max <= optionsCount) {
                              onUpdate({ selectLimit: { type: 'range', min, max } });
                            }
                          }}
                          className="bg-white w-20"
                        />
                      </>
                    );
                  })()}
                </div>
              )}

              {showChoiceOptions && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="isOther" className="cursor-pointer">"기타" 옵션 추가</Label>
                  <Switch
                    id="isOther"
                    checked={question.options?.some((option) => option.isOther) || false}
                    onCheckedChange={
                      (checked) => {
                        if (checked) {
                          onUpdate({ options: [...(question.options || []), { label: '기타', isOther: true, key: `option-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }] as Option[] });
                        } else {
                          onUpdate({ options: question.options?.filter((option) => !option.isOther) || [] });
                        }
                      }
                    }
                  />
                </div>
              )}

              <div>
                <Label htmlFor="validation">유효성 검사</Label>
                <Input
                  id="validation"
                  value={question.validations?.regex || ''}
                  onChange={(e) => onUpdate({ validations: { ...question.validations, regex: e.target.value } })}
                  placeholder="예: 이메일, 숫자, 최소 길이"
                  className="mt-2 bg-white"
                />
              </div>
            </div>
          </div>

          <Separator />

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
        </TabsContent>

        <TabsContent value="branching" className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">분기 로직</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddBranchRule}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                규칙 추가
              </Button>
            </div>

            {(!branchLogic || branchLogic.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">분기 규칙이 없습니다</p>
                <p className="text-sm">규칙을 추가하여 조건부 경로를 생성하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {branchLogic.map((rule, index) => (
                  <BranchRuleEditor
                    key={index}
                    rule={rule}
                    ruleIndex={index}
                    allQuestions={allQuestions}
                    currentQuestionId={question.id}
                    onUpdate={(updates) => handleUpdateBranchRule(index, updates)}
                    onDelete={() => handleDeleteBranchRule(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4">
          <div>
            <h3 className="mb-4 text-gray-900">표시 조건</h3>
            <p className="text-sm text-gray-500 mb-4">
              이 질문을 표시할 조건을 설정합니다
            </p>
            <ConditionBuilder
              condition={showConditions}
              allQuestions={allQuestions}
              currentQuestionId={question.id}
              onChange={handleUpdateShowCondition}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BranchRuleEditorProps {
  rule: BranchRule;
  ruleIndex: number;
  allQuestions: Question[];
  currentQuestionId: string;
  onUpdate: (updates: Partial<BranchRule>) => void;
  onDelete: () => void;
}

function BranchRuleEditor({
  rule,
  ruleIndex,
  allQuestions,
  currentQuestionId,
  onUpdate,
  onDelete,
}: BranchRuleEditorProps) {
  const availableQuestions = allQuestions.filter((q) => q.id !== currentQuestionId);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">규칙 #{ruleIndex + 1}</span>
          {!rule.when && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">기본</span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-sm">조건 (선택사항)</Label>
          <ConditionBuilder
            condition={rule.when}
            allQuestions={allQuestions}
            currentQuestionId={currentQuestionId}
            onChange={(condition) => onUpdate({ when: condition })}
          />
        </div>

        <div>
          <Label className="text-sm">다음 질문</Label>
          <Select
            value={rule.next_question_id}
            onValueChange={(value) => onUpdate({ next_question_id: value })}
          >
            <SelectTrigger className="mt-2 bg-white">
              <SelectValue placeholder="질문 선택" />
            </SelectTrigger>
            <SelectContent>
              {availableQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.title || `질문 ${q.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

interface ConditionBuilderProps {
  condition: Condition | undefined;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: Condition | undefined) => void;
}

function ConditionBuilder({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
}: ConditionBuilderProps) {
  const availableQuestions = allQuestions.filter((q) => q.id !== currentQuestionId);

  if (!condition) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          onChange({
            kind: 'condition',
            question_id: availableQuestions[0]?.id || '',
            operator: 'eq',
          });
        }}
        className="w-full mt-2"
      >
        <Plus className="w-4 h-4 mr-1" />
        조건 추가
      </Button>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <ConditionNode
        condition={condition}
        allQuestions={allQuestions}
        currentQuestionId={currentQuestionId}
        onChange={onChange}
        depth={0}
      />
    </div>
  );
}

interface ConditionNodeProps {
  condition: Condition;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: Condition | undefined) => void;
  depth: number;
}

function ConditionNode({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
  depth,
}: ConditionNodeProps) {
  const availableQuestions = allQuestions.filter((q) => q.id !== currentQuestionId);

  if (condition.kind === 'condition') {
    const selectedQuestion = allQuestions.find((q) => q.id === condition.question_id);
    const selectedType = selectedQuestion?.type as string;
    const isComposite = ['composite-input', 'composite_single', 'composite_multiple'].includes(selectedType || '');
    const compositeItems = (selectedQuestion as any)?.compositeItems || [];

    return (
      <div className="p-3 border border-gray-200 rounded-lg bg-white">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <div>
              <Label className="text-xs text-gray-500">질문</Label>
              <Select
                value={condition.question_id}
                onValueChange={(value) => {
                  onChange({
                    ...condition,
                    question_id: value,
                    sub_key: undefined,
                  });
                }}
              >
                <SelectTrigger className="h-8 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.title || `질문 ${q.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isComposite && (
              <div>
                <Label className="text-xs text-gray-500">항목 (subKey)</Label>
                <Select
                  value={condition.sub_key || ''}
                  onValueChange={(value) => {
                    onChange({
                      ...condition,
                      sub_key: value || undefined,
                    });
                  }}
                >
                  <SelectTrigger className="h-8 bg-white text-sm">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    {compositeItems.map((item: any) => (
                      <SelectItem key={item.key} value={item.key}>
                        {item.label || item.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500">연산자</Label>
              <Select
                value={condition.operator}
                onValueChange={(value) => {
                  onChange({
                    ...condition,
                    operator: value as Operator,
                  });
                }}
              >
                <SelectTrigger className="h-8 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!['is_empty', 'not_empty'].includes(condition.operator) && (
              <div>
                <Label className="text-xs text-gray-500">값</Label>
                <Input
                  value={typeof condition.value === 'object' ? JSON.stringify(condition.value) : String(condition.value || '')}
                  onChange={(e) => {
                    let value: string | number | boolean | Array<string | number> = e.target.value;
                    // 간단한 파싱 시도
                    if (value.startsWith('[') && value.endsWith(']')) {
                      try {
                        value = JSON.parse(value);
                      } catch {
                        // 파싱 실패 시 문자열로 유지
                      }
                    } else if (!isNaN(Number(value)) && value !== '') {
                      value = Number(value);
                    }
                    onChange({
                      ...condition,
                      value,
                    });
                  }}
                  placeholder="값 입력"
                  className="h-8 bg-white text-sm"
                />
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ConditionGroup
  return (
    <div className="space-y-2">
      <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Select
            value={condition.aggregator}
            onValueChange={(value) => {
              onChange({
                ...condition,
                aggregator: value as 'AND' | 'OR',
              });
            }}
          >
            <SelectTrigger className="h-7 w-20 bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange({
                ...condition,
                children: [
                  ...condition.children,
                  {
                    kind: 'condition',
                    question_id: availableQuestions[0]?.id || '',
                    operator: 'eq',
                  },
                ],
              });
            }}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            조건 추가
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 ml-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-gray-300">
          {condition.children.map((child, index) => (
            <ConditionNode
              key={index}
              condition={child}
              allQuestions={allQuestions}
              currentQuestionId={currentQuestionId}
              onChange={(updated) => {
                const newChildren = [...condition.children];
                if (updated === undefined) {
                  newChildren.splice(index, 1);
                } else {
                  newChildren[index] = updated;
                }
                onChange({
                  ...condition,
                  children: newChildren,
                });
              }}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
