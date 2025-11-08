export type QuestionType =
  | "short_text"
  | "long_text"
  | "choice"
  | "composite_single"
  | "composite_multiple"
  | "description";


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

export type CompositeItem = {
  label: string;
  input_type: "text" | "number" | "email" | "tel";
  unit?: string;
  placeholder?: string;
  key: string; // compositeItems 내 유일
  required?: boolean;
  show_conditions?: PredicateNode; // 항목 단위 표시 조건
  validations?: Validation;
  branchRules?: BranchRule[]; // default []
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

// 다중 선택 제한 타입
export type SelectLimitType = 'unlimited' | 'exact' | 'range';

// 다중 선택 제한 설정
export type SelectLimit =
  | { type: 'unlimited' }
  | { type: 'exact'; value: number }
  | { type: 'range'; min: number; max: number };

// export type Question = {
//   id: string;
//   title: string;
//   description?: string;
//   type: QuestionType;
//   required?: boolean; // default false
//   images?: ImageObj[];
//   options?: Option[];
//   compositeItems?: CompositeItem[];
//   minSelect?: number;
//   maxSelect?: number;
//   validations?: {
//     regex?: string;
//     min?: number;
//     max?: number;
//     maxLength?: number;
//     minLength?: number;
//   };
//   branchLogic?: BranchRule[]; // default []
//   showConditions?: Condition; // 단일 트리 구조
//   nextQuestionId?: string; // highest priority
// };

export type Question = {
  id: string;
  title: string;
  description?: string;
  images?: ImageObj[];
  options?: Option[];

  type: QuestionType;
  required?: boolean;
  isMultiple?: boolean; // choice 타입에서 다중선택 허용 여부
  selectLimit?: SelectLimit; // isMultiple이 true일 때 선택 제한 설정
  isDropdown?: boolean; // choice 타입에서 드롭다운 렌더링 여부

  // composite 문항일 경우
  compositeItems?: CompositeItem[];

  // 분기 로직: 여러 브랜치 규칙 (우선순위는 인덱스 순)
  branchRules?: BranchRule[];
  // 표시 규칙: 이 질문을 표시할 조건들 (우선순위는 인덱스 순)
  showRules?: ShowRule[];
  design?: {
    themeColor?: string;
    backgroundStyle?: string;
  },
  validations?: Validation;
  sectionId?: string; // 섹션 ID (섹션에 속한 문항인 경우)
};
