'use client';

import { useState } from 'react';
import { Question, Section, QuestionType } from '../types/survey';
import { BranchNode, PredicateNode, GroupNode, BranchRule, ShowNode, ShowRule, Option, Operator, ComplexItem } from '@/types/survey';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { ChoiceConditionBuilder } from './ChoiceConditionComponents';

interface InspectorPanelProps {
  question: Question | null;
  allQuestions?: Question[];
  sections?: Section[];
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

export function InspectorPanel({ question, allQuestions = [], sections = [], onUpdate }: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'branching' | 'visibility'>('settings');
  
  // 분기 탭 표시 여부 결정
  const showBranchingTab = question && (question.type === 'choice' || question.type === 'complex_choice');

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
  const isChoiceType = questionType === 'choice';
  const showChoiceOptions = isChoiceType;
  const isComplexChoiceType = questionType === 'complex_choice';
  const isComplexInputType = questionType === 'complex_input';
  const isComplexType = isComplexChoiceType || isComplexInputType;
  const showComplexOptions = isComplexType;

  // dropdown 타입을 choice로 통합 (하위 호환성 유지)
  const isDropdown = isChoiceType && question.isDropdown;

  // 분기 규칙과 표시 규칙
  const branchRules = question.branchRules || [];
  const showRules = question.showRules || [];

  const handleAddBranchRule = () => {
    const newRule: BranchRule = {
      next_question_id: '',
    };
    const updated = [...branchRules, newRule];
    onUpdate({ branchRules: updated });
  };

  const handleUpdateBranchRule = (index: number, updates: Partial<BranchRule>) => {
    const updated = [...branchRules];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ branchRules: updated });
  };

  const handleDeleteBranchRule = (index: number) => {
    const updated = branchRules.filter((_, i) => i !== index);
    onUpdate({ branchRules: updated });
  };

  const handleAddShowRule = () => {
    const newRule: ShowRule = {
      refQuestionId: allQuestions.filter(q => q.id !== question.id)[0]?.id || '',
    };
    const updated = [...showRules, newRule];
    onUpdate({ showRules: updated });
  };

  const handleUpdateShowRule = (index: number, updates: Partial<ShowRule>) => {
    const updated = [...showRules];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ showRules: updated });
  };

  const handleDeleteShowRule = (index: number) => {
    const updated = showRules.filter((_, i) => i !== index);
    onUpdate({ showRules: updated });
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="flex items-center gap-0 mb-6 bg-transparent p-0 h-auto">
          <TabsTrigger
            value="settings"
            className="px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:bg-gray-100 data-[state=active]:border-gray-400 data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-900 transition-colors"
          >
            설정
          </TabsTrigger>
          {showBranchingTab && (
            <TabsTrigger
              value="branching"
              className="px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:bg-gray-100 data-[state=active]:border-gray-400 data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-900 transition-colors"
            >
              분기
            </TabsTrigger>
          )}
          <TabsTrigger
            value="visibility"
            className="px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:bg-gray-100 data-[state=active]:border-gray-400 data-[state=active]:text-gray-900 text-gray-600 hover:text-gray-900 transition-colors"
          >
            표시
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h3 className="mb-4 text-gray-900">질문 설정</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="questionType" className="mb-2 block">문항 타입</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) => {
                    const newType = value as QuestionType;
                    const updates: Partial<Question> = { type: newType };

                    // 타입별 초기화
                    if (newType === 'choice') {
                      // choice 타입으로 변경: options 초기화
                      if (!question.options || question.options.length === 0) {
                        updates.options = [{ label: '', key: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }] as Option[];
                      }
                    } else {
                      // choice가 아닌 타입으로 변경: choice 관련 필드 제거
                      updates.options = undefined;
                      updates.isDropdown = undefined;
                      // complex_choice는 isMultiple을 유지
                      if (newType !== 'complex_choice' && newType !== 'complex_input') {
                        updates.isMultiple = undefined;
                      }
                    }

                    if (newType === 'complex_choice') {
                      // complex_choice 타입으로 변경: complexItems 초기화
                      if (!question.complexItems || question.complexItems.length === 0) {
                        updates.complexItems = [];
                      }
                      // isMultiple 기본값 설정 (없으면 false)
                      if (question.isMultiple === undefined) {
                        updates.isMultiple = false;
                      }
                    } else if (newType === 'complex_input') {
                      // complex_input 타입으로 변경: complexItems 초기화
                      if (!question.complexItems || question.complexItems.length === 0) {
                        updates.complexItems = [];
                      }
                      // complex_input은 선택 기능이 없으므로 isMultiple 제거
                      updates.isMultiple = undefined;
                    } else {
                      // complex_choice/complex_input이 아닌 타입으로 변경: complexItems 제거
                      if (newType !== 'choice') {
                        updates.complexItems = undefined;
                      }
                    }

                    if (newType === 'description') {
                      // description 타입: description 필드 초기화
                      updates.description = '';
                    }

                    if (newType === 'short_text') {
                      // short_text 타입으로 변경: input_type 기본값 설정
                      if (!question.input_type) {
                        updates.input_type = 'text';
                      }
                    } else {
                      // short_text가 아닌 타입으로 변경: input_type 제거
                      updates.input_type = undefined;
                    }

                    onUpdate(updates);
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="문항 타입 선택">
                      {question.type === 'short_text' && '단답형'}
                      {question.type === 'long_text' && '장문형'}
                      {question.type === 'choice' && '선택형'}
                      {question.type === 'complex_choice' && '복합 선택'}
                      {question.type === 'complex_input' && '복합 입력'}
                      {question.type === 'description' && '설명'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="short_text">단답형</SelectItem>
                    <SelectItem value="long_text">장문형</SelectItem>
                    <SelectItem value="choice">선택형</SelectItem>
                    <SelectItem value="complex_choice">복합 선택</SelectItem>
                    <SelectItem value="complex_input">복합 입력</SelectItem>
                    <SelectItem value="description">설명</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {questionType === 'short_text' && (
                <div>
                  <Label htmlFor="inputType" className="mb-2 block">입력 필드 타입</Label>
                  <Select
                    value={question.input_type || 'text'}
                    onValueChange={(value) => {
                      onUpdate({ input_type: value as 'text' | 'number' | 'email' | 'tel' });
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="text">텍스트</SelectItem>
                      <SelectItem value="number">숫자</SelectItem>
                      <SelectItem value="email">이메일</SelectItem>
                      <SelectItem value="tel">전화번호</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(questionType === 'short_text' || questionType === 'long_text') && (
                <div>
                  <Label htmlFor="placeholder" className="mb-2 block">Placeholder</Label>
                  <Input
                    id="placeholder"
                    type="text"
                    value={question.placeholder || ''}
                    onChange={(e) => {
                      onUpdate({ placeholder: e.target.value || undefined });
                    }}
                    placeholder="입력 필드에 표시될 힌트 텍스트"
                    className="bg-white"
                  />
                </div>
              )}

              {
                !isComplexType && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="required" className="cursor-pointer">필수 항목</Label>
                    <Switch
                      id="required"
                      checked={question.required}
                      onCheckedChange={(checked) => onUpdate({ required: checked })}
                    />
                  </div>
                )
              }

              {showChoiceOptions && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="isDropdown" className="cursor-pointer">드롭다운 형식</Label>
                  <Switch
                    id="isDropdown"
                    checked={isDropdown || false}
                    onCheckedChange={(checked) => {
                      onUpdate({ isDropdown: checked });
                    }}
                  />
                </div>
              )}

              {showChoiceOptions && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="isMultiple" className="cursor-pointer">다중선택 허용</Label>
                  <Switch
                    id="isMultiple"
                    checked={question.isMultiple || false}
                    onCheckedChange={(checked) => {
                      onUpdate({ isMultiple: checked });
                    }}
                  />
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
                          onUpdate({ options: [...(question.options || []), { label: '기타', isOther: true, key: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }] as Option[] });
                        } else {
                          onUpdate({ options: question.options?.filter((option) => !option.isOther) || [] });
                        }
                      }
                    }
                  />
                </div>
              )}

              {isComplexChoiceType && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="complexIsMultiple" className="cursor-pointer">다중선택 허용</Label>
                  <Switch
                    id="complexIsMultiple"
                    checked={question.isMultiple || false}
                    onCheckedChange={(checked) => {
                      onUpdate({ isMultiple: checked });
                    }}
                  />
                </div>
              )}

              {showComplexOptions && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>{isComplexChoiceType ? '복합 선택 필드' : '복합 입력 필드'}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItem: ComplexItem = {
                          label: '',
                          input_type: 'text',
                          key: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        };
                        onUpdate({
                          complexItems: [...(question.complexItems || []), newItem],
                        });
                      }}
                      className="h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      필드 추가
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(question.complexItems || []).map((item, index) => (
                      <div key={item.key} className="p-3 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">필드 {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = (question.complexItems || []).filter((_, i) => i !== index);
                              onUpdate({ complexItems: updated });
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500">라벨</Label>
                            <Input
                              value={item.label}
                              onChange={(e) => {
                                const updated = [...(question.complexItems || [])];
                                updated[index] = { ...updated[index], label: e.target.value };
                                onUpdate({ complexItems: updated });
                              }}
                              placeholder="필드 라벨"
                              className="mt-1 bg-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">입력 타입</Label>
                            <Select
                              value={item.input_type}
                              onValueChange={(value) => {
                                const updated = [...(question.complexItems || [])];
                                updated[index] = { ...updated[index], input_type: value as 'text' | 'number' | 'email' | 'tel' };
                                onUpdate({ complexItems: updated });
                              }}
                            >
                              <SelectTrigger className="mt-1 bg-white text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-200">
                                <SelectItem value="text">텍스트</SelectItem>
                                <SelectItem value="number">숫자</SelectItem>
                                <SelectItem value="email">이메일</SelectItem>
                                <SelectItem value="tel">전화번호</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">플레이스홀더 (선택)</Label>
                            <Input
                              value={item.placeholder || ''}
                              onChange={(e) => {
                                const updated = [...(question.complexItems || [])];
                                updated[index] = { ...updated[index], placeholder: e.target.value || undefined };
                                onUpdate({ complexItems: updated });
                              }}
                              placeholder="플레이스홀더"
                              className="mt-1 bg-white text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">단위 (선택)</Label>
                            <Input
                              value={item.unit || ''}
                              onChange={(e) => {
                                const updated = [...(question.complexItems || [])];
                                updated[index] = { ...updated[index], unit: e.target.value || undefined };
                                onUpdate({ complexItems: updated });
                              }}
                              placeholder="예: kg, cm"
                              className="mt-1 bg-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!question.complexItems || question.complexItems.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        복합 필드가 없습니다. 필드를 추가하세요.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!showChoiceOptions && !showComplexOptions && (
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
              )}
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

        {showBranchingTab && (
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

            {(!branchRules || branchRules.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">분기 규칙이 없습니다</p>
                <p className="text-sm">규칙을 추가하여 조건부 경로를 생성하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {branchRules.map((rule, index) => (
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
        )}

        <TabsContent value="visibility" className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">표시 규칙</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddShowRule}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                규칙 추가
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              이 질문을 표시할 조건을 설정합니다. 모든 규칙이 true일 때 표시됩니다.
            </p>

            {(!showRules || showRules.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">표시 규칙이 없습니다</p>
                <p className="text-sm">규칙을 추가하여 조건부 표시를 설정하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {showRules.map((rule, index) => (
                  <ShowRuleEditor
                    key={index}
                    rule={rule}
                    ruleIndex={index}
                    allQuestions={allQuestions}
                    currentQuestionId={question.id}
                    onUpdate={(updates) => handleUpdateShowRule(index, updates)}
                    onDelete={() => handleDeleteShowRule(index)}
                  />
                ))}
              </div>
            )}
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
  const currentQuestion = allQuestions.find((q) => q.id === currentQuestionId);
  const isChoiceType = currentQuestion && (currentQuestion.type === 'choice' || currentQuestion.isDropdown);
  const options = currentQuestion?.options || [];

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
          <ConditionBuilder
            condition={(() => {
              // rule.when이 없으면 undefined
              if (!rule.when) {
                return undefined;
              }
              // rule.when이 GroupNode이면 그대로 반환
              if (rule.when.kind === 'group') {
                return rule.when;
              }
              // rule.when이 PredicateNode이면 GroupNode로 감싸서 반환
              return {
                kind: 'group',
                op: 'AND',
                children: [rule.when],
              };
            })()}
            allQuestions={allQuestions}
            currentQuestionId={currentQuestionId}
            onChange={(condition) => {
              if (!condition) {
                onUpdate({ when: undefined });
              } else {
                // GroupNode를 그대로 저장 (nested group 지원)
                onUpdate({ when: condition });
              }
            }}
          />
        </div>

        <div>
          <Label className="text-sm">다음 질문으로 이동</Label>
          <Select
            value={rule.next_question_id}
            onValueChange={(value) => onUpdate({ next_question_id: value })}
          >
            <SelectTrigger className="mt-2 bg-white">
              <SelectValue placeholder="질문 선택">
                {rule.next_question_id
                  ? availableQuestions.find(q => q.id === rule.next_question_id)?.title || rule.next_question_id
                  : "질문 선택"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {availableQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id || ''}>
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

interface ShowRuleEditorProps {
  rule: ShowRule;
  ruleIndex: number;
  allQuestions: Question[];
  currentQuestionId: string;
  onUpdate: (updates: Partial<ShowRule>) => void;
  onDelete: () => void;
}

function ShowRuleEditor({
  rule,
  ruleIndex,
  allQuestions,
  currentQuestionId,
  onUpdate,
  onDelete,
}: ShowRuleEditorProps) {
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
          <Label className="text-sm">참조 질문</Label>
          <Select
            value={rule.refQuestionId}
            onValueChange={(value) => onUpdate({ refQuestionId: value })}
          >
            <SelectTrigger className="mt-2 bg-white">
              <SelectValue placeholder="질문 선택">
                {rule.refQuestionId
                  ? allQuestions.find(q => q.id === rule.refQuestionId)?.title || rule.refQuestionId
                  : "질문 선택"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {availableQuestions.map((q) => (
                <SelectItem key={q.id} value={q.id || ''}>
                  {q.title || `질문 ${q.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">조건 (선택사항, 미설정시 항상 true)</Label>
          <ConditionBuilder
            condition={(() => {
              if (!rule.when) {
                return undefined;
              }
              if (rule.when.kind === 'group') {
                return rule.when;
              }
              return {
                kind: 'group',
                op: 'AND',
                children: [rule.when],
              };
            })()}
            allQuestions={allQuestions}
            currentQuestionId={rule.refQuestionId}
            onChange={(condition) => {
              if (!condition) {
                onUpdate({ when: undefined });
              } else {
                onUpdate({ when: condition });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface ConditionBuilderProps {
  condition: GroupNode | undefined;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: GroupNode | undefined) => void;
}

function ConditionBuilder({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
}: ConditionBuilderProps) {
  const currentQuestion = allQuestions.find((q) => q.id === currentQuestionId);
  const isChoiceType = currentQuestion && (currentQuestion.type === 'choice' || currentQuestion.isDropdown);

  if (isChoiceType) {
    return (
      <>
        <ChoiceConditionBuilder
          condition={condition}
          allQuestions={allQuestions}
          currentQuestionId={currentQuestionId}
          onChange={onChange}
        />
      </>
    );
  }

  return (
    <>
      {/* <Label className="text-sm">조건 (선택사항, 미설정시 항상 적용)</Label> */}
      <DefaultConditionBuilder
        condition={condition}
        allQuestions={allQuestions}
        currentQuestionId={currentQuestionId}
        onChange={onChange}
      />
    </>
  );
}


interface DefaultConditionBuilderProps {
  condition: GroupNode | undefined;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: GroupNode | undefined) => void;
}

function DefaultConditionBuilder({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
}: DefaultConditionBuilderProps) {
  if (!condition) {
    // 일반적인 경우 조건 추가 버튼 표시
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          onChange({
            kind: 'group',
            op: 'AND',
            children: [{
              kind: 'predicate',
              op: 'eq',
            }],
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
      <DefaultConditionNode
        condition={condition}
        allQuestions={allQuestions}
        currentQuestionId={currentQuestionId}
        onChange={(updated) => {
          if (updated === undefined) {
            onChange(undefined);
          } else if (updated.kind === 'group') {
            onChange(updated);
          } else {
            // PredicateNode를 GroupNode로 변환
            onChange({
              kind: 'group',
              op: 'AND',
              children: [updated],
            });
          }
        }}
        depth={0}
      />
    </div>
  );
}


interface DefaultPredicateNodeProps {
  condition: PredicateNode;
  selectedQuestion: Question | undefined;
  onChange: (condition: PredicateNode | undefined) => void;
}

function DefaultPredicateNode({
  condition,
  selectedQuestion,
  onChange,
}: DefaultPredicateNodeProps) {
  const selectedType = selectedQuestion?.type as string;
  const isComposite = selectedType === 'complex_choice' || selectedType === 'complex_input';
  const complexItems = (selectedQuestion as any)?.complexItems || [];

  return (
    <div className="p-3 border border-gray-200 rounded-lg bg-white">
      <div className="flex">
        <div className="flex-1 space-y-2">
          {isComposite && (
            <div>
              <Label className="text-xs text-gray-500">항목 (subKey)</Label>
              <Select
                value={condition.subKey || ''}
                onValueChange={(value) => {
                  onChange({
                    ...condition,
                    subKey: value || undefined,
                  });
                }}
              >
                <SelectTrigger className="h-8 bg-white text-sm">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {complexItems.map((item: any) => (
                    <SelectItem key={item.key} value={item.key || ''} className="text-sm bg-white">
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
              value={condition.op || ''}
              onValueChange={(value) => {
                onChange({
                  ...condition,
                  op: value as Operator,
                });
              }}
            >
              <SelectTrigger className="h-8 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {OPERATORS.map((op) => (
                  <SelectItem key={op.value} value={op.value || ''}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!['is_empty', 'not_empty'].includes(condition.op) && (
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
                    value: value as string | number | boolean,
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

interface DefaultConditionNodeProps {
  condition: BranchNode;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: BranchNode | undefined) => void;
  depth: number;
}

function DefaultConditionNode({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
  depth,
}: DefaultConditionNodeProps) {
  const selectedQuestion = allQuestions.find((q) => q.id === currentQuestionId);

  if (condition.kind === 'predicate') {
    return (
      <DefaultPredicateNode
        condition={condition}
        selectedQuestion={selectedQuestion}
        onChange={onChange}
      />
    );
  }

  // GroupNode
  return (
    <DefaultGroupNode
      condition={condition}
      allQuestions={allQuestions}
      currentQuestionId={currentQuestionId}
      onChange={onChange}
      depth={depth}
    />
  );
}

interface DefaultGroupNodeProps {
  condition: GroupNode;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: GroupNode | undefined) => void;
  depth: number;
}

function DefaultGroupNode({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
  depth,
}: DefaultGroupNodeProps) {
  return (
    <div className="space-y-2">
      <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2 bg-white">
          <Select
            value={condition.op}
            onValueChange={(value) => {
              onChange({
                ...condition,
                op: value as 'AND' | 'OR',
              });
            }}
          >
            <SelectTrigger className="h-7 w-20 bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
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
                    kind: 'predicate',
                    op: 'eq',
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
            <DefaultConditionNode
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

