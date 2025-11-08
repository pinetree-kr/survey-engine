export type QuestionType =
  | "short_text"
  | "long_text"
  | "choice"
  | "complex_choice"
  | "complex_input"
  | "description"
  | "range";


export type ImageObj = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type Validation = {
  regex?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  minLength?: number;
};

export type Option = {
  label: string;
  key: string; // question 내 유일
  images?: ImageObj[];
  isOther?: boolean;
  freeText?: {
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
  };
};

export type Operator =
  | 'eq' | 'neq'
  | 'contains' | 'contains_any' | 'contains_all'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'regex' | 'is_empty' | 'not_empty';

// PredicateNode: 비교 연산을 수행하는 노드
// 현재 선택된 문항의 답변을 참조하므로 question_id가 필요 없음
export type PredicateNode = {
  kind: 'predicate';
  subKey?: string;  // composite 내부 필드 참조 시 사용
  op: Operator;  // 비교 연산자
  value?: string | number | boolean | Array<string | number>;  // 비교할 값
};

// GroupNode: 논리 연산을 수행하는 노드 (AND/OR)
export type GroupNode = {
  kind: 'group';
  op: 'AND' | 'OR';  // 논리 연산자
  children: BranchNode[];  // 중첩 가능한 자식 노드들
};

// BranchNode: 분기 로직의 트리 구조 노드
export type BranchNode = PredicateNode | GroupNode;

export type ComplexItem = {
  label: string;
  input_type: "text" | "number" | "email" | "tel";
  unit?: string;
  placeholder?: string;
  key: string; // compositeItems 내 유일
  required?: boolean;
  validations?: Validation;
};

// 분기 규칙: 브랜치 로직과 다음 질문 ID를 정의
export type BranchRule = {
  when?: BranchNode; // true가 될 로직 (트리 구조), 없으면 항상 true
  next_question_id: string; // 이동할 다음 질문 ID
};

// ShowNode: 표시 조건의 트리 구조 노드 (BranchNode와 유사하지만 참조 질문이 다름)
export type ShowNode = PredicateNode | GroupNode;

// ShowRule: 표시 규칙 (BranchRule과 유사하지만 참조 질문을 명시)
export type ShowRule = {
  when?: ShowNode; // true가 될 로직 (트리 구조), 없으면 항상 true
  refQuestionId: string; // 참조할 질문 ID
};

// 공통 속성
export type BaseQuestion = {
  id: string;
  title: string;
  description?: string;
  images?: ImageObj[];
  required?: boolean;
  showRules?: ShowRule[];
  design?: {
    themeColor?: string;
    backgroundStyle?: string;
  };
  validations?: Validation;
  sectionId?: string;
};

// Range 설정 타입
export type RangeConfig = {
  min: number;
  max: number;
  step: number;
  labels?: string[];
  displayStyle?: 'slider' | 'stars' | 'buttons';
};

// 타입별 질문 인터페이스
export type ShortTextQuestion = BaseQuestion & {
  type: 'short_text';
  input_type?: "text" | "number" | "email" | "tel";
  placeholder?: string;
};

export type LongTextQuestion = BaseQuestion & {
  type: 'long_text';
  placeholder?: string;
};

export type ChoiceQuestion = BaseQuestion & {
  type: 'choice';
  options: Option[];
  isMultiple?: boolean;
  isDropdown?: boolean;
  isBoolean?: boolean;
  branchRules?: BranchRule[];
};

export type RangeQuestion = BaseQuestion & {
  type: 'range';
  rangeConfig: RangeConfig;
};

export type ComplexChoiceQuestion = BaseQuestion & {
  type: 'complex_choice';
  complexItems: ComplexItem[];
  isMultiple?: boolean;
  branchRules?: BranchRule[];
};

export type ComplexInputQuestion = BaseQuestion & {
  type: 'complex_input';
  complexItems: ComplexItem[];
};

export type DescriptionQuestion = BaseQuestion & {
  type: 'description';
};

// 통합 질문 타입 (Discriminated Union)
export type Question =
  | ShortTextQuestion
  | LongTextQuestion
  | ChoiceQuestion
  | RangeQuestion
  | ComplexChoiceQuestion
  | ComplexInputQuestion
  | DescriptionQuestion;

// 타입 가드 함수들
export function isShortTextQuestion(q: Question): q is ShortTextQuestion {
  return q.type === 'short_text';
}

export function isLongTextQuestion(q: Question): q is LongTextQuestion {
  return q.type === 'long_text';
}

export function isChoiceQuestion(q: Question): q is ChoiceQuestion {
  return q.type === 'choice';
}

export function isRangeQuestion(q: Question): q is RangeQuestion {
  return q.type === 'range';
}

export function isComplexChoiceQuestion(q: Question): q is ComplexChoiceQuestion {
  return q.type === 'complex_choice';
}

export function isComplexInputQuestion(q: Question): q is ComplexInputQuestion {
  return q.type === 'complex_input';
}

export function isDescriptionQuestion(q: Question): q is DescriptionQuestion {
  return q.type === 'description';
}


// 섹션 타입
export interface Section {
  id: string;
  title: string;
  order: number;
}