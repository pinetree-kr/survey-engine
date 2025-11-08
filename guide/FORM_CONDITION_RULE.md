# FORM_CONDITION_RULE (분기 및 표시 규칙) 스키마 및 Validation 가이드

## 개요

`BranchRule`과 `ShowRule`은 설문조사에서 문항의 응답에 따라 다음 문항으로 이동하거나 문항을 표시하는 조건부 로직을 정의합니다. 

- **BranchRule**: 문항의 응답에 따라 다음 문항으로 이동하는 분기 로직
- **ShowRule**: 문항을 표시할 조건을 정의하는 표시 로직

여러 규칙을 배열로 정의할 수 있으며, 우선순위는 인덱스 순서대로 평가됩니다.

## 타입 정의

### BranchRule

```typescript
export type BranchRule = {
  when?: BranchNode; // true가 될 로직 (트리 구조), 없으면 항상 true
  next_question_id: string; // 이동할 다음 질문 ID
};
```

- `when`: 조건이 없으면 항상 true (기본 규칙)
- `when`이 있으면 해당 조건이 true일 때만 `next_question_id`로 이동
- 여러 `BranchRule`이 있을 경우, 배열 순서대로 평가하며 첫 번째 매칭되는 규칙이 적용됨
- **중요**: `branchRules`는 **choice 타입(`ChoiceQuestion`, `ComplexChoiceQuestion`)에서만 사용 가능**합니다.

### BranchNode

분기 로직의 트리 구조를 표현하는 노드입니다.

```typescript
export type BranchNode = PredicateNode | GroupNode;
```

### PredicateNode

비교 연산을 수행하는 노드입니다. **현재 선택된 문항의 답변을 자동으로 참조**하므로 `questionId` 필드가 필요 없습니다.

```typescript
export type PredicateNode = {
  kind: 'predicate';
  subKey?: string;  // composite 내부 필드 참조 시 사용
  op: Operator;  // 비교 연산자
  value?: string | number | boolean | Array<string | number>;  // 비교할 값
};
```

**특징:**
- `questionId` 필드가 없음: 현재 문항의 답변을 자동으로 참조
- `subKey`: composite 문항의 특정 필드를 참조할 때 사용 (예: `{ name: "홍길동", email: "test@example.com" }`에서 `name` 필드만 참조)
- `op`: 비교 연산자 (아래 참조)
- `value`: 비교할 값

### GroupNode

논리 연산을 수행하는 노드입니다. 중첩 가능한 구조를 지원합니다.

```typescript
export type GroupNode = {
  kind: 'group';
  op: 'AND' | 'OR';  // 논리 연산자
  children: BranchNode[];  // 중첩 가능한 자식 노드들
};
```

**특징:**
- `op`: 'AND' 또는 'OR' 논리 연산자
- `children`: `PredicateNode` 또는 `GroupNode`를 포함할 수 있어 중첩 구조 지원
- 모든 자식 노드가 같은 논리 연산자로 평가됨

### ShowRule

표시 규칙입니다. `BranchRule`과 유사하지만 참조할 질문을 명시합니다.

```typescript
export type ShowRule = {
  when?: ShowNode; // true가 될 로직 (트리 구조), 없으면 항상 true
  refQuestionId: string; // 참조할 질문 ID
};
```

- `when`: 조건이 없으면 항상 true (기본 규칙)
- `refQuestionId`: 조건 평가 시 참조할 질문 ID
- 여러 `ShowRule`이 있을 경우, **모든 규칙이 true**여야 문항이 표시됨 (AND 평가)

### ShowNode

표시 조건의 트리 구조를 표현하는 노드입니다. `BranchNode`와 동일한 구조이지만 참조 질문이 다릅니다.

```typescript
export type ShowNode = PredicateNode | GroupNode;
```

**특징:**
- `ShowNode`는 `BranchNode`와 동일한 구조 (`PredicateNode | GroupNode`)
- 하지만 평가 시 `refQuestionId`로 지정된 질문의 답변을 참조
- `subKey`는 `PredicateNode`에만 속함 (ShowRule 레벨에는 없음)

### Operator

비교 연산자 타입입니다.

```typescript
export type Operator =
  | 'eq' | 'neq'                    // 같음, 같지 않음
  | 'contains' | 'contains_any' | 'contains_all'  // 포함, 하나라도 포함, 모두 포함
  | 'gt' | 'lt' | 'gte' | 'lte'    // 비교 연산자
  | 'regex' | 'is_empty' | 'not_empty';  // 정규식, 비어있음, 비어있지 않음
```

## Question 타입의 branchRules 및 showRules 필드

### 타입별 인터페이스 분리 (Discriminated Union)

질문 타입은 Discriminated Union 패턴으로 타입별로 분리되어 있습니다:

```typescript
// 공통 속성
export type BaseQuestion = {
  id: string;
  title: string;
  description?: string;
  images?: ImageObj[];
  required?: boolean;
  showRules?: ShowRule[];  // 모든 질문 타입에서 사용 가능
  design?: {
    themeColor?: string;
    backgroundStyle?: string;
  };
  validations?: Validation;
  sectionId?: string;
};

// Choice 타입: branchRules 사용 가능
export type ChoiceQuestion = BaseQuestion & {
  type: 'choice';
  options: Option[];
  isMultiple?: boolean;
  isDropdown?: boolean;
  isBoolean?: boolean;
  branchRules?: BranchRule[];  // choice 타입에서만 사용 가능
};

// ComplexChoice 타입: branchRules 사용 가능
export type ComplexChoiceQuestion = BaseQuestion & {
  type: 'complex_choice';
  complexItems: ComplexItem[];
  isMultiple?: boolean;
  branchRules?: BranchRule[];  // complex_choice 타입에서만 사용 가능
};

// 다른 타입들 (ShortTextQuestion, LongTextQuestion, RangeQuestion, ComplexInputQuestion, DescriptionQuestion)
// branchRules를 사용할 수 없음
```

### 필드 사용 규칙

- **`branchRules`**: 
  - **`ChoiceQuestion`**과 **`ComplexChoiceQuestion`**에서만 사용 가능
  - 배열 형태로 여러 분기 규칙을 정의 (우선순위는 인덱스 순, 첫 번째 매칭되는 규칙 적용)
  - 다른 질문 타입에서는 타입 안전성으로 인해 접근 불가

- **`showRules`**: 
  - **모든 질문 타입**에서 사용 가능 (`BaseQuestion`에 정의됨)
  - 배열 형태로 여러 표시 규칙을 정의 (모든 규칙이 true일 때 표시됨)

## 평가 로직

### 1. branchRules 평가 순서

1. `branchRules` 배열을 인덱스 순서대로 순회
2. 각 `BranchRule`의 `when` 조건을 평가
3. `when`이 없거나 `true`로 평가되면 해당 `next_question_id` 반환
4. 첫 번째 매칭되는 규칙이 적용됨 (나머지는 평가하지 않음)

**참고**: `branchRules`는 choice 타입에서만 평가됩니다. 다른 타입의 질문에서는 `branchRules`가 없으므로 평가되지 않습니다.

### 2. showRules 평가 순서

1. `showRules` 배열의 모든 규칙을 평가
2. 각 `ShowRule`의 `when` 조건을 평가 (참조 질문은 `refQuestionId`)
3. `when`이 없으면 항상 true로 간주
4. **모든 규칙이 true**여야 문항이 표시됨 (AND 평가)

### 3. BranchNode 평가

#### PredicateNode 평가

```typescript
function evaluateBranchNode(
  node: BranchNode,
  currentQuestionId: string,  // 현재 질문 ID
  answers: AnswersMap
): boolean {
  if (node.kind === 'predicate') {
    // 현재 질문의 답변을 가져옴
    const answerValue = getAnswerValue(
      answers,
      currentQuestionId,  // PredicateNode는 현재 질문을 자동 참조
      node.subKey        // composite 필드 참조 시 사용
    );
    
    // 연산자에 따라 비교
    return compareValues(answerValue, node.op, node.value);
  }
  // ...
}
```

**중요:** `PredicateNode`는 항상 현재 질문(`currentQuestionId`)의 답변을 참조합니다.

#### GroupNode 평가

```typescript
if (node.kind === 'group') {
  // 모든 자식 노드를 재귀적으로 평가
  const results = node.children.map(child => 
    evaluateBranchNode(child, currentQuestionId, answers)
  );
  
  if (node.op === 'AND') {
    return results.every(Boolean);  // 모든 조건이 true
  } else {
    return results.some(Boolean);   // 하나라도 true
  }
}
```

### 4. ShowNode 평가

#### PredicateNode 평가

```typescript
function evaluateShowNode(
  node: ShowNode,
  refQuestionId: string,  // 참조할 질문 ID
  answers: AnswersMap
): boolean {
  if (node.kind === 'predicate') {
    // 참조 질문의 답변을 가져옴
    const answerValue = getAnswerValue(
      answers,
      refQuestionId,  // ShowRule의 refQuestionId 사용
      node.subKey     // PredicateNode의 subKey 사용
    );
    
    // 연산자에 따라 비교
    return compareValues(answerValue, node.op, node.value);
  }
  // ...
}
```

**중요:** `ShowNode`의 `PredicateNode`는 `refQuestionId`로 지정된 질문의 답변을 참조합니다.

#### GroupNode 평가

```typescript
if (node.kind === 'group') {
  // 모든 자식 노드를 재귀적으로 평가
  const results = node.children.map(child => 
    evaluateShowNode(child, refQuestionId, answers)
  );
  
  if (node.op === 'AND') {
    return results.every(Boolean);  // 모든 조건이 true
  } else {
    return results.some(Boolean);   // 하나라도 true
  }
}
```

## Validation 규칙

### 1. 필수 필드 검증

- `BranchRule.nextQuestionId`: 필수 (빈 문자열 불가)
- `ShowRule.refQuestionId`: 필수 (빈 문자열 불가)
- `PredicateNode.op`: 필수
- `GroupNode.op`: 필수 ('AND' 또는 'OR')
- `GroupNode.children`: 필수 (빈 배열 가능)

### 2. 참조 무결성 검증

#### next_question_id 검증

```typescript
// choice 타입의 질문에서만 branchRules 검증
if (isChoiceQuestion(question) && question.branchRules) {
  for (const rule of question.branchRules) {
    if (!questionIds.has(rule.next_question_id)) {
      // 에러: 존재하지 않는 질문 ID 참조
    }
  }
}

if (isComplexChoiceQuestion(question) && question.branchRules) {
  for (const rule of question.branchRules) {
    if (!questionIds.has(rule.next_question_id)) {
      // 에러: 존재하지 않는 질문 ID 참조
    }
  }
}
```

**검증 규칙:**
- `next_question_id`는 설문조사 내에 존재하는 질문 ID여야 함
- 자기 자신을 참조할 수 있음 (순환 참조 가능)
- **중요**: `branchRules`는 `ChoiceQuestion`과 `ComplexChoiceQuestion`에서만 검증됩니다.

#### refQuestionId 검증

```typescript
// 모든 showRules의 refQuestionId가 존재하는 질문 ID인지 확인
for (const rule of question.showRules) {
  if (!questionIds.has(rule.refQuestionId)) {
    // 에러: 존재하지 않는 질문 ID 참조
  }
}
```

**검증 규칙:**
- `refQuestionId`는 설문조사 내에 존재하는 질문 ID여야 함
- 자기 자신을 참조할 수 있음

#### questionId 검증 (제거됨)

**변경 사항:** `PredicateNode`에서 `questionId` 필드가 제거되었으므로 별도 검증이 필요 없습니다.

- `PredicateNode`는 항상 현재 질문을 자동으로 참조 (BranchRule의 경우)
- `PredicateNode`는 `refQuestionId`로 지정된 질문을 참조 (ShowRule의 경우)
- `subKey`는 composite 문항의 필드 키를 참조하므로 별도 검증 필요 없음

### 3. 구조 검증

#### GroupNode children 검증

- `children` 배열은 최소 1개 이상의 노드를 포함해야 함 (실제 구현에서는 빈 배열도 허용 가능)
- `children`의 각 노드는 유효한 `BranchNode` 또는 `ShowNode`여야 함

#### 중첩 깊이 제한

- 이론적으로는 무한 중첩 가능하지만, 실제 구현에서는 성능을 위해 깊이 제한을 고려할 수 있음

## 예제

### 예제 1: 단순 분기 (BranchRule)

```typescript
{
  id: "q1",
  title: "성별을 선택하세요",
  type: "choice",
  options: [
    { label: "남성", key: "male" },
    { label: "여성", key: "female" }
  ],
  branchRules: [
    {
      when: {
        kind: "group",
        op: "AND",
        children: [{
          kind: "predicate",
          op: "eq",
          value: "male"
        }]
      },
      next_question_id: "q2"  // 남성 선택 시 q2로 이동
    },
    {
      when: {
        kind: "group",
        op: "AND",
        children: [{
          kind: "predicate",
          op: "eq",
          value: "female"
        }]
      },
      next_question_id: "q3"  // 여성 선택 시 q3로 이동
    },
    {
      // when이 없으면 항상 true (기본 규칙)
      next_question_id: "q4"  // 그 외의 경우 q4로 이동
    }
  ]
}
```

### 예제 2: 복합 조건 (AND) - BranchRule

```typescript
{
  id: "q1",
  title: "나이와 성별을 입력하세요",
  type: "composite_single",
  branchRules: [
    {
      when: {
        kind: "group",
        op: "AND",
        children: [
          {
            kind: "predicate",
            subKey: "age",
            op: "gte",
            value: 18
          },
          {
            kind: "predicate",
            subKey: "gender",
            op: "eq",
            value: "male"
          }
        ]
      },
      next_question_id: "q2"  // 18세 이상 남성
    }
  ]
}
```

### 예제 3: 복합 조건 (OR) - BranchRule

```typescript
{
  id: "q1",
  title: "선호하는 음식을 선택하세요",
  type: "choice",
  isMultiple: true,
  branchRules: [
    {
      when: {
        kind: "group",
        op: "OR",
        children: [
          {
            kind: "predicate",
            op: "contains",
            value: "pizza"
          },
          {
            kind: "predicate",
            op: "contains",
            value: "burger"
          }
        ]
      },
      next_question_id: "q2"  // 피자 또는 버거 선택 시
    }
  ]
}
```

### 예제 4: 중첩 그룹 - BranchRule

```typescript
{
  id: "q1",
  title: "복잡한 조건",
  type: "choice",
  branchRules: [
    {
      when: {
        kind: "group",
        op: "AND",
        children: [
          {
            kind: "predicate",
            op: "eq",
            value: "option1"
          },
          {
            kind: "group",
            op: "OR",
            children: [
              {
                kind: "predicate",
                op: "neq",
                value: "excluded"
              },
              {
                kind: "predicate",
                op: "is_empty",
                value: undefined
              }
            ]
          }
        ]
      },
      next_question_id: "q2"
    }
  ]
}
```

### 예제 5: 표시 규칙 (ShowRule)

```typescript
{
  id: "q3",
  title: "추가 질문",
  type: "short_text",
  showRules: [
    {
      refQuestionId: "q1",  // q1 질문을 참조
      when: {
        kind: "group",
        op: "AND",
        children: [{
          kind: "predicate",
          op: "eq",
          value: "male"
        }]
      }
      // q1의 답변이 "male"일 때만 표시
    },
    {
      refQuestionId: "q2",  // q2 질문을 참조
      when: {
        kind: "group",
        op: "AND",
        children: [{
          kind: "predicate",
          op: "gte",
          value: 18
        }]
      }
      // q2의 답변이 18 이상일 때만 표시
    }
    // 모든 showRules가 true여야 q3가 표시됨
  ]
}
```

### 예제 6: composite 필드 참조 - ShowRule

```typescript
{
  id: "q4",
  title: "이메일 확인 질문",
  type: "short_text",
  showRules: [
    {
      refQuestionId: "q1",  // composite 문항 참조
      when: {
        kind: "group",
        op: "AND",
        children: [{
          kind: "predicate",
          subKey: "email",  // composite의 email 필드만 참조
          op: "not_empty",
          value: undefined
        }]
      }
      // q1의 email 필드가 비어있지 않을 때만 표시
    }
  ]
}
```

## 주요 변경 사항

### 1. 필드명 변경

- `branchLogic` → `branchRules`
- `showConditions` → `showRules`
- `aggregator` → `op` (GroupNode)
- `operator` → `op` (PredicateNode)
- `next_question_id`: snake_case 유지 (실제 구현과 일치)
- `ref_question_id` → `refQuestionId` (camelCase)
- `sub_key` → `subKey` (camelCase)

### 2. 타입 변경

- `SingleCondition` → `PredicateNode`
- `ConditionGroup` → `GroupNode`
- `Condition` → `BranchNode`
- `ShowCondition` → `ShowRule[]` (배열로 변경)
- `ShowNode` 타입 추가: `PredicateNode | GroupNode`

### 3. 구조 변경

- **모든 분기 로직이 `GroupNode` 형태로 통일**: `PredicateNode`는 항상 `GroupNode`로 감싸져야 함
- **`questionId` 필드 제거**: `PredicateNode`는 현재 질문을 자동으로 참조 (BranchRule의 경우)
- **중첩 그룹 지원**: `GroupNode` 내부에 `GroupNode`를 포함할 수 있음
- **`showRules` 배열로 변경**: 여러 표시 규칙을 배열로 정의 (모든 규칙이 true일 때 표시)
- **`ShowRule` 타입 추가**: `refQuestionId`를 명시하여 참조할 질문을 지정
- **`subKey` 위치 변경**: `ShowRule`에서 제거되고 `PredicateNode`에만 속함
- **타입별 인터페이스 분리 (Discriminated Union)**: 질문 타입이 타입별로 분리되어 타입 안전성 향상
- **`branchRules` 타입 제한**: `ChoiceQuestion`과 `ComplexChoiceQuestion`에서만 사용 가능하도록 제한

### 4. 평가 로직 변경

- `evaluateBranchNode` 함수가 `currentQuestionId`를 파라미터로 받음
- `PredicateNode` 평가 시 항상 현재 질문의 답변을 참조 (BranchRule의 경우)
- `evaluateShowNode` 함수가 `refQuestionId`를 파라미터로 받음
- `ShowNode`의 `PredicateNode` 평가 시 `refQuestionId`로 지정된 질문의 답변을 참조

## 주의사항

1. **우선순위**: `branchRules` 배열의 순서가 중요합니다. 첫 번째 매칭되는 규칙이 적용됩니다.

2. **기본 규칙**: `when`이 없는 `BranchRule`은 항상 true로 평가되므로, 기본 규칙은 배열의 마지막에 배치하는 것이 좋습니다.

3. **현재 질문 참조**: `BranchRule`의 `PredicateNode`는 항상 현재 질문의 답변을 참조하므로, 다른 질문의 답변을 참조하려면 `ShowRule`을 사용해야 합니다.

4. **표시 규칙 평가**: `showRules`의 모든 규칙이 true여야 문항이 표시됩니다 (AND 평가).

5. **참조 질문**: `ShowRule`의 `refQuestionId`로 다른 질문의 답변을 참조할 수 있습니다.

6. **composite 필드 참조**: composite 문항의 특정 필드를 참조할 때는 `subKey`를 사용합니다.

7. **중첩 깊이**: 이론적으로는 무한 중첩이 가능하지만, 실제 사용 시 깊이를 제한하는 것을 권장합니다.

8. **`branchRules` 타입 제한**: 
   - `branchRules`는 **`ChoiceQuestion`**과 **`ComplexChoiceQuestion`**에서만 사용 가능합니다.
   - 다른 질문 타입(`ShortTextQuestion`, `LongTextQuestion`, `RangeQuestion`, `ComplexInputQuestion`, `DescriptionQuestion`)에서는 타입 안전성으로 인해 `branchRules`에 접근할 수 없습니다.
   - 타입 가드 함수(`isChoiceQuestion`, `isComplexChoiceQuestion`)를 사용하여 타입을 확인한 후 접근해야 합니다.

9. **타입 안전성**: 
   - Discriminated Union 패턴을 사용하여 타입별로 인터페이스가 분리되어 있습니다.
   - 각 질문 타입은 해당 타입에만 존재하는 속성에만 접근할 수 있습니다.
   - 타입 가드 함수를 사용하여 런타임에서 타입을 확인할 수 있습니다.

