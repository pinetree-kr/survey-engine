# 설문 스키마 확장 및 UI/UX 가이드 문서

## 1. 개요
본 문서는 기존 설문 스키마에 대한 확장 사항으로, **조건부 분기(branchRules)** 및 **표시 조건(showRules)** 을 포함하여 **복합(complex) 문항**까지 일관된 방식으로 처리할 수 있는 구조를 정의합니다. 또한, 해당 스키마를 기반으로 한 **UI/UX 설계 원칙 및 JSON 예시**를 함께 제공합니다.

---

## 2. 핵심 변경 요약

| 구분 | 기존 | 변경 후 |
|------|------|----------|
| `nextQuestionId` | 질문 레벨의 단일 이동 | `branchRules`로 통합 (`when` 미설정 rule = default) |
| `branchRules` | 단일 조건 구조 | 트리형 조건(AND/OR 그룹) + subKey 지원 |
| `showRules` | 배열 구조 | 단일 트리 구조로 통합 |
| `complex` | 항목 단위 `next_question_id`만 지원 | `subKey` 기반 다중 조건 평가 및 그룹화 가능 |
| `BranchNode` | 단일 조건 | 중첩 조건 그룹(`GroupNode`) 지원 |

---

## 3. 스키마 정의

### 3.1 BranchNode (조건 표현)

```ts
type Operator =
  | 'eq' | 'neq'
  | 'contains' | 'contains_any' | 'contains_all'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'regex' | 'is_empty' | 'not_empty';

// PredicateNode: 비교 연산을 수행하는 노드
// 현재 선택된 문항의 답변을 참조하므로 question_id가 필요 없음
type PredicateNode = {
  kind: 'predicate';
  subKey?: string;  // complex 내부 필드 참조 시 사용
  op: Operator;  // 비교 연산자
  value?: string | number | boolean | Array<string | number>;  // 비교할 값
};

// GroupNode: 논리 연산을 수행하는 노드 (AND/OR)
type GroupNode = {
  kind: 'group';
  op: 'AND' | 'OR';  // 논리 연산자
  children: BranchNode[];  // 중첩 가능한 자식 노드들
};

// BranchNode: 분기 로직의 트리 구조 노드
type BranchNode = PredicateNode | GroupNode;
```

### 3.2 BranchRule (분기 규칙)

```ts
type BranchRule = {
  when?: BranchNode;          // 없으면 항상 true
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

  // complex 문항일 경우
  complexItems?: ComplexItem[];

  // 조건 로직
  branchRules?: BranchRule[];  // choice, complex_choice 타입에서만 사용
  showRules?: ShowRule[];     // 모든 타입에서 사용 가능
};
```

### 3.4 ComplexItem (복합 항목)

```ts
type ComplexItem = {
  key: string;  // complexItems 내 유일
  label: string;
  input_type: "text" | "number" | "email" | "tel";
  unit?: string;
  placeholder?: string;
  required?: boolean;
  validations?: Validation;
};
```

### 3.5 ShowRule (표시 규칙)

```ts
// ShowNode: 표시 조건의 트리 구조 노드 (BranchNode와 유사하지만 참조 질문이 다름)
type ShowNode = PredicateNode | GroupNode;

// ShowRule: 표시 규칙 (BranchRule과 유사하지만 참조 질문을 명시)
type ShowRule = {
  when?: ShowNode;  // true가 될 로직 (트리 구조), 없으면 항상 true
  refQuestionId: string;  // 참조할 질문 ID
};
```

---

## 4. 동작 원리

### 4.1 라우팅 우선순위

| 우선순위 | 설명 |
|-----------|-------|
| ① | `Question.branchRules` (when 조건 트리 평가, 첫 매칭) |
| ② | `showRules`에 의해 비활성 질문은 스킵 |
| ③ | 기본 선형(next index) 이동 |

**참고:** `ComplexItem` 단위의 `next_question_id`는 제거되었습니다. 모든 분기는 `branchRules`를 통해 처리됩니다.

### 4.2 BranchNode 평가 핵심 로직

```ts
function evaluateBranchNode(
  node: BranchNode,
  currentQuestionId: string,  // 현재 질문 ID (PredicateNode가 참조할 질문)
  answers: AnswersMap
): boolean {
  if (node.kind === 'predicate') {
    // PredicateNode 평가 (현재 질문의 답변을 참조)
    const answerValue = getAnswerValue(
      answers,
      currentQuestionId,
      node.subKey
    );

    if (answerValue === undefined) {
      return false;
    }

    return compareValues(answerValue, node.op, node.value);
  }

  if (node.kind === 'group') {
    // GroupNode 평가
    const results = node.children.map(child => 
      evaluateBranchNode(child, currentQuestionId, answers)
    );

    if (node.op === 'AND') {
      return results.every(Boolean);
    } else {
      // OR
      return results.some(Boolean);
    }
  }

  return false;
}
```

### 4.3 ShowNode 평가 핵심 로직

```ts
function evaluateShowNode(
  node: ShowNode,
  refQuestionId: string,  // 참조할 질문 ID
  answers: AnswersMap
): boolean {
  if (node.kind === 'predicate') {
    // PredicateNode 평가 (참조 질문의 답변을 참조)
    const answerValue = getAnswerValue(
      answers,
      refQuestionId,
      node.subKey
    );

    if (answerValue === undefined) {
      return false;
    }

    return compareValues(answerValue, node.op, node.value);
  }

  if (node.kind === 'group') {
    // GroupNode 평가
    const results = node.children.map(child => 
      evaluateShowNode(child, refQuestionId, answers)
    );

    if (node.op === 'AND') {
      return results.every(Boolean);
    } else {
      // OR
      return results.some(Boolean);
    }
  }

  return false;
}
```

---

## 5. JSON 예시

### 5.1 Complex 문항 내 다중 조건 분기 예시

```json
{
  "id": "q10",
  "title": "기본 정보",
  "type": "complex_choice",
  "complexItems": [
    { "key": "age", "label": "나이", "input_type": "number" },
    { "key": "city", "label": "거주 도시", "input_type": "text" },
    { "key": "job", "label": "직업", "input_type": "text" }
  ],
  "branchRules": [
    {
      "when": {
        "kind": "group",
        "op": "AND",
        "children": [
          { 
            "kind": "predicate", 
            "subKey": "age", 
            "op": "gte", 
            "value": 20 
          },
          { 
            "kind": "predicate", 
            "subKey": "city", 
            "op": "eq", 
            "value": "서울" 
          }
        ]
      },
      "next_question_id": "q15"
    },
    {
      "when": {
        "kind": "group",
        "op": "OR",
        "children": [
          { 
            "kind": "predicate", 
            "subKey": "job", 
            "op": "eq", 
            "value": "학생" 
          },
          { 
            "kind": "predicate", 
            "subKey": "job", 
            "op": "eq", 
            "value": "프리랜서" 
          }
        ]
      },
      "next_question_id": "q20"
    },
    { 
      "next_question_id": "q12" 
    }
  ]
}
```

### 5.2 Choice 문항 분기 예시

```json
{
  "id": "q1",
  "title": "질문 1",
  "type": "choice",
  "options": [
    { "label": "옵션 1", "key": "opt1" },
    { "label": "옵션 2", "key": "opt2" }
  ],
  "branchRules": [
    {
      "when": {
        "kind": "predicate",
        "op": "eq",
        "value": "opt1"
      },
      "next_question_id": "q2"
    },
    {
      "when": {
        "kind": "predicate",
        "op": "eq",
        "value": "opt2"
      },
      "next_question_id": "q3"
    }
  ]
}
```

### 5.3 ShowRule 예시

```json
{
  "id": "q5",
  "title": "조건부 질문",
  "type": "short_text",
  "showRules": [
    {
      "refQuestionId": "q1",
      "when": {
        "kind": "predicate",
        "op": "eq",
        "value": "opt1"
      }
    }
  ]
}
```

---

## 6. UI/UX 설계 가이드

### 6.1 분기 로직(BranchRules) 빌더 UX

| 요소 | 설명 |
|------|------|
| 조건 대상 선택기 | 현재 질문 자동 참조 (PredicateNode는 question_id 불필요) |
| subKey 선택기 | `[항목(subKey)]` 구조로 complex 필드 선택 지원 |
| 조건 그룹(AND/OR) | 계층 구조 시각화 (들여쓰기, 색상 구분) |
| 우선순위 표시 | Rule #1 → Rule #2 순서대로 평가 (첫 매칭 적용) |
| 시뮬레이션 | 현재 응답 기반으로 "다음 질문 미리보기" 버튼 제공 |

**예시 (Inspector Panel):**
```
[조건 1] (age >= 20 AND city = 서울) → q15
[조건 2] (job = 학생 OR job = 프리랜서) → q20
[기본] 항상 → q12
```

### 6.2 표시 조건(ShowRules) 편집기
- 질문 단위에서 설정 가능
- 시각적으로 "보이는 조건"과 "이동 조건"을 구분 (탭 분리)
- `GroupNode` 기반의 AND/OR 빌더 사용 (칩 형태 UI)
- `refQuestionId`를 명시적으로 선택 (다른 질문 참조)

### 6.3 Complex 전용 UX
- subKey 기반 조건 선택 시, 드롭다운에 해당 항목들 표시
- PredicateNode는 현재 질문을 자동으로 참조하므로 question_id 불필요

---

## 7. Validator 설계 개요

| 검사 항목 | 설명 |
|------------|------|
| 중복 질문 ID | 동일한 question ID 중복 탐지 |
| 중복 옵션 키 | choice 타입 내 옵션 키 중복 탐지 |
| 중복 컴포지트 키 | complex 타입 내 complexItems 키 중복 탐지 |
| 참조 무결성 | branchRules의 next_question_id 존재 여부 검증 |
| 도달성 검사 | 시작 질문부터 모든 노드 도달 가능한지 확인 |
| 순환 검사 | next_question_id 그래프 순환 감지 |
| 도달 불가능 질문 | 조건 조합상 접근 불가능한 질문 탐지 |
| 유효성 검사 | multiple_choice의 validations 제약 검증 |
| 정규식 검증 | regex 패턴 유효성 검증 |

---

## 8. 주요 차이점

### 8.1 BranchNode vs Condition
- **이전:** `Condition` 타입에 `question_id` 필드가 있었음
- **현재:** `PredicateNode`는 `question_id`가 없음 (현재 질문을 자동 참조)
- **이유:** branchRules는 항상 현재 질문의 답변을 참조하므로 명시적 참조 불필요

### 8.2 ShowRule vs BranchRule
- **BranchRule:** 현재 질문의 답변을 참조 (question_id 불필요)
- **ShowRule:** 다른 질문의 답변을 참조 (refQuestionId 필수)

### 8.3 complexItems vs compositeItems
- **현재 코드:** `complexItems` 사용
- **타입:** `complex_choice`, `complex_input` 두 가지 타입 지원

### 8.4 branchRules 사용 가능 타입
- **choice:** branchRules 사용 가능
- **complex_choice:** branchRules 사용 가능
- **기타 타입:** branchRules 사용 불가 (선형 이동만 가능)

---

## 9. 결론

- `branchRules`는 단일 필드가 아닌 **트리형 BranchNode**를 사용하여 AND/OR 중첩 조건 및 complex 내부 subKey 평가를 모두 지원합니다.
- `PredicateNode`는 현재 질문을 자동으로 참조하므로 `question_id`가 필요 없습니다.
- `ShowRule`은 다른 질문을 참조하므로 `refQuestionId`가 필수입니다.
- `BranchNodeEvaluator`는 currentQuestionId와 sub_key를 인식하여, 단일/복합 문항 모두 동일한 로직으로 평가됩니다.
- UI에서는 **조건 빌더 + 시각적 플로우 미리보기 + 검증 피드백**을 통해 작성자의 혼란과 충돌을 최소화합니다.

---

## 10. Claude 프롬프트 스크립트

```
You are an AI design assistant helping generate interactive UI specifications in Figma (Make AI or Jam).
The following document defines an advanced survey schema supporting conditional branching and composite fields.

### Task
- Generate a Figma storyboard and component spec for both **FormBuilder (생성 모드)** and **FormPlayer (응답 모드)**.
- Reference Typeform's style for transition, animation, and user flow.
- Focus on visualizing:
  - Condition builder for branchRules (AND/OR tree editor)
  - SubKey picker for complex questions
  - Rule order and evaluation feedback (warning colors, connection lines)
  - Preview mode: show resulting next question path based on sample answers
  - Inspector Panel for showRules vs branchRules (separate tabs)

### Output
- Frame layout specification for both builder and respondent views
- Annotated UI components (question card, complex input group, condition chip, rule connector)
- Example prototype flow for a complex question with multi-field branchRules

Base your generation on the schema described in this document.
```

---

**파일 작성자:** Histree Dev (히즈트리 설문폼 프로젝트)
**버전:** v2.1 (현재 코드 버전 반영)
**작성일:** 2025-01-XX
