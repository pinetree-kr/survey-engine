# Survey Engine - 프로젝트 가이드

## 개요

Survey Engine은 Typeform-like 설문 엔진 라이브러리입니다. 타입 안전한 TypeScript로 작성되었으며, 복잡한 조건부 분기와 동적 질문 흐름을 지원합니다.

## 기술 스택

- **언어**: TypeScript
- **검증**: Zod
- **번들러**: Next.js + Turbopack
- **런타임**: Node.js / Next.js (ESM)
- **테스트**: Vitest
- **UI 프레임워크**: React

## 프로젝트 구조

```
survey-engine/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── page.tsx           # 데모 페이지
│   ├── schema/                # 스키마 정의
│   │   ├── question.types.ts  # TypeScript 타입
│   │   └── question.zod.ts    # Zod 검증 스키마
│   ├── engine/                # 핵심 엔진 로직
│   │   ├── next-router.ts     # 다음 질문 결정기
│   │   ├── visibility.ts      # 표시 조건 평가
│   │   ├── integrity.ts       # 정적 무결성 검사
│   │   ├── validators.ts      # 런타임 값 검증
│   │   └── *.spec.ts          # 단위 테스트
│   ├── ui/                    # UI 컴포넌트
│   │   └── QuestionRenderer.tsx
│   ├── fixtures/              # 예시 데이터
│   │   └── demo-survey.json
│   └── index.ts               # 라이브러리 진입점
├── dist/                      # 빌드 출력 (라이브러리)
├── next.config.js             # Next.js 설정
├── tsconfig.json              # Next.js용 TS 설정
├── tsconfig.lib.json          # 라이브러리 빌드용 TS 설정
├── vitest.config.ts           # Vitest 설정
└── package.json
```

## 주요 기능

### 1. 질문 타입 지원

- `short_text`: 짧은 텍스트 입력
- `long_text`: 긴 텍스트 입력
- `single_choice`: 단일 선택
- `multiple_choice`: 다중 선택 (minSelect/maxSelect 지원)
- `dropdown`: 드롭다운 선택
- `composite_single`: 단일 컴포지트 (여러 입력 필드)
- `composite_multiple`: 다중 컴포지트
- `description`: 설명/안내 문구

### 2. 조건부 분기

- **nextQuestionId**: 최우선 분기 (질문 레벨)
- **옵션별 분기**: 선택지의 `nextQuestionId`
- **컴포지트 분기**: 입력 항목의 `nextQuestionId`
- **branch_logic**: 복잡한 조건 기반 분기 (AND 평가)
- **show_conditions**: 조건부 표시 (OR 평가)

### 3. 정적 무결성 검사

- 중복 ID/키 검출
- 참조 무결성 검사
- 도달성 검사 (모든 질문이 접근 가능한지)
- 사이클 탐지
- 제약 조건 검증

### 4. 런타임 검증

- 필수 항목 검사
- 텍스트 길이/정규식 검증
- 숫자 범위 검증
- 이메일/전화번호 형식 검증
- 다중 선택 개수 제한

## 사용법

### 라이브러리로 사용

```typescript
import { validateSurvey, getNextQuestionId, QuestionRenderer } from "survey-engine";
import type { Question } from "survey-engine";

// 1. 설문 무결성 검사
const questions: Question[] = [...];
const result = validateSurvey(questions);

if (!result.ok) {
  console.error("설문 검증 실패:", result.errors);
}

// 2. 다음 질문 결정
const answers = new Map([["q1", "answer1"]]);
const nextId = getNextQuestionId(currentQuestion, questions, answers);

// 3. React 컴포넌트 사용
<QuestionRenderer questions={questions} onComplete={handleComplete} />
```

### 개발 서버 실행

```bash
# Turbopack으로 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 빌드

```bash
# Next.js 앱 빌드
npm run build

# 라이브러리 빌드 (dist/)
npm run build:lib
```

### 테스트

```bash
# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

## API 참조

### `validateSurvey(questions: Question[]): ValidationResult`

설문의 정적 무결성을 검사합니다.

**검사 항목**:
- 중복 ID/키
- 참조 무결성
- 도달성
- 사이클
- 제약 조건

### `getNextQuestionId(currentQuestion, questions, answers): string | null`

다음 질문 ID를 결정합니다.

**우선순위**:
1. 현재 질문의 `nextQuestionId` (최우선)
2. 답변 기반 분기 (옵션/컴포지트)
3. `branch_logic` 평가
4. 선형 다음 질문 또는 완료

### `evaluateShowConditions(question, answers): boolean`

질문의 표시 조건을 평가합니다. `show_conditions`는 OR 결합으로 평가됩니다.

### `validateAnswer(question, value): ValidationResult`

답변 값을 검증합니다.

## 설문 스키마 예시

```typescript
const question: Question = {
  id: "q1",
  title: "질문 제목",
  description: "설명 (선택)",
  type: "single_choice",
  required: true,
  options: [
    {
      label: "옵션 1",
      key: "opt1",
      nextQuestionId: "q2"  // 옵션별 분기
    },
    {
      label: "옵션 2",
      key: "opt2"
    }
  ],
  branch_logic: [
    {
      conditions: [
        {
          question_id: "q0",
          operator: "eq",
          value: "yes"
        }
      ],
      nextQuestionId: "q3"
    }
  ],
  show_conditions: [
    {
      question_id: "q0",
      operator: "neq",
      value: ""
    }
  ]
};
```

## 다음 질문 결정 로직

1. **현재 질문의 `nextQuestionId`**: 최우선으로 평가
2. **답변 기반 분기**:
   - `single_choice`/`dropdown`: 선택된 옵션의 `nextQuestionId`
   - `multiple_choice`: 선택된 키 배열에서 첫 매칭 옵션의 `nextQuestionId`
   - `composite_*`: 정의 순서대로 첫 매칭 항목의 `nextQuestionId`
3. **`branch_logic`**: 배열 순서대로 AND 평가, 첫 매칭 rule의 `nextQuestionId`
4. **선형 다음 질문**: 위 조건이 모두 없으면 배열의 다음 질문

## 표시 조건 (`show_conditions`)

- OR 결합: 조건 중 하나라도 충족하면 표시
- `sub_key`를 사용하여 컴포지트/옵션의 서브 값 참조 가능
- 연산자: `eq`, `neq`, `contains`, `gt`, `lt`, `gte`, `lte`

## 분기 규칙 (`branch_logic`)

- 각 rule 내 조건들은 AND 결합
- 배열 순서대로 평가, 첫 매칭 rule의 `nextQuestionId` 사용

## 개발 가이드

### 새 질문 타입 추가

1. `src/schema/question.types.ts`에 타입 추가
2. `src/schema/question.zod.ts`에 Zod 스키마 추가
3. `src/engine/validators.ts`에 검증 로직 추가
4. `src/ui/QuestionRenderer.tsx`에 렌더링 로직 추가
5. 테스트 작성

### 테스트 작성

모든 엔진 로직은 `*.spec.ts` 파일에 단위 테스트가 포함되어 있습니다.

```bash
npm test
```

## 배포

### 라이브러리 배포

```bash
npm run build:lib
# dist/ 디렉토리에 빌드된 파일 생성
```

### Next.js 앱 배포

```bash
npm run build
npm run start
```

Cloudflare Worker 배포를 위해서는 `opennextjs-cloudflare`를 사용할 수 있습니다.

## 라이선스

MIT

