# 설문 스키마 확장 및 UI/UX 가이드 문서

## 1. 개요
본 문서는 기존 설문 스키마에 대한 확장 사항으로, **조건부 분기(branchLogic)** 및 **표시 조건(showConditions)** 을 포함하여 **복합(composite) 문항**까지 일관된 방식으로 처리할 수 있는 구조를 정의합니다. 또한, 해당 스키마를 기반으로 한 **UI/UX 설계 원칙 및 JSON 예시**를 함께 제공합니다.

---

## 2. 핵심 변경 요약

| 구분 | 기존 | 변경 후 |
|------|------|----------|
| `nextQuestionId` | 질문 레벨의 단일 이동 | `branchLogic`으로 통합 (`when` 미설정 rule = default) |
| `branchLogic` | 단일 조건 구조 | 트리형 조건(AND/OR 그룹) + subKey 지원 |
| `showConditions` | 배열 구조 | 단일 트리 구조로 통합 |
| `composite` | 항목 단위 `next_question_id`만 지원 | `sub_key` 기반 다중 조건 평가 및 그룹화 가능 |
| `Condition` | 단일 조건 | 중첩 조건 그룹(`ConditionGroup`) 지원 |

---

## 3. 스키마 정의

### 3.1 Condition (조건 표현)
```ts
type Operator =
  | 'eq' | 'neq'
  | 'contains' | 'contains_any' | 'contains_all'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'regex' | 'is_empty' | 'not_empty';

type SingleCondition = {
  kind: 'condition';
  question_id: string;
  sub_key?: string;  // composite 내부 필드 참조 시 사용
  operator: Operator;
  value?: string | number | boolean | Array<string | number>;
};

type ConditionGroup = {
  kind: 'group';
  aggregator: 'AND' | 'OR';
  children: Condition[];
};

type Condition = SingleCondition | ConditionGroup;
```

### 3.2 BranchRule (분기 규칙)
```ts
type BranchRule = {
  when?: Condition;          // 없으면 항상 true
  next_question_id: string;  // 이동할 다음 질문 ID
};
```

### 3.3 Question (질문)
```ts
type Question = {
  id: string;
  title: string;
  type: QuestionType;
  required?: boolean;

  // composite 문항일 경우
  compositeItems?: CompositeItem[];

  // 조건 로직
  branchLogic?: BranchRule[];
  showConditions?: Condition;
};
```

### 3.4 CompositeItem (복합 항목)
```ts
type CompositeItem = {
  key: string;
  label: string;
  input_type: string;
  required?: boolean;
  next_question_id?: string;    // 항목 단위 이동 (선택적)
  show_conditions?: Condition;  // 항목 단위 표시 조건
};
```

---

## 4. 동작 원리

### 4.1 라우팅 우선순위

| 우선순위 | 설명 |
|-----------|-------|
| ① | `CompositeItem.next_question_id` (항목 단위 분기) |
| ② | `Question.branchLogic` (when 조건 트리 평가) |
| ③ | `Group.branchLogic` (그룹 단위 분기) |
| ④ | `showConditions`에 의해 비활성 질문은 스킵 |
| ⑤ | 기본 선형(next index) 이동 |

### 4.2 ConditionEvaluator 핵심 로직
```ts
function evaluateCondition(condition: Condition, answers: Record<string, any>): boolean {
  if (condition.kind === 'condition') {
    const { question_id, sub_key, operator, value } = condition;
    const target = sub_key ? answers[question_id]?.[sub_key] : answers[question_id];
    return compare(operator, target, value);
  }

  if (condition.kind === 'group') {
    const results = condition.children.map(c => evaluateCondition(c, answers));
    return condition.aggregator === 'AND' ? results.every(Boolean) : results.some(Boolean);
  }

  return false;
}
```

---

## 5. JSON 예시

### 5.1 Composite 문항 내 다중 조건 분기 예시

```json
{
  "id": "q10",
  "title": "기본 정보",
  "type": "composite_single",
  "compositeItems": [
    { "key": "age", "label": "나이", "input_type": "number" },
    { "key": "city", "label": "거주 도시", "input_type": "dropdown" },
    { "key": "job", "label": "직업", "input_type": "short_text" }
  ],
  "branchLogic": [
    {
      "when": {
        "kind": "group",
        "aggregator": "AND",
        "children": [
          { "kind": "condition", "question_id": "q10", "sub_key": "age", "operator": "gte", "value": 20 },
          { "kind": "condition", "question_id": "q10", "sub_key": "city", "operator": "eq", "value": "서울" }
        ]
      },
      "next_question_id": "q15"
    },
    {
      "when": {
        "kind": "group",
        "aggregator": "OR",
        "children": [
          { "kind": "condition", "question_id": "q10", "sub_key": "job", "operator": "eq", "value": "학생" },
          { "kind": "condition", "question_id": "q10", "sub_key": "job", "operator": "eq", "value": "프리랜서" }
        ]
      },
      "next_question_id": "q20"
    },
    { "next_question_id": "q12" }
  ]
}
```

---

## 6. UI/UX 설계 가이드

### 6.1 분기 로직(BranchLogic) 빌더 UX

| 요소 | 설명 |
|------|------|
| 조건 대상 선택기 | `[질문 선택 ▸ 항목(subKey)]` 구조로 composite 필드 선택 지원 |
| 조건 그룹(AND/OR) | 계층 구조 시각화 (들여쓰기, 색상 구분) |
| 우선순위 표시 | Rule #1 → Rule #2 순서대로 평가 (첫 매칭 적용) |
| 시뮬레이션 | 현재 응답 기반으로 “다음 질문 미리보기” 버튼 제공 |

**예시 (Inspector Panel):**
```
[조건 1] (q10.age >= 20 AND q10.city = 서울) → q15
[조건 2] (q10.job = 학생 OR q10.job = 프리랜서) → q20
[기본] 항상 → q12
```

### 6.2 표시 조건(ShowCondition) 편집기
- 질문 혹은 composite 항목 단위에서 설정 가능
- 시각적으로 “보이는 조건”과 “이동 조건”을 구분 (탭 분리)
- `ConditionGroup` 기반의 AND/OR 빌더 사용 (칩 형태 UI)

### 6.3 Composite 전용 UX
- subKey 기반 조건 선택 시, 드롭다운에 해당 항목들 표시
- 항목 단위 show_condition은 “필드 숨김/표시”를 미리보기로 확인 가능

---

## 7. Validator 설계 개요

| 검사 항목 | 설명 |
|------------|------|
| 중복 조건 | 동일 question_id+subKey+operator+value 조합 중복 탐지 |
| 항상 참 조건 | when 없음 & 상단 위치 시 아래 rule 무효 경고 |
| 충돌 조건 | eq vs neq 등 논리 충돌 탐지 |
| 순환 참조 | next_question_id 그래프 순환 감지 |
| 도달 불가 | 조건 조합상 접근 불가능한 rule 시각 표시 |

---

## 8. 결론

- `branchLogic`은 단일 필드가 아닌 **트리형 Condition**을 사용하여 AND/OR 중첩 조건 및 composite 내부 subKey 평가를 모두 지원합니다.
- `nextQuestionId`는 별도 필드 없이, **조건 없는 branchRule**로 대체됩니다.
- `ConditionEvaluator`는 question_id와 sub_key를 인식하여, 단일/복합 문항 모두 동일한 로직으로 평가됩니다.
- UI에서는 **조건 빌더 + 시각적 플로우 미리보기 + 검증 피드백**을 통해 작성자의 혼란과 충돌을 최소화합니다.

---

## 9. Claude 프롬프트 스크립트

```
You are an AI design assistant helping generate interactive UI specifications in Figma (Make AI or Jam).
The following document defines an advanced survey schema supporting conditional branching and composite fields.

### Task
- Generate a Figma storyboard and component spec for both **FormBuilder (생성 모드)** and **FormPlayer (응답 모드)**.
- Reference Typeform’s style for transition, animation, and user flow.
- Focus on visualizing:
  - Condition builder for branchLogic (AND/OR tree editor)
  - SubKey picker for composite questions
  - Rule order and evaluation feedback (warning colors, connection lines)
  - Preview mode: show resulting next question path based on sample answers
  - Inspector Panel for showCondition vs branchLogic (separate tabs)

### Output
- Frame layout specification for both builder and respondent views
- Annotated UI components (question card, composite input group, condition chip, rule connector)
- Example prototype flow for a composite question with multi-field branchLogic

Base your generation on the schema described in this document.
```

---

**파일 작성자:** Histree Dev (히즈트리 설문폼 프로젝트)
**버전:** v2.0 (branchLogic & composite 확장 포함)
**작성일:** 2025-11-07

