'use client';

import { Question } from '../types/survey';
import { BranchNode, PredicateNode, GroupNode } from '@/types/survey';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Plus } from 'lucide-react';
import { getOptionLabel } from '@/utils/label';

interface ChoiceConditionBuilderProps {
  condition: GroupNode | undefined;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: GroupNode | undefined) => void;
}

export function ChoiceConditionBuilder({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
}: ChoiceConditionBuilderProps) {
  const selectedQuestion = allQuestions.find((q) => q.id === currentQuestionId);
  const isMultiple = selectedQuestion?.isMultiple || false;

  // isMultiple이 false인 경우: 단일 선택 UI
  if (!isMultiple) {
    return (
      <ChoiceSingleConditionBuilder
        condition={condition}
        allQuestions={allQuestions}
        currentQuestionId={currentQuestionId}
        onChange={onChange}
      />
    );
  }

  // isMultiple이 true인 경우: 다중 선택 UI
  return (
    <ChoiceMultipleConditionBuilder
      condition={condition}
      allQuestions={allQuestions}
      currentQuestionId={currentQuestionId}
      onChange={onChange}
    />
  );
}

interface ChoiceSingleConditionBuilderProps {
  condition: GroupNode | undefined;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: GroupNode | undefined) => void;
}

function ChoiceSingleConditionBuilder({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
}: ChoiceSingleConditionBuilderProps) {
  const selectedQuestion = allQuestions.find((q) => q.id === currentQuestionId);
  const options = selectedQuestion?.options || [];
  const isBoolean = selectedQuestion?.isBoolean || false;

  // GroupNode에서 첫 번째 predicate를 추출 (단일 선택이므로)
  const predicate = condition?.children?.[0] as PredicateNode | undefined;
  const currentValue = predicate?.value as string | undefined;

  const handleValueChange = (value: string | undefined) => {
    if (!value) {
      onChange(undefined);
      return;
    }

    const newPredicate: PredicateNode = {
      kind: 'predicate',
      op: 'eq',
      value: value,
    };

    onChange({
      kind: 'group',
      op: 'AND',
      children: [newPredicate],
    });
  };

  // 인덱스 레이블 가져오기 (isBoolean일 때는 option.key 사용)
  const getIndexLabel = (option: { key: string }, idx: number) => {
    if (isBoolean) {
      return option.key || (idx === 0 ? 'Y' : 'N');
    }
    return getOptionLabel(idx);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <Select
          value={currentValue || ''}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="h-9 bg-white flex-1">
            <SelectValue placeholder="옵션을 선택하세요" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            {options.map((option, idx) => (
              <SelectItem key={option.key} value={option.key}>
                {getIndexLabel(option, idx)}. {option.label || ''} 선택시
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleValueChange(undefined)}
            className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface ChoiceMultipleConditionBuilderProps {
  condition: GroupNode | undefined;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: GroupNode | undefined) => void;
}

function ChoiceMultipleConditionBuilder({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
}: ChoiceMultipleConditionBuilderProps) {
  if (!condition) {
    // 다중 선택인 경우 조건 추가 버튼 표시
    return (
      <div className="mt-2">
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
          className="w-full"
        >
          조건 추가
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <ChoiceConditionNode
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

interface ChoicePredicateNodeProps {
  condition: PredicateNode;
  selectedQuestion: Question | undefined;
  onChange: (condition: PredicateNode | undefined) => void;
}

// Choice 타입의 PredicateNode - isMultiple일 때 사용
function ChoicePredicateNode({
  condition,
  selectedQuestion,
  onChange,
}: ChoicePredicateNodeProps) {
  const options = selectedQuestion?.options || [];
  const isBoolean = selectedQuestion?.isBoolean || false;

  // 인덱스 레이블 가져오기 (isBoolean일 때는 option.key 사용)
  const getIndexLabel = (option: { key: string }, idx: number) => {
    if (isBoolean) {
      return option.key || (idx === 0 ? 'Y' : 'N');
    }
    return getOptionLabel(idx);
  };

  return (
    <div className="p-3 border border-gray-200 rounded-lg bg-white">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-500">옵션 선택</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <Select
              value={typeof condition.value === 'string' ? condition.value : String(condition.value || '')}
              onValueChange={(value) => {
                onChange({
                  ...condition,
                  op: 'eq',
                  value: value || undefined,
                });
              }}
            >
              <SelectTrigger className="h-9 bg-white w-full">
                <SelectValue placeholder="옵션을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {options.map((option, idx) => (
                  <SelectItem key={option.key} value={option.key}>
                    {getIndexLabel(option, idx)}. {option.label || ''} 선택시
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {condition.value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange({
                  ...condition,
                  op: 'eq',
                  value: undefined,
                });
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChoiceConditionNodeProps {
  condition: BranchNode;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: BranchNode | undefined) => void;
  depth: number;
}

function ChoiceConditionNode({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
  depth,
}: ChoiceConditionNodeProps) {
  const selectedQuestion = allQuestions.find((q) => q.id === currentQuestionId);

  if (condition.kind === 'predicate') {
    return (
      <ChoicePredicateNode
        condition={condition}
        selectedQuestion={selectedQuestion}
        onChange={onChange}
      />
    );
  }

  // GroupNode
  return (
    <ChoiceGroupNode
      condition={condition}
      allQuestions={allQuestions}
      currentQuestionId={currentQuestionId}
      onChange={onChange}
      depth={depth}
    />
  );
}

interface ChoiceGroupNodeProps {
  condition: GroupNode;
  allQuestions: Question[];
  currentQuestionId: string;
  onChange: (condition: GroupNode | undefined) => void;
  depth: number;
}

function ChoiceGroupNode({
  condition,
  allQuestions,
  currentQuestionId,
  onChange,
  depth,
}: ChoiceGroupNodeProps) {
  const selectedQuestion = allQuestions.find((q) => q.id === currentQuestionId);
  const isMultiple = selectedQuestion?.isMultiple || false;

  // isMultiple이 true인 경우: AND/OR 선택 가능, 조건 추가 버튼 표시
  if (isMultiple) {
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
              <ChoiceConditionNode
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

  // isMultiple이 false인 경우: AND/OR 선택 없음, 조건 추가 버튼 없음
  return (
    <div className="space-y-2">
      <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2 bg-white">
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
            <ChoiceConditionNode
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

