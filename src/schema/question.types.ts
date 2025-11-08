export type QuestionType =
  | "short_text"
  | "long_text"
  | "choice"
  | "dropdown"
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


// 단일 조건
export type SingleCondition = {
  kind: 'condition';
  question_id: string;
  sub_key?: string;  // composite 내부 필드 참조 시 사용
  operator: Operator;
  value?: string | number | boolean | Array<string | number>;
};



// 조건 그룹
export type ConditionGroup = {
  kind: 'group';
  aggregator: 'AND' | 'OR';
  children: Condition[];
};

// 조건 타입(트리 구조)
export type Condition = SingleCondition | ConditionGroup;

export type CompositeItem = {
  label: string;
  input_type: "text" | "number" | "email" | "tel";
  unit?: string;
  placeholder?: string;
  key: string; // compositeItems 내 유일
  required?: boolean;
  show_conditions?: Condition; // 항목 단위 표시 조건
  validations?: Validation;
  branchLogic?: BranchRule[]; // default []
};

// 분기 규칙
export type BranchRule = {
  when?: Condition; // 없으면 항상 true
  next_question_id: string; // 이동할 다음 질문 ID
};

// 표시 조건 (단일 트리 구조)
export type ShowCondition = Condition;

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

  // composite 문항일 경우
  compositeItems?: CompositeItem[];

  // 조건 로직
  branchLogic?: BranchRule[];
  showConditions?: Condition;
  design?: {
    themeColor?: string;
    backgroundStyle?: string;
  },
  validations?: Validation;
};
