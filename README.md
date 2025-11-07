# Survey Engine

Typeform-like 설문 엔진 - 타입 안전하고 테스트 가능한 설문 시스템

## 기술 스택

- **언어**: TypeScript
- **검증**: Zod
- **테스트**: Vitest
- **런타임**: Node/Next.js 호환 ESM

## 설치

```bash
npm install
```

## 빌드

```bash
npm run build
```

## 개발 서버 실행

```bash
# 개발 서버 시작 (Next.js + Turbopack)
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 데모 앱을 확인할 수 있습니다.

Turbopack은 `--turbo` 플래그로 활성화되어 있어 빠른 개발 경험을 제공합니다.

## 테스트

```bash
# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

## 사용법

### 기본 사용

```typescript
import { validateSurvey, getNextQuestionId, QuestionRenderer } from "survey-engine";
import type { Question, AnswersMap } from "survey-engine";
import demoSurvey from "./fixtures/demo-survey.json";

// 1. 설문 무결성 검사
const questions: Question[] = demoSurvey;
const integrityResult = validateSurvey(questions);

if (!integrityResult.ok) {
  console.error("설문 검증 실패:", integrityResult.errors);
  return;
}

// 2. React 컴포넌트에서 사용
function SurveyApp() {
  return (
    <QuestionRenderer
      questions={questions}
      onComplete={(answers) => {
        console.log("설문 완료:", answers);
      }}
    />
  );
}
```

### API 개요

#### `validateSurvey(questions: Question[]): ValidationResult`

설문의 정적 무결성을 검사합니다.

- 중복 ID/키 검출
- 참조 무결성 검사
- 도달성 검사
- 사이클 검사
- 제약 조건 검증

```typescript
const result = validateSurvey(questions);
if (!result.ok) {
  result.errors.forEach((error) => {
    console.error(`${error.code}: ${error.message}`);
  });
}
```

#### `evaluateShowConditions(question: Question, answers: AnswersMap): boolean`

질문의 표시 조건을 평가합니다. `show_conditions`는 OR 결합으로 평가됩니다.

```typescript
const shouldShow = evaluateShowConditions(question, answers);
```

#### `getNextQuestionId(currentQuestion: Question, questions: Question[], answers: AnswersMap): string | null`

다음 질문 ID를 결정합니다. 우선순위:

1. 현재 질문의 `nextQuestionId` (최우선)
2. 답변 기반 분기 (옵션/컴포지트의 `nextQuestionId`)
3. `branch_logic` 평가
4. 선형 다음 질문 또는 완료 (`null`)

```typescript
const nextId = getNextQuestionId(currentQuestion, questions, answers);
if (nextId === null) {
  // 설문 완료
}
```

#### `validateAnswer(question: Question, value: unknown): ValidationResult`

답변 값을 검증합니다.

```typescript
const result = validateAnswer(question, userAnswer);
if (!result.ok) {
  result.errors.forEach((error) => {
    console.error(error);
  });
}
```

#### `getAnswer(answers: AnswersMap, questionId: string, subKey?: string): unknown`

답변 맵에서 값을 가져옵니다. `subKey`를 사용하여 컴포지트 항목의 서브 값을 추출할 수 있습니다.

```typescript
const answer = getAnswer(answers, "q1");
const email = getAnswer(answers, "q1", "email"); // 컴포지트 항목
```

## 질문 타입

- `short_text`: 짧은 텍스트 입력
- `long_text`: 긴 텍스트 입력
- `single_choice`: 단일 선택
- `multiple_choice`: 다중 선택
- `dropdown`: 드롭다운 선택
- `composite_single`: 단일 컴포지트 (여러 입력 필드)
- `composite_multiple`: 다중 컴포지트
- `description`: 설명/안내 문구

## 설문 스키마 구조

```typescript
type Question = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required?: boolean;
  images?: ImageObj[];
  options?: Option[];
  compositeItems?: CompositeItem[];
  minSelect?: number;
  maxSelect?: number;
  validations?: {
    regex?: string;
    min?: number;
    max?: number;
    maxLength?: number;
    minLength?: number;
  };
  branch_logic?: BranchRule[];
  show_conditions?: ShowCondition[];
  nextQuestionId?: string;
};
```

## 예시 설문

`src/fixtures/demo-survey.json` 파일에 다양한 기능을 보여주는 예시 설문이 포함되어 있습니다:

- 단일 선택 + 옵션별 분기
- 다중 선택 + minSelect/maxSelect
- 컴포지트 입력 (이름/이메일/전화번호)
- `show_conditions`로 표시 제어
- `branch_logic`로 분기
- `nextQuestionId` 강제 연결

## Design Notes

### 다음 질문 결정 우선순위

1. **현재 질문의 `nextQuestionId`**: 최우선으로 평가됩니다.
2. **답변 기반 분기**:
   - `single_choice`/`dropdown`: 선택된 옵션의 `nextQuestionId`
   - `multiple_choice`: 선택된 키 배열에서 첫 매칭 옵션의 `nextQuestionId`
   - `composite_*`: 정의 순서대로 첫 매칭 항목의 `nextQuestionId`
3. **`branch_logic`**: 배열 순서대로 AND 평가, 첫 매칭 rule의 `nextQuestionId`
4. **선형 다음 질문**: 위 조건이 모두 없으면 배열의 다음 질문

### 표시 조건 (`show_conditions`)

- OR 결합: 조건 중 하나라도 충족하면 표시
- `sub_key`를 사용하여 컴포지트/옵션의 서브 값 참조 가능

### 분기 규칙 (`branch_logic`)

- 각 rule 내 조건들은 AND 결합
- 배열 순서대로 평가, 첫 매칭 rule의 `nextQuestionId` 사용

### 답변 맵 (`AnswersMap`)

```typescript
type AnswersMap = Map<
  string,
  string | number | boolean | string[] | Record<string, unknown>
>;
```

- 키: 질문 ID
- 값: 답변 값 (단일 값 또는 객체)

## 라이선스

MIT

# survey-engine
